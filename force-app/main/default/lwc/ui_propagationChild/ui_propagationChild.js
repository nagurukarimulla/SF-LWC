import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Ui_propagationChild extends LightningElement {

    handleClick() {

        const evt = new CustomEvent('propagationdemo', {

            detail: {
                message: 'Event fired from child'
            },

            bubbles: true,
            composed: true

        });

        this.dispatchEvent(evt);
        console.log('Custom event dispatched from child component:', evt);

        // Show toast notification
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Child Event Fired',
                message: 'Custom event dispatched with bubbles and composed',
                variant: 'warning',
            })
        );

    }

}