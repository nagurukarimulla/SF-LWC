import { LightningElement, wire } from 'lwc';

import getHighValueDeals
    from '@salesforce/apex/OpportunityAnalyticsController.getHighValueDeals';

import { refreshApex } from '@salesforce/apex';

export default class Concept_refreshApexCache extends LightningElement {

    amount = 1000;

    deals;
    error;
    errorMessage;

    wiredResult;

    handleAmountChange(event) {

        this.amount = event.target.value;

    }

    @wire(getHighValueDeals, { amount: '$amount' })
    wiredDeals(value) {

        this.wiredResult = value;

        const { data, error } = value;

        if (data) {

            this.deals = data;
            this.error = undefined;

        }

        else if (error) {

            this.error = error;
            this.deals = undefined;
            this.errorMessage = error.body?.message;

        }

    }

    async handleRefresh() {

        try {

            await refreshApex(this.wiredResult);

        }
        catch (error) {

            this.errorMessage = error.body?.message;

        }

    }

}