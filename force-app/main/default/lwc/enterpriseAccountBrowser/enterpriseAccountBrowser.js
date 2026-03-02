import { LightningElement, track } from 'lwc';
import getAccounts from '@salesforce/apex/EnterpriseAccountPaginationController.getAccounts';

export default class EnterpriseAccountBrowser extends LightningElement {

    @track accounts = [];
    nextIndex = 0;
    pageSize = 10;
    isDone = false;
    isFirst = true;
    previousStack = [];

    columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Industry', fieldName: 'Industry' },
        { label: 'Rating', fieldName: 'Rating' }
    ];

    connectedCallback() {
        this.loadPage(0);
    }

    loadPage(startIndex) {
        getAccounts({ startIndex: startIndex, pageSize: this.pageSize })
            .then(result => {
                this.accounts = result.records;
                // Only set isDone true if records.length < pageSize
                this.isDone = result.records.length < this.pageSize;
                // Only push if not first load
                if (this.previousStack.length === 0 || this.previousStack[this.previousStack.length - 1] !== startIndex) {
                    this.previousStack.push(startIndex);
                }
                this.nextIndex = result.nextIndex;
                this.isFirst = this.previousStack.length <= 1;
                // Debug logs
                console.log('Loaded page:', startIndex);
                console.log('Records:', result.records.length);
                console.log('isDone:', this.isDone);
                console.log('nextIndex:', this.nextIndex);
                console.log('previousStack:', this.previousStack);
                console.log('isFirst:', this.isFirst);
            })
            .catch(error => {
                console.error(error);
            });
    }

    handleNext() {
        this.loadPage(this.nextIndex);
    }

    handlePrevious() {
            // Remove current page index
            this.previousStack.pop();
            // Get previous page index
            let prevIndex = this.previousStack.length > 0 ? this.previousStack[this.previousStack.length - 1] : 0;
            this.loadPage(prevIndex);
    }
}