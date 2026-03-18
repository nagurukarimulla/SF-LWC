public with sharing class DomainController {
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getDomainInfo() {
        Map<String, Object> domainInfo = new Map<String, Object>();
        
        try {
            // Use URL.getOrgDomainUrl() instead of getSalesforceBaseUrl()
            String hostname = URL.getOrgDomainUrl().getHost();
            
            System.Domain currentDomain = System.DomainParser.parse(hostname);
            
            domainInfo.put('domainType', currentDomain.getDomainType().name());
            domainInfo.put('myDomainName', currentDomain.getMyDomainName());
            domainInfo.put('sandboxName', currentDomain.getSandboxName());
            domainInfo.put('packageName', currentDomain.getPackageName());
            domainInfo.put('sitesSubdomainName', currentDomain.getSitesSubdomainName());
            
            return domainInfo;
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving domain info: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static Map<String, Object> parseDomain(String domainUrl) {
        Map<String, Object> domainInfo = new Map<String, Object>();
        
        try {
            // Extract hostname from URL if full URL is provided
            String hostname = domainUrl;
            if (domainUrl.startsWith('http')) {
                // Use URL class for proper parsing
                Url url = new Url(domainUrl);
                hostname = url.getHost();
            }
            
            System.Domain parsedDomain = System.DomainParser.parse(hostname);
            
            domainInfo.put('domainType', parsedDomain.getDomainType().name());
            domainInfo.put('myDomainName', parsedDomain.getMyDomainName());
            domainInfo.put('sandboxName', parsedDomain.getSandboxName());
            domainInfo.put('packageName', parsedDomain.getPackageName());
            domainInfo.put('sitesSubdomainName', parsedDomain.getSitesSubdomainName());
            
            return domainInfo;
        } catch (Exception e) {
            throw new AuraHandledException('Error parsing domain: ' + e.getMessage());
        }
    }
    
    // Optional: Alternative method to get current instance URL
    @AuraEnabled(cacheable=true)
    public static String getCurrentInstanceUrl() {
        return URL.getOrgDomainUrl().toExternalForm();
    }
}