import { LightningElement, wire } from 'lwc';

import getTopDeals from
    '@salesforce/apex/SalesDashboardController.getTopDeals';

import { refreshApex } from '@salesforce/apex';

export default class Concept_apexClientCaching extends LightningElement {

    deals;
    error;

    wiredDealsResult;

    @wire(getTopDeals)
    wiredDeals(result) {

        this.wiredDealsResult = result;

        if (result.data) {
            this.deals = result.data;
            this.error = undefined;
        }
        else if (result.error) {
            this.error = result.error;
            this.deals = undefined;
        }

    }

    handleRefresh() {

        refreshApex(this.wiredDealsResult);

    }

}