import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

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

        const toastEvent = new ShowToastEvent({
            title: 'Child Event Fired',
            message: 'Event fired from child button',
            variant: 'success'
        });
        this.dispatchEvent(toastEvent);
        console.log('Toast event dispatched from child component:', toastEvent);
    }

}