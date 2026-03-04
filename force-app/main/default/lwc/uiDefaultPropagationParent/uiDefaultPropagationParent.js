import { LightningElement } from 'lwc';

export default class UiDefaultPropagationParent extends LightningElement {

    childMessage = '';

    handleEvent(event) {

        this.childMessage = event.detail.message;

        console.log('Parent received event', this.childMessage);


    }

}