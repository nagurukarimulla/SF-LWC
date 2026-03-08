import { LightningElement } from 'lwc';

export default class Concept_containerComponents extends LightningElement {

    showModal = false;

    openModal() {
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }
}