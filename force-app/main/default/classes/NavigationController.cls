public with sharing class NavigationController {
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getAccountMetrics() {
        Map<String, Object> result = new Map<String, Object>();
        
        // Get account count
        Integer accountCount = [SELECT COUNT() FROM Account];
        result.put('totalCount', accountCount);
        
        // Get recent accounts
        List<Account> accounts = [SELECT Id, Name, Type, Industry FROM Account ORDER BY CreatedDate DESC LIMIT 10];
        result.put('records', accounts);
        
        return result;
    }
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getContactMetrics() {
        Map<String, Object> result = new Map<String, Object>();
        
        Integer contactCount = [SELECT COUNT() FROM Contact];
        result.put('totalCount', contactCount);
        
        List<Contact> contacts = [SELECT Id, Name, Email, Phone, Title FROM Contact ORDER BY CreatedDate DESC LIMIT 10];
        result.put('records', contacts);
        
        return result;
    }
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getOpportunityMetrics() {
        Map<String, Object> result = new Map<String, Object>();
        
        // Get total pipeline value
        AggregateResult totalValue = [SELECT SUM(Amount) total FROM Opportunity WHERE IsClosed = false];
        result.put('totalValue', totalValue.get('total'));
        
        List<Opportunity> opportunities = [SELECT Id, Name, Amount, StageName, CloseDate FROM Opportunity ORDER BY CreatedDate DESC LIMIT 10];
        result.put('records', opportunities);
        
        return result;
    }
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getCaseMetrics() {
        Map<String, Object> result = new Map<String, Object>();
        
        Integer openCases = [SELECT COUNT() FROM Case WHERE IsClosed = false];
        result.put('openCount', openCases);
        
        List<Case> cases = [SELECT Id, CaseNumber, Subject, Status, Priority FROM Case WHERE IsClosed = false ORDER BY CreatedDate DESC LIMIT 10];
        result.put('records', cases);
        
        return result;
    }
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getTaskMetrics() {
        Map<String, Object> result = new Map<String, Object>();
        
        Integer pendingTasks = [SELECT COUNT() FROM Task WHERE Status != 'Completed' AND IsClosed = false];
        result.put('pendingCount', pendingTasks);
        
        List<Task> tasks = [SELECT Id, Subject, Status, ActivityDate FROM Task WHERE Status != 'Completed' ORDER BY ActivityDate ASC NULLS LAST LIMIT 10];
        result.put('records', tasks);
        
        return result;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<RecentItem> getRecentItems() {
        List<RecentItem> recentItems = new List<RecentItem>();
        
        // Get recently viewed records
        for (RecentlyViewed rv : [SELECT Id, Name, Type FROM RecentlyViewed ORDER BY LastViewedDate DESC LIMIT 10]) {
            RecentItem item = new RecentItem();
            item.id = rv.Id;
            item.name = rv.Name;
            item.objectApiName = rv.Type;
            item.objectLabel = rv.Type;
            recentItems.add(item);
        }
        
        return recentItems;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<SearchResult> searchRecords(String searchTerm) {
        List<SearchResult> results = new List<SearchResult>();
        
        String searchQuery = 'FIND \'' + String.escapeSingleQuotes(searchTerm) + '*\' IN ALL FIELDS RETURNING ';
        
        // Search across multiple objects
        searchQuery += 'Account(Id, Name), ';
        searchQuery += 'Contact(Id, Name, Email), ';
        searchQuery += 'Opportunity(Id, Name), ';
        searchQuery += 'Case(Id, CaseNumber)';
        
        List<List<SObject>> searchResults = Search.query(searchQuery);
        
        // Parse results
        if (searchResults != null && searchResults.size() >= 4) {
            // Add accounts
            for (Account acc : (List<Account>)searchResults[0]) {
                results.add(new SearchResult(acc.Id, acc.Name, 'Account'));
            }
            
            // Add contacts
            for (Contact con : (List<Contact>)searchResults[1]) {
                results.add(new SearchResult(con.Id, con.Name, 'Contact'));
            }
            
            // Add opportunities
            for (Opportunity opp : (List<Opportunity>)searchResults[2]) {
                results.add(new SearchResult(opp.Id, opp.Name, 'Opportunity'));
            }
            
            // Add cases
            for (Case c : (List<Case>)searchResults[3]) {
                results.add(new SearchResult(c.Id, c.CaseNumber, 'Case'));
            }
        }
        
        return results;
    }
    
    // Wrapper classes
    public class RecentItem {
        @AuraEnabled public String id;
        @AuraEnabled public String name;
        @AuraEnabled public String objectApiName;
        @AuraEnabled public String objectLabel;
    }
    
    public class SearchResult {
        @AuraEnabled public String id;
        @AuraEnabled public String label;
        @AuraEnabled public String objectApiName;
        @AuraEnabled public String objectLabel;
        
        public SearchResult(String id, String label, String objectApiName) {
            this.id = id;
            this.label = label;
            this.objectApiName = objectApiName;
            this.objectLabel = objectApiName;
        }
    }

    
}