import { LightningElement, wire, track } from 'lwc';
import { getObjectInfos } from 'lightning/uiObjectInfoApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity';
import CASE_OBJECT from '@salesforce/schema/Case';
import LEAD_OBJECT from '@salesforce/schema/Lead';

export default class Concept_getObjectInfosComparator extends LightningElement {
    @track firstObject = 'Account';
    @track secondObject = 'Contact';
    @track firstObjectData = null;
    @track secondObjectData = null;
    @track isLoading = false;
    @track errorMessage = null;
    
    objectOptions = [
        { label: 'Account', value: 'Account' },
        { label: 'Contact', value: 'Contact' },
        { label: 'Opportunity', value: 'Opportunity' },
        { label: 'Case', value: 'Case' },
        { label: 'Lead', value: 'Lead' }
    ];

    objectMap = {
        'Account': ACCOUNT_OBJECT,
        'Contact': CONTACT_OBJECT,
        'Opportunity': OPPORTUNITY_OBJECT,
        'Case': CASE_OBJECT,
        'Lead': LEAD_OBJECT
    };

    get objectApiNames() {
        if (!this.firstObject || !this.secondObject) return [];
        // Always return two entries even if both selections are the same.
        // getObjectInfos expects an array; duplicates are allowed.
        const first = this.objectMap[this.firstObject];
        const second = this.objectMap[this.secondObject];
        return [first, second];
    }

    @wire(getObjectInfos, { objectApiNames: '$objectApiNames' })
    wiredObjectInfos({ error, data }) {
        this.isLoading = false;

        if (data) {
            const results = Array.isArray(data.results) ? data.results : [];

            // Reset current data before assigning to avoid showing stale values
            this.firstObjectData = null;
            this.secondObjectData = null;

            if (results.length >= 2) {
                // Results preserve input order; index 0 maps to first selection, 1 to second selection
                const r0 = results[0];
                const r1 = results[1];

                if (r0?.statusCode === 200 && r0.result) {
                    this.firstObjectData = this.extractObjectInfo(r0.result);
                }
                if (r1?.statusCode === 200 && r1.result) {
                    this.secondObjectData = this.extractObjectInfo(r1.result);
                }
            }

            // Clear any previous error if we have both sides
            this.errorMessage = null;
        } else if (error) {
            this.errorMessage = error.body?.message || 'Error loading objects';
            this.firstObjectData = null;
            this.secondObjectData = null;
        }
    }

    // Extract only the fields we need to display
    extractObjectInfo(obj) {
        if (!obj) return null;

        // Normalize to ensure booleans and strings are always present
        return {
            label: obj.label || (obj.apiName || ''),
            apiName: obj.apiName || '',
            keyPrefix: obj.keyPrefix || '',
            createable: Boolean(obj.createable),
            updateable: Boolean(obj.updateable),
            deletable: Boolean(obj.deletable),
            queryable: Boolean(obj.queryable),
            fieldCount: obj.fields ? Object.keys(obj.fields).length : 0
        };
    }

    get hasData() {
        return this.firstObjectData !== null && this.secondObjectData !== null;
    }

    get showLoading() {
        return this.isLoading;
    }

    get showError() {
        // Only show explicit wire errors; don't show a generic message just because a side is momentarily null
        return !!this.errorMessage;
    }

    // Comparison getters
    get compareApiName() {
        return this.firstObjectData?.apiName === this.secondObjectData?.apiName;
    }

    get compareKeyPrefix() {
        return this.firstObjectData?.keyPrefix === this.secondObjectData?.keyPrefix;
    }

    // Field counts
    get firstFieldCount() {
        return this.firstObjectData?.fieldCount || 0;
    }

    get secondFieldCount() {
        return this.secondObjectData?.fieldCount || 0;
    }

    get firstFieldPercentage() {
        if (!this.firstFieldCount || !this.secondFieldCount) return 0;
        const max = Math.max(this.firstFieldCount, this.secondFieldCount);
        return Math.round((this.firstFieldCount / max) * 100);
    }

    get secondFieldPercentage() {
        if (!this.firstFieldCount || !this.secondFieldCount) return 0;
        const max = Math.max(this.firstFieldCount, this.secondFieldCount);
        return Math.round((this.secondFieldCount / max) * 100);
    }

    get firstFieldVariant() {
        if (this.firstFieldCount > this.secondFieldCount) return 'success';
        if (this.firstFieldCount < this.secondFieldCount) return 'warning';
        return 'base';
    }

    get secondFieldVariant() {
        if (this.secondFieldCount > this.firstFieldCount) return 'success';
        if (this.secondFieldCount < this.firstFieldCount) return 'warning';
        return 'base';
    }

    // Badge variants
    get firstCreateableVariant() { return this.firstObjectData?.createable ? 'success' : 'inverse'; }
    get secondCreateableVariant() { return this.secondObjectData?.createable ? 'success' : 'inverse'; }
    get firstUpdateableVariant() { return this.firstObjectData?.updateable ? 'success' : 'inverse'; }
    get secondUpdateableVariant() { return this.secondObjectData?.updateable ? 'success' : 'inverse'; }
    get firstDeletableVariant() { return this.firstObjectData?.deletable ? 'success' : 'inverse'; }
    get secondDeletableVariant() { return this.secondObjectData?.deletable ? 'success' : 'inverse'; }
    get firstQueryableVariant() { return this.firstObjectData?.queryable ? 'success' : 'inverse'; }
    get secondQueryableVariant() { return this.secondObjectData?.queryable ? 'success' : 'inverse'; }

    // Capability labels
    get firstCreateable() { return this.firstObjectData?.createable ? 'Yes' : 'No'; }
    get secondCreateable() { return this.secondObjectData?.createable ? 'Yes' : 'No'; }
    get firstUpdateable() { return this.firstObjectData?.updateable ? 'Yes' : 'No'; }
    get secondUpdateable() { return this.secondObjectData?.updateable ? 'Yes' : 'No'; }
    get firstDeletable() { return this.firstObjectData?.deletable ? 'Yes' : 'No'; }
    get secondDeletable() { return this.secondObjectData?.deletable ? 'Yes' : 'No'; }
    get firstQueryable() { return this.firstObjectData?.queryable ? 'Yes' : 'No'; }
    get secondQueryable() { return this.secondObjectData?.queryable ? 'Yes' : 'No'; }

    handleFirstChange(event) {
        const newValue = event.detail.value;
        if (this.firstObject !== newValue) {
            this.firstObject = newValue;
            // Reset and show loading to avoid stale cross-object display
            this.firstObjectData = null;
            this.secondObjectData = null;
            this.errorMessage = null;
            this.isLoading = true;
        }
    }

    handleSecondChange(event) {
        const newValue = event.detail.value;
        if (this.secondObject !== newValue) {
            this.secondObject = newValue;
            // Reset and show loading to avoid stale cross-object display
            this.firstObjectData = null;
            this.secondObjectData = null;
            this.errorMessage = null;
            this.isLoading = true;
        }
    }

    get isSameObjectSelected() {
        return this.firstObject === this.secondObject;
    }
}