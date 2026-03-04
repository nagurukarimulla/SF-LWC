import { LightningElement } from 'lwc';

export default class Concept_eventTargetVsCurrentTarget extends LightningElement {

    targetInfo = '';
    currentTargetInfo = '';

    handleContainerClick(event) {

        const targetElement = event.target;
        const currentElement = event.currentTarget;

        this.targetInfo = targetElement.tagName;

        this.currentTargetInfo = currentElement.className;

        console.log('event.target:', targetElement);

        console.log('event.currentTarget:', currentElement);
    }
}