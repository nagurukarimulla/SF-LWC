import { LightningElement } from 'lwc';

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

        }, 500); // delay 500ms

    }

}