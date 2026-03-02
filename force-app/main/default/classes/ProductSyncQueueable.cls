// Org 1: ProductSyncQueueable.cls
public with sharing class ProductSyncQueueable implements Queueable, Database.AllowsCallouts {
    
    private List<Product_Sync_Event__e> events;
    
    public ProductSyncQueueable(List<Product_Sync_Event__e> events) {
        this.events = events;
    }
    
    public void execute(QueueableContext context) {
        List<Product_Sync_Event__e> eventsToUpdate = new List<Product_Sync_Event__e>();
        
        for (Product_Sync_Event__e event : events) {
            try {
                // Call the sync service
                Boolean success = ProductSyncService.syncToSecondary(event);
                
                // Update event status (you'd need a custom object to store event history)
                // For now, we'll just log
                if (success) {
                    System.debug('Successfully synced product: ' + event.Product_ID__c);
                } else {
                    System.debug('Failed to sync product: ' + event.Product_ID__c);
                }
                
            } catch (Exception e) {
                System.debug('Error syncing product: ' + e.getMessage());
                // Log error
                ErrorLogHelper.logError('ProductSync', e.getMessage(), event.Product_ID__c);
            }
        }
    }
}