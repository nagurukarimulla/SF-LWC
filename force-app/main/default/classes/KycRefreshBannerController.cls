public with sharing class KycRefreshBannerController {

    @AuraEnabled(cacheable=true)
    public static KycBannerWrapper getKycBanner(Id accountId) {

        KycBannerWrapper response = new KycBannerWrapper();

        Account acc = [
            SELECT Id,
                   Name,
                   KYC_Refresh_Date__c
            FROM Account
            WHERE Id = :accountId
            LIMIT 1
        ];

        if(acc.KYC_Refresh_Date__c == null){
            return response;
        }

        Date today = Date.today();
        Integer daysDifference = today.daysBetween(acc.KYC_Refresh_Date__c);

        response.daysDifference = daysDifference;

        if(daysDifference >= 181 && daysDifference <= 730){

            response.showBanner = true;
            response.bannerType = 'WARNING';
            response.message =
                'Client\'s KYC Refresh is approaching. Please validate the profile details. Information must be reviewed and confirmed immediately using the Client Profile Update.';

        } else if(daysDifference >= 0 && daysDifference <= 180){

            response.showBanner = true;
            response.bannerType = 'INFO';
            response.message =
                'Client\'s KYC Refresh is due soon. Please validate the profile details to ensure the information remains accurate and compliant.';

        } else if(acc.KYC_Refresh_Date__c < today){

            response.showBanner = true;
            response.bannerType = 'ERROR';
            response.message =
                'Client\'s KYC Refresh is overdue. Immediate validation of profile details is required to remain KYC compliant.';
        }

        return response;
    }

    public class KycBannerWrapper {

        @AuraEnabled
        public Boolean showBanner = false;

        @AuraEnabled
        public String bannerType;

        @AuraEnabled
        public String message;

        @AuraEnabled
        public Integer daysDifference;
    }
}