import { LightningElement, wire, track } from 'lwc';
import { getSObjectValue } from '@salesforce/apex';

import getAccountInsight from '@salesforce/apex/AccountInsightController.getAccountInsight';
import getAccountOptions from '@salesforce/apex/AccountInsightController.getAccountOptions';

import NAME_FIELD from '@salesforce/schema/Account.Name';
import INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';
import OWNER_NAME_FIELD from '@salesforce/schema/Account.Owner.Name';
import OWNER_EMAIL_FIELD from '@salesforce/schema/Account.Owner.Email';
import ACCOUNT_NUMBER_FIELD from '@salesforce/schema/Account.AccountNumber';
import ACCOUNT_TYPE_FIELD from '@salesforce/schema/Account.Type';

export default class Concept_apexSchemaImport extends LightningElement {

    selectedAccountId = '';
    accountData; // Store just the account data directly
    @track accountOptions = [];
    errorMessage;
    isLoading = false; // Add loading property

    connectedCallback() {
        this.loadAccountOptions();
    }

    async loadAccountOptions() {
        this.isLoading = true;
        try {
            const accounts = await getAccountOptions();
            this.accountOptions = accounts.map(acc => ({
                label: acc.Name,
                value: acc.Id
            }));
            this.errorMessage = undefined;
        }
        catch(error) {
            this.errorMessage = error.body?.message;
        }
        finally {
            this.isLoading = false;
        }
    }

    handleAccountChange(event) {
        this.selectedAccountId = event.detail.value;
        this.accountData = undefined; // Clear previous account data
        this.errorMessage = undefined;
        console.log('Selected Account Id:', this.selectedAccountId);
    }

    get selectedIdForWire() {
        return this.selectedAccountId || undefined;
    }

    @wire(getAccountInsight, { recordId: '$selectedAccountId' })
    wiredAccount({ data, error }) {
        if (data) {
            this.accountData = data; // Store data directly
            this.errorMessage = undefined;
        }
        else if (error) {
            this.accountData = undefined;
            this.errorMessage = error.body?.message;
        }
    }

    // Computed properties for template conditions
    get hasAccountData() {
        return this.accountData !== undefined && this.accountData !== null;
    }

    get hasError() {
        return this.errorMessage !== undefined && this.errorMessage !== null;
    }

    get isAccountNotSelected() {
        return !this.selectedAccountId && !this.isLoading && !this.hasError;
    }

    // Safe getters with null checks
    get accountName() {
        return this.accountData
            ? getSObjectValue(this.accountData, NAME_FIELD)
            : '-';
    }

    get industry() {
        return this.accountData
            ? getSObjectValue(this.accountData, INDUSTRY_FIELD)
            : '-';
    }

    get ownerName() {
        return this.accountData
            ? getSObjectValue(this.accountData, OWNER_NAME_FIELD)
            : '-';
    }

    get ownerEmail() {
        return this.accountData
            ? getSObjectValue(this.accountData, OWNER_EMAIL_FIELD)
            : '-';
    }

    get accountNumber() {
        return this.accountData
            ? getSObjectValue(this.accountData, ACCOUNT_NUMBER_FIELD)
            : '-';
    }

    get accountType() {
        return this.accountData
            ? getSObjectValue(this.accountData, ACCOUNT_TYPE_FIELD)
            : '-';
    }
}