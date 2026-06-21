import { LightningElement, track } from 'lwc';
import verifyPhone from '@salesforce/apex/VeriphoneController.verifyPhone';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class VeriphoneLookup extends LightningElement {

    phoneNumber = '';
    @track result;
    isLoading = false;

    handleChange(event) {
        this.phoneNumber = event.target.value;
    }

    async validatePhone() {
        if (!this.phoneNumber) {
            this.showToast(
                'Error',
                'Please enter a phone number',
                'error'
            );
            return;
        }

        try {
            this.isLoading = true;
            const response =
                await verifyPhone({
                    phoneNumber: this.phoneNumber
                });
            this.result = JSON.parse(response);
        } catch (error) {
            this.showToast(
                'Error',
                error.body?.message || 'Validation Failed',
                'error'
            );
        } finally {
            this.isLoading = false;
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}