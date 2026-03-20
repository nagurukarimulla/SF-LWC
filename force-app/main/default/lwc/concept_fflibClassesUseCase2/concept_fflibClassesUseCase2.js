import { LightningElement, wire, track } from 'lwc';
import getOnboardingPreview from '@salesforce/apex/OnboardingController.getOnboardingPreview';
import onboardOpportunity from '@salesforce/apex/OnboardingController.onboardOpportunity';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Concept_fflibClassesUseCase2 extends LightningElement {
    @track selectedOpportunityId;
    @track previewData;
    @track isCompleted = false;
    @track error;
    @track isLoading = false;
    @track selectedOpportunityName;

    // Handle opportunity selection from picker
    handleOpportunityChange(event) {
        console.log('=== PICKER CHANGE EVENT ===');
        console.log('Event detail:', JSON.stringify(event.detail));
        
        // The record ID is in event.detail.recordId
        const newValue = event.detail?.recordId;
        console.log('New selected value from detail.recordId:', newValue);
        
        if (newValue) {
            // Update the tracked property
            this.selectedOpportunityId = newValue;
            
            // Also try to get the selected record name from the picker
            const picker = this.template.querySelector('lightning-record-picker');
            if (picker && picker.selectedRecord) {
                console.log('Selected record:', picker.selectedRecord);
                this.selectedOpportunityName = picker.selectedRecord.Name;
            }
            
            // Reset states
            this.isCompleted = false;
            this.error = undefined;
            this.previewData = undefined;
            this.isLoading = true;
            
            console.log('selectedOpportunityId set to:', this.selectedOpportunityId);
            // The wire will automatically trigger with the new ID
        } else {
            console.log('No recordId in event detail');
            this.selectedOpportunityId = undefined;
        }
    }

    @wire(getOnboardingPreview, { oppId: '$selectedOpportunityId' })
    wiredPreview({ error, data }) {
        console.log('=== WIRE METHOD TRIGGERED ===');
        console.log('Current selectedOpportunityId:', this.selectedOpportunityId);
        console.log('Data:', data);
        console.log('Error:', error);
        
        if (!this.selectedOpportunityId) {
            console.log('No opportunity selected, clearing data');
            this.previewData = undefined;
            this.isLoading = false;
            return;
        }

        if (data) {
            console.log('SUCCESS - Data structure:', JSON.stringify(data));
            this.previewData = data;
            this.error = undefined;
            this.isLoading = false;
        } else if (error) {
            console.error('ERROR - Full error:', JSON.stringify(error));
            console.error('Error body:', error.body);
            console.error('Error message:', error.body?.message);
            this.error = error.body?.message || 'Could not load preview data.';
            this.previewData = undefined;
            this.isLoading = false;
        } else {
            // Loading state
            console.log('Wire method in loading state');
            this.isLoading = true;
        }
    }

    // Optional: Add this to verify the picker is working
    renderedCallback() {
        const picker = this.template.querySelector('lightning-record-picker');
        if (picker && !this.hasLoggedPicker) {
            console.log('Picker found and initialized');
            this.hasLoggedPicker = true;
        }
    }

    handleOnboard() {
        console.log('Onboard clicked. selectedOpportunityId:', this.selectedOpportunityId);
        
        if (!this.selectedOpportunityId) {
            this.showToast(
                'No Opportunity Selected',
                'Please select an opportunity to onboard',
                'warning'
            );
            return;
        }

        if (!this.previewData) {
            this.showToast(
                'Data Not Loaded',
                'Please wait for the preview data to load',
                'warning'
            );
            return;
        }

        const oppName = this.previewData.oppName || 'Opportunity';
        const accName = this.previewData.accountName || 'Account';

        this.isLoading = true;
        
        onboardOpportunity({ oppId: this.selectedOpportunityId })
            .then(() => {
                console.log('Onboard success');
                this.isCompleted = true;
                this.isLoading = false;
                this.showToast(
                    'Onboarding Successful', 
                    `Successfully onboarded ${oppName}. A new contract and task have been created for ${accName}.`, 
                    'success'
                );
            })
            .catch(err => {
                console.error('Onboard error:', err);
                this.isLoading = false;
                this.showToast(
                    'Onboarding Blocked', 
                    err.body?.message || 'An unexpected error occurred in the Service Layer.', 
                    'error'
                );
            });
    }

    get disableOnboarding() {
    return !this.previewData?.canOnboard || this.isLoading || this.isCompleted;
}
    handleReset() {
        console.log('Reset clicked');
        this.selectedOpportunityId = undefined;
        this.previewData = undefined;
        this.isCompleted = false;
        this.error = undefined;
        this.isLoading = false;
        this.selectedOpportunityName = undefined;
        
        const picker = this.template.querySelector('lightning-record-picker');
        if (picker) {
            picker.value = null;
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'sticky' 
        }));
    }
}