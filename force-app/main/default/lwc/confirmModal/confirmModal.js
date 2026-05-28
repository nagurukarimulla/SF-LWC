import { LightningElement, track } from 'lwc';
import LightningConfirm from 'lightning/confirm';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ConfirmModal extends LightningElement {
     @track userChoice = '';

    // Headerless Confirm Modal
    async handleHeaderlessConfirm() {

        console.log('Opening Headerless Confirm Modal');

        const result = await LightningConfirm.open({
            message: 'Are you sure you want to delete this record?',
            variant: 'headerless',
            label: 'Delete Confirmation'
        });

        console.log('User Selection:', result);

        if(result) {

            this.userChoice = 'User clicked OK';

            this.showToast(
                'Success',
                'Record deleted successfully!',
                'success'
            );

        } else {

            this.userChoice = 'User clicked Cancel';

            this.showToast(
                'Cancelled',
                'Delete operation cancelled.',
                'warning'
            );
        }
    }

    // Default Confirm Modal
    async handleDefaultConfirm() {

        console.log('Opening Default Confirm Modal');

        const result = await LightningConfirm.open({
            message: 'Do you want to continue?',
            label: 'Confirmation',
            theme: 'warning'
        });

        console.log('User Selection:', result);

        if(result) {

            this.userChoice = 'User accepted the action';

            this.showToast(
                'Confirmed',
                'Action completed successfully!',
                'success'
            );

        } else {

            this.userChoice = 'User rejected the action';

            this.showToast(
                'Rejected',
                'Action was cancelled.',
                'error'
            );
        }
    }

    // Toast Helper Method
    showToast(title, message, variant) {

        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });

        this.dispatchEvent(toastEvent);
    }
}