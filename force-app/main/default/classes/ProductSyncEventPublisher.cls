// Org 1: ProductSyncEventPublisher.cls
public with sharing class ProductSyncEventPublisher {
    
    public static void publishEvents(Set<Id> productIds, String operationType) {
        List<Product_Sync_Event__e> events = new List<Product_Sync_Event__e>();
        
        // Query product data
        Map<Id, Product2> products = new Map<Id, Product2>(
            [SELECT Id, Name, ProductCode, Description, IsActive, Family,
                    LastModifiedDate, CreatedDate
             FROM Product2 WHERE Id IN :productIds]
        );
        
        for (Id prodId : productIds) {
            Product2 prod = products.get(prodId);
            if (prod != null) {
                // Serialize product to JSON for the event
                ProductSyncWrapper wrapper = new ProductSyncWrapper(prod);
                
                Product_Sync_Event__e event = new Product_Sync_Event__e(
                    Product_ID__c = prodId,
                    Product_JSON__c = JSON.serialize(wrapper),
                    Operation_Type__c = operationType,
                    Status__c = 'Pending',
                    Target_Org__c = 'Secondary'
                );
                events.add(event);
            }
        }
        
        // Publish all events
        if (!events.isEmpty()) {
            List<Database.SaveResult> results = EventBus.publish(events);
            
            // Log any publishing failures
            for (Integer i = 0; i < results.size(); i++) {
                if (!results.get(i).isSuccess()) {
                    System.debug('Failed to publish event for product: ' + events.get(i).Product_ID__c);
                }
            }
        }
    }
    
    // Wrapper for JSON serialization
    public class ProductSyncWrapper {
        public String externalId;
        public String name;
        public String productCode;
        public String description;
        public Boolean isActive;
        public String family;
        public Datetime lastModified;
        
        public ProductSyncWrapper(Product2 p) {
            this.externalId = p.Id;
            this.name = p.Name;
            this.productCode = p.ProductCode;
            this.description = p.Description;
            this.isActive = p.IsActive;
            this.family = p.Family;
            this.lastModified = p.LastModifiedDate;
        }
    }
}