import { LightningElement, api } from 'lwc';

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
            event.detail.sourceLabel
        );
    }
}