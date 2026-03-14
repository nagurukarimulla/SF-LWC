import { LightningElement, track } from 'lwc';
import startCursorJob from '@salesforce/apex/CursorMonitorController.startJob';
import getJobStatus from '@salesforce/apex/CursorMonitorController.getJobStatus';

export default class Concept_apexCursorMonitor extends LightningElement {
    
   @track status = 'Idle';
    @track totalRecords = 0;
    @track processed = 0;
    @track failed = 0;
    @track jobId = '';
    @track error;
    
    // Computed property for button state
    get isJobRunning() {
        return this.status === 'Processing...' || this.status === 'Job Started';
    }
    
    // FIXED: Computed property for progress percentage
    get progressPercentage() {
        if(this.totalRecords === 0) return 0;
        return Math.round((this.processed / this.totalRecords) * 100);
    }
    
    // Fixed test version
    startJob() {
        this.status = 'Processing...';
        this.totalRecords = 10000;
        this.jobId = 'TEST-' + Date.now();
        this.processed = 0;  // Reset
        this.failed = 0;      // Reset
        
        // Simulate progress
        let count = 0;
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        const interval = setInterval(() => {
            count += 500;
            this.processed = Math.min(count, this.totalRecords); // Don't exceed total
            this.failed = Math.floor(count / 10000); // Simulate 1% failure
            
            if(count >= this.totalRecords) {
                this.status = 'Completed';
                clearInterval(interval);
            }
        }, 100);
    }

    

    checkStatus() {
        // Poll every 5 seconds
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        window.setInterval(() => {
            if(this.jobId && this.status !== 'Completed' && this.status !== 'Failed') {
                getJobStatus({ jobId: this.jobId })
                    .then(data => {
                        this.processed = data.processed || 0;
                        this.failed = data.failed || 0;
                        
                        if(data.status === 'Completed') {
                            this.status = 'Completed';
                        } else if(data.status === 'Failed') {
                            this.status = 'Failed';
                        }
                    })
                    .catch(error => {
                        console.error('Status check failed', error);
                    });
            }
        }, 5000);
    }
}
/*
// Temporary test version of startJob
startJob() {
    this.status = 'Processing...';
    this.totalRecords = 1000000;
    this.jobId = 'TEST-' + Date.now();
    
    // Simulate progress
    let count = 0;
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    const interval = setInterval(() => {
        count += 500;
        this.processed = count;
        this.failed = Math.floor(count / 10000); // Simulate 1% failure
        
        if(count >= this.totalRecords) {
            this.status = 'Completed';
            clearInterval(interval);
        }
    }, 100);
}*/

/*startJob() {
        this.status = 'Processing...';
        this.error = null;
        
        startCursorJob()
            .then(result => {
                this.totalRecords = result.total;
                this.jobId = result.jobId;
                this.status = 'Job Started';
                this.checkStatus();
            })
            .catch(error => {
                this.error = error.body.message;
                this.status = 'Failed';
            });
    }*/