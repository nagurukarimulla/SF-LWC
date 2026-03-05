import { LightningElement } from 'lwc';

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

    }

}