public with sharing class InvestmentAnalyticsController {

    @AuraEnabled(cacheable=true)
    public static List<Account> analyzePortfolio(Map<String,Object> filters){
        
        try {
            // Safely extract parameters with null checks
            String industry = filters?.get('industry') != null ? 
                (String)filters.get('industry') : '';
                
            Decimal minRevenue = filters?.get('minRevenue') != null ? 
                Decimal.valueOf(String.valueOf(filters.get('minRevenue'))) : 0;
            
            // Log the received parameters
            System.debug('=== ANALYZE PORTFOLIO CALLED ===');
            System.debug('Industry filter: ' + industry);
            System.debug('Min Revenue filter: ' + minRevenue);
            
            // Build dynamic query
            String query = 'SELECT Id, Name, Industry, AnnualRevenue ' +
                          'FROM Account ' +
                          'WHERE Industry = :industry ' +
                          'AND AnnualRevenue >= :minRevenue ' +
                          'ORDER BY AnnualRevenue DESC ' +
                          'LIMIT 10';
            
            System.debug('Executing query: ' + query);
            
            List<Account> accounts = Database.query(query);
            
            System.debug('Records found: ' + accounts.size());
            System.debug('==============================');
            
            return accounts;
            
        } catch (Exception e) {
            System.debug('❌ Error in analyzePortfolio: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
            throw new AuraHandledException('Error analyzing portfolio: ' + e.getMessage());
        }
    }
}