import { LightningElement } from 'lwc';

export default class SpinnerPlayground extends LightningElement {

    loaded = false;
    timestamp = '';

    handleClick() {
        this.loaded = !this.loaded;
        this.timestamp = new Date().toLocaleString();
    }
}