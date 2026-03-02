public with sharing class EnterpriseAccountPaginationController {

    @AuraEnabled
    public static Map<String, Object> getAccounts(Integer startIndex, Integer pageSize) {

        Database.PaginationCursor pCursor =
            Database.getPaginationCursor(
                'SELECT Id, Name, Industry, Rating FROM Account ORDER BY CreatedDate DESC'
            );

        Database.CursorFetchResult result =
            pCursor.fetchPage(startIndex, pageSize);

        Map<String, Object> response = new Map<String, Object>();
        response.put('records', result.getRecords());
        response.put('nextIndex', result.getNextIndex());
        response.put('isDone', result.isDone());

        return response;
    }
}