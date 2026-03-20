public with sharing class CaseService {
    private CaseSelector caseSelector;

    // Constructor with selector parameter
    public CaseService(CaseSelector selector) {
        this.caseSelector = selector;
    }

    // Default constructor
    public CaseService() {
        this(new CaseSelector());
    }

    // This method needs to match the signature being called
    public List<Case> getCasesWithRelations(Set<Id> caseIds) {
        // Check if caseIds is null or empty
        if (caseIds == null || caseIds.isEmpty()) {
            // Return all cases if no IDs provided
            return caseSelector.selectAllCasesWithRelations();
        }
        return caseSelector.selectCasesWithRelations(caseIds);
    }
    
    // Add this method for getting all cases
    public List<Case> getAllCasesWithRelations() {
        return caseSelector.selectAllCasesWithRelations();
    }

    public static void closeCases(Set<Id> caseIds, String closeReason) {
        // Validate parameters
        if (caseIds == null || caseIds.isEmpty()) {
            throw new CaseServiceException('Case IDs not specified.');
        }

        // Query cases
        List<Case> casesToUpdate = [SELECT Id, Status, Reason FROM Case WHERE Id IN :caseIds];

        // Update fields
        for (Case c : casesToUpdate) {
            c.Status = 'Closed';
            c.Reason = closeReason;
        }

        // Commit changes
        update casesToUpdate;
    }

    // ========== CONFIGURATION CONSTANTS ==========
    // Simple hardcoded configuration - easy to change if needed
    private static final Set<String> VALID_STATUSES = new Set<String>{
        'New', 'Working', 'In Progress'
    };
    
    private static final String ESCALATION_TEAM_EMAIL = 'escalations@company.com';
    
    private static final Boolean CREATE_TASKS_AUTOMATICALLY = true;
    
    private static final String ESCALATION_TEMPLATE = 
        '[ESCALATED on {0}]\n' +
        'Reason: {1}\n' +
        'Escalated By: {2}\n' +
        'Please review immediately.';
    // =============================================
    
    /**
     * Escalate cases with default task creation setting
     */
    public static void escalateCases(List<Id> caseIds, String reason) {
        escalateCases(caseIds, reason, CREATE_TASKS_AUTOMATICALLY);
    }
    
    /**
     * Main escalation method - bulk escalates multiple cases
     */
    public static void escalateCases(List<Id> caseIds, String reason, Boolean createTasks) {
        // Validate inputs
        if(caseIds == null || caseIds.isEmpty()) {
            throw new IllegalArgumentException('No cases selected for escalation');
        }
        
        if(String.isBlank(reason)) {
            throw new IllegalArgumentException('Escalation reason is required');
        }
        
        if(reason.length() > 255) {
            throw new IllegalArgumentException('Escalation reason must be less than 255 characters');
        }
        
        // Create Unit of Work for transaction management
        fflib_SObjectUnitOfWork uow = new fflib_SObjectUnitOfWork(
            new List<SObjectType>{ 
                Case.SObjectType,
                Task.SObjectType
            }
        );
        
        try {
            // Step 1: Fetch all cases in bulk with related data
            List<Case> casesToProcess = new CaseSelector().selectByIdWithDetails(new Set<Id>(caseIds));
            
            if(casesToProcess.isEmpty()) {
                throw new IllegalArgumentException('No cases found with the provided IDs');
            }
            
            // Log for debugging
            System.debug('Processing ' + casesToProcess.size() + ' cases for escalation');
            
            // Step 2: Apply domain validations
            Cases casesDomain = new Cases(casesToProcess);
            casesDomain.validateForEscalation(VALID_STATUSES);
            
            // Step 3: Apply escalation logic
            String escalationNote = formatEscalationNote(reason);
            casesDomain.applyEscalation(escalationNote);
            
            // Step 4: Register all updates with Unit of Work
            List<String> escalatedCaseNumbers = new List<String>();
            List<Id> caseIdsToNotify = new List<Id>(); // For future method
            
            for(Case c : casesToProcess) {
                // Register case for update
                uow.registerDirty(c);
                escalatedCaseNumbers.add(c.CaseNumber);
                caseIdsToNotify.add(c.Id); // Collect IDs for notifications
                
                // Create follow-up task if enabled
                if(createTasks) {
                    Task followUpTask = new Task(
                        Subject = 'Follow up on Escalated Case: ' + c.CaseNumber,
                        Description = 'Case ' + c.CaseNumber + ' was escalated on ' + Date.today() + 
                                      '\nReason: ' + reason +
                                      '\nPriority: High',
                        Status = 'Not Started',
                        Priority = 'High',
                        ActivityDate = Date.today().addDays(1),
                        WhatId = c.Id
                    );
                    uow.registerNew(followUpTask);
                }
            }
            
            // Step 5: Commit all changes in a single DML operation
            uow.commitWork();
            
            System.debug('Successfully escalated ' + escalatedCaseNumbers.size() + ' cases: ' + 
                         String.join(escalatedCaseNumbers, ', '));
            
            // Step 6: Send notifications asynchronously - FIXED: passing IDs instead of Case objects
            sendEscalationNotifications(caseIdsToNotify, reason);
            
        } catch (Cases.DomainException e) {
            // Re-throw domain exceptions with clear message
            System.debug(LoggingLevel.ERROR, 'Domain validation failed: ' + e.getMessage());
            throw new AuraHandledException('Cannot escalate: ' + e.getMessage());
            
        } catch (Exception e) {
            // Log and wrap other exceptions
            System.debug(LoggingLevel.ERROR, 'Error in escalateCases: ' + e.getMessage() + 
                         ' at line ' + e.getLineNumber());
            throw new AuraHandledException('Failed to escalate cases: ' + e.getMessage());
        }
    }
    
    /**
     * Format escalation note using template
     */
    private static String formatEscalationNote(String reason) {
        return String.format(
            ESCALATION_TEMPLATE,
            new List<String>{
                DateTime.now().format('MM/dd/yyyy hh:mm a'),  // Formatted date
                reason,
                UserInfo.getName()
            }
        );
    }
    
    /**
     * Send email notifications to case owners and escalation team
     * FIXED: Now accepts List<Id> (primitive type) instead of List<Case>
     */
    @future(callout=true)
    private static void sendEscalationNotifications(List<Id> caseIds, String reason) {
        if(caseIds == null || caseIds.isEmpty()) {
            return;
        }
        
        // Query cases with related data inside the future method
        List<Case> cases = new CaseSelector().selectByIdWithDetails(new Set<Id>(caseIds));
        
        if(cases.isEmpty()) {
            return;
        }
        
        // Group cases by owner for efficient email sending
        Map<Id, List<Case>> casesByOwner = new Map<Id, List<Case>>();
        Set<Id> ownerIds = new Set<Id>();
        
        for(Case c : cases) {
            if(c.OwnerId != null) {
                if(!casesByOwner.containsKey(c.OwnerId)) {
                    casesByOwner.put(c.OwnerId, new List<Case>());
                    ownerIds.add(c.OwnerId);
                }
                casesByOwner.get(c.OwnerId).add(c);
            }
        }
        
        // Get owner emails
        Map<Id, User> owners = new Map<Id, User>(
            [SELECT Id, Email, Name FROM User WHERE Id IN :ownerIds]
        );
        
        // Send emails to each owner
        List<Messaging.SingleEmailMessage> emailsToSend = new List<Messaging.SingleEmailMessage>();
        
        for(Id ownerId : casesByOwner.keySet()) {
            User owner = owners.get(ownerId);
            if(owner == null || String.isBlank(owner.Email)) {
                continue;
            }
            
            List<Case> ownerCases = casesByOwner.get(ownerId);
            
            // Build case list for this owner
            String caseList = '';
            for(Case c : ownerCases) {
                caseList += '• ' + c.CaseNumber + ' - ' + (c.Subject != null ? c.Subject : 'No Subject') + '\n';
                caseList += '  Account: ' + (c.Account?.Name ?? 'N/A') + '\n';
                caseList += '  Contact: ' + (c.Contact?.Name ?? 'N/A') + '\n\n';
            }
            
            // Create email
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            mail.setToAddresses(new String[]{owner.Email});
            mail.setSubject('Cases Escalated - Action Required (' + ownerCases.size() + ' cases)');
            mail.setPlainTextBody(
                'Hello ' + owner.Name + ',\n\n' +
                'The following cases assigned to you have been escalated:\n\n' +
                caseList +
                'Escalation Reason: ' + reason + '\n\n' +
                'Please review these cases immediately and take appropriate action.\n\n' +
                'Thank you,\n' +
                'Support Operations'
            );
            
            emailsToSend.add(mail);
        }
        
        // Send email to escalation team
        Messaging.SingleEmailMessage teamMail = new Messaging.SingleEmailMessage();
        teamMail.setToAddresses(new String[]{ESCALATION_TEAM_EMAIL});
        teamMail.setSubject('Bulk Case Escalation Notification - ' + cases.size() + ' cases');
        
        String teamCaseList = '';
        for(Case c : cases) {
            teamCaseList += '• ' + c.CaseNumber + ' - ' + (c.Subject ?? 'No Subject') + '\n';
            teamCaseList += '  Owner: ' + (c.Owner?.Name ?? 'Unassigned') + '\n';
            teamCaseList += '  Account: ' + (c.Account?.Name ?? 'N/A') + '\n\n';
        }
        
        teamMail.setPlainTextBody(
            'The following ' + cases.size() + ' cases were escalated:\n\n' +
            teamCaseList +
            'Escalation Reason: ' + reason + '\n\n' +
            'Escalated By: ' + UserInfo.getName() + '\n' +
            'Date: ' + DateTime.now().format() + '\n\n' +
            'This is an automated notification.'
        );
        
        emailsToSend.add(teamMail);
        
        // Send all emails
        if(!emailsToSend.isEmpty()) {
            Messaging.sendEmail(emailsToSend);
        }
    }
    
    /**
     * Overloaded method to get escalation statistics
     */
    @AuraEnabled(cacheable=true)
    public static Map<String, Integer> getEscalationStats(Date startDate, Date endDate) {
        Map<String, Integer> stats = new Map<String, Integer>();
        
        // Query escalated cases in date range
        List<AggregateResult> results = [
            SELECT COUNT(Id) caseCount, Owner.Name ownerName
            FROM Case
            WHERE Status = 'Escalated'
            AND LastModifiedDate >= :startDate
            AND LastModifiedDate <= :endDate
            GROUP BY Owner.Name
        ];
        
        for(AggregateResult ar : results) {
            stats.put((String)ar.get('ownerName'), (Integer)ar.get('caseCount'));
        }
        
        return stats;
    }

    public class CaseServiceException extends Exception {}
}