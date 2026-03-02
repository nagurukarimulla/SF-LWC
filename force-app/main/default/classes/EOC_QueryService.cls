public with sharing class EOC_QueryService {

    public static EOC_Response fetchRecords(
        String objectApiName,
        String fieldSetName,
        Integer pageSize,
        String lastCreatedDate,
        String lastRecordId,
        String sortBy,
        String sortDirection
    ){

        // 1️⃣ Validate Object
        Map<String, Schema.SObjectType> globalMap = Schema.getGlobalDescribe();

        if(!globalMap.containsKey(objectApiName)){
            throw new AuraHandledException('Invalid object');
        }

        Schema.DescribeSObjectResult describeObj =
            globalMap.get(objectApiName).getDescribe();

        if(!describeObj.isAccessible()){
            throw new AuraHandledException('No access to object');
        }

        // 2️⃣ Get FieldSet Fields
        List<String> fieldList = new List<String>();
        List<EOC_Response.ColumnWrapper> columns =
            new List<EOC_Response.ColumnWrapper>();

        Schema.FieldSet fieldSet =
            describeObj.fieldSets.getMap().get(fieldSetName);
            if(fieldList.isEmpty()){
    throw new AuraHandledException(
        'FieldSet ' + fieldSetName + ' has no fields for object ' + objectApiName
    );
}

        for(Schema.FieldSetMember field : fieldSet.getFields()){

    fieldList.add(field.getFieldPath());

    Schema.DisplayType fieldType =
        describeObj.fields.getMap()
            .get(field.getFieldPath())
            .getDescribe()
            .getType();

    EOC_Response.ColumnWrapper col =
        new EOC_Response.ColumnWrapper();

    col.label = field.getLabel();
    col.fieldName = field.getFieldPath();
    col.type = fieldType.name().toLowerCase();
    col.editable = !field.getDbRequired()
                   && field.getFieldPath() != 'Id';

    columns.add(col);
}

        List<String> finalFields = new List<String>();
finalFields.addAll(fieldList);
finalFields.add('CreatedDate');
finalFields.add('Id');

String query = 'SELECT ' + String.join(finalFields, ',')
             + ' FROM ' + objectApiName;

        // Keyset pagination
        if(lastCreatedDate != null && lastRecordId != null){
            query += ' WHERE (CreatedDate < :lastCreatedDate'
                  + ' OR (CreatedDate = :lastCreatedDate AND Id < :lastRecordId))';
        }

        if(!fieldList.contains(sortBy)){
    sortBy = 'CreatedDate';
}
if(String.isBlank(sortDirection)){
    sortDirection = 'DESC';
}

query += ' ORDER BY ' + sortBy + ' ' + sortDirection + ', Id ' + sortDirection;
        query += ' LIMIT :pageSize';

        List<SObject> records = Database.query(query);

        // 4️⃣ FLS Enforcement
        records = Security.stripInaccessible(
            AccessType.READABLE,
            records
        ).getRecords();

        // 5️⃣ Build Response
        EOC_Response response = new EOC_Response();
        response.records = records;
        response.columns = columns;

        if(!records.isEmpty()){
            SObject last = records[records.size()-1];
            response.lastCreatedDate =
                String.valueOf(last.get('CreatedDate'));
            response.lastRecordId =
                String.valueOf(last.get('Id'));
        }

        response.hasMore = records.size() == pageSize;

        return response;
    }
}