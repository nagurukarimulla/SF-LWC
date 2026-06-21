// AccountCreatorQueueable.cls
public with sharing class AccountCreatorQueueable implements Queueable, Finalizer {
    
    private Integer retryCount;
    private List<String> logs;
    
    // Constructor
    public AccountCreatorQueueable(Integer retryCount) {
        this.retryCount = retryCount;
        this.logs = new List<String>();
    }
    
    // Queueable execution
    public void execute(QueueableContext ctx) {
        try {
            // Attach this class as finalizer
            System.attachFinalizer(this);
            
            // Add log that job started
            logs.add('Job started at ' + DateTime.now());
            
            // Simulate work - create 5 accounts
            for (Integer i = 1; i <= 5; i++) {
                Account acc = new Account(Name = 'Transaction Finalizer ' + i);
                insert acc;
                logs.add('Created account: Transaction Finalizer ' + i);
            }
            
            // Simulate random failure (50% chance for demo)
            if (Math.random() < 0.5 && retryCount < 2) {
                throw new DmlException('Simulated failure - Database error occurred');
            }
            
            logs.add('Job completed successfully at ' + DateTime.now());
            
        } catch (Exception e) {
            logs.add('ERROR: ' + e.getMessage());
            throw e; // Re-throw to trigger finalizer with failure state
        }
    }
    
    // Finalizer execution (runs after queueable completes or fails)
    public void execute(FinalizerContext ctx) {
        String result = ctx.getResult() == ParentJobResult.SUCCESS ? 'SUCCESS' : 'UNHANDLED_EXCEPTION';
        
        // Prepare summary message
        String summary = '=== Job Result ===\n';
        summary += 'Status: ' + result + '\n';
        summary += 'Retry Count: ' + retryCount + '\n';
        summary += 'Logs:\n' + String.join(logs, '\n');
        
        if (ctx.getResult() == ParentJobResult.UNHANDLED_EXCEPTION) {
            summary += '\nException: ' + ctx.getException().getMessage() + '\n';
            summary += 'Attempting retry...';
            
            // Retry up to 2 times
            if (retryCount < 2) {
                System.enqueueJob(new AccountCreatorQueueable(retryCount + 1));
                summary += ' (Retry ' + (retryCount + 1) + ' scheduled)';
            } else {
                summary += ' (Max retries reached)';
            }
        }
        
        // Store result in custom object (optional - create this object)
        saveLog(ctx.getAsyncApexJobId(), summary);
        
        System.debug(summary);
    }
    
    // Helper to save logs
    private void saveLog(Id jobId, String message) {
        try {
            // Create a custom object 'Job_Log__c' with fields: Job_Id__c, Message__c, Created_Date__c
            Error_Log__c errorLog = new Error_Log__c(
                Job_Id__c = jobId,
                Error_Message__c = message,
                Created_Date__c = DateTime.now().date()
            );
            insert errorLog;
            System.debug('Log saved successfully for job: ' + jobId);
        } catch (Exception e) {
            System.debug('Failed to save log: ' + e.getMessage());
        }
    }
}