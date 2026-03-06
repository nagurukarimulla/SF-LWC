import { LightningElement } from 'lwc';
import analyzePortfolio from '@salesforce/apex/InvestmentAnalyticsController.analyzePortfolio';

export default class Concept_passValuesToApex extends LightningElement {

    industry = '';
    minRevenue = 0;  // Initialize with default value

    accounts;
    error;

    handleIndustry(event) {
        this.industry = event.target.value;
    }

    handleRevenue(event) {
        this.minRevenue = event.target.value;
    }

    async handleAnalyze() {

        // Create the filters object directly (no nested object)
        let filters = {
            industry: this.industry,
            minRevenue: this.minRevenue
        };

        console.log('📤 Sending filters to Apex:', JSON.stringify(filters));

        try {
            this.accounts = await analyzePortfolio({ filters });  // Pass filters directly
            
            console.log('📥 Received accounts:', this.accounts);
            this.error = undefined;

            if (!this.accounts || this.accounts.length === 0) {
                console.log('No accounts found matching criteria');
            }

        } catch (error) {
            console.error('❌ Error:', error);
            this.accounts = undefined;
            this.error = error;
        }
    }

}