import { LightningElement, track } from 'lwc';
import getExchangeRates from '@salesforce/apex/ExchangeRateController.getExchangeRates';
import { supportedCurrencies } from './supportedCurrencies';

export default class ExchangeRateConverter extends LightningElement {
    @track baseCurrency = 'USD';
    @track targetCurrency = '';
    @track amount = 1;
    @track isLoading = false;
    @track errorMessage;
    @track baseCode;
    @track timeLastUpdateUtc;
    @track timeNextUpdateUtc;
    @track conversionRates = [];
    @track filteredRates = [];
    @track searchTerm = '';
    
    // Import all supported currencies
    currencyOptions = supportedCurrencies;
    
    // Computed properties
    get isBaseCurrencySelected() {
        return this.baseCurrency && this.baseCurrency.length > 0;
    }
    
    handleBaseCurrencyChange(event) {
        this.baseCurrency = event.detail.value;
        this.clearResults();
    }
    
    handleGetRates() {
        if (!this.baseCurrency) {
            this.errorMessage = 'Please select a base currency';
            return;
        }
        
        this.isLoading = true;
        this.errorMessage = null;
        
        getExchangeRates({ baseCurrency: this.baseCurrency })
            .then(result => {
                if (result.result === 'success') {
                    this.baseCode = result.base_code;
                    this.timeLastUpdateUtc = result.time_last_update_utc;
                    this.timeNextUpdateUtc = result.time_next_update_utc;
                    
                    // Convert rates map to array for easier filtering
                    this.conversionRates = Object.keys(result.conversion_rates).map(code => ({
                        code: code,
                        rate: result.conversion_rates[code],
                        label: this.getCurrencyLabel(code)
                    }));
                    
                    // Sort by currency code
                    this.conversionRates.sort((a, b) => a.code.localeCompare(b.code));
                    
                    this.filteredRates = [...this.conversionRates];
                } else {
                    this.errorMessage = result.error_type + ': ' + result.error_message;
                    this.clearResults();
                }
                this.isLoading = false;
            })
            .catch(error => {
                this.errorMessage = 'Error fetching exchange rates: ' + error.body.message;
                this.clearResults();
                this.isLoading = false;
            });
    }
    
    handleSearch(event) {
        this.searchTerm = event.detail.value.toUpperCase();
        
        if (this.searchTerm) {
            this.filteredRates = this.conversionRates.filter(rate => 
                rate.code.includes(this.searchTerm) || 
                rate.label.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
        } else {
            this.filteredRates = [...this.conversionRates];
        }
    }
    
    handleClear() {
        this.clearResults();
    }
    
    clearResults() {
        this.baseCode = null;
        this.timeLastUpdateUtc = null;
        this.timeNextUpdateUtc = null;
        this.conversionRates = [];
        this.filteredRates = [];
        this.searchTerm = '';
        this.errorMessage = null;
    }
    
    getCurrencyLabel(currencyCode) {
        const currency = this.currencyOptions.find(option => option.value === currencyCode);
        return currency ? currency.label : currencyCode;
    }
    
    // Format rate for display
    formatRate(rate) {
        if (rate < 0.01) {
            return rate.toFixed(6);
        } else if (rate < 1) {
            return rate.toFixed(4);
        } else {
            return rate.toFixed(2);
        }
    }
}