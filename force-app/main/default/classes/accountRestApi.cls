@RestResource(urlMapping='/api/Account/*')
global with sharing class accountRestApi {

    // GET method - Retrieve an Account by AccountNumber
    @HttpGet
    global static Account doGet() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;
        String accNumber = req.requestURI.substring(req.requestURI.lastIndexOf('/') + 1);
        Account result = [
            SELECT Id, Name, Phone, Website, AccountNumber 
            FROM Account 
            WHERE AccountNumber = :accNumber 
            LIMIT 1
        ];
        return result;
    }

    // POST method - Create a new Account
  @HttpPost
global static String doPost() {
    RestRequest req = RestContext.request;
    String body = req.requestBody.toString();
    Map<String, Object> jsonMap = (Map<String, Object>) JSON.deserializeUntyped(body);

    Account acc = new Account(
        Name = (String) jsonMap.get('name'),
        Phone = (String) jsonMap.get('phone'),
        AccountNumber = (String) jsonMap.get('AccountNumber')
    );

    insert acc;
    return acc.Id;
}


    // PUT method - Replace an entire Account record (update all attributes)
    @HttpPut
    global static String doPut(String accountNumber, String name, String phone, String website) {
        Account acc = [
            SELECT Id, Name, Phone, Website 
            FROM Account 
            WHERE AccountNumber = :accountNumber 
            LIMIT 1
        ];
        acc.Name = name;
        acc.Phone = phone;
        acc.Website = website;
        update acc;
        return acc.Id;
    }

    // PATCH method - Perform a partial update (update only provided fields)
    @HttpPatch
    global static String doPatch() {
        RestRequest req = RestContext.request;
        String body = req.requestBody.toString();
        Map<String, Object> updates = (Map<String, Object>) JSON.deserializeUntyped(body);

        String accNumber = req.requestURI.substring(req.requestURI.lastIndexOf('/') + 1);
        Account acc = [
            SELECT Id, Name, Phone, Website 
            FROM Account 
            WHERE AccountNumber = :accNumber 
            LIMIT 1
        ];

        if (updates.containsKey('Name')) acc.Name = (String) updates.get('Name');
        if (updates.containsKey('Phone')) acc.Phone = (String) updates.get('Phone');
        if (updates.containsKey('Website')) acc.Website = (String) updates.get('Website');

        update acc;
        return acc.Id;
    }

    // DELETE method - Delete Account by AccountNumber
    @HttpDelete
    global static void doDelete() {
        RestRequest req = RestContext.request;
        String accNumber = req.requestURI.substring(req.requestURI.lastIndexOf('/') + 1);
        Account acc = [
            SELECT Id FROM Account WHERE AccountNumber = :accNumber LIMIT 1
        ];
        delete acc;
    }
}