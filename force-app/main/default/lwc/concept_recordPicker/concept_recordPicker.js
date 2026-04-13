import { LightningElement, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import NAME_FIELD from '@salesforce/schema/User.Name';
import ID_FIELD from '@salesforce/schema/Case.Id';
import OWNER_ID_FIELD from '@salesforce/schema/Case.OwnerId';
import CASE_NUMBER_FIELD from '@salesforce/schema/Case.CaseNumber';
import SUBJECT_FIELD from '@salesforce/schema/Case.Subject';

export default class Concept_RecordPicker extends LightningElement {
    selectedCaseId = null;
    selectedCaseNumber = null;
    selectedCaseSubject = null;
    selectedAgentId = null;
    selectedAgentName = null;
    assignmentComplete = false;
    lastAssignedCaseNumber = null;
    lastAssignedAgentName = null;
    errorMessage = null;
    isAssigning = false;
    showCasePicker = true;

    openCasesFilter = {
        criteria: [
            {
                fieldPath: 'IsClosed',
                operator: 'eq',
                value: false
            }
        ]
    };

    activeAgentsFilter = {
        criteria: [
            {
                fieldPath: 'IsActive',
                operator: 'eq',
                value: true
            }
        ]
    };

    caseDisplayInfo = {
        primaryField: 'CaseNumber',
        additionalFields: ['Subject']
    };

    agentDisplayInfo = {
        primaryField: 'Name',
        additionalFields: ['Email']
    };

    agentMatchingInfo = {
        primaryField: { fieldPath: 'Name', mode: 'contains' },
        additionalFields: [{ fieldPath: 'Email', mode: 'contains' }]
    };

    @wire(getRecord, { recordId: '$selectedCaseId', fields: [CASE_NUMBER_FIELD, SUBJECT_FIELD] })
    wiredCase({ error, data }) {
        if (data) {
            this.selectedCaseNumber = data.fields.CaseNumber.value;
            this.selectedCaseSubject = data.fields.Subject.value;
        } else if (error) {
            this.selectedCaseNumber = null;
            this.selectedCaseSubject = null;
        }
    }

    @wire(getRecord, { recordId: '$selectedAgentId', fields: [NAME_FIELD] })
    wiredAgent({ error, data }) {
        if (data) {
            this.selectedAgentName = data.fields.Name.value;
        } else if (error) {
            this.selectedAgentName = null;
        }
    }

    get showAssignSection() {
        return this.selectedCaseId && this.selectedAgentId && !this.isAssigning;
    }

    get isAssignButtonDisabled() {
        return this.isAssigning || !this.selectedCaseId || !this.selectedAgentId;
    }

    get selectedCaseLabel() {
        if (!this.selectedCaseNumber) {
            return '';
        }

        return this.selectedCaseSubject
            ? `Case ${this.selectedCaseNumber} - ${this.selectedCaseSubject}`
            : `Case ${this.selectedCaseNumber}`;
    }

    handleCaseChange(event) {
        const recordId = event.detail.recordId;

        if (!recordId) {
            this.clearSelections();
            return;
        }

        this.selectedCaseId = recordId;
        this.selectedCaseNumber = null;
        this.selectedCaseSubject = null;
        this.selectedAgentId = null;
        this.selectedAgentName = null;
        this.assignmentComplete = false;
        this.errorMessage = null;

        const displayText = event.target?.displayValue || event.target?.value?.label || '';
        if (displayText) {
            const parts = displayText.split(' - ');
            this.selectedCaseNumber = parts[0] || this.selectedCaseNumber;
            this.selectedCaseSubject = parts.length > 1 ? parts.slice(1).join(' - ') : this.selectedCaseSubject;
        }
    }

    handleAgentChange(event) {
        const recordId = event.detail.recordId;

        if (!recordId) {
            this.selectedAgentId = null;
            this.selectedAgentName = null;
            this.assignmentComplete = false;
            return;
        }

        this.selectedAgentId = recordId;
        this.selectedAgentName = null;
        this.assignmentComplete = false;
    }

    handleError(event) {
        this.errorMessage = event.detail?.error?.message || 'Unknown picker error';
    }

    async handleAssignment() {
        this.isAssigning = true;
        this.errorMessage = null;

        try {
            const fields = {};
            fields[ID_FIELD.fieldApiName] = this.selectedCaseId;
            fields[OWNER_ID_FIELD.fieldApiName] = this.selectedAgentId;

            await updateRecord({ fields });

            this.lastAssignedCaseNumber = this.selectedCaseNumber;
            this.lastAssignedAgentName = this.selectedAgentName;
            this.assignmentComplete = true;

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: `Case ${this.lastAssignedCaseNumber} assigned to ${this.lastAssignedAgentName}`,
                    variant: 'success'
                })
            );

            this.clearSelections(true);

            // Force the picker to remount so the case input is fully reset.
            this.showCasePicker = false;
            window.requestAnimationFrame(() => {
                this.showCasePicker = true;
            });
        } catch (error) {
            let errorMessage = 'Error assigning case';
            if (error.body?.message) {
                errorMessage = error.body.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: errorMessage,
                    variant: 'error'
                })
            );

            this.errorMessage = errorMessage;
        } finally {
            this.isAssigning = false;
        }
    }

    clearSelections(keepCompletion = false) {
        this.selectedCaseId = null;
        this.selectedCaseNumber = null;
        this.selectedCaseSubject = null;
        this.selectedAgentId = null;
        this.selectedAgentName = null;
        this.errorMessage = null;

        if (!keepCompletion) {
            this.assignmentComplete = false;
            this.lastAssignedCaseNumber = null;
            this.lastAssignedAgentName = null;
        }
    }
}