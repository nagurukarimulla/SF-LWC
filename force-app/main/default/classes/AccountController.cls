public with sharing class AccountController {
    @AuraEnabled
    public static void requestLimitIncrease(Id accountId, Decimal amount) {
        try {
            AccountService.updateCreditLimit(accountId, amount);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}