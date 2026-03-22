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
        
        // Get field describe information
        Map<String, Schema.SObjectField> fieldMap = sObjType.getDescribe().fields.getMap();
        
        for (String key : fields.keySet()) {
            Object value = fields.get(key);
            
            // Check if field exists
            if (fieldMap.containsKey(key)) {
                Schema.DescribeFieldResult fieldDescribe = fieldMap.get(key).getDescribe();
                
                // Handle Date fields
                if (fieldDescribe.getType() == Schema.DisplayType.Date && value != null) {
                    if (value instanceof String) {
                        String dateStr = (String)value;
                        // Parse YYYY-MM-DD format
                        if (Pattern.matches('\\d{4}-\\d{2}-\\d{2}', dateStr)) {
                            List<String> parts = dateStr.split('-');
                            Integer year = Integer.valueOf(parts[0]);
                            Integer month = Integer.valueOf(parts[1]);
                            Integer day = Integer.valueOf(parts[2]);
                            value = Date.newInstance(year, month, day);
                        }
                    }
                }
                // Handle DateTime fields
                else if (fieldDescribe.getType() == Schema.DisplayType.DateTime && value != null) {
                    if (value instanceof String) {
                        value = DateTime.valueOf((String)value);
                    }
                }
                // Handle Decimal/Currency fields
                else if ((fieldDescribe.getType() == Schema.DisplayType.Double || 
                          fieldDescribe.getType() == Schema.DisplayType.Currency) && value != null) {
                    if (value instanceof String) {
                        value = Decimal.valueOf((String)value);
                    } else if (value instanceof Integer) {
                        value = Decimal.valueOf((Integer)value);
                    }
                }
                // Handle Integer fields
                else if (fieldDescribe.getType() == Schema.DisplayType.Integer && value != null) {
                    if (value instanceof String) {
                        value = Integer.valueOf((String)value);
                    }
                }
                // Handle Boolean fields
                else if (fieldDescribe.getType() == Schema.DisplayType.Boolean && value != null) {
                    if (value instanceof String) {
                        value = Boolean.valueOf((String)value);
                    }
                }
            }
            
            sObj.put(key, value);
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
        
        // Get field describe information
        Map<String, Schema.SObjectField> fieldMap = sObjType.getDescribe().fields.getMap();
        
        for (String key : fields.keySet()) {
            Object value = fields.get(key);
            
            // Check if field exists
            if (fieldMap.containsKey(key)) {
                Schema.DescribeFieldResult fieldDescribe = fieldMap.get(key).getDescribe();
                
                // Handle Date fields
                if (fieldDescribe.getType() == Schema.DisplayType.Date && value != null) {
                    if (value instanceof String) {
                        String dateStr = (String)value;
                        // Parse YYYY-MM-DD format
                        if (Pattern.matches('\\d{4}-\\d{2}-\\d{2}', dateStr)) {
                            List<String> parts = dateStr.split('-');
                            Integer year = Integer.valueOf(parts[0]);
                            Integer month = Integer.valueOf(parts[1]);
                            Integer day = Integer.valueOf(parts[2]);
                            value = Date.newInstance(year, month, day);
                        }
                    }
                }
                // Handle DateTime fields
                else if (fieldDescribe.getType() == Schema.DisplayType.DateTime && value != null) {
                    if (value instanceof String) {
                        value = DateTime.valueOf((String)value);
                    }
                }
                // Handle Decimal/Currency fields
                else if ((fieldDescribe.getType() == Schema.DisplayType.Double || 
                          fieldDescribe.getType() == Schema.DisplayType.Currency) && value != null) {
                    if (value instanceof String) {
                        value = Decimal.valueOf((String)value);
                    } else if (value instanceof Integer) {
                        value = Decimal.valueOf((Integer)value);
                    }
                }
                // Handle Integer fields
                else if (fieldDescribe.getType() == Schema.DisplayType.Integer && value != null) {
                    if (value instanceof String) {
                        value = Integer.valueOf((String)value);
                    }
                }
                // Handle Boolean fields
                else if (fieldDescribe.getType() == Schema.DisplayType.Boolean && value != null) {
                    if (value instanceof String) {
                        value = Boolean.valueOf((String)value);
                    }
                }
            }
            
            sObj.put(key, value);
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
        
        // Get all fields that are accessible
        Map<String, Schema.SObjectField> fieldMap = sObjType.getDescribe().fields.getMap();
        Set<String> accessibleFields = new Set<String>();
        
        for (String fieldName : fieldMap.keySet()) {
            Schema.DescribeFieldResult fieldDescribe = fieldMap.get(fieldName).getDescribe();
            if (fieldDescribe.isAccessible()) {
                accessibleFields.add(fieldName);
            }
        }
        
        // Always include Id and Name
        accessibleFields.add('Id');
        accessibleFields.add('Name');
        
        qf.selectFields(accessibleFields);
        
        if (String.isNotBlank(conditions)) {
            qf.setCondition(conditions);
        }
        
        if (String.isNotBlank(orderBy)) {
            qf.addOrdering(orderBy, fflib_QueryFactory.SortOrder.ASCENDING);
        }
        
        if (limitCount > 0) {
            qf.setLimit(limitCount);
        }
        
        System.debug('Query SOQL: ' + qf.toSOQL());
        return Database.query(qf.toSOQL());
        
    } catch (Exception e) {
        throw new AuraHandledException('Error querying records: ' + e.getMessage());
    }
}
}