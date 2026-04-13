import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Concept_imperativeEventListenerRegistration extends LightningElement {

    notifications = [];
    listenerRegistered = false;

    renderedCallback() {

        if (this.listenerRegistered) {
            return;
        }

        this.listenerRegistered = true;

        this.template.addEventListener(
            'notification',
            this.handleNotification
        );

        console.log('Imperative listener registered in renderedCallback');
    }

    handleNotification = (event) => {

        console.log('Notification received:', event.detail.message);

        this.notifications = [
            ...this.notifications,
            {
                id: Date.now(),
                message: event.detail.message
            }
        ];

        const toastEvent = new ShowToastEvent({
            title: 'Notification Received',
            message: event.detail.message,
            variant: 'info'
        });
        this.dispatchEvent(toastEvent);

        console.log('Toast event dispatched in notification handler:', toastEvent);
    }
}