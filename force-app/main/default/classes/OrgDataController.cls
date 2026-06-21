public with sharing class OrgDataController {
    @AuraEnabled(cacheable=true)
    public static OrgDataWrapper getOrgData() {
        OrgDataWrapper wrapper = new OrgDataWrapper();
        
        // Header Data - Org Information
        Organization org = [SELECT Id, Name, InstanceName, OrganizationType 
                           FROM Organization LIMIT 1];
        wrapper.orgId = org.Id;
        wrapper.orgName = org.Name;
        wrapper.instanceUrl = URL.getOrgDomainUrl().toExternalForm();
        
        // Middle Section - Account Data
        List<Account> accounts = [SELECT Id, Name 
                                  FROM Account 
                                  ORDER BY CreatedDate DESC 
                                  LIMIT 5];
        wrapper.totalAccounts = [SELECT COUNT() FROM Account];
        wrapper.recentAccounts = accounts;
        
        // Footer Section - Opportunity Data
        List<Opportunity> opportunities = [SELECT Id, Name, StageName 
                                          FROM Opportunity 
                                          ORDER BY CreatedDate DESC 
                                          LIMIT 5];
        wrapper.totalOpportunities = [SELECT COUNT() FROM Opportunity];
        wrapper.recentOpportunities = opportunities;
        
        return wrapper;
    }
    
    // Wrapper class to hold all data
    public class OrgDataWrapper {
        @AuraEnabled public String orgId;
        @AuraEnabled public String orgName;
        @AuraEnabled public String instanceUrl;
        @AuraEnabled public Integer totalAccounts;
        @AuraEnabled public List<Account> recentAccounts;
        @AuraEnabled public Integer totalOpportunities;
        @AuraEnabled public List<Opportunity> recentOpportunities;
    }
}