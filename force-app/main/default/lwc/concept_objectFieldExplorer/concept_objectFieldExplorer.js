import { LightningElement, wire, track } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity';
import CASE_OBJECT from '@salesforce/schema/Case';

export default class ObjectFieldExplorer extends LightningElement {
    @track selectedObject;
    @track searchTerm = '';
    
    objectOptions = [
        { label: 'Account', value: 'Account' },
        { label: 'Contact', value: 'Contact' },
        { label: 'Opportunity', value: 'Opportunity' },
        { label: 'Case', value: 'Case' }
    ];

    objectMap = {
        'Account': ACCOUNT_OBJECT,
        'Contact': CONTACT_OBJECT,
        'Opportunity': OPPORTUNITY_OBJECT,
        'Case': CASE_OBJECT
    };

    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    objectInfo;

    get objectApiName() {
        return this.selectedObject ? this.objectMap[this.selectedObject] : null;
    }

    get isLoading() {
        return this.selectedObject && !this.objectInfo.data && !this.objectInfo.error;
    }

    get error() {
        if (this.objectInfo.error) {
            return 'Error loading object: ' + this.objectInfo.error.body.message;
        }
        return null;
    }

    get objectData() {
        return this.objectInfo.data;
    }

    // Computed UI helpers for template (avoid ternary in HTML)
    get hasFilteredFields() {
        return Boolean(this.filteredFields && this.filteredFields.length);
    }

    get createableText() {
        const d = this.objectData;
        return d && typeof d.createable === 'boolean'
            ? (d.createable ? 'Createable' : 'Not Createable')
            : '';
    }
    get updateableText() {
        const d = this.objectData;
        return d && typeof d.updateable === 'boolean'
            ? (d.updateable ? 'Updateable' : 'Not Updateable')
            : '';
    }
    get deletableText() {
        const d = this.objectData;
        return d && typeof d.deletable === 'boolean'
            ? (d.deletable ? 'Deletable' : 'Not Deletable')
            : '';
    }

    get createableVariant() {
        const d = this.objectData;
        return d && d.createable ? 'success' : 'inverse';
    }
    get updateableVariant() {
        const d = this.objectData;
        return d && d.updateable ? 'success' : 'inverse';
    }
    get deletableVariant() {
        const d = this.objectData;
        return d && d.deletable ? 'success' : 'inverse';
    }

    badgeVariant(value) {
        return value ? 'success' : 'light';
    }

    get filteredFields() {
        if (!this.objectInfo.data || !this.objectInfo.data.fields) {
            return [];
        }

        const fields = this.objectInfo.data.fields;
        const fieldsList = Object.keys(fields).map(fieldApiName => ({
            apiName: fieldApiName,
            label: fields[fieldApiName].label,
            dataType: fields[fieldApiName].dataType,
            required: fields[fieldApiName].required,
            unique: fields[fieldApiName].unique,
            externalId: fields[fieldApiName].externalId,
            length: fields[fieldApiName].length
        }));

        if (!this.searchTerm) {
            return fieldsList.slice(0, 20); // Limit to 20 fields
        }

        const searchLower = this.searchTerm.toLowerCase();
        return fieldsList
            .filter(field => 
                field.label.toLowerCase().includes(searchLower) ||
                field.apiName.toLowerCase().includes(searchLower) ||
                field.dataType.toLowerCase().includes(searchLower)
            )
            .slice(0, 20);
    }

    handleObjectChange(event) {
        this.selectedObject = event.detail.value;
        this.searchTerm = '';
    }

    handleSearch(event) {
        this.searchTerm = event.detail.value;
    }
}