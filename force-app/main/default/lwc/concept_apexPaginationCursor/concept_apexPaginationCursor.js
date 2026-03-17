import { LightningElement, track } from 'lwc';
import getAccounts from '@salesforce/apex/ApexPaginationCursorController.getAccounts';

export default class Concept_apexPaginationCursor extends LightningElement {
    
    @track accounts = [];
    
    pageSize = 5;
    currentStartIndex = 0;
    
    totalRecords = 0;
    currentPage = 1;
    totalPages = 1;
    done = false;
    isLoading = false;
    
    columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Industry', fieldName: 'Industry' },
        { label: 'Phone', fieldName: 'Phone', type: 'phone' }
    ];

    get disablePrevious() {
        return this.currentPage <= 1;
    }

    get disableNext() {
        return this.currentPage >= this.totalPages;
    }

    connectedCallback() {
        this.loadAccounts(0);
    }

    loadAccounts(startIndex) {
        this.isLoading = true;
        
        console.log('Loading accounts with startIndex:', startIndex);
        console.log('Current page before load:', this.currentPage);
        
        getAccounts({
            startIndex: startIndex,
            pageSize: this.pageSize
        })
        .then(result => {
            console.log('Result received:', result);
            
            this.accounts = result.records;
            this.currentStartIndex = startIndex;
            this.done = result.done;
            this.totalRecords = result.totalRecords;
            this.currentPage = result.currentPage;
            this.totalPages = result.totalPages;
            
            console.log('Current Page after load:', this.currentPage);
            console.log('Total Pages:', this.totalPages);
            console.log('Done:', this.done);
            console.log('Current Start Index:', this.currentStartIndex);
            console.log('Accounts length:', this.accounts.length);
            
            // Debug last page check
            if (this.currentPage === this.totalPages) {
                console.log('ON LAST PAGE - Records on last page:', this.accounts.length);
                console.log('Expected records on last page:', this.totalRecords - ((this.totalPages - 1) * this.pageSize));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Optionally show a toast message to the user
            this.showToast('Error', 'Error loading records', 'error');
        })
        .finally(() => {
            this.isLoading = false;
        });
    }

    handleNext() {
        console.log('Next clicked - Current Page:', this.currentPage, 'Total Pages:', this.totalPages);
        
        if (this.currentPage < this.totalPages) {
            // Calculate next start index based on current page
            const nextStartIndex = this.currentPage * this.pageSize;
            console.log('Next startIndex:', nextStartIndex);
            this.loadAccounts(nextStartIndex);
        } else {
            console.log('Already on last page, next disabled');
        }
    }

    handlePrevious() {
        console.log('Previous clicked - Current Page:', this.currentPage);
        
        if (this.currentPage > 1) {
            // Calculate previous start index
            const prevStartIndex = (this.currentPage - 2) * this.pageSize;
            console.log('Previous startIndex:', prevStartIndex);
            this.loadAccounts(prevStartIndex);
        } else {
            console.log('Already on first page, previous disabled');
        }
    }

    showToast(title, message, variant) {
        // Optional: Add toast message functionality
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
    }
}