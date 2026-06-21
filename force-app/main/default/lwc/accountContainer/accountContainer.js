import { LightningElement, api, wire,track } from 'lwc';
import getOrgData from '@salesforce/apex/OrgDataController.getOrgData';

export default class AccountContainer extends LightningElement {

    @track orgName;
    @track orgId;
    @track instanceUrl;
    @track totalAccounts;
    @track recentAccounts;
    @track totalOpportunities;
    @track recentOpportunities;

    @wire(getOrgData)
    wiredOrgData({ error, data }) {
        if (data) {
            // Org Header Data
            this.orgName = data.orgName || 'Unknown';
            this.orgId = data.orgId || 'N/A';
            this.instanceUrl = data.instanceUrl || 'N/A';
            
            // Middle Section Data (Accounts)
            this.totalAccounts = data.totalAccounts || 0;
            this.recentAccounts = data.recentAccounts || [];
            
            // Footer Section Data (Opportunities)
            this.totalOpportunities = data.totalOpportunities || 0;
            this.recentOpportunities = data.recentOpportunities || [];
            
        } else if (error) {
            console.error('Error fetching org data:', error);
            this.handleError(error);
        }
    }

    handleError(error) {
        // Set default values or error messages
        this.orgName = 'Error loading data';
        this.totalAccounts = 0;
        this.totalOpportunities = 0;
        this.recentAccounts = [];
        this.recentOpportunities = [];
    }
}