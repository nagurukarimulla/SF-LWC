import { LightningElement } from 'lwc';
import LightningAlert from 'lightning/alert';

export default class AlertModal extends LightningElement {

    // Error Alert
    async handleErrorAlert() {

        console.log('Opening Error Alert');

        await LightningAlert.open({
            message: 'Critical system error occurred!',
            theme: 'error',
            label: 'Error Alert'
        });

        console.log('Error Alert Closed');
    }

    // Warning Alert
    async handleWarningAlert() {

        console.log('Opening Warning Alert');

        await LightningAlert.open({
            message: 'Please verify your entered information.',
            theme: 'warning',
            label: 'Warning Alert'
        });

        console.log('Warning Alert Closed');
    }

    // Success Alert
    async handleSuccessAlert() {

        console.log('Opening Success Alert');

        await LightningAlert.open({
            message: 'Record created successfully!',
            theme: 'success',
            label: 'Success Alert'
        });

        console.log('Success Alert Closed');
    }
}