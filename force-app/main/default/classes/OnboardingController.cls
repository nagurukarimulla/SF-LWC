public with sharing class OnboardingController {
    
    /**
     * This method is called by the LWC.
     * It delegates the heavy lifting to the Service Layer.
     */
    @AuraEnabled
    public static void onboardOpportunity(Id oppId) {
        try {
            // Call the Service Layer orchestrator
            OnboardingService.onboardOpportunity(oppId);
        } catch (Exception e) {
            // Re-throw as an AuraHandledException so the LWC can show a toast
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
     * Optional: A separate method to get preview data for the UI
     * marked as cacheable=true for better performance.
     */
    @AuraEnabled(cacheable=true)
public static Map<String, Object> getOnboardingPreview(Id oppId) {
    try {
        List<Opportunity> opportunities = new OpportunitiesSelector().selectByIdWithAccount(new Set<Id>{oppId});
        
        if (opportunities.isEmpty()) {
            throw new AuraHandledException('Opportunity not found with ID: ' + oppId);
        }
        
        Opportunity opp = opportunities[0];
        
        // Add a flag to indicate if onboarding is possible
        Boolean canOnboard = opp.AccountId != null;
        String warningMessage = '';
        
        if (!canOnboard) {
            warningMessage = 'This Opportunity does not have an Account. Please assign an Account before onboarding.';
        }
        
        // Safely get values with null checks
        String accountName = opp.Account != null ? opp.Account.Name : 'No Account';
        String ownerName = opp.Account != null && opp.Account.Owner != null ? 
                          opp.Account.Owner.Name : 'No Owner';
        Decimal amount = opp.Amount != null ? opp.Amount : 0;
        
        return new Map<String, Object> {
            'oppName' => opp.Name != null ? opp.Name : 'Unnamed Opportunity',
            'accountName' => accountName,
            'ownerName' => ownerName,
            'amount' => amount,
            'canOnboard' => canOnboard,
            'warningMessage' => warningMessage,
            'accountId' => opp.AccountId
        };
        
    } catch (Exception e) {
        System.debug('Error in getOnboardingPreview: ' + e.getMessage() + ' at line ' + e.getLineNumber());
        throw new AuraHandledException('Unable to load preview: ' + e.getMessage());
    }
}
}