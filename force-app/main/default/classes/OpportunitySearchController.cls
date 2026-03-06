public with sharing class OpportunitySearchController {

@AuraEnabled(cacheable=true)
public static List<Opportunity> findDeals(String stageName, Decimal minAmount){

return [
SELECT Id, Name, StageName, Amount, CloseDate
FROM Opportunity
WHERE StageName = :stageName
AND Amount >= :minAmount
ORDER BY Amount DESC
LIMIT 10
];

}

}