public with sharing class ContactsSelector extends fflib_SObjectSelector {
    
    public Schema.SObjectType getSObjectType() {
        return Contact.SObjectType;
    }
    
    public List<Schema.SObjectField> getSObjectFieldList() {
        return new List<Schema.SObjectField>{
            Contact.Id,
            Contact.Name,
            Contact.FirstName,
            Contact.LastName,
            Contact.Email,
            Contact.Phone,
            Contact.AccountId,
            Contact.Account.Name,
            Contact.Title,
            Contact.Department
        };
    }
    
    public List<Contact> selectById(Set<Id> idSet) {
        return (List<Contact>) selectSObjectsById(idSet);
    }
    
    public List<Contact> selectByAccountId(Set<Id> accountIds) {
        fflib_QueryFactory qf = newQueryFactory();
        qf.setCondition('AccountId IN :accountIds');
        return (List<Contact>) Database.query(qf.toSOQL());
    }
    
    public List<Contact> selectByEmail(String email) {
        fflib_QueryFactory qf = newQueryFactory();
        qf.setCondition('Email = :email');
        return (List<Contact>) Database.query(qf.toSOQL());
    }
}
