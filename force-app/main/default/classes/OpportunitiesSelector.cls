public with sharing class OpportunitiesSelector extends fflib_SObjectSelector {
    
    public Schema.SObjectType getSObjectType() {
        return Opportunity.SObjectType;
    }
    
    public List<Schema.SObjectField> getSObjectFieldList() {
        return new List<Schema.SObjectField>{
            Opportunity.Id,
            Opportunity.Name,
            Opportunity.AccountId,
            Opportunity.Account.Name,
            Opportunity.StageName,
            Opportunity.Amount,
            Opportunity.CloseDate,
            Opportunity.Probability,
            Opportunity.Type,
            Opportunity.CreatedDate,
            Opportunity.LastModifiedDate,
            Opportunity.OwnerId
        };
    }
    
    public List<Opportunity> selectById(Set<Id> idSet) {
        return (List<Opportunity>) selectSObjectsById(idSet);
    }
    
    public List<Opportunity> selectByAccountId(Set<Id> accountIds) {
        fflib_QueryFactory qf = newQueryFactory();
        qf.setCondition('AccountId IN :accountIds');
        qf.setOrdering('CloseDate', fflib_QueryFactory.SortOrder.ASCENDING);
        return (List<Opportunity>) Database.query(qf.toSOQL());
    }
    
    public List<Opportunity> selectByStage(String stage) {
        fflib_QueryFactory qf = newQueryFactory();
        qf.setCondition('StageName = :stage');
        return (List<Opportunity>) Database.query(qf.toSOQL());
    }
    
    public List<Opportunity> selectWonOpportunities(Date fromDate) {
        fflib_QueryFactory qf = newQueryFactory();
        qf.setCondition('StageName = \'Closed Won\' AND CloseDate >= :fromDate');
        qf.setOrdering('Amount', fflib_QueryFactory.SortOrder.DESCENDING);
        return (List<Opportunity>) Database.query(qf.toSOQL());
    }

    public List<Opportunity> selectByIdWithAccount(Set<Id> idSet) {
        fflib_QueryFactory qf = newQueryFactory();
        
        // Add the condition
        qf.setCondition('Id IN :idSet');
        
        // Select related fields properly
        qf.selectField('Account.Id');
        qf.selectField('Account.Name');
        qf.selectField('Account.Owner.Id');
        qf.selectField('Account.Owner.Name');
        
        String soql = qf.toSOQL();
        System.debug('Generated SOQL: ' + soql); // For debugging
        
        return (List<Opportunity>) Database.query(soql);
    }
}