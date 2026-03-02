// Org 1: ErrorLogHelper.cls - COMPLETE with logSuccess method
public with sharing class ErrorLogHelper {
    
    public static void logError(String processName, String errorMessage, String relatedRecordId) {
        // Create custom object Error_Log__c in setup first
        Error_Log__c log = new Error_Log__c(
            Process_Name__c = processName,
            Error_Message__c = errorMessage,
            Related_Record_ID__c = relatedRecordId,
            Log_Date_Time__c = System.now()
        );
        
        // Insert asynchronously to avoid mixed DML
        System.enqueueJob(new ErrorLogQueueable(log));
    }
    
    // NEW: logSuccess method
    public static void logSuccess(String processName, String message, String relatedRecordId) {
        // Create custom object Error_Log__c in setup first
        Error_Log__c log = new Error_Log__c(
            Process_Name__c = processName + '_Success',  // Makes it easy to filter successes
            Error_Message__c = message,  // Reusing field for success message
            Related_Record_ID__c = relatedRecordId,
            Log_Date_Time__c = System.now()
        );
        
        // Insert asynchronously to avoid mixed DML
        System.enqueueJob(new ErrorLogQueueable(log));
    }
    
    // Queueable class for async logging
    private class ErrorLogQueueable implements Queueable {
        private Error_Log__c logEntry;
        
        public ErrorLogQueueable(Error_Log__c log) {
            this.logEntry = log;
        }
        
        public void execute(QueueableContext context) {
            try {
                insert logEntry;
                System.debug('✅ Log created: ' + logEntry.Process_Name__c + ' - ' + logEntry.Error_Message__c);
            } catch (Exception e) {
                System.debug('❌ Failed to create log: ' + e.getMessage());
            }
        }
    }
}