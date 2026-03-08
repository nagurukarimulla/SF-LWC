public with sharing class ProcessMetricsController {
    
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getRecentRecords() {
        List<Map<String, Object>> records = new List<Map<String, Object>>();
        
        // Get recent Opportunities
        for (Opportunity opp : [
            SELECT Id, Name, StageName, CreatedDate 
            FROM Opportunity 
            ORDER BY CreatedDate DESC 
            LIMIT 10
        ]) {
            Map<String, Object> record = new Map<String, Object>();
            record.put('Id', opp.Id);
            record.put('Name', opp.Name);
            record.put('attributes', new Map<String, String>{'type' => 'Opportunity'});
            records.add(record);
        }
        
        // Get recent Cases
        for (Case c : [
            SELECT Id, CaseNumber, Status, CreatedDate 
            FROM Case 
            ORDER BY CreatedDate DESC 
            LIMIT 10
        ]) {
            Map<String, Object> record = new Map<String, Object>();
            record.put('Id', c.Id);
            record.put('CaseNumber', c.CaseNumber);
            record.put('attributes', new Map<String, String>{'type' => 'Case'});
            records.add(record);
        }
        
        return records;
    }
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getTaskMetrics(String recordId) {
        Map<String, Object> metrics = new Map<String, Object>();
        
        // Count total tasks
        AggregateResult[] totalResults = [
            SELECT COUNT(Id) total 
            FROM Task 
            WHERE WhatId = :recordId
        ];
        
        // Count completed tasks
        AggregateResult[] completedResults = [
            SELECT COUNT(Id) completed 
            FROM Task 
            WHERE WhatId = :recordId 
            AND Status = 'Completed'
        ];
        
        Integer total = (Integer)totalResults[0].get('total');
        Integer completed = (Integer)completedResults[0].get('completed');
        
        metrics.put('totalTasks', total);
        metrics.put('completedTasks', completed);
        
        return metrics;
    }
    
    @AuraEnabled
    public static Map<String, Object> updateRecordStage(String recordId, String recordType) {
        Savepoint sp = Database.setSavepoint();
        
        try {
            Map<String, Object> result = new Map<String, Object>();
            
            if (recordType == 'Opportunity') {
                Opportunity opp = [SELECT Id, StageName FROM Opportunity WHERE Id = :recordId];
                String nextStage = getNextOpportunityStage(opp.StageName);
                opp.StageName = nextStage;
                update opp;
                result.put('message', 'Opportunity moved to ' + nextStage);
                
            } else if (recordType == 'Case') {
                Case c = [SELECT Id, Status FROM Case WHERE Id = :recordId];
                String nextStatus = getNextCaseStatus(c.Status);
                c.Status = nextStatus;
                update c;
                result.put('message', 'Case moved to ' + nextStatus);
            }
            
            result.put('success', true);
            return result;
            
        } catch (Exception e) {
            Database.rollback(sp);
            throw new AuraHandledException('Error updating record: ' + e.getMessage());
        }
    }
    
    private static String getNextOpportunityStage(String currentStage) {
        Map<String, String> stageFlow = new Map<String, String>{
            'Prospecting' => 'Qualification',
            'Qualification' => 'Needs Analysis',
            'Needs Analysis' => 'Value Proposition',
            'Value Proposition' => 'Closed Won',
            'Closed Won' => 'Closed Won',
            'Closed Lost' => 'Closed Lost'
        };
        return stageFlow.containsKey(currentStage) ? stageFlow.get(currentStage) : currentStage;
    }
    
    private static String getNextCaseStatus(String currentStatus) {
        Map<String, String> statusFlow = new Map<String, String>{
            'New' => 'Working',
            'Working' => 'Escalated',
            'Escalated' => 'Waiting on Customer',
            'Waiting on Customer' => 'Closed',
            'Closed' => 'Closed'
        };
        return statusFlow.containsKey(currentStatus) ? statusFlow.get(currentStatus) : currentStatus;
    }
}