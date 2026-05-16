import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Concept_eventDefaultPropagation extends LightningElement {

    eventMessage = '';

    handleEvent(event) {
        this.eventMessage = event.detail.message;

        console.log('Grandparent received event here:', this.eventMessage);

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Grandparent Handler',
                message: `Received event message: ${this.eventMessage}`,
                variant: 'info',
            })
        );
    }

}