public class IdMethodsDemo {

    public static void demonstrateIdMethods() {

        System.debug('===== START OF ID METHODS DEMO =====');

        // Step 1: Create an Account
        Account acc = new Account(Name = 'Tech Corp');
        insert acc;

        System.debug('Inserted Account Record: ' + acc);

        // Step 2: Store Account Id
        Id accountId = acc.Id;

        System.debug('18 Digit Account Id: ' + accountId);

        // Step 3: Convert to 15 Digit Id
        String id15 = accountId.to15();

        System.debug('15 Digit Id: ' + id15);

        // Step 4: Get SObject Type
        Schema.SObjectType objType = accountId.getSObjectType();

        System.debug('SObject Type: ' + objType);

        // Step 5: Convert String to Id using valueOf
        String stringId = String.valueOf(accountId);

        Id convertedId = Id.valueOf(stringId);

        System.debug('Converted Id from String: ' + convertedId);

        // Step 6: Compare IDs
        if(accountId == convertedId) {
            System.debug('SUCCESS: IDs are matching');
        } else {
            System.debug('ERROR: IDs are not matching');
        }

        // Step 7: Dynamic Query using SObject Type
        String objectName = objType.getDescribe().getName();

        System.debug('Object API Name: ' + objectName);

        String query = 'SELECT Id, Name FROM ' + objectName +
                       ' WHERE Id = :accountId';

        System.debug('Dynamic Query: ' + query);

        List<SObject> records = Database.query(query);

        System.debug('Queried Records: ' + records);

        System.debug('===== END OF ID METHODS DEMO =====');
    }
}