public with sharing class OnboardingService {
    public static void onboardOpportunity(Id oppId) {
        try {
            // Fetch Opportunity with Account details
            List<Opportunity> opportunities = new OpportunitiesSelector().selectByIdWithAccount(new Set<Id>{oppId});
            
            if (opportunities.isEmpty()) {
                throw new IllegalArgumentException('Opportunity not found: ' + oppId);
            }
            
            Opportunity opp = opportunities[0];
            
            // VALIDATION: Check if Account exists
            if (opp.AccountId == null) {
                throw new IllegalArgumentException('Cannot onboard Opportunity without an Account. Please assign an Account first.');
            }
            
            // Validate business rules
            new Opportunities(new List<Opportunity>{opp}).validateForOnboarding();

            // Define UoW
            fflib_SObjectUnitOfWork uow = new fflib_SObjectUnitOfWork(
                new List<SObjectType> { 
                    Account.SObjectType, 
                    Contract.SObjectType, 
                    Task.SObjectType 
                }
            );

            // Register Account Update
            Account acc = new Account(
                Id = opp.AccountId, 
                Description = 'Onboarded: ' + opp.Name + ' on ' + Date.today()
            );
            uow.registerDirty(acc);

            // Register New Contract
            Contract con = new Contract(
                AccountId = opp.AccountId, 
                Status = 'Draft', 
                StartDate = Date.today(), 
                ContractTerm = 12,
                Name = 'Contract - ' + opp.Name
            );
            uow.registerNew(con);

            // Register Task with relationship to Contract
            Task t = new Task(
                Subject = 'Onboarding Follow-up for ' + opp.Name,
                Status = 'Not Started',
                Priority = 'Normal',
                ActivityDate = Date.today().addDays(7)
            );
            
            uow.registerNew(t, Task.WhatId, con);
            uow.commitWork();
            
            
        } catch (Opportunities.OnboardingException de) {
            // Create the exception, set the message, THEN throw it
            AuraHandledException e = new AuraHandledException(de.getMessage());
            e.setMessage(de.getMessage()); 
            throw e;
        } catch (Exception e) {
            AuraHandledException hex = new AuraHandledException('Onboarding failed: ' + e.getMessage());
            hex.setMessage('Onboarding failed: ' + e.getMessage());
            throw hex;
        }
    }
}