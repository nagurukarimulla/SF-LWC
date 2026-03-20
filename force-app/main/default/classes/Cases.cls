public with sharing class Cases extends fflib_SObjectDomain {
    
    public Cases(List<Case> sObjectList) {
        super(sObjectList);
    }
    
    public class Constructor implements fflib_SObjectDomain.IConstructable {
        public fflib_SObjectDomain construct(List<SObject> sObjectList) {
            return new Cases(sObjectList);
        }
    }
    
    
    public void validateForEscalation(Set<String> validStatuses) {
        List<String> invalidCaseNumbers = new List<String>();
        List<String> alreadyEscalated = new List<String>();
        
        for(Case c : (List<Case>) Records) {
            if(c.Status == 'Escalated') {
                alreadyEscalated.add(c.CaseNumber);
            } else if(!validStatuses.contains(c.Status)) {
                invalidCaseNumbers.add(c.CaseNumber);
            }
        }
        
        if(!alreadyEscalated.isEmpty()) {
            throw new DomainException(
                'Cannot escalate: The following cases are already escalated: ' + 
                String.join(alreadyEscalated, ', ')
            );
        }
        
        if(!invalidCaseNumbers.isEmpty()) {
            throw new DomainException(
                'Cannot escalate: The following cases must be in ' + 
                String.join(new List<String>(validStatuses), ', ') + 
                ' status: ' + String.join(invalidCaseNumbers, ', ')
            );
        }
    }
    
    public void validateAlreadyEscalated() {
        List<String> escalatedCaseNumbers = new List<String>();
        
        for(Case c : (List<Case>) Records) {
            if(c.Status == 'Escalated') {
                escalatedCaseNumbers.add(c.CaseNumber);
            }
        }
        
        if(!escalatedCaseNumbers.isEmpty()) {
            throw new DomainException(
                'The following cases are already escalated: ' + 
                String.join(escalatedCaseNumbers, ', ')
            );
        }
    }
    
   public void applyEscalation(String escalationNote) {
        for(Case c : (List<Case>) Records) {
            c.Status = 'Escalated';
            c.Priority = 'High';
            
            // Append escalation note to description
            if(c.Description == null) {
                c.Description = escalationNote;
            } else {
                c.Description += '\n\n' + escalationNote;
            }
        }
    }
    
    public class DomainException extends Exception {}
}