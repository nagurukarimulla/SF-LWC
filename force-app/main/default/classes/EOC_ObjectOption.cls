public class EOC_ObjectOption {
    @AuraEnabled public String label;
    @AuraEnabled public String value;

    public EOC_ObjectOption(String label, String value) {
        this.label = label;
        this.value = value;
    }
}