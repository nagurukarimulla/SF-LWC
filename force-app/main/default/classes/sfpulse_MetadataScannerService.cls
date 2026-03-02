public with sharing class sfpulse_MetadataScannerService {

    public static void scanMetadata() {

        // Clear old data (for prototype simplicity)
        delete [SELECT Id FROM Object_Health__c];

        Map<String, Object_Health__c> healthMap = new Map<String, Object_Health__c>();

        // -------- FLOW COUNT --------
        for (FlowDefinition fd : [
            SELECT Id, DeveloperName, ActiveVersion.VersionNumber
            FROM FlowDefinition
        ]) {
            if (!healthMap.containsKey(fd.DeveloperName)) {
                healthMap.put(fd.DeveloperName, new Object_Health__c(
                    Object_API_Name__c = fd.DeveloperName,
                    Flow_Count__c = 1,
                    Trigger_Count__c = 0,
                    Validation_Count__c = 0,
                    Field_Count__c = 0
                ));
            } else {
                healthMap.get(fd.DeveloperName).Flow_Count__c++;
            }
        }

        // -------- TRIGGER COUNT --------
        for (ApexTrigger at : [
            SELECT Id, Name, TableEnumOrId
            FROM ApexTrigger
        ]) {

            String objectName = at.TableEnumOrId;

            if (!healthMap.containsKey(objectName)) {
                healthMap.put(objectName, new Object_Health__c(
                    Object_API_Name__c = objectName,
                    Flow_Count__c = 0,
                    Trigger_Count__c = 1,
                    Validation_Count__c = 0,
                    Field_Count__c = 0
                ));
            } else {
                healthMap.get(objectName).Trigger_Count__c++;
            }
        }

        if (!healthMap.isEmpty()) {
            insert healthMap.values();
        }

        System.debug('SFPulse Metadata Scan Completed');
    }
}