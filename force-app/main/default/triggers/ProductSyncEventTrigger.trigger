// Org 1: ProductSyncEventTrigger.trigger
trigger ProductSyncEventTrigger on Product_Sync_Event__e (after insert) {
    
    // Collect all event IDs for bulk processing
    List<String> eventIds = new List<String>();
    Map<String, Product_Sync_Event__e> eventsMap = new Map<String, Product_Sync_Event__e>();
    
    for (Product_Sync_Event__e event : Trigger.new) {
        // Use a unique key (you might want to use a combination of fields)
        String key = event.Product_ID__c + '_' + System.now().getTime();
        eventIds.add(key);
        eventsMap.put(key, event);
    }
    
    // Queue the sync job for each event (bulkified)
    if (!eventsMap.isEmpty()) {
        ProductSyncQueueable syncJob = new ProductSyncQueueable(eventsMap.values());
        System.enqueueJob(syncJob);
    }
}