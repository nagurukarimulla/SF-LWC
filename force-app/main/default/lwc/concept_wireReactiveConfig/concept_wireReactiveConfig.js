import { LightningElement, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

import ACCOUNT_NAME_FIELD from '@salesforce/schema/Account.Name';
import ACCOUNT_INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';
import ACCOUNT_TYPE_FIELD from '@salesforce/schema/Account.Type';
import ACCOUNT_NUMBER_FIELD from '@salesforce/schema/Account.AccountNumber';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';
import WEBSITE_FIELD from '@salesforce/schema/Account.Website';

const fields = [
    ACCOUNT_NAME_FIELD, 
    ACCOUNT_INDUSTRY_FIELD, 
    ACCOUNT_TYPE_FIELD, 
    ACCOUNT_NUMBER_FIELD, 
    PHONE_FIELD, 
    WEBSITE_FIELD
];

export default class Concept_wireReactiveConfig extends LightningElement {
    recordId;

    @wire(getRecord, {
        recordId: '$recordId',
        fields
    })
    account;

    handleChange(event) {
        this.recordId = event.target.value;
    }

    get accountName() {
        return this.account.data ? getFieldValue(this.account.data, ACCOUNT_NAME_FIELD) : '-';
    }

    get accountIndustry() {
        return this.account.data ? getFieldValue(this.account.data, ACCOUNT_INDUSTRY_FIELD) : '-';
    }

    get accountType() {
        return this.account.data ? getFieldValue(this.account.data, ACCOUNT_TYPE_FIELD) : '-';
    }

    get accountNumber() {
        return this.account.data ? getFieldValue(this.account.data, ACCOUNT_NUMBER_FIELD) : '-';
    }

    get accountPhone() {
        return this.account.data ? getFieldValue(this.account.data, PHONE_FIELD) : '-';
    }

    get accountWebsite() {
        return this.account.data ? getFieldValue(this.account.data, WEBSITE_FIELD) : '-';
    }
}