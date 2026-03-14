public with sharing class DynamicDeleteController {
    @AuraEnabled(cacheable=true)
    public static List<SObject> getRecords(String objectName) {
        try {
            String query;
            
            if (objectName == 'Account') {
                query = 'SELECT Id, Name, Phone FROM Account ORDER BY CreatedDate DESC LIMIT 20';
            } else if (objectName == 'Contact') {
                query = 'SELECT Id, Name, Email FROM Contact ORDER BY CreatedDate DESC LIMIT 20';
            } else if (objectName == 'Case') {
                query = 'SELECT Id, CaseNumber, Subject, Status FROM Case ORDER BY CreatedDate DESC LIMIT 20';
            } else if (objectName == 'Opportunity') {
                query = 'SELECT Id, Name, StageName, Amount FROM Opportunity ORDER BY CreatedDate DESC LIMIT 20';
            } else if (objectName == 'Lead') {
                query = 'SELECT Id, Name, Company, Status FROM Lead ORDER BY CreatedDate DESC LIMIT 20';
            } else {
                return new List<SObject>();
            }
            
            System.debug('Executing query: ' + query);
            List<SObject> results = Database.query(query);
            System.debug('Results: ' + results);
            return results;
            
        } catch (Exception e) {
            System.debug('Error in getRecords: ' + e.getMessage());
            throw new AuraHandledException('Error loading records: ' + e.getMessage());
        }
    }
}