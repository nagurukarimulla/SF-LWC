import { LightningElement } from 'lwc';

export default class Ui_internalBubbleChild extends LightningElement {

    handleClick() {

        const evt = new CustomEvent('internalbubble', {

            detail: {
                message: 'Event bubbling inside component'
            },

            bubbles: true,
            composed: false

        });

        this.dispatchEvent(evt);

        console.log('Child dispatched bubbling event', evt.detail.message);

    }

}