public class EOC_Response {

    @AuraEnabled public List<SObject> records;
    @AuraEnabled public List<ColumnWrapper> columns;
    @AuraEnabled public String lastCreatedDate;
    @AuraEnabled public String lastRecordId;
    @AuraEnabled public Boolean hasMore;

    public class ColumnWrapper {
        @AuraEnabled public String label;
        @AuraEnabled public String fieldName;
        @AuraEnabled public String type;
        @AuraEnabled public Boolean editable;
    }
}