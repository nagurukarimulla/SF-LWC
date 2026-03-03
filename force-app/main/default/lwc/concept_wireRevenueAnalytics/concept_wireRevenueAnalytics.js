import { LightningElement, wire, track } from 'lwc';
import getRevenueSummary from '@salesforce/apex/RevenueAnalyticsController.getRevenueSummary';
import { refreshApex } from '@salesforce/apex';

export default class Concept_wireRevenueAnalytics extends LightningElement {

    accountId;
    minAmount = 0;

    wiredResult;
    summary;
    error;

    handleAccountChange(event) {
        this.accountId = event.target.value;
    }

    handleAmountChange(event) {
        this.minAmount = event.target.value;
    }

    @wire(getRevenueSummary, {
        accountId: '$accountId',
        minAmount: '$minAmount'
    })
    wiredRevenue(result) {

        this.wiredResult = result;

        const { data, error } = result;

        if (data) {
            this.summary = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.summary = undefined;
        }
    }

    handleRefresh() {
        refreshApex(this.wiredResult);
    }

    get formattedRevenue() {
        return this.summary?.totalRevenue?.toLocaleString();
    }
}