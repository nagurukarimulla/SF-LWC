import { LightningElement, track, wire } from 'lwc';
import getCases from '@salesforce/apex/CaseController.getCases';
import updateCaseRecord from '@salesforce/apex/CaseController.updateCaseRecord';
import { refreshApex } from '@salesforce/apex';
import { subscribe, unsubscribe, onError } from 'lightning/empApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class Concept_caseCDC extends LightningElement {

    @track cases = [];
    @track error;
    @track isLoading = false;
    @track changedFields = [];
    @track draftValues = [];
    
    wiredCasesResult;
    subscription = {};
    channelName = '/data/CaseChangeEvent';
    
    columns = [
        { label: 'Case Number', fieldName: 'CaseNumber', type: 'text', editable: false, initialWidth: 120 },
        { label: 'Subject', fieldName: 'Subject', type: 'text', editable: true, initialWidth: 250 },
        { label: 'Status', fieldName: 'Status', type: 'text', editable: true, initialWidth: 120 },
        { label: 'Priority', fieldName: 'Priority', type: 'text', editable: true, initialWidth: 100 }
    ];
    
    // Lifecycle hooks
    connectedCallback() {
        this.subscribeToCDC();
    }
    
    disconnectedCallback() {
        if (this.subscription) {
            unsubscribe(this.subscription, () => {});
        }
    }
    
    @wire(getCases)
    wiredCases(result) {
        this.wiredCasesResult = result;
        this.isLoading = false; // Always set loading to false when wire completes
        
        if (result.data) {
            this.cases = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.cases = [];
            this.showToastMessage('Failed to load cases: ' + (result.error.body?.message || 'Unknown error'), 'error');
        }
    }
    
    // CDC Subscription
    subscribeToCDC() {
        // Register error listener
        onError(error => {
            console.error('EMP API Error:', error);
            this.showToastMessage('CDC connection error: ' + error.message, 'error');
        });

        const messageCallback = (response) => {
            console.log('CDC Event Received:', JSON.stringify(response, null, 2));
            this.handleCDCEvent(response);
        };
        
        subscribe(this.channelName, -1, messageCallback)
            .then(response => {
                this.subscription = response;
                console.log('Successfully subscribed to CDC channel:', this.channelName);
                this.showToastMessage('CDC monitoring active', 'success');
            })
            .catch(error => {
                console.error('CDC Subscription failed:', error);
                this.showToastMessage('CDC subscription failed: ' + (error.message || JSON.stringify(error)), 'error');
            });
    }
    
    handleCDCEvent(event) {
        try {
            console.log('Processing CDC event:', event);
            
            if (!event || !event.data || !event.data.payload) {
                console.warn('Invalid CDC event structure:', event);
                return;
            }
            
            const header = event.data.payload.ChangeEventHeader;
            if (!header || !header.recordIds || header.recordIds.length === 0) {
                console.warn('Invalid CDC header or no record IDs:', header);
                return;
            }
            
            const recordId = header.recordIds[0];
            const changedFieldsList = header.changedFields || [];
            
            console.log('CDC Event Details:', {
                recordId,
                changedFields: changedFieldsList,
                eventType: header.changeType,
                changeOrigin: header.changeOrigin
            });
            
            // Show what changed
            this.changedFields = changedFieldsList;
            this.showToastMessage(
                `Case ${recordId} changed: ${changedFieldsList.join(', ')} updated`,
                'info'
            );
            
            // Refresh data to reflect changes
            refreshApex(this.wiredCasesResult)
                .then(() => {
                    console.log('Data refreshed after CDC event');
                })
                .catch(error => {
                    console.error('Error refreshing data after CDC:', error);
                });
            
            // Keep changed fields visible until new changes arrive
            // No timeout - changes stay visible permanently
            
        } catch (error) {
            console.error('Error handling CDC event:', error);
            this.showToastMessage('Error processing CDC event: ' + error.message, 'error');
        }
    }
    
    // Handle draft value changes (when user edits cells)
    handleCellChange(event) {
        this.draftValues = event.detail.draftValues;
    }
    
    // Handle inline editing save
    handleSave(event) {
        const draftValues = event.detail.draftValues;
        
        if (!draftValues || draftValues.length === 0) {
            return;
        }
        
        const updatedRecord = draftValues[0];
        const recordId = updatedRecord.Id;
        const originalCase = this.cases.find(c => c.Id === recordId);
        
        if (!originalCase) {
            this.showToastMessage('Record not found', 'error');
            return;
        }
        
        // Prepare updates
        const subject = updatedRecord.Subject !== undefined ? updatedRecord.Subject : originalCase.Subject;
        const status = updatedRecord.Status !== undefined ? updatedRecord.Status : originalCase.Status;
        const priority = updatedRecord.Priority !== undefined ? updatedRecord.Priority : originalCase.Priority;
        
        // Show loading state
        this.isLoading = true;
        
        // Call imperative Apex
        updateCaseRecord({
            caseId: recordId,
            subject: subject,
            status: status,
            priority: priority
        })
        .then(result => {
            console.log('Update successful:', result);
            this.showToastMessage('Case updated successfully!', 'success');
            this.draftValues = []; // Clear draft values
            refreshApex(this.wiredCasesResult); // Refresh data immediately
        })
        .catch(error => {
            console.error('Update error:', error);
            this.showToastMessage('Update failed: ' + (error.body?.message || 'Unknown error'), 'error');
            this.draftValues = []; // Clear draft values on error
            refreshApex(this.wiredCasesResult); // Refresh to revert changes
        })
        .finally(() => {
            this.isLoading = false;
        });
    }
    
    // Toast notification helper
    showToastMessage(message, variant) {
        const event = new ShowToastEvent({
            title: variant === 'error' ? 'Error' : variant === 'success' ? 'Success' : 'Info',
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
    
    // Test CDC by manually refreshing (for debugging)
    testCDCRefresh() {
        console.log('Testing CDC refresh...');
        refreshApex(this.wiredCasesResult)
            .then(() => {
                console.log('Manual refresh completed');
                this.showToastMessage('Data refreshed manually', 'info');
            })
            .catch(error => {
                console.error('Manual refresh failed:', error);
                this.showToastMessage('Manual refresh failed', 'error');
            });
    }
    
    // Getters
    get showChangedFields() {
        return this.changedFields && this.changedFields.length > 0;
    }
}