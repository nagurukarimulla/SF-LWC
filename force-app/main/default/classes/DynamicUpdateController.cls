public with sharing class DynamicUpdateController {
    
    @AuraEnabled(cacheable=true)
    public static List<SObject> getRecords(String objectName) {
        try {
            String query;
            
            if (objectName == 'Account') {
                query = 'SELECT Id, Name FROM Account ORDER BY CreatedDate DESC LIMIT 20';
            } else if (objectName == 'Contact') {
                query = 'SELECT Id, Name FROM Contact ORDER BY CreatedDate DESC LIMIT 20';
            } else if (objectName == 'Case') {
                query = 'SELECT Id, CaseNumber, Subject FROM Case ORDER BY CreatedDate DESC LIMIT 20';
            } else if (objectName == 'Opportunity') {
                query = 'SELECT Id, Name FROM Opportunity ORDER BY CreatedDate DESC LIMIT 20';
            } else if (objectName == 'Lead') {
                query = 'SELECT Id, Name FROM Lead ORDER BY CreatedDate DESC LIMIT 20';
            } else {
                return new List<SObject>();
            }
            
            return Database.query(query);
            
        } catch (Exception e) {
            throw new AuraHandledException('Error loading records: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static SObject getRecordById(String objectName, String recordId) {
        try {
            String query;
            
            if (objectName == 'Account') {
                query = 'SELECT Id, Name, Phone, Website FROM Account WHERE Id = :recordId';
            } else if (objectName == 'Contact') {
                query = 'SELECT Id, FirstName, LastName, Email, Phone FROM Contact WHERE Id = :recordId';
            } else if (objectName == 'Case') {
                query = 'SELECT Id, CaseNumber, Subject, Description, Status, Priority FROM Case WHERE Id = :recordId';
            } else if (objectName == 'Opportunity') {
                query = 'SELECT Id, Name, StageName, CloseDate, Amount FROM Opportunity WHERE Id = :recordId';
            } else if (objectName == 'Lead') {
                query = 'SELECT Id, FirstName, LastName, Company, Email FROM Lead WHERE Id = :recordId';
            } else {
                return null;
            }
            
            List<SObject> results = Database.query(query);
            return results.isEmpty() ? null : results[0];
            
        } catch (Exception e) {
            throw new AuraHandledException('Error loading record: ' + e.getMessage());
        }
    }
}