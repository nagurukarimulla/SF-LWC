import { LightningElement } from 'lwc';

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

    console.log(
        'Notification event dispatched from child component:',
        notificationEvent
    );
}
}