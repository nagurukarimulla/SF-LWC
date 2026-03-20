import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getCaseDetails from '@salesforce/apex/CaseController.getCaseDetails';
import escalateCases from '@salesforce/apex/CaseController.escalateCases';
import validateCases from '@salesforce/apex/CaseController.validateCases';

export default class Concept_fflibClassesUseCase3 extends LightningElement {
    @track caseIdsInput = '';
    @track cases = [];
    @track reason = '';
    @track isLoading = false;
    @track validationResult;
    
    // Getters
    get hasCases() {
        return this.cases && this.cases.length > 0;
    }
    
    get totalCases() {
        return this.cases.length;
    }
    
    get validCount() {
        return this.validationResult?.validCount || 0;
    }
    
    get invalidCount() {
        return this.validationResult?.invalidCount || 0;
    }
    
    get invalidCasesList() {
        return this.validationResult?.invalidCases?.join(', ') || '';
    }
    
    get canEscalate() {
        return this.validationResult?.canEscalate || false;
    }
    
    get isEscalateDisabled() {
        return !this.reason || 
               this.reason.trim() === '' || 
               this.isLoading ||
               !this.canEscalate ||
               !this.hasCases;
    }
    
    // Event Handlers
    handleCaseIdsChange(event) {
        this.caseIdsInput = event.target.value;
    }
    
    handleReasonChange(event) {
        this.reason = event.target.value;
    }
    
    // Load Cases from input
    loadCases() {
        if (!this.caseIdsInput || this.caseIdsInput.trim() === '') {
            this.showToast('Warning', 'Please enter Case IDs', 'warning');
            return;
        }
        
        // Parse comma-separated IDs
        const idArray = this.caseIdsInput.split(',')
            .map(id => id.trim())
            .filter(id => id.length > 0);
        
        if (idArray.length === 0) {
            this.showToast('Warning', 'No valid Case IDs entered', 'warning');
            return;
        }
        
        this.isLoading = true;
        
        // Load cases
        getCaseDetails({ caseIds: idArray })
            .then(result => {
                this.cases = result;
                if (result.length === 0) {
                    this.showToast('Info', 'No cases found with the provided IDs', 'info');
                }
                // Validate after loading
                return this.validateCases(idArray);
            })
            .catch(error => {
                this.showToast('Error', 'Failed to load cases: ' + error.body.message, 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }
    
    // Validate cases
    validateCases(caseIds) {
        return validateCases({ caseIds: caseIds })
            .then(result => {
                this.validationResult = result;
            })
            .catch(error => {
                console.error('Validation error:', error);
            });
    }
    
    // Escalate cases
    handleEscalate() {
        if (this.isEscalateDisabled) return;
        
        // Get valid case IDs
        const caseIds = this.cases.map(c => c.Id);
        
        this.isLoading = true;
        
        escalateCases({ 
            caseIds: caseIds, 
            reason: this.reason 
        })
        .then(() => {
            this.showToast('Success', caseIds.length + ' cases escalated successfully', 'success');
            this.handleClear();
        })
        .catch(error => {
            this.showToast('Error', error.body.message, 'error');
        })
        .finally(() => {
            this.isLoading = false;
        });
    }
    
    // Clear all
    handleClear() {
        this.caseIdsInput = '';
        this.cases = [];
        this.reason = '';
        this.validationResult = null;
    }
    
    // Toast helper
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        }));
    }
}