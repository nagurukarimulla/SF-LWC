import { LightningElement } from 'lwc';

export default class Concept_configureEventPropagation extends LightningElement {

    eventMessage = '';

    handleEvent(event) {

        this.eventMessage = event.detail.message;

        console.log('Grandparent received event:', this.eventMessage);

        console.log('Target:', event.target);

        console.log('CurrentTarget:', event.currentTarget);

    }

}