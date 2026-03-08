public with sharing class CustomerInteractionController {

    @AuraEnabled(cacheable=true)
    public static List<Task> getRecentInteractions(Id accountId){

        try{

            return [
                SELECT Id, Subject, ActivityDate, Status
                FROM Task
                WHERE WhatId = :accountId
                ORDER BY ActivityDate DESC
                LIMIT 10
            ];

        }
        catch(Exception ex){

            throw new AuraHandledException(
                'Error retrieving interactions: ' + ex.getMessage()
            );

        }

    }

    @AuraEnabled
    public static void logInteraction(Id accountId){

        try{

            Task t = new Task(
                Subject = 'Follow-up Call',
                WhatId = accountId,
                ActivityDate = System.today(),
                Status = 'Completed'
            );

            insert t;

        }
        catch(Exception ex){

            throw new AuraHandledException(
                'Error logging interaction: ' + ex.getMessage()
            );

        }

    }

}