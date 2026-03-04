import { LightningElement } from 'lwc';

export default class Concept_removeEventListeners extends LightningElement {

    lastKey = '';

    connectedCallback() {

        window.addEventListener(
            'keydown',
            this.handleKeyPress
        );

        console.log('Global key listener added');

    }

    disconnectedCallback() {

        window.removeEventListener(
            'keydown',
            this.handleKeyPress
        );

        console.log('Global key listener removed');

    }

    handleKeyPress = (event) => {

        this.lastKey = event.key;

        console.log('Key pressed:', event.key);

    }

}