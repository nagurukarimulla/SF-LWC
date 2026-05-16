import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Ui_propagationParent extends LightningElement {

    childMessage = '';
    handleEvent(event) {
        this.childMessage = event.detail.message;

        console.log('Parent received event:', this.childMessage);

        // Show toast notification
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Parent Event Received',
                message: `Message: ${this.childMessage}`,
                variant: 'info',
            })
        );

    }

}