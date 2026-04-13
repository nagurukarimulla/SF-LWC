import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Ui_notificationEmitter extends LightningElement {

    sendNotification() {

        const notificationEvent = new CustomEvent('notification', {
            detail: {
                message: 'Notification emitted from child component'
            },
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(notificationEvent);

        const toastEvent = new ShowToastEvent({
            title: 'Notification Sent',
            message: 'Notification emitted from child component',
            variant: 'success'
        });
        this.dispatchEvent(toastEvent);

        console.log(
            'Notification event dispatched from child component:',
            notificationEvent
        );
        console.log('Toast event dispatched from child component:', toastEvent);
    }
}