public with sharing class AccountSelector extends fflib_SObjectSelector {
    
    public Schema.SObjectType getSObjectType() {
        return Account.SObjectType;
    }
    
    public List<Schema.SObjectField> getSObjectFieldList() {
        return new List<Schema.SObjectField>{
            Account.Id,
            Account.Name,
            Account.Phone,
            Account.Industry,
            Account.Type,
            Account.Rating,
            Account.AnnualRevenue,
            Account.CreatedDate,
            Account.LastModifiedDate
        };
    }
    
    public List<Account> selectById(Set<Id> idSet) {
        return (List<Account>) selectSObjectsById(idSet);
    }
    
    public List<Account> selectByName(String name) {
        fflib_QueryFactory qf = newQueryFactory();
        qf.setCondition('Name LIKE \'%' + String.escapeSingleQuotes(name) + '%\'');
        return (List<Account>) Database.query(qf.toSOQL());
    }
    
    public List<Account> selectByIndustry(String industry) {
        fflib_QueryFactory qf = newQueryFactory();
        qf.setCondition('Industry = :industry');
        qf.setOrdering('Name', fflib_QueryFactory.SortOrder.ASCENDING);
        return (List<Account>) Database.query(qf.toSOQL());
    }
    
    public List<Account> selectRecent(Integer limitCount) {
        fflib_QueryFactory qf = newQueryFactory();
        qf.setOrdering('CreatedDate', fflib_QueryFactory.SortOrder.DESCENDING);
        qf.setLimit(limitCount);
        return (List<Account>) Database.query(qf.toSOQL());
    }
}