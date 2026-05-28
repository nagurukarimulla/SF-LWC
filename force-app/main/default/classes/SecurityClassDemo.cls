public with sharing class SecurityClassDemo {

    // =====================================================
    // stripInaccessible() - CREATABLE Example
    // =====================================================
    public static void creatableExample() {

        System.debug('===== CREATABLE ACCESS CHECK =====');

        List<Opportunity> oppList = new List<Opportunity>{
            new Opportunity(
                Name = 'AI Project Opportunity',
                StageName = 'Prospecting',
                CloseDate = Date.today().addDays(30),
                Amount = 50000,
                Probability = 90
            ),

            new Opportunity(
                Name = 'Cloud Migration Deal',
                StageName = 'Qualification',
                CloseDate = Date.today().addDays(45),
                Amount = 75000,
                Probability = 80
            )
        };

        // Remove fields user cannot create
        SObjectAccessDecision decision =
            Security.stripInaccessible(
                AccessType.CREATABLE,
                oppList
            );

        System.debug('===== STRIPPED RECORDS =====');

        for(SObject obj : decision.getRecords()) {
            System.debug(obj);
        }

        System.debug('===== MODIFIED INDEXES =====');
        System.debug(decision.getModifiedIndexes());

        System.debug('===== REMOVED FIELDS =====');
        System.debug(decision.getRemovedFields());
    }


    // =====================================================
    // stripInaccessible() - READABLE Example
    // =====================================================
    public static void readableExample() {

        System.debug('===== READABLE ACCESS CHECK =====');

        List<Campaign> campaignList = new List<Campaign>();

        campaignList.add(new Campaign(
            Name = 'Summer Campaign',
            BudgetedCost = 10000,
            ActualCost = 8000,
            IsActive = true
        ));

        campaignList.add(new Campaign(
            Name = 'Winter Campaign',
            BudgetedCost = 20000,
            ActualCost = 15000,
            IsActive = true
        ));

        insert campaignList;

        List<Campaign> queriedCampaigns = [
            SELECT Id,
                   Name,
                   BudgetedCost,
                   ActualCost,
                   IsActive
            FROM Campaign
            WHERE Id IN :campaignList
        ];

        // Remove fields user cannot read
        SObjectAccessDecision decision =
            Security.stripInaccessible(
                AccessType.READABLE,
                queriedCampaigns
            );

        System.debug('===== STRIPPED RECORDS =====');

        for(SObject obj : decision.getRecords()) {
            System.debug(obj);
        }

        System.debug('===== MODIFIED INDEXES =====');
        System.debug(decision.getModifiedIndexes());

        System.debug('===== REMOVED FIELDS =====');
        System.debug(decision.getRemovedFields());
    }


    // =====================================================
    // stripInaccessible() with enforceRootObjectCRUD
    // =====================================================
    public static void enforceCrudExample() {

        System.debug('===== ENFORCE CRUD ACCESS CHECK =====');

        List<Account> accList = new List<Account>();

        accList.add(new Account(
            Name = 'OpenAI Technologies',
            Phone = '9999999999',
            Industry = 'Technology'
        ));

        accList.add(new Account(
            Name = 'Salesforce Innovations',
            Phone = '8888888888',
            Industry = 'Software'
        ));

        // enforceRootObjectCRUD = true
        SObjectAccessDecision decision =
            Security.stripInaccessible(
                AccessType.CREATABLE,
                accList,
                true
            );

        System.debug('===== STRIPPED RECORDS =====');

        for(SObject obj : decision.getRecords()) {
            System.debug(obj);
        }

        System.debug('===== MODIFIED INDEXES =====');
        System.debug(decision.getModifiedIndexes());

        System.debug('===== REMOVED FIELDS =====');
        System.debug(decision.getRemovedFields());
    }


    // =====================================================
    // UPSERTABLE Example
    // =====================================================
    public static void updatableExample() {

        System.debug('===== UPSERTABLE ACCESS CHECK =====');

        List<Contact> contactList = new List<Contact>();

        contactList.add(new Contact(
            FirstName = 'Karim',
            LastName = 'Developer',
            Email = 'karim@test.com',
            Department = 'Engineering'
        ));

        contactList.add(new Contact(
            FirstName = 'Naguru',
            LastName = 'Architect',
            Email = 'naguru@test.com',
            Department = 'Cloud'
        ));

        SObjectAccessDecision decision =
            Security.stripInaccessible(
                AccessType.UPSERTABLE,
                contactList
            );

        System.debug('===== STRIPPED RECORDS =====');

        for(SObject obj : decision.getRecords()) {
            System.debug(obj);
        }

        System.debug('===== MODIFIED INDEXES =====');
        System.debug(decision.getModifiedIndexes());

        System.debug('===== REMOVED FIELDS =====');
        System.debug(decision.getRemovedFields());
    }
}