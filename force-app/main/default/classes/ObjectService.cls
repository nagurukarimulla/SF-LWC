public with sharing class ObjectService {
    
    // Generic method to get SObjectType
    private static Schema.SObjectType getSObjectType(String objectName) {
        Schema.SObjectType sObjType = Schema.getGlobalDescribe().get(objectName);
        if (sObjType == null) {
            throw new AuraHandledException('Invalid object name: ' + objectName);
        }
        return sObjType;
    }
    
    // Generic method to validate fields
    private static void validateFields(Schema.SObjectType sObjType, Map<String, Object> fields) {
        Map<String, Schema.SObjectField> fieldMap = sObjType.getDescribe().fields.getMap();
        
        for (String fieldName : fields.keySet()) {
            if (!fieldMap.containsKey(fieldName)) {
                throw new AuraHandledException('Invalid field: ' + fieldName + ' for object: ' + sObjType);
            }
            
            // Check field accessibility
            Schema.DescribeFieldResult fieldDescribe = fieldMap.get(fieldName).getDescribe();
            if (!fieldDescribe.isAccessible() && !fieldDescribe.isCreateable() && !fieldDescribe.isUpdateable()) {
                throw new AuraHandledException('Field ' + fieldName + ' is not accessible');
            }
        }
    }
    
    @AuraEnabled
    public static Id createRecord(String objectName, Map<String, Object> fields) {
        try {
            Schema.SObjectType sObjType = getSObjectType(objectName);
            validateFields(sObjType, fields);
            
            // Check create permission
            if (!sObjType.getDescribe().isCreateable()) {
                throw new AuraHandledException('Create permission missing for: ' + objectName);
            }
            
            SObject sObj = sObjType.newSObject();
            for (String key : fields.keySet()) {
                sObj.put(key, fields.get(key));
            }
            
            fflib_SObjectUnitOfWork uow = new fflib_SObjectUnitOfWork(
                new List<SObjectType>{sObjType}
            );
            uow.registerNew(sObj);
            uow.commitWork();
            
            return sObj.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error creating record: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static SObject getRecord(String objectName, Id recordId) {
        try {
            if (String.isBlank(recordId)) {
                throw new AuraHandledException('Record ID is required');
            }
            
            Schema.SObjectType sObjType = getSObjectType(objectName);
            
            // Check read permission
            if (!sObjType.getDescribe().isAccessible()) {
                throw new AuraHandledException('Read permission missing for: ' + objectName);
            }
            
            // Use specific selector if available
            if (objectName == 'Account') {
                List<Account> accounts = (new AccountSelector()).selectById(new Set<Id>{recordId});
                return accounts.isEmpty() ? null : accounts[0];
            } else if (objectName == 'Contact') {
                List<Contact> contacts = (new ContactsSelector()).selectById(new Set<Id>{recordId});
                return contacts.isEmpty() ? null : contacts[0];
            } else if (objectName == 'Opportunity') {
                List<Opportunity> opportunities = (new OpportunitiesSelector()).selectById(new Set<Id>{recordId});
                return opportunities.isEmpty() ? null : opportunities[0];
            }
            
            // Dynamic query for other objects
            String query = new fflib_QueryFactory(sObjType)
                .selectFields(new Set<String>{'Id', 'Name'})
                .setCondition('Id = :recordId')
                .toSOQL();
            
            List<SObject> results = Database.query(query);
            return results.isEmpty() ? null : results[0];
            
        } catch (Exception e) {
            throw new AuraHandledException('Error reading record: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void updateRecord(String objectName, Id recordId, Map<String, Object> fields) {
        try {
            if (String.isBlank(recordId)) {
                throw new AuraHandledException('Record ID is required for update');
            }
            
            Schema.SObjectType sObjType = getSObjectType(objectName);
            validateFields(sObjType, fields);
            
            // Check update permission
            if (!sObjType.getDescribe().isUpdateable()) {
                throw new AuraHandledException('Update permission missing for: ' + objectName);
            }
            
            SObject sObj = sObjType.newSObject(recordId);
            for (String key : fields.keySet()) {
                sObj.put(key, fields.get(key));
            }
            
            fflib_SObjectUnitOfWork uow = new fflib_SObjectUnitOfWork(
                new List<SObjectType>{sObjType}
            );
            uow.registerDirty(sObj);
            uow.commitWork();
            
        } catch (Exception e) {
            throw new AuraHandledException('Error updating record: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void deleteRecord(String objectName, Id recordId) {
        try {
            if (String.isBlank(recordId)) {
                throw new AuraHandledException('Record ID is required for delete');
            }
            
            Schema.SObjectType sObjType = getSObjectType(objectName);
            
            // Check delete permission
            if (!sObjType.getDescribe().isDeletable()) {
                throw new AuraHandledException('Delete permission missing for: ' + objectName);
            }
            
            SObject sObj = sObjType.newSObject(recordId);
            
            fflib_SObjectUnitOfWork uow = new fflib_SObjectUnitOfWork(
                new List<SObjectType>{sObjType}
            );
            uow.registerDeleted(sObj);
            uow.commitWork();
            
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting record: ' + e.getMessage());
        }
    }
    
    // Additional utility methods
    @AuraEnabled
    public static List<SObject> searchRecords(String objectName, String searchTerm, List<String> fields) {
        try {
            Schema.SObjectType sObjType = getSObjectType(objectName);
            
            if (!sObjType.getDescribe().isAccessible()) {
                throw new AuraHandledException('Read permission missing for: ' + objectName);
            }
            
            Set<String> fieldSet = new Set<String>(fields);
            fieldSet.add('Id');
            fieldSet.add('Name');
            
            String soslQuery = 'FIND \'*' + String.escapeSingleQuotes(searchTerm) + '*\' ' +
                              'IN ALL FIELDS RETURNING ' + objectName + '(' + 
                              String.join(new List<String>(fieldSet), ', ') + 
                              ' LIMIT 10)';
            
            List<List<SObject>> searchResults = Search.query(soslQuery);
            return searchResults[0];
            
        } catch (Exception e) {
            throw new AuraHandledException('Error searching records: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static List<SObject> queryRecords(String objectName, String conditions, String orderBy, Integer limitCount) {
        try {
            Schema.SObjectType sObjType = getSObjectType(objectName);
            
            if (!sObjType.getDescribe().isAccessible()) {
                throw new AuraHandledException('Read permission missing for: ' + objectName);
            }
            
            fflib_QueryFactory qf = new fflib_QueryFactory(sObjType);
            qf.selectFields(new Set<String>{'Id', 'Name'});
            
            if (String.isNotBlank(conditions)) {
                qf.setCondition(conditions);
            }
            
            if (String.isNotBlank(orderBy)) {
                qf.addOrdering(orderBy, fflib_QueryFactory.SortOrder.ASCENDING);
            }
            
            if (limitCount > 0) {
                qf.setLimit(limitCount);
            }
            
            return Database.query(qf.toSOQL());
            
        } catch (Exception e) {
            throw new AuraHandledException('Error querying records: ' + e.getMessage());
        }
    }
}