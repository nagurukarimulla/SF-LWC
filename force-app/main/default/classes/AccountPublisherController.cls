public with sharing class AccountPublisherController {
    
    @AuraEnabled
    public static String createAccountAndPublish(String accountName, String industry) {
        if (String.isBlank(accountName)) {
            throw new AuraHandledException('Account Name is required');
        }
        
        try {
            // Create account
            Account acc = new Account(
                Name = accountName,
                Industry = industry
            );
            insert acc;
            
            // Create platform event
            Account_Notification__e eventObj = new Account_Notification__e(
                AccountId__c = acc.Id,
                AccountName__c = acc.Name,
                Industry__c = acc.Industry
            );
            
            // Publish event
            Database.SaveResult sr = EventBus.publish(eventObj);
            
            if (sr.isSuccess()) {
                System.debug('Event published successfully for Account: ' + acc.Id);
                return 'Account Created & Event Published - Account ID: ' + acc.Id;
            } else {
                System.debug('Event publish failed: ' + sr.getErrors());
                throw new AuraHandledException('Event publish failed: ' + sr.getErrors()[0].getMessage());
            }
            
        } catch (DmlException e) {
            System.debug('DML Error: ' + e.getMessage());
            throw new AuraHandledException('Failed to create account: ' + e.getDmlMessage(0));
        } catch (Exception e) {
            System.debug('General Error: ' + e.getMessage());
            throw new AuraHandledException('Error: ' + e.getMessage());
        }
    }
}