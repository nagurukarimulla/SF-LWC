import { LightningElement } from 'lwc';
import evaluateRisk from '@salesforce/apex/OpportunityRiskController.evaluateRisk';

export default class Concept_imperativeRiskEvaluator extends LightningElement {

    stageName = '';
    minAmount;
    summary;
    error;
    isLoading = false;

    handleStageChange(event) {
        this.stageName = event.target.value;
    }

    handleAmountChange(event) {
        this.minAmount = event.target.value;
    }

    get errorMessage() {
        return this.error?.body?.message || 'Unexpected error occurred';
    }

    async handleEvaluate() {
        this.isLoading = true;
        this.summary = undefined;
        this.error = undefined;

        try {
            const result = await evaluateRisk({
                stageName: this.stageName,
                minAmount: this.minAmount
            });

            this.summary = result;

        } catch (err) {
            this.error = err;
        } finally {
            this.isLoading = false;
        }
    }
}