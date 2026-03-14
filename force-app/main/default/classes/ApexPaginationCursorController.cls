public with sharing class ApexPaginationCursorController {
    
    public class PageResult {
        @AuraEnabled public List<Account> records;
        @AuraEnabled public Integer nextIndex;
        @AuraEnabled public Boolean done;
        @AuraEnabled public Integer totalRecords;
        @AuraEnabled public Integer currentPage;
        @AuraEnabled public Integer totalPages;
        @AuraEnabled public Integer pageSize;
       
    }
    
    @AuraEnabled(cacheable=false)
    public static PageResult getAccounts(Integer startIndex, Integer pageSize) {
        try {
            System.debug('=== Starting getAccounts ===');
            System.debug('startIndex: ' + startIndex);
            System.debug('pageSize: ' + pageSize);
            
            // Simple query without search
            String query = 'SELECT Id, Name, Industry, Phone FROM Account ORDER BY Name';
            System.debug('Query: ' + query);
            
            // Get total count
            Integer totalRecords = Database.countQuery('SELECT COUNT() FROM Account');
            System.debug('Total Records: ' + totalRecords);
            
            // Create pagination cursor
            Database.PaginationCursor cursor = Database.getPaginationCursor(query);
            System.debug('Cursor created successfully');
            
            // Fetch page
            Database.CursorFetchResult result = cursor.fetchPage(startIndex, pageSize);
            System.debug('fetchPage called with startIndex: ' + startIndex + ', pageSize: ' + pageSize);
            
            List<Account> records = (List<Account>)result.getRecords();
            System.debug('Records fetched: ' + records.size());
            
            // Calculate pagination info
            Integer nextIndex = result.getNextIndex();
            Boolean isDone = result.isDone();
          
            
            System.debug('Next Index: ' + nextIndex);
            System.debug('Is Done: ' + isDone);
           
            
            // Build response
            PageResult response = new PageResult();
            response.records = records;
            response.nextIndex = nextIndex;
            response.done = isDone;
            response.totalRecords = totalRecords;
            response.pageSize = pageSize;
            response.currentPage = (startIndex / pageSize) + 1;
            response.totalPages = (Integer)Math.ceil((Double)totalRecords / (Double)pageSize);
            
            System.debug('Current Page: ' + response.currentPage);
            System.debug('Total Pages: ' + response.totalPages);
            System.debug('=== Ending getAccounts ===');
            
            return response;
            
        } catch (Exception e) {
            System.debug('Error: ' + e.getMessage());
            System.debug('Stack Trace: ' + e.getStackTraceString());
            throw new AuraHandledException('Error: ' + e.getMessage());
        }
    }
}