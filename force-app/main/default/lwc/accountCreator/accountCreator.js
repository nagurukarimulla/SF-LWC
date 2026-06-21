import { LightningElement, track } from 'lwc';
import startQueueableJob from '@salesforce/apex/AccountCreatorController.startQueueableJob';
import getJobStatus from '@salesforce/apex/AccountCreatorController.getJobStatus';

export default class AccountCreator extends LightningElement {
    @track isProcessing = false;
    @track logs = [];
   jobId = null;
    pollingInterval = null;

    // Start the queueable job
    async startJob() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        this.addLog('🚀 Starting queueable job...', 'info');
        
        try {
            const result = await startQueueableJob();
            this.jobId = result.jobId;
            this.addLog(`✅ Job enqueued with ID: ${this.jobId}`, 'success');
            this.addLog(`📊 You can track this job in Setup → Apex Jobs`, 'info');
            this.addLog(`🔍 Open Developer Console → Debug Logs to see detailed execution`, 'info');
            
            // Start polling for job status
            this.startPolling();
            
        } catch (error) {
            this.addLog(`❌ Error starting job: ${error.body.message}`, 'error');
            this.isProcessing = false;
        }
    }

    // Poll for job completion
    startPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
        
        this.pollingInterval = setInterval(async () => {
            if (!this.jobId) return;
            
            try {
                const status = await getJobStatus({ jobId: this.jobId });
                
                if (status.isComplete) {
                    clearInterval(this.pollingInterval);
                    this.pollingInterval = null;
                    
                    if (status.success) {
                        this.addLog(`🎉 Job completed successfully!`, 'success');
                        this.addLog(`📝 Check Developer Console for finalizer logs`, 'info');
                    } else {
                        this.addLog(`⚠️ Job failed with exception: ${status.errorMessage}`, 'error');
                        this.addLog(`🔄 Finalizer should handle retry automatically`, 'warning');
                    }
                    
                    this.isProcessing = false;
                    this.jobId = null;
                } else {
                    // Update status periodically
                    if (Math.random() < 0.3) { // Only show every few polls to avoid spam
                        this.addLog(`⏳ Job still processing... (Status: ${status.status})`, 'info');
                    }
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 2000); // Poll every 2 seconds
    }

    // Add log message
    addLog(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        this.logs = [
            {
                id: Date.now() + Math.random(),
                timestamp: timestamp,
                message: message,
                type: type
            },
            ...this.logs
        ].slice(0, 50); // Keep last 50 logs
    }

    // Clear logs
    clearLogs() {
        this.logs = [];
        this.addLog('Logs cleared', 'info');
    }

    // Cleanup polling on component destroy
    disconnectedCallback() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
    }
}