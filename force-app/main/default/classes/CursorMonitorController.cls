public with sharing class CursorMonitorController {
    
    @AuraEnabled
    public static Map<String, Object> startJob() {
        try {
            CursorJobTracker__c tracker = new CursorJobTracker__c(
                Status__c = 'Processing',
                Processed__c = 0
            );
            insert tracker;

            System.enqueueJob(new ContactArchiveCursorJob(tracker.Id));
            return new Map<String, Object>{ 'jobId' => tracker.Id };
        } catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=false)
    public static Map<String, Object> getJobStatus(String jobId) {
        CursorJobTracker__c tracker = [
            SELECT Status__c, Processed__c, TotalRecords__c 
            FROM CursorJobTracker__c WHERE Id = :jobId LIMIT 1
        ];
        return new Map<String, Object>{
            'status' => tracker.Status__c,
            'processed' => (Integer)(tracker.Processed__c != null ? tracker.Processed__c : 0),
            'total' => (Integer)(tracker.TotalRecords__c != null ? tracker.TotalRecords__c : 0)
        };
    }
}