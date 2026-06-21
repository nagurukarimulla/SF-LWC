public with sharing class AccountController {
    @AuraEnabled
    public static void requestLimitIncrease(Id accountId, Decimal amount) {
        try {
            AccountService.updateCreditLimit(accountId, amount);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true)
    public static Account getAccountDetails(Id accountId) {

        return [
            SELECT Id,
                   Name,
                   Industry,
                   AnnualRevenue,
                   NumberOfEmployees
            FROM Account
            WHERE Id = :accountId
            LIMIT 1
        ];
    }
}