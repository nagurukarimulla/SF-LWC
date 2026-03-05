import { LightningElement } from 'lwc';

export default class Concept_eventBubbleInternal extends LightningElement {

    handleEvent() {

        console.log('Grandparent received event', this.eventMessage);

        this.eventMessage = event.detail.message;
        console.log('Grandparent received event:', this.eventMessage);

    }

}