import { LightningElement, track } from 'lwc';
import getObjectMetadata from '@salesforce/apex/MetadataController.getObjectMetadata';

export default class Concept_getMetadata extends LightningElement {
    @track metadataResult = null;
    @track isLoading = false;
    @track error = null;
    @track selectedObject = 'Account';
    @track showJson = false;
    
    objectOptions = [
        { label: 'Account', value: 'Account' },
        { label: 'Contact', value: 'Contact' },
        { label: 'Lead', value: 'Lead' },
        { label: 'Opportunity', value: 'Opportunity' },
        { label: 'Case', value: 'Case' }
    ];
    
    recentItemsColumns = [
        { label: 'ID', fieldName: 'Id', type: 'text' },
        { label: 'Name', fieldName: 'Name', type: 'text' }
    ];
    
    handleObjectChange(event) {
        this.selectedObject = event.detail.value;
        this.metadataResult = null;
        this.error = null;
        this.showJson = false;
    }
    
    handleGetMetadata() {
        this.isLoading = true;
        this.error = null;
        this.metadataResult = null;
        this.showJson = false;
        
        console.log('Fetching metadata for:', this.selectedObject);
        
        // Call without any special caching parameters
        getObjectMetadata({ objectName: this.selectedObject })
            .then(result => {
                console.log('Raw result:', result);
                // Parse the JSON string returned from Apex
                this.metadataResult = JSON.parse(result);
                console.log('Parsed metadata:', this.metadataResult);
                this.isLoading = false;
            })
            .catch(error => {
                console.error('Error:', error);
                // Extract error message properly
                let errorMessage = 'Unknown error';
                if (error.body && error.body.message) {
                    errorMessage = error.body.message;
                } else if (error.message) {
                    errorMessage = error.message;
                }
                this.error = errorMessage;
                this.isLoading = false;
            });
    }
    
    toggleJsonView() {
        this.showJson = !this.showJson;
    }
    
    get formattedJson() {
        return this.metadataResult ? JSON.stringify(this.metadataResult, null, 2) : '';
    }
}