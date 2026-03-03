import { LightningElement } from 'lwc';

export default class Concept_dynamicEventStrategySwitching extends LightningElement {

    eventLog = [];
    eventBindings = {};

    currentStrategy = 'Primary Only';

    connectedCallback() {
        this.applyPrimaryStrategy();
    }

    applyPrimaryStrategy() {
        this.eventBindings = {
            primaryevent: this.handleEvent.bind(this)
        };
        this.currentStrategy = 'Primary Only';
    }

    applySecondaryStrategy() {
        this.eventBindings = {
            secondaryevent: this.handleEvent.bind(this)
        };
        this.currentStrategy = 'Secondary Only';
    }

    switchStrategy() {
        if (this.currentStrategy === 'Primary Only') {
            this.applySecondaryStrategy();
        } else {
            this.applyPrimaryStrategy();
        }
    }

    handleEvent(event) {
        this.eventLog = [
            ...this.eventLog,
            {
                id: Date.now(),
                message: `${event.type} → ${event.detail}`
            }
        ];
    }
}