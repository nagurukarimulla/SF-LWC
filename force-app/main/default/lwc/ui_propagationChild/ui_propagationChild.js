import { LightningElement } from 'lwc';

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
    }

}