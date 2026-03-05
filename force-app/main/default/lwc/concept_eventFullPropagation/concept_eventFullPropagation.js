import { LightningElement } from 'lwc';

export default class Concept_eventFullPropagation extends LightningElement {

    grandMessage = '';

    handleEvent(event) {

        this.grandMessage = event.detail.message;

        console.log('Grandparent received event', this.grandMessage);

    }

}