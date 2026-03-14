import { LightningElement, track } from 'lwc';
import getAccounts from '@salesforce/apex/ApexPaginationCursorController.getAccounts';

export default class Concept_apexPaginationCursor extends LightningElement {
    
    @track accounts = [];
    
    pageSize = 5;
    startIndex = 0;
    
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
        this.loadAccounts();
    }

    loadAccounts() {
        this.isLoading = true;
        
        console.log('Loading accounts with startIndex:', this.startIndex);
        
        getAccounts({
            startIndex: this.startIndex,
            pageSize: this.pageSize
        })
        .then(result => {
            console.log('Result received:', result);
            
            this.accounts = result.records;
            this.startIndex = result.nextIndex;
            this.done = result.done;
            this.totalRecords = result.totalRecords;
            this.currentPage = result.currentPage;
            this.totalPages = result.totalPages;
            
            console.log('Current Page:', this.currentPage);
            console.log('Total Pages:', this.totalPages);
            console.log('Done:', this.done);
            console.log('Next Index:', this.startIndex);
            console.log('Accounts length:', this.accounts.length);
        })
        .catch(error => {
            console.error('Error:', error);
        })
        .finally(() => {
            this.isLoading = false;
        });
    }

    handleNext() {
        console.log('Next clicked - Current Page:', this.currentPage, 'Total Pages:', this.totalPages);
        if (this.currentPage < this.totalPages) {
            // Use the nextIndex from the result
            this.loadAccounts();
        }
    }

    handlePrevious() {
        console.log('Previous clicked - Current Page:', this.currentPage);
        if (this.currentPage > 1) {
            // Calculate previous start index: (currentPage - 2) * pageSize
            this.startIndex = (this.currentPage - 2) * this.pageSize;
            console.log('New startIndex for previous:', this.startIndex);
            this.loadAccounts();
        }
    }
}