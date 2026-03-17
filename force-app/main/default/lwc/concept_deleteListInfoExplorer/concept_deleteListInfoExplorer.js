import { LightningElement, track } from 'lwc';
import { deleteListInfo } from 'lightning/uiListsApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// Object imports
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity';
import CASE_OBJECT from '@salesforce/schema/Case';
import LEAD_OBJECT from '@salesforce/schema/Lead';

export default class Concept_deleteListInfoExplorer extends LightningElement {
    @track selectedObject = '';
    @track listViewApiName = '';
    @track showConfirmation = false;
    @track deleted = false;
    @track deletedListViewName = '';
    @track deletedObjectName = '';
    @track errorMessage = '';

    // Object options
    objectOptions = [
        { label: 'Account', value: 'Account' },
        { label: 'Contact', value: 'Contact' },
        { label: 'Opportunity', value: 'Opportunity' },
        { label: 'Case', value: 'Case' },
        { label: 'Lead', value: 'Lead' }
    ];

    // Object API mapping
    objectApiMap = {
        'Account': ACCOUNT_OBJECT,
        'Contact': CONTACT_OBJECT,
        'Opportunity': OPPORTUNITY_OBJECT,
        'Case': CASE_OBJECT,
        'Lead': LEAD_OBJECT
    };

    // Common list views for reference (for user guidance)
    commonListViews = {
        'Account': ['AllAccounts', 'MyAccounts', 'RecentlyViewedAccounts'],
        'Contact': ['AllContacts', 'MyContacts', 'RecentlyViewedContacts'],
        'Opportunity': ['AllOpportunities', 'ClosingNextMonth', 'MyOpportunities'],
        'Case': ['AllCases', 'MyCases', 'RecentlyViewedCases'],
        'Lead': ['AllLeads', 'MyLeads', 'RecentlyViewedLeads', 'UnreadLeads']
    };

    get isFormValid() {
        return this.selectedObject && this.listViewApiName && this.listViewApiName.trim() !== '';
    }

    get commonListViewsForObject() {
        return this.commonListViews[this.selectedObject] || [];
    }

    handleObjectChange(event) {
        this.selectedObject = event.detail.value;
        this.listViewApiName = '';
        this.deleted = false;
        this.errorMessage = '';
    }

    handleNameChange(event) {
        this.listViewApiName = event.target.value;
        this.deleted = false;
        this.errorMessage = '';
    }

    handleDelete() {
        if (!this.isFormValid) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Validation Error',
                    message: 'Please select an object and enter a list view API name',
                    variant: 'warning'
                })
            );
            return;
        }

        // Show confirmation modal
        this.showConfirmation = true;
    }

    cancelDelete() {
        this.showConfirmation = false;
    }

    async confirmDelete() {
        this.showConfirmation = false;
        
        try {
            // Validate API name format
            if (!this.isValidApiName(this.listViewApiName)) {
                throw new Error('Invalid list view API name. Use only letters, numbers, and underscores.');
            }

            // Get the object API name
            const objectApiName = this.selectedObject;
            
            console.log(`Attempting to delete list view: ${this.listViewApiName} from ${objectApiName}`);

            // Call deleteListInfo
            await deleteListInfo({
                objectApiName: objectApiName,
                listViewApiName: this.listViewApiName.trim()
            });

            // Success handling
            this.deleted = true;
            this.deletedListViewName = this.listViewApiName;
            this.deletedObjectName = this.selectedObject;
            this.errorMessage = '';

            // Show success toast
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: `List view "${this.listViewApiName}" deleted successfully`,
                    variant: 'success'
                })
            );

            // Clear the input after successful deletion
            this.listViewApiName = '';

        } catch (error) {
            console.error('Error deleting list view:', error);
            
            // Parse error message
            let errorMessage = this.parseErrorMessage(error);
            
            this.errorMessage = errorMessage;
            this.deleted = false;

            // Show error toast
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: errorMessage,
                    variant: 'error'
                })
            );
        }
    }

    isValidApiName(apiName) {
        // API Name can only contain letters, numbers, and underscores
        const regex = /^[a-zA-Z0-9_]+$/;
        return regex.test(apiName);
    }

    parseErrorMessage(error) {
        if (error?.body?.message) {
            return error.body.message;
        } else if (error?.body?.output?.errors?.length > 0) {
            return error.body.output.errors[0].message;
        } else if (error?.body?.fieldErrors) {
            const fieldErrors = Object.values(error.body.fieldErrors);
            if (fieldErrors.length > 0 && fieldErrors[0].length > 0) {
                return fieldErrors[0][0].message;
            }
        } else if (error?.message) {
            return error.message;
        }
        return 'An unknown error occurred while deleting the list view';
    }

    // Helper method to get object API name
    getObjectApiName(objectLabel) {
        const objectMap = {
            'Account': 'Account',
            'Contact': 'Contact',
            'Opportunity': 'Opportunity',
            'Case': 'Case',
            'Lead': 'Lead'
        };
        return objectMap[objectLabel] || objectLabel;
    }
}