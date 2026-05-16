public with sharing class MetadataController {
    
    // Remove cacheable=true because we're making a callout
    @AuraEnabled
    public static String getObjectMetadata(String objectName) {
        try {
            // Get base URL
            String baseUrl = System.URL.getOrgDomainUrl().toExternalForm();
            String restEndpoint = baseUrl + '/services/data/v66.0/sobjects/' + objectName + '/';
            
            // Create HTTP request
            HttpRequest req = new HttpRequest();
            req.setEndpoint(restEndpoint);
            req.setMethod('GET');
            req.setHeader('Authorization', 'Bearer ' + UserInfo.getSessionId());
            req.setHeader('Content-Type', 'application/json');
            
            // Send request
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            // Parse response
            if (res.getStatusCode() == 200) {
                return res.getBody();
            } else {
                throw new AuraHandledException('Error: ' + res.getStatusCode() + ' - ' + res.getBody());
            }
        } catch (Exception e) {
            throw new AuraHandledException('Failed to fetch metadata: ' + e.getMessage());
        }
    }

     @AuraEnabled
    public static String getFullObjectDescribe(String objectName) {
        try {
            // Get base URL - Using v66.0 as per your requirement
            String baseUrl = System.URL.getOrgDomainUrl().toExternalForm();
            // Added /describe/ to the endpoint to get fields and child relationships
            String restEndpoint = baseUrl + '/services/data/v66.0/sobjects/' + objectName + '/describe/';
            
            HttpRequest req = new HttpRequest();
            req.setEndpoint(restEndpoint);
            req.setMethod('GET');
            
            // Note: Use Named Credentials for LWC; Use SessionId for Execute Anonymous
            req.setHeader('Authorization', 'Bearer ' + UserInfo.getSessionId());
            req.setHeader('Content-Type', 'application/json');
            
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            if (res.getStatusCode() == 200) {
                return res.getBody();
            } else {
                String errorMsg = 'Error: ' + res.getStatusCode() + ' - ' + res.getBody();
                AuraHandledException ex = new AuraHandledException(errorMsg);
                ex.setMessage(errorMsg);
                throw ex;
            }
        } catch (Exception e) {
            AuraHandledException ex = new AuraHandledException(e.getMessage());
            ex.setMessage(e.getMessage());
            throw ex;
        }
    }

    @AuraEnabled
    public static String getMetadataIfChanged(String objectName, DateTime lastCheckDate) {
        try {
            String baseUrl = System.URL.getOrgDomainUrl().toExternalForm();
            String restEndpoint = baseUrl + '/services/data/v66.0/sobjects/' + objectName + '/describe/';
            
            // Format Date to: EEE, dd MMM yyyy HH:mm:ss z (GMT)
            // Example: Wed, 03 Jul 2013 19:43:31 GMT
            String formattedDate = lastCheckDate.formatGmt('EEE, dd MMM yyyy HH:mm:ss') + ' GMT';
            
            HttpRequest req = new HttpRequest();
            req.setEndpoint(restEndpoint);
            req.setMethod('GET');
            req.setHeader('Authorization', 'Bearer ' + UserInfo.getSessionId());
            req.setHeader('Content-Type', 'application/json');
            
            // Critical Header for checking changes
            req.setHeader('If-Modified-Since', formattedDate);
            
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            if (res.getStatusCode() == 200) {
                return res.getBody(); // Metadata has changed
            } else if (res.getStatusCode() == 304) {
                return 'STATUS_304: No changes since ' + formattedDate;
            } else {
                throw new AuraHandledException('Error: ' + res.getStatusCode() + ' - ' + res.getBody());
            }
        } catch (Exception e) {
            throw new AuraHandledException('Failed: ' + e.getMessage());
        }
    }
}


// ===============================
// String objectName = 'Contact';
// try {
// String result = 
//     MetadataController.getFullObjectDescribe(objectName);
// // Deserialize and re-serialize to "prettify" the log output
//     String prettyJson = 
//         JSON.serializePretty(JSON.deserializeUntyped(result));
//     System.debug('--- Formatted Metadata ---');
//     System.debug(prettyJson);
// } catch (Exception e) {
//     System.debug('Error: ' + e.getMessage());
// }


// =============
//     String objectName = 'Campaign';
// // Test 1: Date in the past (Should return 200 + Data)
// DateTime oldDate = DateTime.now().addDays(-1);

// try {
//     System.debug('--- Checking for changes since 2013 ---');
//     String result = MetadataController.getMetadataIfChanged(objectName, oldDate);
    
//     if(result.startsWith('STATUS_304')) {
//         System.debug(result);
//     } else {
//         String prettyJson = JSON.serializePretty(JSON.deserializeUntyped(result));
//         System.debug('Changes detected! Metadata received:');
//         System.debug(prettyJson);
//     }

//     // Test 2: Check with "Now" (Should return 304)
//     System.debug('--- Checking for changes since right now ---');
//     String resultNow = MetadataController.getMetadataIfChanged(objectName, DateTime.now());
//     System.debug(resultNow);

// } catch (Exception e) {
//     System.debug('Error: ' + e.getMessage());
// }
// =======================