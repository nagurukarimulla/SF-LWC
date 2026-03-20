trigger AccountsTrigger on Account (
    before insert, before update, before delete, 
    after insert, after update, after delete, after undelete
) {
    // This calls the internal framework logic to route to your Accounts class
    fflib_SObjectDomain.triggerHandler(Accounts.class);
}