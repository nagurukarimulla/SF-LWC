import { LightningElement } from 'lwc';
import createAccountAndPublish from '@salesforce/apex/AccountPublisherController.createAccountAndPublish';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AccountPublisher extends LightningElement {
    accountName = '';
    industry = '';
    isLoading = false;

    handleNameChange(event) {
        this.accountName = event.target.value;
    }

    handleIndustryChange(event) {
        this.industry = event.target.value;
    }

    createAccount() {
        // Validation
        if (!this.accountName) {
            this.showToast('Error', 'Account Name is required', 'error');
            return;
        }

        this.isLoading = true;

        createAccountAndPublish({
            accountName: this.accountName,
            industry: this.industry || null
        })
        .then(result => {
            this.showToast('Success', result, 'success');
            // Clear form
            this.accountName = '';
            this.industry = '';
            // Clear input fields
            const inputFields = this.template.querySelectorAll('lightning-input');
            inputFields.forEach(field => {
                field.value = '';
            });
        })
        .catch(error => {
            console.error('Full error:', error);
            let errorMsg = 'Unknown error occurred';
            
            if (error.body) {
                if (error.body.message) {
                    errorMsg = error.body.message;
                } else if (error.body.pageErrors && error.body.pageErrors[0]) {
                    errorMsg = error.body.pageErrors[0].message;
                }
            }
            
            this.showToast('Error', errorMsg, 'error');
        })
        .finally(() => {
            this.isLoading = false;
        });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
}