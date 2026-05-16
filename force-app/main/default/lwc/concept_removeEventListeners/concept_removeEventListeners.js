import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Concept_removeEventListeners extends LightningElement {
    lastKey = '';

    connectedCallback() {
        window.addEventListener(
            'keydown',
            this.handleKeyPress
        );
        console.log('Global key listener added');
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Listener Added',
                message: 'Global key listener added to window',
                variant: 'success'
            })
        );
    }

    disconnectedCallback() {
        this.cleanupListener();
    }

    cleanupListener() {
        window.removeEventListener(
            'keydown',
            this.handleKeyPress
        );
        console.log('Global key listener removed');
    }

    handleKeyPress = (event) => {
        this.lastKey = event.key;
        console.log('Key pressed:', event.key);
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Key Pressed',
                message: `You pressed: ${event.key}`,
                variant: 'warning'
            })
        );
    }

    removeSelf() {
        console.log('Global key listener removed');
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Listener Removed',
                message: 'Global key listener removed from window',
                variant: 'info'
            })
        );
        setTimeout(() => {
            this.template.host?.remove();
        }, 1000);
    }
}