import { LightningElement, api, wire } from 'lwc';

import { getRecord } from 'lightning/uiRecordApi';

import ACCOUNT_NAME_FIELD from '@salesforce/schema/Account.Name';
import ACCOUNT_INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';
import ACCOUNT_TYPE_FIELD from '@salesforce/schema/Account.Type';
import ACCOUNT_NUMBER_FIELD from '@salesforce/schema/Account.AccountNumber';

export default class Concept_wireFunction extends LightningElement {

    @api recordId;

    account;
    error;

    @wire(getRecord, {
        recordId: '$recordId',
        fields: [ACCOUNT_NAME_FIELD, ACCOUNT_INDUSTRY_FIELD, ACCOUNT_TYPE_FIELD, ACCOUNT_NUMBER_FIELD]
    })
    wiredAccount({ data, error }) {

        if (data) {

            this.account = data;

            this.error = undefined;

            console.log('Account data received', data);

        }

        else if (error) {

            this.error = error;

            this.account = undefined;

            console.error('Error retrieving record', error);

        }

    }

    get accountName() {

        return this.account.fields.Name.value;

    }

    get industry() {

        return this.account.fields.Industry.value;

    }

}