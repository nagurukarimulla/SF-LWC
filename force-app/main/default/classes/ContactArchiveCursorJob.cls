public with sharing class ContactArchiveCursorJob implements Queueable {

    private Database.Cursor contactCursor;
    private Integer position;
    private String jobId;
    private Integer totalProcessed;
    private Set<Id> failedIds;
    
    public ContactArchiveCursorJob() {
        contactCursor = Database.getCursor(
            'SELECT Id, LastActivityDate, Description FROM Contact WHERE LastActivityDate < LAST_N_DAYS:730',
            AccessLevel.USER_MODE
        );
        position = 0;
        jobId = String.valueOf(System.currentTimeMillis());
        totalProcessed = 0;
        failedIds = new Set<Id>();
    }
    
    // Overloaded constructor for resuming
    public ContactArchiveCursorJob(Integer startPosition, Integer processed, Set<Id> failures) {
        this();
        this.position = startPosition;
        this.totalProcessed = processed;
        this.failedIds = failures != null ? failures : new Set<Id>();
    }

    public void execute(QueueableContext ctx) {
        Integer totalRows = contactCursor.getNumRecords();
        Integer remaining = totalRows - position;
        
        if(remaining <= 0){
            sendCompletionEmail();
            return;
        }

        Integer fetchSize = Math.min(500, remaining);
        List<Contact> contacts = contactCursor.fetch(position, fetchSize);
        position += contacts.size();
        
        List<Contact> successList = archiveContacts(contacts);
        totalProcessed += successList.size();

        if(position < totalRows){
            // Continue with next chunk
            System.enqueueJob(new ContactArchiveCursorJob(position, totalProcessed, failedIds));
        } else {
            sendCompletionEmail();
        }
    }

    private List<Contact> archiveContacts(List<Contact> contacts){
        List<Contact> updates = new List<Contact>();
        
        for(Contact c : contacts){
            try {
                c.Description = 'Archived by system on ' + System.now().format() + 
                              ' | Previous Activity: ' + c.LastActivityDate;
                updates.add(c);
            } catch(Exception e) {
                failedIds.add(c.Id);
            }
        }
        
        if(!updates.isEmpty()){
            Database.SaveResult[] results = Database.update(updates, false);
            for(Integer i = 0; i < results.size(); i++){
                if(!results[i].isSuccess()){
                    failedIds.add(updates[i].Id);
                }
            }
        }
        
        return updates;
    }
    
    private void sendCompletionEmail() {
        // Log results in custom object or platform event
        System.debug('Job Completed - Total: ' + totalProcessed + 
                    ', Failed: ' + failedIds.size() + 
                    ', JobId: ' + jobId);
    }
}