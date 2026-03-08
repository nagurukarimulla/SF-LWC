import { LightningElement, api, wire } from 'lwc';

import getRecentInteractions
    from '@salesforce/apex/CustomerInteractionController.getRecentInteractions';

import logInteraction
    from '@salesforce/apex/CustomerInteractionController.logInteraction';

import { refreshApex } from '@salesforce/apex';

export default class Concept_refreshWiredFunction extends LightningElement {

    @api recordId;

    interactions;
    error;
    errorMessage;

    wiredInteractions;

    @wire(getRecentInteractions, { accountId: '$recordId' })
    wiredGetInteractions(value) {

        this.wiredInteractions = value;

        const { data, error } = value;

        if (data) {

            this.interactions = data;
            this.error = undefined;

        }
        else if (error) {

            this.error = error;
            this.interactions = undefined;
            this.errorMessage = error.body?.message;

        }

    }

    async handleLogInteraction() {

        try {

            await logInteraction({ accountId: this.recordId });

            await refreshApex(this.wiredInteractions);

        }
        catch (error) {

            this.errorMessage = error.body?.message;

        }

    }

}