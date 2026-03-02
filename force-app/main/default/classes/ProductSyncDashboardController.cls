public with sharing class ProductSyncDashboardController {
    
    @AuraEnabled(cacheable=true)
    public static List<SyncSummary> getRecentSyncs() {
        List<SyncSummary> summaries = new List<SyncSummary>();
        
        // 1. Get logs from Error_Log__c
        List<Error_Log__c> logs = [
            SELECT Id, Process_Name__c, Error_Message__c, Related_Record_ID__c,
                   CreatedDate
            FROM Error_Log__c
            WHERE Process_Name__c LIKE 'ProductSync%'
            ORDER BY CreatedDate DESC
            LIMIT 20
        ];
        
        // Create summary from logs
        for(Error_Log__c log : logs) {
            String status = log.Process_Name__c.contains('Success') ? 'Success' : 'Failed';
            summaries.add(new SyncSummary(
                log.Related_Record_ID__c != null ? log.Related_Record_ID__c : 'Unknown',
                'Sync',
                status,
                log.CreatedDate.format('HH:mm:ss'),
                'Secondary',
                status == 'Failed' ? 'slds-text-color_error' : 'slds-text-color_success'
            ));
        }
        
        // 2. Get recent products
        List<Product2> recentProducts = [
            SELECT Id, Name, LastModifiedDate, CreatedDate
            FROM Product2
            ORDER BY LastModifiedDate DESC
            LIMIT 10
        ];
        
        // Add recently created products
        for(Product2 prod : recentProducts) {
            // Check if this product was recently created (< 5 min ago)
            Long timeDiff = System.now().getTime() - prod.CreatedDate.getTime();
            Long fiveMinutesMs = 5 * 60 * 1000;
            
            String status;
            String statusClass;
            
            if(timeDiff < fiveMinutesMs) {
                status = 'Processing';
                statusClass = 'slds-text-color_weak';
            } else {
                status = 'Synced';
                statusClass = 'slds-text-color_success';
            }
            
            summaries.add(new SyncSummary(
                prod.Id,
                'Insert',
                status,
                prod.CreatedDate.format('HH:mm:ss'),
                'Secondary',
                statusClass
            ));
        }
        
        // Sort by syncTime (most recent first) and limit
        summaries.sort();
        if (summaries.size() > 10) {
            List<SyncSummary> trimmed = new List<SyncSummary>();
            for (Integer i = 0; i < 10; i++) {
                trimmed.add(summaries[i]);
            }
            summaries = trimmed;
        }
        
        return summaries;
    }
    
    @AuraEnabled(cacheable=true)
    public static SyncStats getSyncStats() {
        Date today = Date.today();
        
        // Count total products created/updated today
        Integer totalProductsToday = [
            SELECT COUNT()
            FROM Product2
            WHERE CreatedDate = TODAY OR LastModifiedDate = TODAY
        ];
        
        // Count failed syncs from today
        Integer failedToday = [
            SELECT COUNT()
            FROM Error_Log__c
            WHERE Process_Name__c LIKE '%Error%'
            AND CreatedDate = TODAY
        ];
        
        // Count successful syncs
        Integer successToday = [
            SELECT COUNT()
            FROM Error_Log__c
            WHERE Process_Name__c LIKE '%Success%'
            AND CreatedDate = TODAY
        ];
        
        return new SyncStats(
            totalProductsToday,
            successToday,
            failedToday
        );
    }
    
    @AuraEnabled(cacheable=true)
    public static List<RealtimeEvent> getRealtimeEvents() {
        List<RealtimeEvent> events = new List<RealtimeEvent>();
        
        // Get most recent logs for real-time feed
        List<Error_Log__c> recentLogs = [
            SELECT Id, Process_Name__c, Error_Message__c, Related_Record_ID__c,
                   CreatedDate
            FROM Error_Log__c
            WHERE Process_Name__c LIKE 'ProductSync%'
            ORDER BY CreatedDate DESC
            LIMIT 5
        ];
        
        for(Error_Log__c log : recentLogs) {
            Boolean isSuccess = log.Process_Name__c.contains('Success');
            String icon = isSuccess ? 'utility:success' : 'utility:error';
            String statusClass = isSuccess ? 'slds-text-color_success' : 'slds-text-color_error';
            String message = 'Product ' + log.Related_Record_ID__c + 
                           ' - ' + (isSuccess ? 'Success: ' : 'Failed: ') + 
                           log.Error_Message__c;
            
            events.add(new RealtimeEvent(
                'log_' + log.Id,
                message,
                icon,
                statusClass,
                log.CreatedDate.format('HH:mm:ss')
            ));
        }
        
        return events;
    }
    
    // FIXED: Using 'syncTime' instead of 'time'
    public class SyncSummary implements Comparable {
        @AuraEnabled public String productId;
        @AuraEnabled public String operation;
        @AuraEnabled public String status;
        @AuraEnabled public String syncTime;        // CHANGED: from 'times' to 'syncTime'
        @AuraEnabled public String targetOrg;
        @AuraEnabled public String statusClass;
        
        public SyncSummary(String pid, String op, String stat, String t, String org, String sClass) {
            this.productId = pid;
            this.operation = op;
            this.status = stat;
            this.syncTime = t;                       // CHANGED: from 'times' to 'syncTime'
            this.targetOrg = org;
            this.statusClass = sClass;
        }
        
        public Integer compareTo(Object compareTo) {
            SyncSummary other = (SyncSummary)compareTo;
            return other.syncTime.compareTo(this.syncTime);  // CHANGED: from 'times' to 'syncTime'
        }
    }
    
    public class SyncStats {
        @AuraEnabled public Integer total;
        @AuraEnabled public Integer successful;
        @AuraEnabled public Integer failed;
        
        public SyncStats(Integer t, Integer s, Integer f) {
            this.total = t;
            this.successful = s;
            this.failed = f;
        }
    }
    
    // FIXED: Using 'eventTime' instead of 'time'
    public class RealtimeEvent {
        @AuraEnabled public String id;
        @AuraEnabled public String message;
        @AuraEnabled public String icon;
        @AuraEnabled public String statusClass;
        @AuraEnabled public String eventTime;        // CHANGED: from 'times' to 'eventTime'
        
        public RealtimeEvent(String id, String msg, String ico, String sc, String t) {
            this.id = id;
            this.message = msg;
            this.icon = ico;
            this.statusClass = sc;
            this.eventTime = t;                       // CHANGED: from 'times' to 'eventTime'
        }
    }
}