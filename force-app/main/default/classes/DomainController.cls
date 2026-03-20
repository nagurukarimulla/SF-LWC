public with sharing class DomainController {
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getDomainInfo() {
        Map<String, Object> domainInfo = new Map<String, Object>();
        
        try {
            // Get org domain URL (works in all contexts)
            Url orgUrl = URL.getOrgDomainUrl();
            String hostname = orgUrl.getHost();
            
            System.Domain currentDomain = System.DomainParser.parse(hostname);
            
            domainInfo.put('domainType', getDomainTypeDisplay(currentDomain.getDomainType()));
            domainInfo.put('myDomainName', currentDomain.getMyDomainName() ?? '');
            domainInfo.put('sandboxName', currentDomain.getSandboxName() ?? '');
            domainInfo.put('packageName', currentDomain.getPackageName() ?? '');
            domainInfo.put('sitesSubdomainName', currentDomain.getSitesSubdomainName() ?? '');
            domainInfo.put('fullDomain', hostname);
            
            return domainInfo;
        } catch (Exception e) {
            System.debug('Error in getDomainInfo: ' + e.getMessage());
            throw new AuraHandledException('Unable to retrieve domain information');
        }
    }
    
    @AuraEnabled
    public static Map<String, Object> parseDomain(String domainUrl) {
        Map<String, Object> domainInfo = new Map<String, Object>();
        
        try {
            if (String.isBlank(domainUrl)) {
                throw new AuraHandledException('Please enter a domain to parse');
            }
            
            // Clean and parse the URL
            String cleanUrl = domainUrl.trim();
            if (!cleanUrl.startsWith('http')) {
                cleanUrl = 'https://' + cleanUrl;
            }
            
            Url url = new Url(cleanUrl);
            String hostname = url.getHost();
            
            // Validate it's a Salesforce domain
            if (!isSalesforceDomain(hostname)) {
                throw new AuraHandledException('Not a valid Salesforce domain');
            }
            
            System.Domain parsedDomain = System.DomainParser.parse(hostname);
            
            domainInfo.put('domainType', getDomainTypeDisplay(parsedDomain.getDomainType()));
            domainInfo.put('myDomainName', parsedDomain.getMyDomainName() ?? '');
            domainInfo.put('sandboxName', parsedDomain.getSandboxName() ?? '');
            domainInfo.put('packageName', parsedDomain.getPackageName() ?? '');
            domainInfo.put('sitesSubdomainName', parsedDomain.getSitesSubdomainName() ?? '');
            domainInfo.put('parsedHostname', hostname);
            
            return domainInfo;
        } catch (Exception e) {
            System.debug('Error in parseDomain: ' + e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    private static Boolean isSalesforceDomain(String hostname) {
        return hostname.endsWith('.force.com') || 
               hostname.endsWith('.salesforce.com') ||
               hostname.endsWith('.cloudforce.com') ||
               hostname.endsWith('.database.com');
    }
    
    private static String getDomainTypeDisplay(System.DomainType domainType) {
        if (domainType == null) return 'UNKNOWN';
        
        // Convert enum to readable format
        String typeName = domainType.name();
        // Replace underscores with spaces and capitalize first letter of each word
        String[] words = typeName.toLowerCase().split('_');
        for (Integer i = 0; i < words.size(); i++) {
            if (words[i].length() > 0) {
                words[i] = words[i].substring(0, 1).toUpperCase() + 
                          words[i].substring(1);
            }
        }
        return String.join(words, ' ');
    }
}