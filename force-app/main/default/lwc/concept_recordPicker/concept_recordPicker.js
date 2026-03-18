import { LightningElement, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import NAME_FIELD from '@salesforce/schema/User.Name';
import ID_FIELD from '@salesforce/schema/Case.Id';
import OWNER_ID_FIELD from '@salesforce/schema/Case.OwnerId';

export default class Concept_RecordPicker extends LightningElement {
    selectedCaseId = null;
    selectedCaseNumber = null;
    selectedCaseSubject = null;
    selectedAgentId = null;
    selectedAgentName = null;
    assignmentComplete = false;
    errorMessage = null;
    isAssigning = false;

    // Filter for open cases only
    openCasesFilter = {
        criteria: [
            {
                fieldPath: "IsClosed",
                operator: "eq",
                value: false
            }
        ]
    };

    // Filter for active support agents
    activeAgentsFilter = {
        criteria: [
            {
                fieldPath: "IsActive",
                operator: "eq",
                value: true
            }
        ]
    };

    // Display info for cases
    caseDisplayInfo = {
        primaryField: "CaseNumber",
        additionalFields: ["Subject"]
    };

    // Display info for agents
    agentDisplayInfo = {
        primaryField: "Name",
        additionalFields: ["Email"]
    };

    // Search agents by name or email
    agentMatchingInfo = {
        primaryField: { fieldPath: "Name", mode: "contains" },
        additionalFields: [{ fieldPath: "Email", mode: "contains" }]
    };

    // Wire adapter to get agent name when ID changes
    @wire(getRecord, { recordId: '$selectedAgentId', fields: [NAME_FIELD] })
    wiredAgent({ error, data }) {
        if (data) {
            this.selectedAgentName = data.fields.Name.value;
            console.log('Agent name from wire:', this.selectedAgentName);
        } else if (error) {
            console.error('Error fetching agent:', error);
            const agentPicker = this.template.querySelector('[data-id="agent-picker"]');
            if (agentPicker && agentPicker.displayValue) {
                this.selectedAgentName = agentPicker.displayValue;
            }
        }
    }

    get showAssignSection() {
        return this.selectedCaseId && this.selectedAgentId && !this.isAssigning;
    }

    get isAssignButtonDisabled() {
        return this.isAssigning || !this.selectedCaseId || !this.selectedAgentId;
    }

    handleCaseChange(event) {
        console.log('Case selected:', event.detail.recordId);
        this.selectedCaseId = event.detail.recordId;
        
        // Get case number from the picker's display value
        const casePicker = event.target;
        
        if (casePicker) {
            // Try displayValue first
            if (casePicker.displayValue) {
                const displayText = casePicker.displayValue;
                const parts = displayText.split(' - ');
                this.selectedCaseNumber = parts[0] || displayText;
                this.selectedCaseSubject = parts[1] || '';
            }
            // Try value.label next
            else if (casePicker.value && casePicker.value.label) {
                const displayText = casePicker.value.label;
                const parts = displayText.split(' - ');
                this.selectedCaseNumber = parts[0] || displayText;
                this.selectedCaseSubject = parts[1] || '';
            }
            // Last resort - use part of ID
            else {
                this.selectedCaseNumber = this.selectedCaseId.substring(0, 8);
            }
        }
        
        console.log('Extracted case number:', this.selectedCaseNumber);
        this.assignmentComplete = false;
    }

    handleAgentChange(event) {
        console.log('Agent selected:', event.detail.recordId);
        this.selectedAgentId = event.detail.recordId;
        this.selectedAgentName = null;
        this.assignmentComplete = false;
    }

    handleError(event) {
        this.errorMessage = event.detail.error.message;
        console.error('Picker error:', event.detail);
    }

    async handleAssignment() {
        this.isAssigning = true;
        this.errorMessage = null;

        try {
            // Create the recordInput object for update
            const fields = {};
            fields[ID_FIELD.fieldApiName] = this.selectedCaseId;
            fields[OWNER_ID_FIELD.fieldApiName] = this.selectedAgentId;

            const recordInput = { fields };

            // Update the case with new owner
            await updateRecord(recordInput);

            // Show success message
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: `Case #${this.selectedCaseNumber} assigned to ${this.selectedAgentName}`,
                    variant: 'success'
                })
            );

            // Show success in component
            this.assignmentComplete = true;
            
            // Reset after 3 seconds
            setTimeout(() => {
                this.selectedCaseId = null;
                this.selectedCaseNumber = null;
                this.selectedCaseSubject = null;
                this.selectedAgentId = null;
                this.selectedAgentName = null;
                this.assignmentComplete = false;
                this.errorMessage = null;
                this.isAssigning = false;
            }, 3000);

        } catch (error) {
            console.error('Assignment error:', error);
            
            let errorMessage = 'Error assigning case';
            if (error.body && error.body.message) {
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
            this.isAssigning = false;
        }
    }
}