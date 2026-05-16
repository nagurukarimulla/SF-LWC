import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Concept_eventFullPropagation extends LightningElement {

    grandMessage = '';

    handleEvent(event) {

        this.grandMessage = event.detail.message;

        console.log('Grandparent received event', this.grandMessage);

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Full Event Propagation',
                message: `Grandparent received: ${this.grandMessage}`,
                variant: 'success',
            })
        );

    }

}