import { LightningElement, wire, track } from 'lwc';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';

// Account imports
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import ACCOUNT_INDUSTRY from '@salesforce/schema/Account.Industry';
import ACCOUNT_TYPE from '@salesforce/schema/Account.Type';
import ACCOUNT_RATING from '@salesforce/schema/Account.Rating';
import ACCOUNT_OWNERSHIP from '@salesforce/schema/Account.Ownership';

// Case imports
import CASE_OBJECT from '@salesforce/schema/Case';
import CASE_STATUS from '@salesforce/schema/Case.Status';
import CASE_PRIORITY from '@salesforce/schema/Case.Priority';
import CASE_ORIGIN from '@salesforce/schema/Case.Origin';
import CASE_REASON from '@salesforce/schema/Case.Reason';
import CASE_TYPE from '@salesforce/schema/Case.Type';

// Contact imports
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import CONTACT_LEADSOURCE from '@salesforce/schema/Contact.LeadSource';

// Opportunity imports
import OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity';
import OPPORTUNITY_STAGENAME from '@salesforce/schema/Opportunity.StageName';
import OPPORTUNITY_TYPE from '@salesforce/schema/Opportunity.Type';
import OPPORTUNITY_LEADSOURCE from '@salesforce/schema/Opportunity.LeadSource';

export default class Concept_picklistValuesExplorer extends LightningElement {
    selectedObject = '';
    selectedField = '';
    @track picklistValues;
    @track isLoading = false;

    // Object options
    objectOptions = [
        { label: 'Account', value: 'Account' },
        { label: 'Case', value: 'Case' },
        { label: 'Contact', value: 'Contact' },
        { label: 'Opportunity', value: 'Opportunity' }
    ];

    // Field options for each object
    fieldOptionsMap = {
        'Account': [
            { label: 'Industry', value: 'Industry' },
            { label: 'Type', value: 'Type' },
            { label: 'Rating', value: 'Rating' },
            { label: 'Ownership', value: 'Ownership' }
        ],
        'Case': [
            { label: 'Status', value: 'Status' },
            { label: 'Priority', value: 'Priority' },
            { label: 'Origin', value: 'Origin' },
            { label: 'Reason', value: 'Reason' },
            { label: 'Type', value: 'Type' }
        ],
        'Contact': [
            { label: 'Lead Source', value: 'LeadSource' }
        ],
        'Opportunity': [
            { label: 'Stage', value: 'StageName' },
            { label: 'Type', value: 'Type' },
            { label: 'Lead Source', value: 'LeadSource' }
        ]
    };

    // Object API names mapping
    objectApiMap = {
        'Account': ACCOUNT_OBJECT,
        'Case': CASE_OBJECT,
        'Contact': CONTACT_OBJECT,
        'Opportunity': OPPORTUNITY_OBJECT
    };

    // Field API mapping
    fieldApiMap = {
        'Account-Industry': ACCOUNT_INDUSTRY,
        'Account-Type': ACCOUNT_TYPE,
        'Account-Rating': ACCOUNT_RATING,
        'Account-Ownership': ACCOUNT_OWNERSHIP,
        'Case-Status': CASE_STATUS,
        'Case-Priority': CASE_PRIORITY,
        'Case-Origin': CASE_ORIGIN,
        'Case-Reason': CASE_REASON,
        'Case-Type': CASE_TYPE,
        'Contact-LeadSource': CONTACT_LEADSOURCE,
        'Opportunity-StageName': OPPORTUNITY_STAGENAME,
        'Opportunity-Type': OPPORTUNITY_TYPE,
        'Opportunity-LeadSource': OPPORTUNITY_LEADSOURCE
    };

    recordTypeId;

    get fieldOptions() {
        return this.fieldOptionsMap[this.selectedObject] || [];
    }

    get showNoValues() {
        return this.selectedField && !this.isLoading && (!this.picklistValues || this.picklistValues.length === 0);
    }

    handleObjectChange(event) {
        this.selectedObject = event.detail.value;
        this.selectedField = '';
        this.picklistValues = null;
        this.recordTypeId = null;
    }

    handleFieldChange(event) {
        this.selectedField = event.detail.value;
        this.picklistValues = null;
        this.isLoading = true;
    }

    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    objectInfo({ data, error }) {
        if (data) {
            this.recordTypeId = data.defaultRecordTypeId;
            this.isLoading = false;
        } else if (error) {
            console.error('Error fetching object info:', error);
            this.isLoading = false;
        }
    }

    get objectApiName() {
        return this.selectedObject ? this.objectApiMap[this.selectedObject] : null;
    }

    get fieldApiName() {
        if (this.selectedObject && this.selectedField) {
            const key = `${this.selectedObject}-${this.selectedField}`;
            return this.fieldApiMap[key] || null;
        }
        return null;
    }

    @wire(getPicklistValues, {
        recordTypeId: '$recordTypeId',
        fieldApiName: '$fieldApiName'
    })
    picklistValuesHandler({ data, error }) {
        if (data) {
            this.picklistValues = data.values;
            this.isLoading = false;
        } else if (error) {
            console.error('Error fetching picklist values:', error);
            console.error('Error details:', JSON.stringify(error));
            this.picklistValues = [];
            this.isLoading = false;
        }
    }

    // Add getter to check if we should show the field combobox
    get showFieldSelector() {
        return this.selectedObject && this.fieldOptions.length > 0;
    }
}