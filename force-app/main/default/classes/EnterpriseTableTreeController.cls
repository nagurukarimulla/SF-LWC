public with sharing class EnterpriseTableTreeController {
    
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts() {
        try {
            return [
                SELECT Id, Name, Industry, AnnualRevenue, Type, Phone, Website 
                FROM Account 
                ORDER BY Name 
                LIMIT 100
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching accounts: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccountHierarchy() {
        try {
            return [
                SELECT Id, Name, Type, Industry,
                    (SELECT Id, Name, Amount, StageName FROM Opportunities ORDER BY CreatedDate DESC LIMIT 10),
                    (SELECT Id, CaseNumber, Status, Priority FROM Cases ORDER BY CreatedDate DESC LIMIT 10)
                FROM Account 
                ORDER BY Name 
                LIMIT 20
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching hierarchy: ' + e.getMessage());
        }
    }
}