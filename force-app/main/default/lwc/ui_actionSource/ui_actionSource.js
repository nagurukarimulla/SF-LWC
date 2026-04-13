import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Ui_actionSource extends LightningElement {

    @api label;

    handleAction() {

        const actionEvent = new CustomEvent('actiontriggered', {
            detail: {
                sourceLabel: this.label
            },
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(actionEvent);
        console.log(
            'Action event dispatched from source component:',
            actionEvent.detail.sourceLabel
        );

        const toastEvent = new ShowToastEvent({
            title: 'Action Triggered',
            message: `Action from: ${this.label}`,
            variant: 'info'
        });
        this.dispatchEvent(toastEvent);

        console.log('Toast event dispatched:', toastEvent);
    }
}