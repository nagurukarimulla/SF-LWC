import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Ui_defaultPropagationChild extends LightningElement {

    childMessage = '';

    connectedCallback() {
        this.addEventListener('internalaction', this.handleInternalAction.bind(this));
    }

    handleClick() {

        const evt = new CustomEvent('internalaction', {

            detail: {
                message: 'Internal child event'
            }

            // no bubbles
            // no composed

        });

        this.dispatchEvent(evt);

        console.log('Child dispatched internal event', evt);

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Child Event Fired',
                message: 'Internal event dispatched with bubbles:false and composed:false',
                variant: 'warning',
            })
        );

    }

    handleInternalAction(event) {
        this.childMessage = event.detail.message;

        console.log('Child received event internally:', event);

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Child Handled Event',
                message: 'Event is handled inside the child host only',
                variant: 'success',
            })
        );
    }

}