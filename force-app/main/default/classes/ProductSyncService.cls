/*
// Org 1: ProductSyncService.cls
public with sharing class ProductSyncService {
    
    private static final String NAMED_CREDENTIAL = 'callout:LWC_org';
    private static final String ENDPOINT = '/services/apexrest/v1/product/sync/';
    
    public static Boolean syncToSecondary(Product_Sync_Event__e event) {
        HttpRequest req = new HttpRequest();
        HttpResponse res = new HttpResponse();
        Http http = new Http();
        
        try {
            // Build request using Named Credential
            req.setEndpoint(NAMED_CREDENTIAL + ENDPOINT);
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('Accept', 'application/json');
            
            // Use the JSON from the event
            req.setBody(event.Product_JSON__c);
            
            // Set timeout (10 seconds for enterprise)
            req.setTimeout(120000);
            
            // Send request
            res = http.send(req);
            
            // Parse response
            if (res.getStatusCode() == 200) {
                Map<String, Object> responseMap = (Map<String, Object>)JSON.deserializeUntyped(res.getBody());
                Boolean success = (Boolean)responseMap.get('success');
                
                if (success) {
                    // Log success
                    System.debug('Sync successful: ' + res.getBody());
                    return true;
                } else {
                    // Log failure from remote system
                    String errorMsg = (String)responseMap.get('message');
                    throw new ProductSyncException('Remote system error: ' + errorMsg);
                }
            } else {
                throw new ProductSyncException('HTTP Error: ' + res.getStatusCode() + ' - ' + res.getStatus());
            }
            
        } catch (Exception e) {
            System.debug('Callout failed: ' + e.getMessage());
            throw new ProductSyncException('Sync failed: ' + e.getMessage());
        }
    }
    
    public class ProductSyncException extends Exception {}
}*/
// Org 1: ProductSyncService.cls - UPDATED with correct Named Credential
public with sharing class ProductSyncService {
    
    // CHANGE THIS LINE - Use your actual Named Credential name
    private static final String NAMED_CREDENTIAL = 'callout:LWC_org';  // Changed from Secondary_Org
    
    private static final String ENDPOINT = '/services/apexrest/v1/product/sync/';
    
    public static Boolean syncToSecondary(Product_Sync_Event__e event) {
        HttpRequest req = new HttpRequest();
        HttpResponse res = new HttpResponse();
        Http http = new Http();
        
        try {
            // Build request using Named Credential
            String endpoint = NAMED_CREDENTIAL + ENDPOINT;
            req.setEndpoint(endpoint);
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('Accept', 'application/json');
            
            // Use the JSON from the event
            req.setBody(event.Product_JSON__c);
            req.setTimeout(120000);
            
            System.debug('🔌 Calling: ' + endpoint);
            System.debug('📦 Payload: ' + event.Product_JSON__c);
            
            // Send request
            res = http.send(req);
            
            System.debug('📥 Response Code: ' + res.getStatusCode());
            System.debug('📥 Response Body: ' + res.getBody());
            
            if (res.getStatusCode() == 200) {
                Map<String, Object> responseMap = (Map<String, Object>)JSON.deserializeUntyped(res.getBody());
                Boolean success = (Boolean)responseMap.get('success');
                
                if (success) {
                    System.debug('✅ Sync successful');
                    ErrorLogHelper.logSuccess(
                        'ProductSync',
                        'Success: Product synced to secondary org',
                        event.Product_ID__c
                    );
                    return true;
                } else {
                    String errorMsg = (String)responseMap.get('message');
                    ErrorLogHelper.logError(
                        'ProductSync',
                        'Remote system error: ' + errorMsg,
                        event.Product_ID__c
                    );
                    throw new ProductSyncException('Remote system error: ' + errorMsg);
                }
            } else {
                ErrorLogHelper.logError(
                    'ProductSync',
                    'HTTP Error: ' + res.getStatusCode() + ' - ' + res.getStatus(),
                    event.Product_ID__c
                );
                throw new ProductSyncException('HTTP Error: ' + res.getStatusCode() + ' - ' + res.getStatus());
            }
            
        } catch (Exception e) {
            String errorMsg = 'Sync failed: ' + e.getMessage();
            System.debug('❌ ' + errorMsg);
            
            ErrorLogHelper.logError(
                'ProductSync',
                errorMsg,
                event.Product_ID__c
            );
            
            throw new ProductSyncException(errorMsg);
        }
    }
    
    public class ProductSyncException extends Exception {}
}