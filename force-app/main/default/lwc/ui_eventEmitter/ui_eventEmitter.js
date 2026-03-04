import { LightningElement } from 'lwc';

export default class Ui_eventEmitter extends LightningElement {

    connectedCallback() {
        this.dispatchLifecycleEvents();
    }

    dispatchLifecycleEvents() {
        this.dispatchEvent(
            new CustomEvent('primaryevent', {
                detail: 'Primary Event Fired on Load'
            })
        );

        this.dispatchEvent(
            new CustomEvent('secondaryevent', {
                detail: 'Secondary Event Fired on Load'
            })
        );
    }

    handleEmit() {

        this.dispatchEvent(
            new CustomEvent('primaryevent', {
                detail: 'Primary Event Fired on Button Click'
            })
        );

        this.dispatchEvent(
            new CustomEvent('secondaryevent', {
                detail: 'Secondary Event Fired on Button Click'
            })
        );
    }
}