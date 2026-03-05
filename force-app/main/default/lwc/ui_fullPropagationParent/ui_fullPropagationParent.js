import { LightningElement } from 'lwc';

export default class Ui_fullPropagationParent extends LightningElement {

    parentMessage = '';

    handleEvent(event) {

        this.parentMessage = event.detail.message;

        console.log('Parent received event', this.parentMessage);

    }

}