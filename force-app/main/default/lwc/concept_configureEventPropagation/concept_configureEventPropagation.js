import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Concept_configureEventPropagation extends LightningElement {

    eventMessage = '';

    handleEvent(event) {

        this.eventMessage = event.detail.message;

        console.log('Grandparent received event:', this.eventMessage);

        console.log('Target:', event.target);

        console.log('CurrentTarget:', event.currentTarget);

        // Show toast notification
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Grandparent Event Received',
                message: `Message: ${this.eventMessage}`,
                variant: 'success',
            })
        );

    }

}