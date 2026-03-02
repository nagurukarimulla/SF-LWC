public class EnterpriseAccountProcessor implements Queueable {

    private Database.Cursor cursor;
    private Integer position;
    private static final Integer BATCH_SIZE = 100;

    public EnterpriseAccountProcessor() {
        cursor = Database.getCursor(
            'SELECT Id, Name, Rating FROM Account WHERE Rating = \'Cold\''
        );
        position = 0;
    }

    public void execute(QueueableContext context) {
        try {
            List<Account> scope = cursor.fetch(position, BATCH_SIZE);

            System.debug('Processing chunk from position: ' + position);

            for(Account acc : scope){
                acc.Rating = 'Warm';
            }

            if(!scope.isEmpty()){
                update scope;
                position += scope.size();
            }

            if(position < cursor.getNumRecords()){
                System.enqueueJob(this);
            } else {
                System.debug('Processing Completed!');
            }

        } catch (System.TransientCursorException ex) {
            System.debug('Retryable cursor error: ' + ex.getMessage());
            System.enqueueJob(this);
        }
    }
}