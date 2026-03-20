public with sharing class CaseSelector extends fflib_SObjectSelector {

    public CaseSelector() {
        super();
    }

    // Implement abstract methods
    public Schema.SObjectType getSObjectType() {
        return Case.SObjectType;
    }

    public List<Schema.SObjectField> getSObjectFieldList() {
        return new List<Schema.SObjectField>{
            Case.Id, 
            Case.CaseNumber,
            Case.Status, 
            Case.Priority, 
            Case.Description,
            Case.Subject,
            Case.Origin,
            Case.ContactId,
            Case.AccountId,
            Case.OwnerId,
            Case.CreatedDate
        };
    }

    // Custom query method for specific cases
    public List<Case> selectCasesWithRelations(Set<Id> caseIds) {
        // Handle empty set
        if (caseIds == null || caseIds.isEmpty()) {
            return new List<Case>();
        }
        
        return [
            SELECT Id, CaseNumber, Subject, Status,
                   Account.Id, Account.Name,
                   Contact.Id, Contact.FirstName, Contact.Email, Contact.LastName
            FROM Case
            WHERE Id IN :caseIds
        ];
    }
    
    // New method for getting all cases
    public List<Case> selectAllCasesWithRelations() {
        return [
            SELECT Id, CaseNumber, Subject, Status,
                   Account.Id, Account.Name,
                   Contact.Id, Contact.FirstName, Contact.Email, Contact.LastName
            FROM Case
            ORDER BY CreatedDate DESC
            LIMIT 10
        ];
    }

        public List<Case> selectByIdWithDetails(Set<Id> idSet) {
        fflib_QueryFactory qf = newQueryFactory();
        qf.setCondition('Id IN :idSet');
        qf.selectField('Contact.Name');
        qf.selectField('Account.Name');
        qf.selectField('Owner.Name');
        return (List<Case>) Database.query(qf.toSOQL());
    }

    public List<Case> selectByStatus(Set<String> statuses) {
        fflib_QueryFactory qf = newQueryFactory();
        qf.setCondition('Status IN :statuses');
        qf.setOrdering('CreatedDate', fflib_QueryFactory.SortOrder.DESCENDING);
        return (List<Case>) Database.query(qf.toSOQL());
    }
}