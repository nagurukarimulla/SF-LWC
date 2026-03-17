import { LightningElement, track } from 'lwc';
import { createListInfo } from 'lightning/uiListsApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// Import field references correctly
import ACCOUNT_NAME_FIELD from '@salesforce/schema/Account.Name';
import ACCOUNT_TYPE_FIELD from '@salesforce/schema/Account.Type';
import ACCOUNT_INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';
import ACCOUNT_PHONE_FIELD from '@salesforce/schema/Account.Phone';
import ACCOUNT_WEBSITE_FIELD from '@salesforce/schema/Account.Website';

import CONTACT_NAME_FIELD from '@salesforce/schema/Contact.Name';
import CONTACT_EMAIL_FIELD from '@salesforce/schema/Contact.Email';
import CONTACT_PHONE_FIELD from '@salesforce/schema/Contact.Phone';
import CONTACT_TITLE_FIELD from '@salesforce/schema/Contact.Title';

import OPPORTUNITY_NAME_FIELD from '@salesforce/schema/Opportunity.Name';
import OPPORTUNITY_STAGENAME_FIELD from '@salesforce/schema/Opportunity.StageName';
import OPPORTUNITY_AMOUNT_FIELD from '@salesforce/schema/Opportunity.Amount';
import OPPORTUNITY_CLOSEDATE_FIELD from '@salesforce/schema/Opportunity.CloseDate';

import CASE_NUMBER_FIELD from '@salesforce/schema/Case.CaseNumber';
import CASE_STATUS_FIELD from '@salesforce/schema/Case.Status';
import CASE_PRIORITY_FIELD from '@salesforce/schema/Case.Priority';
import CASE_ORIGIN_FIELD from '@salesforce/schema/Case.Origin';

export default class Concept_createListInfoExplorer extends LightningElement {
    @track selectedObject = '';
    @track listViewApiName = '';
    @track listViewLabel = '';
    @track selectedVisibility = 'Private';
    @track displayColumns = null;
    @track availableFields = [];
    @track selectedFields = [];

    objectOptions = [
        { label: 'Account', value: 'Account' },
        { label: 'Contact', value: 'Contact' },
        { label: 'Opportunity', value: 'Opportunity' },
        { label: 'Case', value: 'Case' }
    ];

    visibilityOptions = [
        { label: 'Private (Only me)', value: 'Private' },
        { label: 'Shared with Everyone', value: 'Shared' },
        { label: 'Public', value: 'Public' }
    ];

    // Map objects to their available fields with proper field references
    objectFieldsMap = {
        'Account': [
            { label: 'Account Name', value: 'Name', fieldRef: ACCOUNT_NAME_FIELD, selected: true },
            { label: 'Type', value: 'Type', fieldRef: ACCOUNT_TYPE_FIELD, selected: false },
            { label: 'Industry', value: 'Industry', fieldRef: ACCOUNT_INDUSTRY_FIELD, selected: false },
            { label: 'Phone', value: 'Phone', fieldRef: ACCOUNT_PHONE_FIELD, selected: false },
            { label: 'Website', value: 'Website', fieldRef: ACCOUNT_WEBSITE_FIELD, selected: false }
        ],
        'Contact': [
            { label: 'Name', value: 'Name', fieldRef: CONTACT_NAME_FIELD, selected: true },
            { label: 'Email', value: 'Email', fieldRef: CONTACT_EMAIL_FIELD, selected: false },
            { label: 'Phone', value: 'Phone', fieldRef: CONTACT_PHONE_FIELD, selected: false },
            { label: 'Title', value: 'Title', fieldRef: CONTACT_TITLE_FIELD, selected: false }
        ],
        'Opportunity': [
            { label: 'Opportunity Name', value: 'Name', fieldRef: OPPORTUNITY_NAME_FIELD, selected: true },
            { label: 'Stage', value: 'StageName', fieldRef: OPPORTUNITY_STAGENAME_FIELD, selected: false },
            { label: 'Amount', value: 'Amount', fieldRef: OPPORTUNITY_AMOUNT_FIELD, selected: false },
            { label: 'Close Date', value: 'CloseDate', fieldRef: OPPORTUNITY_CLOSEDATE_FIELD, selected: false }
        ],
        'Case': [
            { label: 'Case Number', value: 'CaseNumber', fieldRef: CASE_NUMBER_FIELD, selected: true },
            { label: 'Status', value: 'Status', fieldRef: CASE_STATUS_FIELD, selected: false },
            { label: 'Priority', value: 'Priority', fieldRef: CASE_PRIORITY_FIELD, selected: false },
            { label: 'Origin', value: 'Origin', fieldRef: CASE_ORIGIN_FIELD, selected: false }
        ]
    };

    handleObjectChange(event) {
        this.selectedObject = event.detail.value;
        this.resetForm();
        this.loadFieldsForObject();
    }

    handleNameChange(event) {
        this.listViewApiName = event.target.value;
    }

    handleLabelChange(event) {
        this.listViewLabel = event.target.value;
    }

    handleVisibilityChange(event) {
        this.selectedVisibility = event.detail.value;
    }

    handleFieldSelection(event) {
        const fieldValue = event.target.value;
        const isChecked = event.target.checked;
        
        this.availableFields = this.availableFields.map(field => {
            if (field.value === fieldValue) {
                return { ...field, selected: isChecked };
            }
            return field;
        });
    }

    loadFieldsForObject() {
        if (this.selectedObject && this.objectFieldsMap[this.selectedObject]) {
            // Deep copy to avoid reference issues
            this.availableFields = JSON.parse(
                JSON.stringify(this.objectFieldsMap[this.selectedObject])
            );
        }
    }

    get isFormValid() {
        return this.selectedObject && 
               this.listViewApiName && 
               this.listViewApiName.trim() !== '' &&
               this.listViewLabel && 
               this.listViewLabel.trim() !== '' &&
               this.selectedVisibility;
    }

    resetForm() {
        this.listViewApiName = '';
        this.listViewLabel = '';
        this.selectedVisibility = 'Private';
        this.displayColumns = null;
        this.availableFields = [];
    }

    getSelectedFields() {
        return this.availableFields
            .filter(field => field.selected)
            .map(field => ({
                fieldApiName: field.value,
                label: field.label
            }));
    }

    async handleCreate() {
        if (!this.isFormValid) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Validation Error',
                    message: 'Please fill in all required fields',
                    variant: 'warning'
                })
            );
            return;
        }

        try {
            const selectedFields = this.getSelectedFields();
            
            if (selectedFields.length === 0) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Warning',
                        message: 'Please select at least one field to display',
                        variant: 'warning'
                    })
                );
                return;
            }

            // Log the payload for debugging
            const listInfoInput = {
                objectApiName: this.selectedObject,
                listViewApiName: this.listViewApiName.trim().replace(/\s+/g, '_'), // Replace spaces with underscores
                label: this.listViewLabel.trim(),
                displayColumns: selectedFields,
                visibility: this.selectedVisibility,
                filters: null,
                isDefault: false
            };

            console.log('Creating list view with payload:', JSON.stringify(listInfoInput, null, 2));

            const result = await createListInfo(listInfoInput);
            
            console.log('Success result:', result);
            
            this.displayColumns = result.displayColumns || selectedFields;

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: `List View "${this.listViewLabel}" created successfully`,
                    variant: 'success'
                })
            );

        } catch (error) {
            console.error('Error creating list view:', error);
            console.error('Error body:', JSON.stringify(error.body, null, 2));
            
            let errorMessage = 'Failed to create list view';
            
            if (error?.body?.message) {
                errorMessage = error.body.message;
            } else if (error?.body?.output?.errors?.length > 0) {
                errorMessage = error.body.output.errors[0].message;
            } else if (error?.body?.fieldErrors) {
                const fieldErrors = Object.values(error.body.fieldErrors);
                if (fieldErrors.length > 0 && fieldErrors[0].length > 0) {
                    errorMessage = fieldErrors[0][0].message;
                }
            } else if (error?.message) {
                errorMessage = error.message;
            }

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: errorMessage,
                    variant: 'error'
                })
            );
        }
    }
}