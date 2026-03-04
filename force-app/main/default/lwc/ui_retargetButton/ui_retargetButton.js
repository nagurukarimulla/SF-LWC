import { LightningElement } from 'lwc';

export default class Ui_retargetButton extends LightningElement {

    handleClick(event) {

        console.log('Inside Child Component');
        console.log('Child event.target:', event.target);

        const customEvt = new CustomEvent('retargettest', {
            detail: {
                message: 'Event fired from child button'
            },
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(customEvt);
        console.log('Custom event dispatched from child component:', customEvt);
    }

}