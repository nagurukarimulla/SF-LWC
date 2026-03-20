public with sharing class AccountService {
    public static void updateCreditLimit(Id accountId, Decimal requestedLimit) {
    fflib_SObjectUnitOfWork uow = new fflib_SObjectUnitOfWork(new List<SObjectType>{ Account.SObjectType });

    // 1. Get current data from Selector
    List<Account> accs = new AccountsSelector().selectById(new Set<Id>{ accountId });
    Account acc = accs[0];

    // 2. Validate via Domain
    Accounts domainAccs = new Accounts(accs);
    domainAccs.validateCreditLimit(requestedLimit);

    // 3. Perform the Addition: Existing + New
    Decimal existingRevenue = acc.AnnualRevenue != null ? acc.AnnualRevenue : 0;
    acc.AnnualRevenue = existingRevenue + requestedLimit;

    // 4. Register and Commit
    uow.registerDirty(acc);
    uow.commitWork();
}
}