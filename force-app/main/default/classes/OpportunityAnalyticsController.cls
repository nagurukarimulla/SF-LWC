public with sharing class OpportunityAnalyticsController {

@AuraEnabled(cacheable=true)
public static List<Opportunity> getHighValueDeals(Decimal amount){

try{

return [
SELECT Id, Name, Amount, StageName
FROM Opportunity
WHERE Amount >= :amount
ORDER BY Amount DESC
LIMIT 10
];

}
catch(Exception ex){

throw new AuraHandledException('Error retrieving opportunities: ' + ex.getMessage());

}

}

}