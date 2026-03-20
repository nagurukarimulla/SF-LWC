@RestResource(urlMapping='/case/*/close')
global with sharing class CaseCloseResource {
    @HttpPost
    global static void closeCase(String reason) {
        // Parse the Case Id from the URI
        RestRequest req = RestContext.request;
        String[] uriParts = req.requestURI.split('/');
        // The URL is /case/{id}/close, so index 2 is the ID
        Id caseId = uriParts[2];
        
        // Call the service method
        CaseService.closeCases(new Set<Id> { caseId }, reason);
    }
}