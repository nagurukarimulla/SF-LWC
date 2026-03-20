import { LightningElement, wire } from 'lwc';
import { getRecord, notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateCasePriority from '@salesforce/apex/CaseController.updateCasePriority';

// Import Case fields
import CASE_NUMBER_FIELD from '@salesforce/schema/Case.CaseNumber';
import SUBJECT_FIELD from '@salesforce/schema/Case.Subject';
import PRIORITY_FIELD from '@salesforce/schema/Case.Priority';
import STATUS_FIELD from '@salesforce/schema/Case.Status';

export default class Concept_notifyRecordUpdateAvailable extends LightningElement {
    selectedCaseId = null;
    selectedPriority = null;
    isUpdating = false;
    updateSuccess = false;
    errorMessage = null;

    priorityOptions = [
        { label: 'High', value: 'High' },
        { label: 'Medium', value: 'Medium' },
        { label: 'Low', value: 'Low' }
    ];

    // Wire the case record using LDS
    @wire(getRecord, { 
        recordId: '$selectedCaseId', 
        fields: [CASE_NUMBER_FIELD, SUBJECT_FIELD, PRIORITY_FIELD, STATUS_FIELD] 
    })
    caseDetails;

    handleCaseChange(event) {
        this.selectedCaseId = event.detail.recordId;
        this.selectedPriority = null;
        this.updateSuccess = false;
        this.errorMessage = null;
    }

    handlePriorityChange(event) {
        this.selectedPriority = event.detail.value;
        this.updateSuccess = false;
    }

    async handleUpdatePriority() {
        if (!this.selectedCaseId || !this.selectedPriority) {
            this.errorMessage = 'Please select both a case and a priority';
            return;
        }

        this.isUpdating = true;
        this.errorMessage = null;

        try {
            // 1. Update the record via Apex
            await updateCasePriority({
                caseId: this.selectedCaseId,
                newPriority: this.selectedPriority
            });

            // 2. Notify LDS that this record has changed
            await notifyRecordUpdateAvailable([{ recordId: this.selectedCaseId }]);

            // 3. Show success message
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: `Case priority updated to ${this.selectedPriority}`,
                    variant: 'success'
                })
            );

            this.updateSuccess = true;

        } catch (error) {
            console.error('Update error:', error);
            
            let errorMsg = 'Error updating case priority';
            if (error.body && error.body.message) {
                errorMsg = error.body.message;
            } else if (error.message) {
                errorMsg = error.message;
            }

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: errorMsg,
                    variant: 'error'
                })
            );

            this.errorMessage = errorMsg;

        } finally {
            this.isUpdating = false;
        }
    }
}