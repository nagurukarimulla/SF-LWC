public with sharing class sfpulse_MetadataScannerService {

    public static void scanMetadata() {

        Map<String, Object_Health__c> healthMap = new Map<String, Object_Health__c>();

        // -------- FLOW COUNT --------
        List<FlowDefinitionView> flows = [
            SELECT Id, ProcessType, TriggerObjectOrEventLabel
            FROM FlowDefinitionView
            WHERE ProcessType = 'AutoLaunchedFlow'
        ];

        for (FlowDefinitionView flow : flows) {

            String objectName = flow.TriggerObjectOrEventLabel;

            if (objectName == null) continue;

            if (!healthMap.containsKey(objectName)) {
                healthMap.put(objectName, new Object_Health__c(
                    Object_API_Name__c = objectName,
                    Flow_Count__c = 1,
                    Trigger_Count__c = 0,
                    Validation_Count__c = 0,
                    Field_Count__c = 0
                ));
            } else {
                healthMap.get(objectName).Flow_Count__c++;
            }
        }

        // -------- TRIGGER COUNT --------
        for (ApexTrigger at : [
            SELECT TableEnumOrId
            FROM ApexTrigger
            WHERE Status = 'Active'
        ]) {

            String objectName = at.TableEnumOrId;
            if (objectName == null) continue;

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

        // Clear old data
        delete [SELECT Id FROM Object_Health__c];

        if (!healthMap.isEmpty()) {
            insert healthMap.values();
        }

        System.debug('SFPulse Scan Completed Successfully');
    }
}