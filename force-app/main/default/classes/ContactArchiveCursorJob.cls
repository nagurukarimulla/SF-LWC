public with sharing class ContactArchiveCursorJob implements Queueable {
    private Id trackerId;
    private Database.Cursor locator;
    private Integer currentPosition;
    private Integer totalRecords;
    
    // 1. Initial Constructor
    public ContactArchiveCursorJob(Id trackerId) {
        this.trackerId = trackerId;
        this.locator = Database.getCursor(
            'SELECT Id, Description FROM Contact WHERE Is_Processed_By_Cursor__c = false',
            AccessLevel.USER_MODE
        );
        this.currentPosition = 0;
        this.totalRecords = this.locator.getNumRecords();

        update new CursorJobTracker__c(
            Id = trackerId, 
            TotalRecords__c = this.totalRecords,
            Status__c = 'Processing',
            Processed__c = 0
        );
    }
    
    // 2. Chaining Constructor
    public ContactArchiveCursorJob(Id trackerId, Database.Cursor locator, Integer position, Integer total) {
        this.trackerId = trackerId;
        this.locator = locator;
        this.currentPosition = position;
        this.totalRecords = total;
    }
    
    public void execute(QueueableContext ctx) {
        try {
            if (totalRecords == 0 || currentPosition >= totalRecords) {
                updateStatus('Completed');
                return;
            }

            // Increase fetchCount to 2000 to process more data per transaction
            Integer fetchCount = Math.min(2000, totalRecords - currentPosition);
            List<Contact> scope = (List<Contact>)locator.fetch(currentPosition, fetchCount);
            
            if(!scope.isEmpty()) {
                for(Contact con : scope) {
                    con.Description = 'Processed by cursor on ' + System.now();
                    con.Is_Processed_By_Cursor__c = true;
                }
                update scope;
                currentPosition += scope.size();
                
                update new CursorJobTracker__c(Id = trackerId, Processed__c = currentPosition);
            }

            // Chain next if records remain
            if(currentPosition < totalRecords) {
                System.enqueueJob(new ContactArchiveCursorJob(trackerId, locator, currentPosition, totalRecords));
            } else {
                updateStatus('Completed');
            }
            
        } catch(Exception e) {
            System.debug('❌ Error: ' + e.getMessage());
            updateStatus('Failed');
        }
    }

    private void updateStatus(String status) {
        update new CursorJobTracker__c(Id = trackerId, Status__c = status);
    }
}