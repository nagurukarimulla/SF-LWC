import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { deleteRecord } from 'lightning/uiRecordApi';
import getRecords from '@salesforce/apex/DynamicDeleteController.getRecords';

export default class Concept_dynamicRecordDeletion extends LightningElement {
    selectedObject;
    records;
    error;
    isLoading = false;
    
    wiredRecordsResult;

    objectOptions = [
        { label: 'Account', value: 'Account' },
        { label: 'Contact', value: 'Contact' },
        { label: 'Case', value: 'Case' },
        { label: 'Opportunity', value: 'Opportunity' },
        { label: 'Lead', value: 'Lead' }
    ];

    // Dynamic columns based on object type
    // Dynamic columns based on object type
get columns() {
    let columns = [];

    if (this.selectedObject === 'Account') {
        columns.push({ label: 'Account Name', fieldName: 'Name' });
        columns.push({ label: 'Phone', fieldName: 'Phone', type: 'phone' });
    } else if (this.selectedObject === 'Contact') {
        columns.push({ label: 'Contact Name', fieldName: 'Name' });
        columns.push({ label: 'Email', fieldName: 'Email', type: 'email' });
    } else if (this.selectedObject === 'Case') {
        columns.push({ label: 'Case Number', fieldName: 'CaseNumber' });
        columns.push({ label: 'Subject', fieldName: 'Subject' });
        columns.push({ label: 'Status', fieldName: 'Status' });
    } else if (this.selectedObject === 'Opportunity') {
        columns.push({ label: 'Opportunity Name', fieldName: 'Name' });
        columns.push({ label: 'Stage', fieldName: 'StageName' });
        columns.push({ label: 'Amount', fieldName: 'Amount', type: 'currency' });
    } else if (this.selectedObject === 'Lead') {
        columns.push({ label: 'Lead Name', fieldName: 'Name' });
        columns.push({ label: 'Company', fieldName: 'Company' });
        columns.push({ label: 'Status', fieldName: 'Status' });
    } else {
        columns.push({ label: 'Name', fieldName: 'Name' });
    }

    // Add delete button only (no ID column)
    columns.push({
        type: 'button',
        typeAttributes: {
            label: 'Delete',
            name: 'delete',
            variant: 'destructive',
            iconName: 'utility:delete'
        }
    });

    return columns;
}

    get showNoRecords() {
        return this.selectedObject && this.records && this.records.length === 0;
    }

    @wire(getRecords, { objectName: '$selectedObject' })
    wiredRecords(result) {
        this.wiredRecordsResult = result;
        if (result.data) {
            console.log('Records loaded:', result.data); // Debug log
            this.records = result.data;
            this.error = undefined;
        } else if (result.error) {
            console.error('Error loading records:', result.error);
            this.error = result.error;
            this.records = undefined;
        }
    }

    handleObjectChange(event) {
        this.selectedObject = event.detail.value;
        this.records = null;
    }

    async handleRowAction(event) {
        const action = event.detail.action.name;
        const row = event.detail.row;

        if (action === 'delete') {
            // Simple confirm dialog
            if (confirm(`Are you sure you want to delete this ${this.selectedObject} record?`)) {
                await this.deleteRecord(row.Id);
            }
        }
    }

    async deleteRecord(recordId) {
        this.isLoading = true;

        try {
            console.log('Deleting record:', recordId); // Debug log
            await deleteRecord(recordId);
            
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: `${this.selectedObject} record deleted successfully`,
                    variant: 'success'
                })
            );

            // Refresh the data
            await refreshApex(this.wiredRecordsResult);

        } catch (error) {
            console.error('Delete error:', error); // Debug log
            let errorMessage = 'Error deleting record';
            
            // Simple error handling
            if (error.body && error.body.message) {
                errorMessage = error.body.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: errorMessage,
                    variant: 'error'
                })
            );
        } finally {
            this.isLoading = false;
        }
    }
}