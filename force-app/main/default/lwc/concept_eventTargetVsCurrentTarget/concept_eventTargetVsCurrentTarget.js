import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Concept_eventTargetVsCurrentTarget extends LightningElement {
    targetInfo = '';
    currentTargetInfo = '';
    targetDatasetId = '';
    currentTargetDatasetId = '';
    handleContainerClick(event) {
        const targetElement = event.target;
        const currentElement = event.currentTarget;
        const targetId = event.target.dataset.id || 'none';
        const currentTargetId = event.currentTarget.dataset.id || 'none';
        this.targetInfo = targetElement.tagName;
        this.currentTargetInfo = currentElement.className;
        this.targetDatasetId = targetId;
        this.currentTargetDatasetId = currentTargetId;
        console.log('event.target:', targetElement);
        console.log('event.currentTarget:', currentElement);
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Click Event Info',
                message: `target = ${targetElement.tagName}, currentTarget = ${currentElement.className}, target.dataset.id = ${targetId}, currentTarget.dataset.id = ${currentTargetId}`,
                variant: 'info'
            })
        );
    }
}