public class ErrorLogQueueable implements Queueable {
        private Error_Log__c logEntry;
        
        public ErrorLogQueueable(Error_Log__c log) {
            this.logEntry = log;
        }
        
        public void execute(QueueableContext context) {
            insert logEntry;
        }
    }