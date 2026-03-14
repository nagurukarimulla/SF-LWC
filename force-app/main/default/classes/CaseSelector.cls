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
            Case.Subject,
            Case.Status,
            Case.AccountId,
            Case.ContactId
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
}