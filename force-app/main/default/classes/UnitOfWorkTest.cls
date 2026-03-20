@IsTest
public class UnitOfWorkTest {

    @IsTest
    static void challengeComplete() {
        // 1. Initialize the Unit of Work with the objects in dependency order
        // Account is parent to Contact, and Note can be linked to both.
        fflib_SObjectUnitOfWork uow = new fflib_SObjectUnitOfWork(
            new Schema.SObjectType[] {
                Account.SObjectType,
                Contact.SObjectType,
                Note.SObjectType
            }
        );

        // 2. Create the records and register them with the UoW
        for (Integer i = 0; i < 100; i++) {
            Account acc = new Account(Name = 'Test Account ' + i);
            uow.registerNew(acc);

            for (Integer j = 0; j < 5; j++) {
                Contact cnt = new Contact(LastName = 'Test Contact ' + i + '_' + j);
                // registerNew with relationship: Links Contact to the Account
                uow.registerNew(cnt, Contact.AccountId, acc);

                Note n = new Note(
                    Title = 'Test Note ' + i + '_' + j,
                    Body = 'Note body content'
                );
                // registerNew with relationship: Links Note to the Contact
                uow.registerNew(n, Note.ParentId, cnt);
            }
        }

        // 3. Commit all work to the database in a single transaction
        Test.startTest();
        uow.commitWork();
        Test.stopTest();

        // 4. Verify the results with assertions
        System.assertEquals(100, [SELECT Id FROM Account].size(), 'Should have 100 Accounts');
        System.assertEquals(500, [SELECT Id FROM Contact].size(), 'Should have 500 Contacts');
        System.assertEquals(500, [SELECT Id FROM Note].size(), 'Should have 500 Notes');
    }
}