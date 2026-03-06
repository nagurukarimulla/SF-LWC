import { LightningElement } from 'lwc';

import findDeals from '@salesforce/apex/OpportunitySearchController.findDeals';

export default class Concept_apexImperativeWithParams extends LightningElement {

    stageName = '';
    minAmount;

    deals;
    error;

    handleStage(event) {
        this.stageName = event.target.value;
    }

    handleAmount(event) {
        this.minAmount = event.target.value;
    }

    async handleSearch() {

        try {

            this.deals = await findDeals({

                stageName: this.stageName,
                minAmount: this.minAmount

            });

            this.error = undefined;

        }
        catch (error) {

            this.error = error;
            this.deals = undefined;

        }

    }

}