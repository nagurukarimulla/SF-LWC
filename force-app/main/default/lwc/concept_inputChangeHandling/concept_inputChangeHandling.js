import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Concept_inputChangeHandling extends LightningElement {

    customerName = '';
    typingTimer;

    handleTyping(event) {

        const value = event.target.value;

        // clear previous timer
        window.clearTimeout(this.typingTimer);

        // debounce logic
        this.typingTimer = setTimeout(() => {

            const normalizedValue = value.trim();

            this.customerName = normalizedValue;

            console.log('Processed value:', normalizedValue);

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Input Processed',
                    message: `Debounced value: "${normalizedValue}"`,
                    variant: 'success'
                })
            );

        }, 500); // delay 500ms

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Typing Detected',
                message: 'Debounce timer reset. Waiting 500ms before processing.',
                variant: 'info'
            })
        );

    }

}