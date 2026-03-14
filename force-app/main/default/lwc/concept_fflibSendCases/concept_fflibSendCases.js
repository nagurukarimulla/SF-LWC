import { LightningElement, wire, track } from 'lwc';
import fetchCases from '@salesforce/apex/CaseController.fetchCases';
import sendCasesToSecondaryOrg from '@salesforce/apex/CaseController.sendCasesToSecondaryOrg';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Concept_fflibSendCases extends LightningElement {
    @track cases = [];
    @track selectedCaseIds = [];
    @track isLoading = false;

    // Define columns for datatable - fixed to match the data structure
    columns = [
        { label: 'Case Number', fieldName: 'CaseNumber', type: 'text' },
        { label: 'Subject', fieldName: 'Subject', type: 'text' },
        { label: 'Status', fieldName: 'Status', type: 'text' },
        { label: 'Account Name', fieldName: 'AccountName', type: 'text' },
        { label: 'Contact Name', fieldName: 'ContactFullName', type: 'text' }, // Changed to ContactFullName
        { label: 'Contact Email', fieldName: 'ContactEmail', type: 'email' }
    ];

    // Wire Apex to fetch cases
    @wire(fetchCases, { caseIds: [] })
    wiredCases({ error, data }) {
        if (data) {
            // Flatten related fields for datatable
            this.cases = data.map(c => ({
                Id: c.Id,
                CaseNumber: c.CaseNumber,
                Subject: c.Subject,
                Status: c.Status,
                AccountName: c.Account ? c.Account.Name : '',
                // Fix: Combine first and last name for display
                ContactFullName: c.Contact ? 
                    (c.Contact.FirstName ? c.Contact.FirstName + ' ' : '') + 
                    (c.Contact.LastName || '') : '',
                ContactEmail: c.Contact ? c.Contact.Email : ''
            }));
        } else if (error) {
            console.error('Error fetching cases:', error);
            this.showToast('Error', error.body?.message || 'Unknown error', 'error');
        }
    }

    handleRowSelection(event) {
        if (event.detail && event.detail.selectedRows) {
            this.selectedCaseIds = event.detail.selectedRows.map(row => row.Id);
        }
    }

    async handleSend() {
        // Validate selection
        if (!this.selectedCaseIds || this.selectedCaseIds.length === 0) {
            this.showToast('Warning', 'Please select cases to send', 'warning');
            return;
        }

        this.isLoading = true;
        try {
            await sendCasesToSecondaryOrg({ caseIds: this.selectedCaseIds });
            this.showToast('Success', 'Cases sent successfully!', 'success');
            
            // Optionally clear selection after successful send
            this.selectedCaseIds = [];
            
            // If you want to refresh the datatable selection
            const datatable = this.template.querySelector('lightning-datatable');
            if (datatable) {
                datatable.selectedRows = [];
            }
            
        } catch (error) {
            console.error('Send error:', error);
            const errorMessage = error.body?.message || error.message || 'Failed to send cases';
            this.showToast('Error', errorMessage, 'error');
        } finally {
            this.isLoading = false;
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ 
            title, 
            message, 
            variant,
            mode: 'dismissable'
        }));
    }
}