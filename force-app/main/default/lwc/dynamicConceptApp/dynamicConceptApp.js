import { LightningElement } from 'lwc';

export default class DynamicConceptApp extends LightningElement {

    selectedComponent;

    handleConceptSelect(event) {
        this.selectedComponent = event.detail;
    }
}