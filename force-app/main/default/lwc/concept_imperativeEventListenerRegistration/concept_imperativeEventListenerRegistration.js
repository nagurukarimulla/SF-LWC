import { LightningElement } from 'lwc';

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
    }
}