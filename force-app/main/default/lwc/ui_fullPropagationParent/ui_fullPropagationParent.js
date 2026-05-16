import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Ui_fullPropagationParent extends LightningElement {

    parentMessage = '';

    handleEvent(event) {

        this.parentMessage = event.detail.message;

        console.log('Parent received event', this.parentMessage);

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Parent Handler',
                message: `Parent received: ${this.parentMessage}`,
                variant: 'info',
            })
        );

    }

}