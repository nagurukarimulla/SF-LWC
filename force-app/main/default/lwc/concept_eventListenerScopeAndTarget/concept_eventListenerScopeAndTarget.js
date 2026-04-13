import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Concept_eventListenerScopeAndTarget extends LightningElement {

    logs = [];
    listenerRegistered = false;

    renderedCallback() {

        if (this.listenerRegistered) {
            return;
        }

        this.listenerRegistered = true;

        // listener inside template boundary
        this.template.addEventListener(
            'actiontriggered',
            this.handleActionEvent
        );
        console.log('Listener for actiontriggered registered on template', this);

        // listener outside template ownership
        this.addEventListener(
            'actiontriggered',
            this.handleActionEvent
        );
        console.log('Listener for actiontriggered registered on component', this.handleActionEvent);
    }

    handleActionEvent = (event) => {

        const sourceComponent = event.target;
        console.log('Action event received:', event, sourceComponent);

        this.logs = [
            ...this.logs,
            {
                id: Date.now(),
                message: `Event from: ${sourceComponent.tagName}`
            }
        ];
         console.log('Updated logs:', this.logs);

        const toastEvent = new ShowToastEvent({
            title: 'Action Triggered',
            message: `Event from: ${sourceComponent.tagName}`,
            variant: 'success'
        });
        this.dispatchEvent(toastEvent);

        console.log('Toast event dispatched:', toastEvent);
    };
}