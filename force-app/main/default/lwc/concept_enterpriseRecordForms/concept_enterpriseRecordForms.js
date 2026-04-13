// import { LightningElement, track } from 'lwc';
// import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// export default class Concept_enterpriseRecordForms extends LightningElement {

// @track recordId = '';
// @track objectApiName = 'Account';
// @track formKey = 0;

// objectOptions = [
// { label:'Account', value:'Account'},
// { label:'Contact', value:'Contact'},
// { label:'Opportunity', value:'Opportunity'},
// { label:'Case', value:'Case'},
// { label:'Lead', value:'Lead'}
// ];

// get hasRecordId(){
// return this.recordId && this.recordId.length > 10;
// }

// get isAccount(){
// return this.objectApiName === 'Account';
// }

// get isContact(){
// return this.objectApiName === 'Contact';
// }

// handleObjectChange(event){

// this.objectApiName = event.detail.value;
// this.formKey++;

// }

// handleRecordChange(event){

// this.recordId = event.target.value.trim();
// this.formKey++;

// }

// handleSuccess(){

// this.dispatchEvent(
// new ShowToastEvent({
// title:'Success',
// message:'Record updated successfully',
// variant:'success'
// })
// );

// this.formKey++;

// }

// }











import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Concept_enterpriseRecordForms extends LightningElement {
    @track recordId = '';
    @track objectApiName = 'Account';
    @track objectLabel = 'Account';
    @track objectMetadata = null;
    @track isLoading = false;
    @track formKey = 0; // Used to force re-render when object changes

    objectOptions = [
        { label: 'Account', value: 'Account' },
        { label: 'Contact', value: 'Contact' },
        { label: 'Opportunity', value: 'Opportunity' },
        { label: 'Case', value: 'Case' },
        { label: 'Lead', value: 'Lead' }
    ];

    // Computed getters for object type checking
    get isAccount() {
        return this.objectApiName === 'Account';
    }

    get isContact() {
        return this.objectApiName === 'Contact';
    }

    get isOpportunity() {
        return this.objectApiName === 'Opportunity';
    }

    get isCase() {
        return this.objectApiName === 'Case';
    }

    get isLead() {
        return this.objectApiName === 'Lead';
    }

    get isUnsupportedObject() {
        const supportedObjects = ['Account', 'Contact', 'Opportunity', 'Case', 'Lead'];
        return !supportedObjects.includes(this.objectApiName);
    }

    get isFormReady() {
        return this.recordId && this.objectApiName && this.recordId.length >= 15;
    }

    handleObjectChange(event) {
        this.objectApiName = event.detail.value;
        this.objectLabel = this.getObjectLabel(this.objectApiName);
        // Force re-render of forms
        this.formKey++;
        this.fetchObjectMetadata();
        
        this.showToast('Success', `Switched to ${this.objectLabel}`, 'success');
    }

    handleRecordChange(event) {
        this.recordId = event.target.value.trim();
        if (this.isFormReady) {
            this.fetchRecordData();
        }
    }

    handleFormLoad() {
        this.isLoading = false;
    }

    handleFormError(event) {
        this.isLoading = false;
        this.showToast('Error', event.detail.error?.body?.message || 'Error loading record', 'error');
    }

    handleSuccess() {
        this.showToast('Success', 'Record updated successfully', 'success');
        // Refresh the forms
        this.formKey++;
    }

    getObjectLabel(apiName) {
        const option = this.objectOptions.find(opt => opt.value === apiName);
        return option ? option.label : apiName;
    }

    fetchObjectMetadata() {
        // Simulate fetching object metadata
        this.objectMetadata = {
            recordTypeName: 'Master',
            lastModified: new Date().toLocaleDateString()
        };
    }

    fetchRecordData() {
        this.isLoading = true;
        // Simulate record fetch
        setTimeout(() => {
            this.isLoading = false;
        }, 1000);
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
}