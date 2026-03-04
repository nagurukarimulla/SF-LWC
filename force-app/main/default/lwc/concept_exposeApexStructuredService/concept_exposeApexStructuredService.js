import { LightningElement, track } from 'lwc';
import classifyAccounts from '@salesforce/apex/AccountClassificationService.classifyAccounts';

export default class Concept_exposeApexStructuredService extends LightningElement {

    industry;
    revenueThreshold = 0;
    selectedRatings = [];

    response;
    error;
    isLoading = false;

    ratingOptions = [
        { label: 'Hot', value: 'Hot' },
        { label: 'Warm', value: 'Warm' },
        { label: 'Cold', value: 'Cold' }
    ];

    handleIndustryChange(event) {
        this.industry = event.target.value;
    }

    handleRevenueChange(event) {
        this.revenueThreshold = parseFloat(event.target.value) || 0;
    }

    handleRatingChange(event) {
        this.selectedRatings = event.detail.value;
    }

    async handleClassify() {

        this.isLoading = true;
        this.response = undefined;
        this.error = undefined;

        try {
            const result = await classifyAccounts({
                industry: this.industry,
                revenueThreshold: this.revenueThreshold,
                ratingFilters: this.selectedRatings
            });

            this.response = result;

        } catch (err) {
            this.error = err;
        } finally {
            this.isLoading = false;
        }
    }
}