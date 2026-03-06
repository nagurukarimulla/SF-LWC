public with sharing class SalesDashboardController {

    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getTopDeals(){
        try {
            return [
                SELECT Id, Name, Amount, StageName
                FROM Opportunity
                ORDER BY Amount DESC
                LIMIT 5
            ];
        } catch (QueryException e) {
            System.debug(LoggingLevel.ERROR, 'Query failed: ' + e.getMessage());
            throw new AuraHandledException('Unable to retrieve top deals');
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Unexpected error: ' + e.getMessage());
            throw new AuraHandledException('An unexpected error occurred');
        }
    }
}