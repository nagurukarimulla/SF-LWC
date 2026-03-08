import { LightningElement, wire } from 'lwc';

import getHighPriorityCases
    from '@salesforce/apex/CaseEscalationController.getHighPriorityCases';

import escalateCases
    from '@salesforce/apex/CaseEscalationController.escalateCases';

import { refreshApex } from '@salesforce/apex';

export default class Concept_refreshWiredProperty extends LightningElement {

    cases;
    error;
    errorMessage;

    wiredCasesResult;

    @wire(getHighPriorityCases)
    wiredCases(result) {

        this.wiredCasesResult = result;

        const { data, error } = result;

        if (data) {

            this.cases = data;
            this.error = undefined;

        }

        else if (error) {

            this.error = error;
            this.cases = undefined;
            this.errorMessage = error.body?.message;

        }

    }

    async handleEscalate() {

        try {

            await escalateCases();

            await refreshApex(this.wiredCasesResult);

        }
        catch (error) {

            this.errorMessage = error.body?.message;

        }

    }

}