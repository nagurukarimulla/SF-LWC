public with sharing class CaseController {
    @AuraEnabled(cacheable=true)
    public static List<Case> fetchCases(List<Id> caseIds) {
        CaseService service = new CaseService();
        // Convert List<Id> to Set<Id> when calling
        return service.getCasesWithRelations(
            caseIds != null ? new Set<Id>(caseIds) : new Set<Id>()
        );
    }

    @AuraEnabled
    public static void sendCasesToSecondaryOrg(List<Id> caseIds) {
        CaseService service = new CaseService();
        List<Case> cases = service.getCasesWithRelations(
            caseIds != null ? new Set<Id>(caseIds) : new Set<Id>()
        );

        // Transform Case objects to CaseWrapper format
        List<CaseWrapper> wrappers = new List<CaseWrapper>();
        
        for (Case c : cases) {
            CaseWrapper wrapper = new CaseWrapper();
            wrapper.Id = c.Id;
            wrapper.CaseNumber = c.CaseNumber;
            wrapper.Subject = c.Subject;
            wrapper.Status = c.Status;
            
            // Handle Account
            if (c.Account != null) {
                wrapper.Account = new AccountWrapper();
                wrapper.Account.Id = c.Account.Id;
                wrapper.Account.Name = c.Account.Name;
            }
            
            // Handle Contact
            if (c.Contact != null) {
                wrapper.Contact = new ContactWrapper();
                wrapper.Contact.Id = c.Contact.Id;
                wrapper.Contact.FirstName = c.Contact.FirstName;
                wrapper.Contact.LastName = c.Contact.LastName;
                wrapper.Contact.Email = c.Contact.Email;
            }
            
            wrappers.add(wrapper);
        }
        
        // Serialize the wrappers instead of the Case objects
        String payload = JSON.serialize(wrappers);
        
        // Debug to check the payload
        System.debug('Payload: ' + payload);
        
        HttpRequest req = new HttpRequest();
        // Use the full REST endpoint path
        req.setEndpoint('callout:LWC_org/services/apexrest/caseSync');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setBody(payload);

        Http http = new Http();
        HttpResponse res = http.send(req);

        System.debug('Response Status: ' + res.getStatusCode());
        System.debug('Response Body: ' + res.getBody());

        if (res.getStatusCode() != 200) {
            throw new AuraHandledException('Failed to send cases: ' + res.getBody());
        }
    }
    
    // Define wrapper classes inside the controller or in separate files
    public class CaseWrapper {
        public String Id;
        public String CaseNumber;
        public String Subject;
        public String Status;
        public AccountWrapper Account;
        public ContactWrapper Contact;
    }
    
    public class AccountWrapper {
        public String Id;
        public String Name;
    }
    
    public class ContactWrapper {
        public String Id;
        public String FirstName;
        public String LastName;
        public String Email;
    }
}