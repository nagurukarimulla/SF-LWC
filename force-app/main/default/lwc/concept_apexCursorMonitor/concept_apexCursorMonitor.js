import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'; // 1. Import Toast
import startCursorJob from '@salesforce/apex/CursorMonitorController.startJob';
import getJobStatus from '@salesforce/apex/CursorMonitorController.getJobStatus';

export default class ApexCursorMonitor extends LightningElement {
    @track status = 'Idle';
    @track totalRecords = 0;
    @track processed = 0;
    @track failed = 0;
    @track jobId = '';
    @track error;
    pollingInterval;

    get isJobRunning() { return this.status === 'Processing'; }
    get isCompleted() { return this.status === 'Completed'; }
    get isFailed() { return this.status === 'Failed'; }
    get showProgress() { return this.totalRecords > 0; }

    get progressPercentage() {
        return (this.totalRecords > 0) ? Math.round((this.processed / this.totalRecords) * 100) : 0;
    }

    get statusBadgeClass() {
        let baseClass = 'slds-badge ';
        if (this.status === 'Processing') baseClass += 'slds-theme_warning';
        else if (this.status === 'Completed') baseClass += 'slds-theme_success';
        else if (this.status === 'Failed') baseClass += 'slds-theme_error';
        return baseClass;
    }

    startJob() {
        this.status = 'Processing';
        this.error = null;
        this.processed = 0;
        this.failed = 0;
        
        startCursorJob()
            .then(result => {
                this.jobId = result.jobId;
                this.startPolling();
            })
            .catch(err => {
                this.error = err.body ? err.body.message : 'Unknown Error';
                this.status = 'Failed';
                this.showToast('Error', this.error, 'error'); // Show toast on start failure
            });
    }

    checkStatus() {
        getJobStatus({ jobId: this.jobId })
            .then(data => {
                this.status = data.status;
                this.processed = data.processed || 0;
                this.totalRecords = data.total || 0;
                this.failed = data.failed || 0;

                if (this.status === 'Completed') {
                    this.stopPolling();
                    this.showToast('Success', 'All contacts processed successfully!', 'success');
                } else if (this.status === 'Failed') {
                    this.stopPolling();
                    this.showToast('Job Failed', 'The migration encountered an error.', 'error');
                }
            })
            .catch(err => {
                console.error(err);
                this.status = 'Failed';
                this.stopPolling();
            });
    }

    // 2. Helper Method to fire the Toast
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant, // success, error, warning, or info
        });
        this.dispatchEvent(event);
    }

    handleReset() {
        this.status = 'Idle';
        this.totalRecords = 0;
        this.processed = 0;
        this.failed = 0;
        this.jobId = '';
        this.error = null;
        this.stopPolling();
    }

    startPolling() {
        this.stopPolling();
        this.pollingInterval = setInterval(() => this.checkStatus(), 2000);
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    disconnectedCallback() {
        this.stopPolling();
    }
}