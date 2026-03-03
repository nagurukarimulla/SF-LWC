import { LightningElement } from 'lwc';

export default class Concept_declarativeMultiEventBinding extends LightningElement {

    interactionLog = [];
    eventBindings = {};

    connectedCallback() {
        console.log('Connected');
        this.eventBindings = {
            click: this.handleClick.bind(this),
            mouseover: this.handleMouseOver.bind(this),
            mouseout: this.handleMouseOut.bind(this)
        };
    }

    handleClick(event) {
        this.logEvent('Tile Clicked');
        console.log('Click event:', event);
    }

    handleMouseOver(event) {
        this.logEvent('Mouse Entered Tile');
        console.log('Mouseover event:', event);
    }

    handleMouseOut(event) {
        this.logEvent('Mouse Left Tile');
        console.log('Mouseout event:', event);
    }

    logEvent(message) {
        console.log('message:', message);
        this.interactionLog = [
            ...this.interactionLog,
            {
                id: Date.now(),
                message
            }
        ];
    }
}