public with sharing class EOC_Controller {
    @AuraEnabled(cacheable=true)
public static EOC_Response getRecords(
    String objectApiName,
    String fieldSetName,
    Integer pageSize,
    String lastCreatedDate,
    String lastRecordId,
    String sortBy,
    String sortDirection
){
    return EOC_QueryService.fetchRecords(
        objectApiName,
        fieldSetName,
        pageSize,
        lastCreatedDate,
        lastRecordId,
        sortBy,
        sortDirection
    );
}
@AuraEnabled
public static void updateRecords(
    String objectApiName,
    List<SObject> records
){
    if(records == null || records.isEmpty()){
        return;
    }

    update records;
}
@AuraEnabled(cacheable=true)
    public static List<EOC_ObjectOption> getActiveObjects() {

        List<EOC_ObjectOption> options = new List<EOC_ObjectOption>();

        List<EOC_Object_Config__mdt> configs = [
            SELECT Object_API_Name_c__c
            FROM EOC_Object_Config__mdt
            WHERE Active_c__c = true
        ];

        Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();

        for(EOC_Object_Config__mdt config : configs) {

            if(globalDescribe.containsKey(config.Object_API_Name_c__c)) {

                Schema.DescribeSObjectResult describeResult =
                    globalDescribe.get(config.Object_API_Name_c__c).getDescribe();

                if(describeResult.isAccessible()) {
                    options.add(
                        new EOC_ObjectOption(
                            describeResult.getLabel(),
                            config.Object_API_Name_c__c
                        )
                    );
                }
            }
        }

        return options;
    }
}