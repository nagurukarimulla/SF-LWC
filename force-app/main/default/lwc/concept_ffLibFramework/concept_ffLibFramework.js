import { LightningElement, track } from 'lwc';
import { showSuccess, showError, showWarning, showInfo } from 'c/toastUtility';
import createRecord from '@salesforce/apex/ObjectService.createRecord';
import getRecord from '@salesforce/apex/ObjectService.getRecord';
import updateRecord from '@salesforce/apex/ObjectService.updateRecord';
import deleteRecord from '@salesforce/apex/ObjectService.deleteRecord';
import searchRecords from '@salesforce/apex/ObjectService.searchRecords';
import queryRecords from '@salesforce/apex/ObjectService.queryRecords';

export default class Concept_ffLibFramework extends LightningElement {
    @track selectedObject = 'Account';
    @track record;
    @track searchTerm = '';
    @track searchResults = [];
    @track queryResults = [];
    @track isLoading = false;
    @track error;
    @track formData = {};
    @track showCreateForm = false;
    @track showUpdateForm = false;
    
    // Picklist options
    industryOptions = [
        { label: 'Technology', value: 'Technology' },
        { label: 'Healthcare', value: 'Healthcare' },
        { label: 'Finance', value: 'Finance' },
        { label: 'Manufacturing', value: 'Manufacturing' },
        { label: 'Retail', value: 'Retail' }
    ];

    stageOptions = [
        { label: 'Prospecting', value: 'Prospecting' },
        { label: 'Qualification', value: 'Qualification' },
        { label: 'Needs Analysis', value: 'Needs Analysis' },
        { label: 'Value Proposition', value: 'Value Proposition' },
        { label: 'Closed Won', value: 'Closed Won' },
        { label: 'Closed Lost', value: 'Closed Lost' }
    ];

    ratingOptions = [
        { label: 'Hot', value: 'Hot' },
        { label: 'Warm', value: 'Warm' },
        { label: 'Cold', value: 'Cold' }
    ];

    typeOptions = [
        { label: 'Prospect', value: 'Prospect' },
        { label: 'Customer', value: 'Customer' },
        { label: 'Partner', value: 'Partner' },
        { label: 'Reseller', value: 'Reseller' }
    ];

    objectOptions = [
        { label: 'Account', value: 'Account' },
        { label: 'Contact', value: 'Contact' },
        { label: 'Opportunity', value: 'Opportunity' }
    ];

    // Base field definitions without computed properties
    accountFields = [
        { name: 'Name', label: 'Account Name', required: true },
        { name: 'Phone', label: 'Phone', required: false },
        { name: 'Industry', label: 'Industry', required: false, isPicklist: true },
        { name: 'Type', label: 'Type', required: false, isPicklist: true },
        { name: 'Rating', label: 'Rating', required: false, isPicklist: true },
        { name: 'AnnualRevenue', label: 'Annual Revenue', required: false }
    ];

    contactFields = [
        { name: 'FirstName', label: 'First Name', required: true },
        { name: 'LastName', label: 'Last Name', required: true },
        { name: 'Email', label: 'Email', required: false },
        { name: 'Phone', label: 'Phone', required: false },
        { name: 'Title', label: 'Title', required: false },
        { name: 'Department', label: 'Department', required: false }
    ];

    opportunityFields = [
        { name: 'Name', label: 'Opportunity Name', required: true },
        { name: 'StageName', label: 'Stage', required: true, isPicklist: true },
        { name: 'Amount', label: 'Amount', required: false },
        { name: 'CloseDate', label: 'Close Date', required: true },
        { name: 'Type', label: 'Type', required: false, isPicklist: true },
        { name: 'Probability', label: 'Probability (%)', required: false }
    ];

    // Computed getters for template
    get currentFields() {
        let fields = [];
        
        if (this.selectedObject === 'Account') {
            fields = this.accountFields;
        } else if (this.selectedObject === 'Contact') {
            fields = this.contactFields;
        } else if (this.selectedObject === 'Opportunity') {
            fields = this.opportunityFields;
        }

        // Enhance fields with computed properties
        return fields.map(field => {
            const enhancedField = { ...field };
            
            // Add input type
            if (field.name === 'AnnualRevenue' || field.name === 'Amount') {
                enhancedField.inputType = 'number';
                enhancedField.step = '0.01';
            } else if (field.name === 'Probability') {
                enhancedField.inputType = 'number';
                enhancedField.step = '1';
            } else if (field.name === 'CloseDate') {
                enhancedField.inputType = 'date';
            } else if (field.name === 'Email') {
                enhancedField.inputType = 'email';
            } else if (field.name === 'Phone') {
                enhancedField.inputType = 'tel';
            } else {
                enhancedField.inputType = 'text';
            }

            // Add picklist options
            if (field.isPicklist) {
                if (field.name === 'Industry') {
                    enhancedField.picklistOptions = this.industryOptions;
                } else if (field.name === 'StageName') {
                    enhancedField.picklistOptions = this.stageOptions;
                } else if (field.name === 'Rating') {
                    enhancedField.picklistOptions = this.ratingOptions;
                } else if (field.name === 'Type') {
                    enhancedField.picklistOptions = this.typeOptions;
                }
            }

            return enhancedField;
        });
    }

    get showCreateButton() {
        return !this.showCreateForm && !this.showUpdateForm;
    }

    handleObjectChange(event) {
        this.selectedObject = event.detail.value;
        this.record = null;
        this.searchResults = [];
        this.queryResults = [];
        this.error = null;
        this.formData = {};
        this.showCreateForm = false;
        this.showUpdateForm = false;
    }

    handleSearchTermChange(event) {
    this.searchTerm = event.detail.value;
    // Auto-close search results when search term is cleared
    if (!this.searchTerm) {
        this.searchResults = [];
    }
}

    handleInputChange(event) {
        const field = event.target.dataset.field;
        let value = event.target.value;
        
        // Handle different input types
        if (event.target.type === 'number') {
            value = value ? parseFloat(value) : null;
        }
        
        this.formData = {
            ...this.formData,
            [field]: value
        };
    }

    handlePicklistChange(event) {
        const field = event.target.dataset.field;
        this.formData = {
            ...this.formData,
            [field]: event.detail.value
        };
    }

    showCreateFormHandler() {
    this.formData = {};
    this.showCreateForm = true;
    this.showUpdateForm = false;
    this.searchResults = []; // Clear search results when opening create form
    this.searchTerm = ''; // Optional: clear search term too
}
    showUpdateFormHandler() {
    if (!this.record?.Id) {
        showWarning(this, 'Warning', 'Please create or select a record first');
        return;
    }
    
    // Populate form with current record data - include ALL fields even if empty
    const newFormData = {};
    this.currentFields.forEach(field => {
        // Include the field even if it's empty (null/undefined) to show blank
        newFormData[field.name] = this.record[field.name] || '';
    });
    
    this.formData = newFormData;
    this.showUpdateForm = true;
    this.showCreateForm = false;
    this.searchResults = []; // Clear search results when opening update form
    this.searchTerm = ''; // Optional: clear search term too
    
    showInfo(this, 'Info', 'Form pre-filled with current record data. Modify and click Update.');
}

    cancelForm() {
        this.showCreateForm = false;
        this.showUpdateForm = false;
        this.formData = {};
    }

    validateForm() {
        const requiredFields = this.currentFields.filter(f => f.required);
        for (let field of requiredFields) {
            if (!this.formData[field.name]) {
                showWarning(this, 'Validation Error', `${field.label} is required`);
                return false;
            }
        }
        return true;
    }

    async handleCreate() {
        if (!this.validateForm()) {
            return;
        }

        this.isLoading = true;
        this.error = null;
        
        try {
            const fields = { ...this.formData };
            
            const id = await createRecord({ 
                objectName: this.selectedObject, 
                fields: fields 
            });
            
            this.record = await getRecord({ 
                objectName: this.selectedObject, 
                recordId: id 
            });
            
            this.showCreateForm = false;
            this.formData = {};
            showSuccess(this, 'Success', 'Record created successfully');
        } catch (error) {
            this.error = error.body ? error.body.message : error.message;
            showError(this, 'Error', this.error);
        } finally {
            this.isLoading = false;
        }
    }

    async handleRead() {
        if (!this.record?.Id) {
            showWarning(this, 'Warning', 'Please create or select a record first');
            return;
        }
        
        this.isLoading = true;
        this.error = null;
        try {
            this.record = await getRecord({ 
                objectName: this.selectedObject, 
                recordId: this.record.Id 
            });
            
            showSuccess(this, 'Success', 'Record refreshed successfully');
        } catch (error) {
            this.error = error.body ? error.body.message : error.message;
            showError(this, 'Error', this.error);
        } finally {
            this.isLoading = false;
        }
    }

    async handleUpdate() {
        if (!this.record?.Id) {
            showWarning(this, 'Warning', 'Please create or select a record first');
            return;
        }

        if (!this.validateForm()) {
            return;
        }
        
        this.isLoading = true;
        this.error = null;
        try {
            await updateRecord({ 
                objectName: this.selectedObject, 
                recordId: this.record.Id, 
                fields: this.formData 
            });
            
            this.record = await getRecord({ 
                objectName: this.selectedObject, 
                recordId: this.record.Id 
            });
            
            this.showUpdateForm = false;
            this.formData = {};
            showSuccess(this, 'Success', 'Record updated successfully');
        } catch (error) {
            this.error = error.body ? error.body.message : error.message;
            showError(this, 'Error', this.error);
        } finally {
            this.isLoading = false;
        }
    }

    async handleDelete() {
        if (!this.record?.Id) {
            showWarning(this, 'Warning', 'Please create or select a record first');
            return;
        }
        
        if (!confirm('Are you sure you want to delete this record?')) return;
        
        this.isLoading = true;
        this.error = null;
        try {
            await deleteRecord({ 
                objectName: this.selectedObject, 
                recordId: this.record.Id 
            });
            
            this.record = null;
            this.showUpdateForm = false;
            showSuccess(this, 'Success', 'Record deleted successfully');
        } catch (error) {
            this.error = error.body ? error.body.message : error.message;
            showError(this, 'Error', this.error);
        } finally {
            this.isLoading = false;
        }
    }

    async handleSearch() {
        if (!this.searchTerm) {
            showWarning(this, 'Warning', 'Please enter a search term');
            return;
        }
        
        this.isLoading = true;
        this.error = null;
        try {
            const fieldNames = this.currentFields.map(f => f.name);
            this.searchResults = await searchRecords({ 
                objectName: this.selectedObject,
                searchTerm: this.searchTerm,
                fields: fieldNames
            });
            
            if (this.searchResults.length === 0) {
                showInfo(this, 'Info', 'No records found');
            }
        } catch (error) {
            this.error = error.body ? error.body.message : error.message;
            showError(this, 'Error', this.error);
        } finally {
            this.isLoading = false;
        }
    }

    async handleQuery() {
        this.isLoading = true;
        this.error = null;
        try {
            let conditions = '';
            let orderBy = '';
            let limitCount = 10;
            
            if (this.selectedObject === 'Account') {
                conditions = 'CreatedDate = LAST_N_DAYS:30';
                orderBy = 'Name';
            } else if (this.selectedObject === 'Contact') {
                conditions = 'Email != null';
                orderBy = 'LastName';
            } else if (this.selectedObject === 'Opportunity') {
                conditions = 'IsClosed = false';
                orderBy = 'CloseDate ASC';
            }
            
            this.queryResults = await queryRecords({ 
                objectName: this.selectedObject,
                conditions: conditions,
                orderBy: orderBy,
                limitCount: limitCount
            });
            
            if (this.queryResults.length === 0) {
                showInfo(this, 'Info', 'No records found for query');
            }
        } catch (error) {
            this.error = error.body ? error.body.message : error.message;
            showError(this, 'Error', this.error);
        } finally {
            this.isLoading = false;
        }
    }

    selectSearchResult(event) {
        const recordId = event.currentTarget.dataset.id;
        this.handleReadWithId(recordId);
     // Option 1: Clear search after selection (uncomment if desired)
    this.searchTerm = '';
    this.queryResults = [];
    }

    clearSearch() {
    this.searchTerm = '';
    this.searchResults = [];
}
    selectQueryResult(event) {
        const recordId = event.currentTarget.dataset.id;
        this.handleReadWithId(recordId);
    }

    async handleReadWithId(recordId) {
        this.isLoading = true;
        this.error = null;
        try {
            this.record = await getRecord({ 
                objectName: this.selectedObject, 
                recordId: recordId 
            });
            this.showUpdateForm = false;
            this.showCreateForm = false;
        } catch (error) {
            this.error = error.body ? error.body.message : error.message;
            showError(this, 'Error', this.error);
        } finally {
            this.isLoading = false;
        }
    }
}