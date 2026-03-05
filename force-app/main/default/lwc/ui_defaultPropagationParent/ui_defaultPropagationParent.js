import { LightningElement } from 'lwc';

export default class Ui_defaultPropagationParent extends LightningElement {

    childMessage = '';

    handleEvent(event) {

        this.childMessage = event.detail.message;

        console.log('Parent received event');

    }

}