import { api } from 'lwc';
import LightningModal from 'lightning/modal';

export default class MyModal extends LightningModal {

    @api options = [];

    // Handle option button click
    handleOptionClick(event) {

        const selectedId = event.target.dataset.id;

        console.log('Selected Option Id => ', selectedId);

        // Close modal and return value
        this.close(selectedId);
    }

    // Close modal manually
    handleClose() {

        console.log('Modal Closed');

        this.close('Modal Closed');
    }
}