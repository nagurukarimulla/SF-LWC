// ==========================================================
// Apex Class: SearchClassDemo
// Demonstrates methods of System.Search class with debug logs
// ==========================================================

public class SearchClassDemo {

    // ======================================================
    // Method 1 : Dynamic SOSL using Search.query()
    // ======================================================
    public static void dynamicSOSLQuery() {

        System.debug('===== dynamicSOSLQuery START =====');

        String soslQuery =
            'FIND \'GenePoint*\' IN ALL FIELDS ' +
            'RETURNING Account(Id, Name), Contact(Id, Name)';

        System.debug('SOSL Query : ' + soslQuery);

        List<List<SObject>> searchResults =
            Search.query(soslQuery);

        System.debug('Total Object Lists Returned : ' + searchResults.size());

        // Accounts
        List<Account> accountList =
            (List<Account>) searchResults[0];

        System.debug('Accounts Found : ' + accountList.size());

        for(Account acc : accountList) {

            System.debug('Account Id   : ' + acc.Id);
            System.debug('Account Name : ' + acc.Name);
        }

        // Contacts
        List<Contact> contactList =
            (List<Contact>) searchResults[1];

        System.debug('Contacts Found : ' + contactList.size());

        for(Contact con : contactList) {

            System.debug('Contact Id   : ' + con.Id);
            System.debug('Contact Name : ' + con.Name);
        }

        System.debug('===== dynamicSOSLQuery END =====');
    }


    // ======================================================
    // Method 2 : Search.find()
    // ======================================================
    public static void dynamicFindMethod() {

        System.debug('===== dynamicFindMethod START =====');

        String findQuery =
            'FIND \'GenePoint*\' IN ALL FIELDS ' +
            'RETURNING Account(Name)';

        System.debug('Find Query : ' + findQuery);

        Search.SearchResults results =
            Search.find(findQuery);

        System.debug('Search.find() Executed Successfully');

        List<Search.SearchResult> records =
            results.get('Account');

        System.debug('Accounts Returned : ' + records.size());

        for(Search.SearchResult sr : records) {

            SObject sobj = sr.getSObject();

            Account acc = (Account) sobj;

            System.debug('Account Name : ' + acc.Name);
        }

        System.debug('===== dynamicFindMethod END =====');
    }


    // ======================================================
    // Method 3 : Search.suggest()
    // ======================================================
    public static void suggestMethodDemo() {

        System.debug('===== suggestMethodDemo START =====');

        Search.SuggestionOption option =
            new Search.SuggestionOption();

        option.setLimit(5);

        Search.SuggestionResults suggestionResults =
            Search.suggest(
                'Gen',
                'Account',
                option
            );

        System.debug('Suggestion Method Executed');

        List<Search.SuggestionResult> suggestions =
            suggestionResults.getSuggestionResults();

        System.debug('Suggestions Count : ' + suggestions.size());

        for(Search.SuggestionResult s : suggestions) {

            SObject sobj = s.getSObject();
            Account acc = (Account) sobj;

            System.debug('Suggested Record Id   : ' + acc.Id);
            System.debug('Suggested Record Name : ' + acc.Name);
        }

        System.debug('===== suggestMethodDemo END =====');
    }
}