// Org 1: Product2Trigger.trigger
trigger Product2Trigger on Product2 (after insert, after update, after delete) {
    
    // Collect IDs
    Set<Id> productIds = new Set<Id>();
    
    if (Trigger.isInsert || Trigger.isUpdate) {
        for (Product2 p : Trigger.new) {
            productIds.add(p.Id);
        }
    } else if (Trigger.isDelete) {
        for (Product2 p : Trigger.old) {
            productIds.add(p.Id);
        }
    }
    
    // Publish platform events (decoupled from trigger logic)
    if (!productIds.isEmpty()) {
        ProductSyncEventPublisher.publishEvents(
            productIds, 
            Trigger.operationType.name()
        );
    }
}