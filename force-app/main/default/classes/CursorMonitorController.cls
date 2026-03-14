public with sharing class CursorMonitorController {

    @AuraEnabled
    public static Map<String, Object> startJob() {
        ContactArchiveCursorJob job = new ContactArchiveCursorJob();
        Id jobId = System.enqueueJob(job);
        
        // Get actual count of inactive contacts
        Integer totalCount = [SELECT COUNT() FROM Contact WHERE LastActivityDate < LAST_N_DAYS:730];
        
        Map<String, Object> result = new Map<String, Object>();
        result.put('total', totalCount);
        result.put('jobId', jobId);
        result.put('status', 'Started');
        
        return result;
    }
    
    @AuraEnabled
    public static Map<String, Object> getJobStatus(String jobId) {
        Map<String, Object> status = new Map<String, Object>();
        
        try {
            // Query async job status
            List<AsyncApexJob> jobs = [
                SELECT Status, JobItemsProcessed, TotalJobItems, NumberOfErrors
                FROM AsyncApexJob 
                WHERE Id = :jobId
            ];
            
            if(!jobs.isEmpty()) {
                AsyncApexJob job = jobs[0];
                status.put('status', job.Status);
                status.put('processed', job.JobItemsProcessed);
                status.put('failed', job.NumberOfErrors);
                status.put('total', job.TotalJobItems);
            } else {
                // Job might be completed and removed from AsyncApexJob
                // Check your custom job log here
                status.put('status', 'Unknown');
                status.put('processed', 0);
                status.put('failed', 0);
            }
        } catch(Exception e) {
            status.put('status', 'Error');
            status.put('error', e.getMessage());
        }
        
        return status;
    }
}