import { LightningElement, track } from 'lwc';
import getDomainInfo from '@salesforce/apex/DomainController.getDomainInfo';
import parseDomain from '@salesforce/apex/DomainController.parseDomain';

export default class Concept_domainClassApex extends LightningElement {
    @track domainData;
    @track customDomainData;
    @track customDomain = '';
    @track error;
    @track isLoading = false;
    
    placeholderDomain = 'Enter your org domain...';

    connectedCallback() {
        this.loadDomainInfo();
    }

    async loadDomainInfo() {
        this.isLoading = true;
        try {
            const result = await getDomainInfo();
            this.domainData = {
                ...result,
                currentDomain: window.location.hostname
            };
            this.placeholderDomain = `${result.myDomainName}.lightning.force.com`;
            this.error = undefined;
        } catch (error) {
            this.error = this.getErrorMessage(error);
            this.domainData = undefined;
        } finally {
            this.isLoading = false;
        }
    }

    get validTestDomains() {
        if (!this.domainData) return [];
        const myDomain = this.domainData.myDomainName;
        return [
            { label: 'Lightning Domain', value: `${myDomain}.lightning.force.com` },
            { label: 'Classic Domain', value: `${myDomain}.my.salesforce.com` },
            { label: 'Current Domain', value: window.location.hostname },
            { label: 'My Domain Only', value: myDomain }
        ];
    }

    get validTestButtons() {
        if (!this.domainData) return [];
        const myDomain = this.domainData.myDomainName;
        return [
            { label: 'Lightning', value: `${myDomain}.lightning.force.com` },
            { label: 'Classic', value: `${myDomain}.my.salesforce.com` },
            { label: 'Current', value: window.location.hostname },
            { label: 'My Domain', value: myDomain }  // Keep this but we'll handle it specially
        ];
    }

    get showNoResults() {
        return !this.customDomainData && !this.error && !this.isLoading;
    }

    handleQuickTest(event) {
        const clickedValue = event.currentTarget.value || event.target.value;
        
        // Special handling for "My Domain Only" option
        if (clickedValue === this.domainData?.myDomainName && !clickedValue.includes('.')) {
            // Try both Lightning and Classic formats
            this.testBothDomainFormats(clickedValue);
        } else {
            this.customDomain = clickedValue;
            this.parseCustomDomain();
        }
    }

    async testBothDomainFormats(myDomain) {
        this.isLoading = true;
        this.error = undefined;
        
        // Try Lightning format first
        const lightningDomain = `${myDomain}.lightning.force.com`;
        
        try {
            const result = await parseDomain({ domainUrl: lightningDomain });
            this.customDomainData = {
                ...result,
                note: 'Using Lightning format'
            };
            this.customDomain = lightningDomain;
            this.error = undefined;
        } catch (lightningError) {
            // If Lightning fails, try Classic format
            const classicDomain = `${myDomain}.my.salesforce.com`;
            
            try {
                const result = await parseDomain({ domainUrl: classicDomain });
                this.customDomainData = {
                    ...result,
                    note: 'Using Classic format'
                };
                this.customDomain = classicDomain;
                this.error = undefined;
            } catch (classicError) {
                this.customDomainData = undefined;
                this.error = `Could not parse domain. Try using: ${myDomain}.lightning.force.com or ${myDomain}.my.salesforce.com`;
            }
        } finally {
            this.isLoading = false;
        }
    }

    handleDomainInput(event) {
        this.customDomain = event.target.value;
    }

    async parseCustomDomain() {
        if (!this.customDomain) {
            this.error = 'Please enter a domain to parse';
            return;
        }

        this.isLoading = true;
        this.error = undefined;
        
        try {
            const result = await parseDomain({ domainUrl: this.customDomain });
            this.customDomainData = result;
            this.error = undefined;
        } catch (error) {
            this.customDomainData = undefined;
            this.error = this.getErrorMessage(error);
            
            // If it's a mydomain-only error, suggest full formats
            if (this.customDomain === this.domainData?.myDomainName) {
                this.error = `${this.error} Try using: ${this.domainData.myDomainName}.lightning.force.com or ${this.domainData.myDomainName}.my.salesforce.com`;
            }
        } finally {
            this.isLoading = false;
        }
    }

    clearResults() {
        this.customDomain = '';
        this.customDomainData = undefined;
        this.error = undefined;
        
        // Clear input field
        const inputField = this.template.querySelector('lightning-input');
        if (inputField) {
            inputField.value = '';
        }
    }

    getErrorMessage(error) {
        if (error.body && error.body.message) {
            // Check for specific error messages
            if (error.body.message.includes('Hostname must belong to this org')) {
                return 'This domain belongs to a different org. Only domains from this org can be parsed.';
            }
            if (error.body.message.includes('java.net.URISyntaxException')) {
                return 'Invalid domain format. Please enter a complete domain (e.g., mydomain.lightning.force.com)';
            }
            return error.body.message;
        }
        return error.message || 'An unknown error occurred';
    }
}