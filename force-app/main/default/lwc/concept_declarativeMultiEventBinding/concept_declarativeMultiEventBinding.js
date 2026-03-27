import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

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

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Clicked!',
                message: 'You clicked the tile.',
                variant: 'success'
            })
        );
    }

    handleMouseOver(event) {
        this.logEvent('Mouse Entered Tile');
        console.log('Mouseover event:', event);

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Mouse Entered',
                message: 'You hovered over the tile.',
                variant: 'info'
            })
        );
    }

    handleMouseOut(event) {
        this.logEvent('Mouse Out of Tile');
        console.log('Mouseout event:', event);

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Mouse Out',
                message: 'You moved out of the tile.',
                variant: 'warning'
            })
        );
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