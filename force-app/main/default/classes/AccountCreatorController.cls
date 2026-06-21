// AccountCreatorController.cls
public with sharing class AccountCreatorController {
    
    @AuraEnabled
    public static Map<String, String> startQueueableJob() {
        try {
            Id jobId = System.enqueueJob(new AccountCreatorQueueable(0));
            return new Map<String, String>{
                'jobId' => jobId,
                'status' => 'Success'
            };
        } catch (Exception e) {
            throw new AuraHandledException('Failed to start job: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static Map<String, Object> getJobStatus(Id jobId) {
        Map<String, Object> result = new Map<String, Object>();
        
        try {
            AsyncApexJob job = [
                SELECT Id, Status, NumberOfErrors, ExtendedStatus 
                FROM AsyncApexJob 
                WHERE Id = :jobId
                LIMIT 1
            ];
            
            result.put('status', job.Status);
            result.put('isComplete', job.Status == 'Completed' || job.Status == 'Failed' || job.Status == 'Aborted');
            result.put('success', job.Status == 'Completed');
            result.put('errorMessage', job.ExtendedStatus);
            
        } catch (Exception e) {
            result.put('status', 'Unknown');
            result.put('isComplete', false);
            result.put('success', false);
            result.put('errorMessage', e.getMessage());
        }
        
        return result;
    }
}