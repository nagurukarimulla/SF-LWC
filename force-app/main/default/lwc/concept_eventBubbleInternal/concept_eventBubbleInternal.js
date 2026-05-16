import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Concept_eventBubbleInternal extends LightningElement {

    childMessage = '';

    handleEvent(event) {

        this.childMessage = event.detail.message;

        console.log('Grandparent received event:', this.childMessage);

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Event Bubbling Inside Shadow DOM',
                message: `Grandparent received: ${this.childMessage}`,
                variant: 'info',
            })
        );

    }

}