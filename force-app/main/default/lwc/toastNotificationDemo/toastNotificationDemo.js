import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ToastNotificationDemo extends LightningElement {

    showSuccessToast() {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Record saved successfully!',
                variant: 'success',
                mode: 'dismissable'
            })
        );
    }

    showErrorToast() {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: 'Something went wrong!',
                variant: 'error',
                mode: 'dismissable'
            })
        );
    }

    showWarningToast() {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Warning',
                message: 'Please check your input values.',
                variant: 'warning',
                mode: 'dismissable'
            })
        );
    }

    showInfoToast() {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Information',
                message: 'This is an informational toast message.',
                variant: 'info',
                mode: 'dismissable'
            })
        );
    }

    showStickyToast() {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Sticky Notification',
                message: 'This toast stays until manually closed.',
                variant: 'success',
                mode: 'sticky'
            })
        );
    }

    showPesterToast() {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Pester Notification',
                message: 'This toast disappears automatically.',
                variant: 'error',
                mode: 'pester'
            })
        );
    }
}