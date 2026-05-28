public class CustomMetadataAllMethodsDemo {

    // ==================================================
    // getAll()
    // ==================================================
    public static void getAllMethod() {

        System.debug('===== getAll() =====');

        Map<String, Games__mdt> gamesMap =
            Games__mdt.getAll();

        for(String devName : gamesMap.keySet()) {

            Games__mdt rec = gamesMap.get(devName);

            System.debug('Developer Name : ' + rec.DeveloperName);
            System.debug('Qualified Name : ' + rec.QualifiedApiName);
            System.debug('Game Type      : ' + rec.GameType__c);
        }
    }



    // ==================================================
    // getInstance(developerName)
    // ==================================================
    public static void getByDeveloperName() {

    System.debug('===== getInstance(developerName) =====');

    // Fetch exact developer name dynamically
    Games__mdt firstRecord = [
        SELECT DeveloperName
        FROM Games__mdt
        LIMIT 1
    ];

    System.debug(
        'Developer Name From DB : '
        + firstRecord.DeveloperName
    );

    // Pass exact value
    Games__mdt rec =
        Games__mdt.getInstance(
            firstRecord.DeveloperName
        );

    if(rec != null) {

        System.debug('Record Found');
        System.debug('Developer Name : ' + rec.DeveloperName);
        System.debug('Game Type      : ' + rec.GameType__c);

    } else {

        System.debug('No Record Found');
    }
}



    // ==================================================
    // getInstance(recordId)
    // ==================================================
    public static void getByRecordId() {

        System.debug('===== getInstance(recordId) =====');

        Games__mdt metadataRecord = [
            SELECT Id,
                   DeveloperName,
                   GameType__c
            FROM Games__mdt
            LIMIT 1
        ];

        Games__mdt rec =
            Games__mdt.getInstance(metadataRecord.Id);

        if(rec != null) {

            System.debug('Record Found');
            System.debug('Developer Name : ' + rec.DeveloperName);
            System.debug('Game Type      : ' + rec.GameType__c);

        } else {

            System.debug('No Record Found');
        }
    }



    // ==================================================
    // getInstance(qualifiedApiName)
    // ==================================================
    public static void getByQualifiedApiName() {

        System.debug('===== getInstance(qualifiedApiName) =====');

        Games__mdt firstRec = [
            SELECT QualifiedApiName
            FROM Games__mdt
            LIMIT 1
        ];

        System.debug(
            'Qualified API Name From DB : '
            + firstRec.QualifiedApiName
        );

        Games__mdt rec =
            Games__mdt.getInstance(
                firstRec.QualifiedApiName
            );

        if(rec != null) {

            System.debug('Record Found');
            System.debug('Developer Name : ' + rec.DeveloperName);
            System.debug('Qualified Name : ' + rec.QualifiedApiName);
            System.debug('Game Type      : ' + rec.GameType__c);

        } else {

            System.debug('No Record Found');
        }
    }
}

// CustomMetadataAllMethodsDemo.getAllMethod();

// CustomMetadataAllMethodsDemo.getByDeveloperName();

// CustomMetadataAllMethodsDemo.getByRecordId();

// CustomMetadataAllMethodsDemo.getByQualifiedApiName();


