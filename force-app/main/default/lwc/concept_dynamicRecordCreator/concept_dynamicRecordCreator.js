  
import { LightningElement, track } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Concept_dynamicRecordCreator extends LightningElement {
    @track selectedObject;
    
    // Object field collections
    @track accountFields = {};
    @track contactFields = {};
    @track caseFields = {};
    @track opportunityFields = {};
    @track leadFields = {};
    
    validationError = '';

    // Object options
    objectOptions = [
        { label: 'Account', value: 'Account' },
        { label: 'Contact', value: 'Contact' },
        { label: 'Case', value: 'Case' },
        { label: 'Opportunity', value: 'Opportunity' },
        { label: 'Lead', value: 'Lead' }
    ];

    // Picklist options
    industryOptions = [
        { label: 'Agriculture', value: 'Agriculture' },
        { label: 'Banking', value: 'Banking' },
        { label: 'Chemicals', value: 'Chemicals' },
        { label: 'Consulting', value: 'Consulting' },
        { label: 'Education', value: 'Education' },
        { label: 'Energy', value: 'Energy' },
        { label: 'Finance', value: 'Finance' },
        { label: 'Healthcare', value: 'Healthcare' },
        { label: 'Insurance', value: 'Insurance' },
        { label: 'Manufacturing', value: 'Manufacturing' },
        { label: 'Real Estate', value: 'Real Estate' },
        { label: 'Technology', value: 'Technology' }
    ];

    accountTypeOptions = [
        { label: 'Prospect', value: 'Prospect' },
        { label: 'Customer - Direct', value: 'Customer - Direct' },
        { label: 'Customer - Channel', value: 'Customer - Channel' },
        { label: 'Partner', value: 'Partner' },
        { label: 'Competitor', value: 'Competitor' },
        { label: 'Other', value: 'Other' }
    ];

    leadSourceOptions = [
        { label: 'Web', value: 'Web' },
        { label: 'Phone Inquiry', value: 'Phone Inquiry' },
        { label: 'Partner Referral', value: 'Partner Referral' },
        { label: 'Purchased List', value: 'Purchased List' },
        { label: 'Other', value: 'Other' }
    ];

    statusOptions = [
        { label: 'New', value: 'New' },
        { label: 'Working', value: 'Working' },
        { label: 'Escalated', value: 'Escalated' },
        { label: 'Closed', value: 'Closed' }
    ];

    priorityOptions = [
        { label: 'High', value: 'High' },
        { label: 'Medium', value: 'Medium' },
        { label: 'Low', value: 'Low' }
    ];

    originOptions = [
        { label: 'Phone', value: 'Phone' },
        { label: 'Email', value: 'Email' },
        { label: 'Web', value: 'Web' },
        { label: 'Social Media', value: 'Social Media' }
    ];

    stageOptions = [
        { label: 'Prospecting', value: 'Prospecting' },
        { label: 'Qualification', value: 'Qualification' },
        { label: 'Needs Analysis', value: 'Needs Analysis' },
        { label: 'Value Proposition', value: 'Value Proposition' },
        { label: 'Id. Decision Makers', value: 'Id. Decision Makers' },
        { label: 'Perception Analysis', value: 'Perception Analysis' },
        { label: 'Proposal/Price Quote', value: 'Proposal/Price Quote' },
        { label: 'Negotiation/Review', value: 'Negotiation/Review' },
        { label: 'Closed Won', value: 'Closed Won' },
        { label: 'Closed Lost', value: 'Closed Lost' }
    ];

    opportunityTypeOptions = [
        { label: 'New Business', value: 'New Business' },
        { label: 'Existing Business', value: 'Existing Business' },
        { label: 'Upgrade', value: 'Upgrade' }
    ];

    leadStatusOptions = [
        { label: 'Open', value: 'Open' },
        { label: 'Contacted', value: 'Contacted' },
        { label: 'Qualified', value: 'Qualified' },
        { label: 'Unqualified', value: 'Unqualified' }
    ];

    // Object type getters
    get isAccount() { return this.selectedObject === 'Account'; }
    get isContact() { return this.selectedObject === 'Contact'; }
    get isCase() { return this.selectedObject === 'Case'; }
    get isOpportunity() { return this.selectedObject === 'Opportunity'; }
    get isLead() { return this.selectedObject === 'Lead'; }

    handleObjectChange(event) {
        this.selectedObject = event.detail.value;
        this.clearFields();
        this.validationError = '';
    }

    // Field change handlers
    handleAccountFieldChange(event) {
        const field = event.target.dataset.field;
        this.accountFields[field] = event.detail.value;
    }

    handleContactFieldChange(event) {
        const field = event.target.dataset.field;
        this.contactFields[field] = event.detail.value;
    }

    handleCaseFieldChange(event) {
        const field = event.target.dataset.field;
        this.caseFields[field] = event.detail.value;
    }

    handleOpportunityFieldChange(event) {
        const field = event.target.dataset.field;
        this.opportunityFields[field] = event.detail.value;
    }

    handleLeadFieldChange(event) {
        const field = event.target.dataset.field;
        this.leadFields[field] = event.detail.value;
    }

    clearFields() {
        this.accountFields = {};
        this.contactFields = {};
        this.caseFields = {};
        this.opportunityFields = {};
        this.leadFields = {};
    }

    validateForm() {
        this.validationError = '';
        
        if (!this.selectedObject) {
            this.validationError = 'Please select an object type.';
            return false;
        }

        switch(this.selectedObject) {
            case 'Account':
                if (!this.accountFields.Name) {
                    this.validationError = 'Account Name is required.';
                    return false;
                }
                break;
            case 'Contact':
                if (!this.contactFields.LastName) {
                    this.validationError = 'Last Name is required.';
                    return false;
                }
                break;
            case 'Case':
                if (!this.caseFields.Subject) {
                    this.validationError = 'Subject is required.';
                    return false;
                }
                break;
            case 'Opportunity':
                if (!this.opportunityFields.Name) {
                    this.validationError = 'Opportunity Name is required.';
                    return false;
                }
                if (!this.opportunityFields.AccountId) {
                    this.validationError = 'Account ID is required.';
                    return false;
                }
                if (!this.opportunityFields.StageName) {
                    this.validationError = 'Stage is required.';
                    return false;
                }
                if (!this.opportunityFields.CloseDate) {
                    this.validationError = 'Close Date is required.';
                    return false;
                }
                break;
            case 'Lead':
                if (!this.leadFields.LastName) {
                    this.validationError = 'Last Name is required.';
                    return false;
                }
                if (!this.leadFields.Company) {
                    this.validationError = 'Company is required.';
                    return false;
                }
                break;
            default:
                this.validationError = 'Invalid object selected.';
                return false;
        }
        
        return true;
    }

    async handleCreateRecord() {
        if (!this.validateForm()) {
            return;
        }

        let fields = {};
        
        switch(this.selectedObject) {
            case 'Account':
                fields = { ...this.accountFields };
                break;
            case 'Contact':
                fields = { ...this.contactFields };
                break;
            case 'Case':
                fields = { ...this.caseFields };
                break;
            case 'Opportunity':
                fields = { ...this.opportunityFields };
                break;
            case 'Lead':
                fields = { ...this.leadFields };
                break;
        }

        // Remove empty fields to avoid API errors
        Object.keys(fields).forEach(key => {
            if (fields[key] === undefined || fields[key] === null || fields[key] === '') {
                delete fields[key];
            }
        });

        const recordInput = {
            apiName: this.selectedObject,
            fields: fields
        };

        try {
            const record = await createRecord(recordInput);
            
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: `${this.selectedObject} created successfully with ID: ${record.id}`,
                    variant: 'success'
                })
            );
            
            // Clear fields after successful creation
            this.clearFields();
            this.selectedObject = null;
            this.validationError = '';
            
        } catch (error) {
            let errorMessage = 'Unknown error occurred';
            
            if (error.body) {
                if (error.body.message) {
                    errorMessage = error.body.message;
                } else if (error.body.pageErrors && error.body.pageErrors.length > 0) {
                    errorMessage = error.body.pageErrors[0].message;
                } else if (error.body.fieldErrors) {
                    const fieldErrors = error.body.fieldErrors;
                    const firstField = Object.keys(fieldErrors)[0];
                    if (firstField && fieldErrors[firstField].length > 0) {
                        errorMessage = `${firstField}: ${fieldErrors[firstField][0].message}`;
                    }
                }
            }

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating record',
                    message: errorMessage,
                    variant: 'error'
                })
            );
        }
    }
}