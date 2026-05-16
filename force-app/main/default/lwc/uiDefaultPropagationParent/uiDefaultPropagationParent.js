import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Ui_defaultPropagationParent extends LightningElement {

    childMessage = '';

    handleEvent(event) {

        this.childMessage = event.detail.message;

        console.log('Parent received event');

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Parent Received Event',
                message: 'Event handled inside parent only because bubbles is false',
                variant: 'success',
            })
        );

    }

}