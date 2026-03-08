public with sharing class CaseEscalationController {

    @AuraEnabled(cacheable=true)
    public static List<Case> getHighPriorityCases(){

        try{

            return [
                SELECT Id, CaseNumber, Subject, Priority, Status
                FROM Case
                WHERE Priority = 'High'
                ORDER BY CreatedDate DESC
                LIMIT 10
            ];

        }
        catch(Exception ex){

            throw new AuraHandledException(
                'Error retrieving cases: ' + ex.getMessage()
            );

        }

    }

    @AuraEnabled
    public static void escalateCases(){

        try{

            List<Case> casesToUpdate = [
                SELECT Id, Status
                FROM Case
                WHERE Priority = 'High'
                AND Status != 'Escalated'
            ];

            for(Case c : casesToUpdate){

                c.Status = 'Escalated';

            }

            update casesToUpdate;

        }
        catch(Exception ex){

            throw new AuraHandledException(
                'Error escalating cases: ' + ex.getMessage()
            );

        }

    }

}