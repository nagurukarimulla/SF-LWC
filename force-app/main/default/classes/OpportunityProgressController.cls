public with sharing class OpportunityProgressController {
    
    @AuraEnabled(cacheable=true)
    public static Map<String,Object> getStageDistribution(String objectApiName, String stageField) {
        try {
            // Validate inputs
            if (String.isBlank(objectApiName) || String.isBlank(stageField)) {
                throw new AuraHandledException('Object name and stage field are required');
            }
            
            // Build dynamic query
            String query = 'SELECT ' + stageField + ', COUNT(Id) total ' +
                           'FROM ' + objectApiName + ' ' +
                           'GROUP BY ' + stageField + ' ' +
                           'ORDER BY ' + stageField;
            
            List<AggregateResult> results = Database.query(query);
            
            Map<String,Integer> stageCounts = new Map<String,Integer>();
            Integer totalRecords = 0;
            
            for(AggregateResult ar : results) {
                String stage = (String)ar.get(stageField);
                // Handle null stages
                if(String.isBlank(stage)) {
                    stage = 'Blank';
                }
                Integer countVal = (Integer)ar.get('total');
                
                stageCounts.put(stage, countVal);
                totalRecords += countVal;
            }
            
            Map<String,Object> response = new Map<String,Object>();
            response.put('stages', stageCounts);
            response.put('total', totalRecords);
            
            return response;
            
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching stage distribution: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<sObject> getRecords(String objectApiName) {
        try {
            if (String.isBlank(objectApiName)) {
                return new List<sObject>();
            }
            
            String query;
            
            // Handle different object types with appropriate field selection
            if (objectApiName == 'Case') {
                query = 'SELECT Id, CaseNumber, Subject, Status, Priority, CreatedDate ' +
                       'FROM Case ' +
                       'ORDER BY CreatedDate DESC LIMIT 50';
            } else if (objectApiName == 'Lead') {
                query = 'SELECT Id, Name, Company, Status, CreatedDate ' +
                       'FROM Lead ' +
                       'ORDER BY CreatedDate DESC LIMIT 50';
            } else if (objectApiName == 'Opportunity') {
                query = 'SELECT Id, Name, StageName, Amount, CloseDate, CreatedDate ' +
                       'FROM Opportunity ' +
                       'ORDER BY CreatedDate DESC LIMIT 50';
            } else {
                // Fallback for other objects
                query = 'SELECT Id, Name, CreatedDate FROM ' + objectApiName + 
                       ' ORDER BY CreatedDate DESC LIMIT 50';
            }
            
            return Database.query(query);
            
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching records: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static String getRecordStage(String recordId, String objectApiName, String stageField) {
        try {
            String query = 'SELECT ' + stageField + ' FROM ' + objectApiName + ' WHERE Id = :recordId LIMIT 1';
            List<sObject> results = Database.query(query);
            
            if (!results.isEmpty()) {
                return (String)results[0].get(stageField);
            }
            return '';
        } catch (Exception e) {
            return '';
        }
    }
}