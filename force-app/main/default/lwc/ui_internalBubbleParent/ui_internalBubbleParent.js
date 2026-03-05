import { LightningElement } from 'lwc';

export default class Ui_internalBubbleParent extends LightningElement {

    childMessage = '';

    handleEvent(event) {

        this.childMessage = event.detail.message;

        console.log('Wrapper received event', this.childMessage);

    }

}