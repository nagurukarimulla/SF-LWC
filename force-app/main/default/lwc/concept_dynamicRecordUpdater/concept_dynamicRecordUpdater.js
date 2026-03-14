import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import getRecords from '@salesforce/apex/DynamicUpdateController.getRecords';
import getRecordById from '@salesforce/apex/DynamicUpdateController.getRecordById';
import ID_FIELD from '@salesforce/schema/Account.Id';

export default class Concept_dynamicRecordUpdater extends LightningElement {
    @track selectedObject;
    @track records;
    @track selectedRecordId;
    @track selectedRecord;
    @track fieldValues = {};
    @track isLoading = false;
    
    wiredRecordsResult;

    objectOptions = [
        { label: 'Account', value: 'Account' },
        { label: 'Contact', value: 'Contact' },
        { label: 'Case', value: 'Case' },
        { label: 'Opportunity', value: 'Opportunity' },
        { label: 'Lead', value: 'Lead' }
    ];

    statusOptions = [
        { label: 'New', value: 'New' },
        { label: 'Working', value: 'Working' },
        { label: 'Escalated', value: 'Escalated' },
        { label: 'Closed', value: 'Closed' }
    ];

    priorityOptions = [
        { label: 'High', value: 'High' },
        { label: 'Medium', value: 'Medium' },
        { label: 'Low', value: 'Low' }
    ];

    stageOptions = [
        { label: 'Prospecting', value: 'Prospecting' },
        { label: 'Qualification', value: 'Qualification' },
        { label: 'Needs Analysis', value: 'Needs Analysis' },
        { label: 'Value Proposition', value: 'Value Proposition' },
        { label: 'Closed Won', value: 'Closed Won' },
        { label: 'Closed Lost', value: 'Closed Lost' }
    ];

    // Object type getters
    get isAccount() { return this.selectedObject === 'Account'; }
    get isContact() { return this.selectedObject === 'Contact'; }
    get isCase() { return this.selectedObject === 'Case'; }
    get isOpportunity() { return this.selectedObject === 'Opportunity'; }
    get isLead() { return this.selectedObject === 'Lead'; }

    get recordOptions() {
        if (!this.records) return [];
        return this.records.map(record => ({
            label: record.Name || record.CaseNumber || record.Subject || 'Record',
            value: record.Id
        }));
    }

    get isFormValid() {
        if (!this.selectedObject) return false;
        
        switch(this.selectedObject) {
            case 'Account':
                return this.fieldValues.Name;
            case 'Contact':
                return this.fieldValues.LastName;
            case 'Case':
                return this.fieldValues.Subject;
            case 'Opportunity':
                return this.fieldValues.Name && this.fieldValues.StageName && this.fieldValues.CloseDate;
            case 'Lead':
                return this.fieldValues.LastName && this.fieldValues.Company;
            default:
                return false;
        }
    }

    @wire(getRecords, { objectName: '$selectedObject' })
    wiredRecords(result) {
        this.wiredRecordsResult = result;
        if (result.data) {
            this.records = result.data;
        } else if (result.error) {
            this.showToast('Error', 'Error loading records', 'error');
        }
    }

    async handleObjectChange(event) {
        this.selectedObject = event.detail.value;
        this.selectedRecordId = null;
        this.selectedRecord = null;
        this.fieldValues = {};
    }

    async handleRecordChange(event) {
        this.selectedRecordId = event.detail.value;
        this.isLoading = true;
        
        try {
            const record = await getRecordById({ 
                objectName: this.selectedObject, 
                recordId: this.selectedRecordId 
            });
            this.selectedRecord = record;
            
            // Populate field values
            this.fieldValues = {};
            Object.keys(record).forEach(key => {
                if (key !== 'attributes') {
                    this.fieldValues[key] = record[key];
                }
            });
            
        } catch (error) {
            this.showToast('Error', 'Error loading record details', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    handleFieldChange(event) {
        const field = event.target.dataset.field;
        this.fieldValues[field] = event.target.value;
    }

    async handleUpdate() {
        // Validate all fields
        const allValid = [...this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-textarea')]
            .reduce((validSoFar, inputField) => {
                if (inputField.required && !inputField.value) {
                    inputField.reportValidity();
                    return false;
                }
                return validSoFar && true;
            }, true);

        if (!allValid) {
            this.showToast('Validation Error', 'Please fill in all required fields', 'error');
            return;
        }

        this.isLoading = true;

        try {
            // Create recordInput object
            const fields = {};
            fields[ID_FIELD.fieldApiName] = this.selectedRecordId;
            
            // Add all field values
            Object.keys(this.fieldValues).forEach(key => {
                if (key !== 'Id' && key !== 'attributes' && this.fieldValues[key]) {
                    fields[key] = this.fieldValues[key];
                }
            });

            const recordInput = { fields };

            await updateRecord(recordInput);
            
            this.showToast('Success', `${this.selectedObject} updated successfully`, 'success');
            
            // Refresh the record data
            const updatedRecord = await getRecordById({ 
                objectName: this.selectedObject, 
                recordId: this.selectedRecordId 
            });
            this.selectedRecord = updatedRecord;
            
        } catch (error) {
            let errorMessage = 'Error updating record';
            if (error.body && error.body.message) {
                errorMessage = error.body.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            this.showToast('Error', errorMessage, 'error');
        } finally {
            this.isLoading = false;
        }
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