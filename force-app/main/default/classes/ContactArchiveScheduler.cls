global class ContactArchiveScheduler implements Schedulable {

    global void execute(SchedulableContext sc) {
        // Check if job is already running
        List<AsyncApexJob> runningJobs = [
            SELECT Id FROM AsyncApexJob 
            WHERE JobType = 'Queueable' 
            AND Status IN ('Processing', 'Preparing')
            AND ApexClass.Name = 'ContactArchiveCursorJob'
        ];
        
        if(runningJobs.isEmpty()) {
            System.enqueueJob(new ContactArchiveCursorJob());
        } else {
            System.debug('Archive job already running');
        }
    }
}