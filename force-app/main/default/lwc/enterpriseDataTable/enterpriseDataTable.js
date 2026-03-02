import { LightningElement, api, track } from 'lwc';
import getRecords from '@salesforce/apex/EOC_Controller.getRecords';
import updateRecords from '@salesforce/apex/EOC_Controller.updateRecords';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class EnterpriseDataTable extends LightningElement {

    @api objectApiName;
    @api fieldSetName;
    @api pageSize = 20;

    @track data = [];
    @track columns = [];
    @track isLoading = false;

    lastCreatedDate;
    lastRecordId;
    hasMore = true;
    sortBy = 'CreatedDate';
sortDirection = 'DESC';
draftValues = [];

    connectedCallback() {
        this.loadData();
    }

    @api
    refreshData(){
        this.resetState();
        this.loadData();
    }

    resetState(){
        this.data = [];
        this.lastCreatedDate = null;
        this.lastRecordId = null;
        this.hasMore = true;
    }

    loadData(){
        if(!this.hasMore || this.isLoading){
            return;
        }

        this.isLoading = true;

        getRecords({
    objectApiName: this.objectApiName,
    fieldSetName: this.fieldSetName,
    pageSize: this.pageSize,
    lastCreatedDate: this.lastCreatedDate,
    lastRecordId: this.lastRecordId,
    sortBy: this.sortBy,
    sortDirection: this.sortDirection
})
        .then(result => {

            if(result.columns && this.columns.length === 0){

    this.columns = result.columns.map(col => {
        return {
            label: col.label,
            fieldName: col.fieldName,
            type: col.type,
            sortable: true,
            editable: col.editable
        };
    });

}

            this.data = [...this.data, ...result.records];

            this.lastCreatedDate = result.lastCreatedDate;
            this.lastRecordId = result.lastRecordId;
            this.hasMore = result.hasMore;
        })
        .catch(error => {
            console.error('Error loading data', error);
        })
        .finally(() => {
            this.isLoading = false;
        });
    }

    handleLoadMore(event){
        event.target.isLoading = true;
        this.loadData();
        event.target.isLoading = false;
    }
    handleSort(event){
    this.sortBy = event.detail.fieldName;
    this.sortDirection = event.detail.sortDirection;

    this.resetState();
    this.loadData();
}
handleSave(event){

    const updatedFields = event.detail.draftValues;

    updateRecords({
        objectApiName: this.objectApiName,
        records: updatedFields
    })
    .then(() => {

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Records updated successfully',
                variant: 'success'
            })
        );

        this.draftValues = [];
        this.resetState();
        this.loadData();

    })
    .catch(error => {
        console.error(error);

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error updating records',
                message: error.body.message,
                variant: 'error'
            })
        );
    });
}
}