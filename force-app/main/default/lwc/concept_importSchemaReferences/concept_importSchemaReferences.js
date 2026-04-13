import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import ACCOUNT_NAME_FIELD from '@salesforce/schema/Account.Name';
import ACCOUNT_SLA_FIELD from '@salesforce/schema/Account.SLA__c';
import ACCOUNT_TYPE_FIELD from '@salesforce/schema/Account.Type';
import ACCOUNT_INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';
import ACCOUNT_NUMBER_FIELD from '@salesforce/schema/Account.AccountNumber';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';
import WEBSITE_FIELD from '@salesforce/schema/Account.Website';


const fields = [ACCOUNT_NAME_FIELD, ACCOUNT_SLA_FIELD, ACCOUNT_TYPE_FIELD, ACCOUNT_INDUSTRY_FIELD, ACCOUNT_NUMBER_FIELD, PHONE_FIELD, WEBSITE_FIELD];

export default class Concept_importSchemaReferences extends LightningElement {

    @api recordId;
    @wire(getRecord, { recordId: '$recordId', fields })
    record;

    get accountName() {
        return getFieldValue(this.record.data, ACCOUNT_NAME_FIELD) || 'Not Available';
    }

    get slaName() {
        return getFieldValue(this.record.data, ACCOUNT_SLA_FIELD) || 'Not Available';
    }

    get accountType() {
        return getFieldValue(this.record.data, ACCOUNT_TYPE_FIELD) || 'Not Available';
    }

    get accountIndustry() {
        return getFieldValue(this.record.data, ACCOUNT_INDUSTRY_FIELD) || 'Not Available';
    }

    get accountNumber() {
        return getFieldValue(this.record.data, ACCOUNT_NUMBER_FIELD) || 'Not Available';
    }

    get accountPhone() {
        return getFieldValue(this.record.data, PHONE_FIELD) || 'Not Available';
    }

    get accountWebsite() {
        return getFieldValue(this.record.data, WEBSITE_FIELD) || 'Not Available';
    }
}