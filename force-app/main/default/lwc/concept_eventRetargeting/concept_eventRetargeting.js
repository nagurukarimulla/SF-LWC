import { LightningElement } from 'lwc';

export default class Concept_eventRetargeting extends LightningElement {

    logs = [];
    listenerRegistered = false;

    renderedCallback() {

        if (this.listenerRegistered) {
            return;
        }

        this.listenerRegistered = true;

        this.template.addEventListener(
            'retargettest',
            this.handleRetargetEvent
        );
        console.log('Listener for retargettest registered on template', this);
    }

    handleRetargetEvent = (event) => {

        console.log('Parent received event');

        console.log('Parent event.target:', event.target);

        this.logs = [
            ...this.logs,
            {
                id: Date.now(),
                message: `Event target seen by parent: ${event.target.tagName}`
            }
        ];
        console.log('Updated logs:', this.logs)
    };

}