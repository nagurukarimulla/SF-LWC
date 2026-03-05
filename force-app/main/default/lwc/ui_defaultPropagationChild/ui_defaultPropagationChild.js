import { LightningElement } from 'lwc';

export default class Ui_defaultPropagationChild extends LightningElement {

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

    }

}