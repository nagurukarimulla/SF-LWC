import { LightningElement } from 'lwc';

export default class HelloWorld extends LightningElement {
    sayWishes = 'Hi Naguru Karimulla';

    connectedCallback() {
        // Log after component is inserted into the DOM
        // Use 'this' to reference class fields
        // eslint-disable-next-line no-console
        console.log('Say wishes::', this.sayWishes);
    }
}
