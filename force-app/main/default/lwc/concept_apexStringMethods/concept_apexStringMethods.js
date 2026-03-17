import { LightningElement, track } from 'lwc';
import demonstrateStringMethods from '@salesforce/apex/StringMethodsController.demonstrateStringMethods';
import getPracticalExamples from '@salesforce/apex/StringMethodsController.getPracticalExamples';

export default class Concept_apexStringMethods extends LightningElement {
    @track inputText = '  Hello World from Salesforce  ';
    @track searchText = 'World';
    @track data;
    @track practicalExamples;
    @track error;
    @track isLoading = false;

    get showNoData() {
        return !this.data && !this.isLoading && !this.error;
    }

    get validationList() {
        if (!this.data?.validation) return [];
        
        return [
            { name: 'isAlpha', value: this.data.validation.isAlpha, variant: this.getVariant(this.data.validation.isAlpha) },
            { name: 'isAlphanumeric', value: this.data.validation.isAlphaNum, variant: this.getVariant(this.data.validation.isAlphaNum) },
            { name: 'isNumeric', value: this.data.validation.isNumeric, variant: this.getVariant(this.data.validation.isNumeric) },
            { name: 'isAllLowerCase', value: this.data.validation.isAllLowerCase, variant: this.getVariant(this.data.validation.isAllLowerCase) },
            { name: 'isAllUpperCase', value: this.data.validation.isAllUpperCase, variant: this.getVariant(this.data.validation.isAllUpperCase) },
            { name: 'isBlank', value: this.data.validation.isBlank, variant: this.getVariant(this.data.validation.isBlank) },
            { name: 'isEmpty', value: this.data.validation.isEmpty, variant: this.getVariant(this.data.validation.isEmpty) }
        ];
    }

    getVariant(value) {
        return value === true ? 'success' : 'error';
    }

    handleInputChange(event) {
        this.inputText = event.target.value;
    }

    handleSearchChange(event) {
        this.searchText = event.target.value;
    }

    async fetchData() {
        this.isLoading = true;
        this.error = null;
        
        try {
            // Fetch string methods data
            this.data = await demonstrateStringMethods({ 
                inputText: this.inputText, 
                searchText: this.searchText 
            });
            
            // Fetch practical examples
            this.practicalExamples = await getPracticalExamples();
            
        } catch (error) {
            this.error = error.body?.message || 'Error loading data';
            console.error('Error:', error);
        } finally {
            this.isLoading = false;
        }
    }

    resetData() {
        this.inputText = '  Hello World from Salesforce  ';
        this.searchText = 'World';
        this.data = null;
        this.practicalExamples = null;
        this.error = null;
    }
}