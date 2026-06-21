public with sharing class BitlyAPIService {
    
    @AuraEnabled
    public static String shortenUrl(String longUrl, String domain, String groupGuid) {
        try {
            // Prepare request body exactly like your working Anonymous Apex
            Map<String, Object> payload = new Map<String, Object>();
            payload.put('long_url', longUrl);
            payload.put('domain', domain);
            payload.put('force_new_link', true);
            
            if (String.isNotBlank(groupGuid)) {
                payload.put('group_guid', groupGuid);
            }
            
            String body = JSON.serialize(payload);
            System.debug('Request Body: ' + body);
            
            // Make HTTP request
            HttpRequest req = new HttpRequest();
            req.setEndpoint('https://api-ssl.bitly.com/v4/shorten');
            req.setMethod('POST');
            req.setHeader('Authorization', 'Bearer 3ff2c7d46c08d1e1a40c04990965a28017759890');
            req.setHeader('Content-Type', 'application/json');
            req.setBody(body);
            
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            System.debug('Status: ' + res.getStatusCode());
            System.debug('Response: ' + res.getBody());
            
            return res.getBody();
            
        } catch (Exception e) {
            System.debug('Error: ' + e.getMessage());
            return '{"error":"' + e.getMessage() + '"}';
        }
    }
}