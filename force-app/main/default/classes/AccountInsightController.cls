public with sharing class AccountInsightController {

    @AuraEnabled(cacheable=true)
    public static Account getAccountInsight(Id recordId){
        try{
            return [
                SELECT
                    Id,
                    Name,
                    Industry,
                    Type,
                    AccountNumber,
                    Owner.Name,
                    Owner.Email
                FROM Account
                WHERE Id = :recordId
                LIMIT 1
            ];
        }
        catch(Exception ex){
            throw new AuraHandledException(
                'Error retrieving account insight: ' + ex.getMessage()
            );
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Account> getAccountOptions() {
        try {
            return [
                SELECT Id, Name 
                FROM Account 
                ORDER BY Name 
                LIMIT 100
            ];
        } catch(Exception ex) {
            throw new AuraHandledException(
                'Error retrieving account options: ' + ex.getMessage()
            );
        }
    }
}