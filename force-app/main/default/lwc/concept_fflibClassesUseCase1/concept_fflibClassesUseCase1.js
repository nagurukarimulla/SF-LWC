import { LightningElement, api, track } from 'lwc';
import requestLimitIncrease from '@salesforce/apex/AccountController.requestLimitIncrease';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class Concept_fflibClassesUseCase1 extends LightningElement {



    @api recordId; // Automatically set if on Account Page
    @track selectedAccountId; 
    amount = 0;

    // Use getter to decide which ID to send to Apex
    get targetId() {
        return this.recordId || this.selectedAccountId;
    }

    get isButtonDisabled() {
        return !this.targetId || this.amount <= 0;
    }

    handleAccountChange(event) {
        this.selectedAccountId = event.detail.recordId;
    }

    handleAmountChange(event) {
        this.amount = event.target.value;
    }

    handleSubmit() {
        // Validation check before calling Apex
        const accountToUpdate = this.targetId || this.recordId;

        if (!accountToUpdate) {
            this.showToast('Error', 'Please select an Account first.', 'error');
            return;
        }

        requestLimitIncrease({ accountId: accountToUpdate, amount: this.amount })
            .then(() => {
                // Specific Credit Limit message
                this.showToast(
                    'Success', 
                    `Credit limit of ${this.amount} has been successfully applied via the Service Layer.`, 
                    'success'
                );
                
                // Optional: Clear the amount field after success
                this.amount = 0;
            })
            .catch(error => {
                // The Domain Layer error (e.g., "Exceeds 50% Revenue") will show here
                this.showToast('Credit Limit Rejected', error.body.message, 'error');
            });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'dismissible' // Stays until user clicks 'X' or 3 seconds pass
        }));
    }
}