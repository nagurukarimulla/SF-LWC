import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Ui_fullPropagationChild extends LightningElement {

    handleClick() {

        const evt = new CustomEvent('crm__globalaction', {

            detail: {
                message: 'Event propagated to document root'
            },

            bubbles: true,
            composed: true

        });

        this.dispatchEvent(evt);

        console.log('Child dispatched global event', evt.detail.message);

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Event Dispatched',
                message: 'Child dispatched event with full propagation',
                variant: 'success',
            })
        );

    }

}