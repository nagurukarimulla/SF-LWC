import { LightningElement, wire, track } from 'lwc';
import { getListInfoByName } from 'lightning/uiListsApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// Object imports
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity';
import CASE_OBJECT from '@salesforce/schema/Case';
import LEAD_OBJECT from '@salesforce/schema/Lead';

export default class Concept_getListInfoByNameExplorer extends LightningElement {
    @track selectedObject = '';
    @track selectedListView = '';
    @track listViewData = null;
    @track error = null;
    @track isLoading = false;

    // Object options
    objectOptions = [
        { label: 'Account', value: 'Account' },
        { label: 'Contact', value: 'Contact' },
        { label: 'Opportunity', value: 'Opportunity' },
        { label: 'Case', value: 'Case' },
        { label: 'Lead', value: 'Lead' }
    ];

    // Common list views for each object
    listViewOptionsMap = {
        'Account': [
            { label: 'All Accounts', value: 'AllAccounts' },
            { label: 'My Accounts', value: 'MyAccounts' },
            { label: 'Recently Viewed Accounts', value: 'RecentlyViewedAccounts' },
            { label: 'New Last Week', value: 'NewLastWeek' },
            { label: 'New This Week', value: 'NewThisWeek' },
        ],
        'Contact': [
            { label: 'All Contacts', value: 'AllContacts' },
            { label: 'My Contacts', value: 'MyContacts' },
            { label: 'Recently Viewed Contacts', value: 'RecentlyViewedContacts' },
            { label: 'Birthdays This Month', value: 'BirthdaysThisMonth' }
        ],
        'Opportunity': [
            { label: 'All Opportunities', value: 'AllOpportunities' },
            { label: 'Closing Next Month', value: 'ClosingNextMonth' },
            { label: 'My Opportunities', value: 'MyOpportunities' },
            { label: 'Won', value: 'Won' }
        ],
        'Case': [
            { label: 'All Open Cases', value: 'AllOpenCases' },
            { label: 'My Cases', value: 'MyCases' },
            { label: 'Recently Viewed Cases', value: 'RecentlyViewedCases' },
            { label: 'My Open Cases', value: 'MyOpenCases' },
            { label: 'All Closed Cases', value: 'AllClosedCases' },
        ],
        'Lead': [
            { label: 'All Open Leads', value: 'AllOpenLeads' },
            { label: 'My Unread Leads', value: 'MyUnreadLeads' },
            { label: 'Recently Viewed Leads', value: 'RecentlyViewedLeads' }
        ]
    };

    // Object API mapping
    objectApiMap = {
        'Account': ACCOUNT_OBJECT,
        'Contact': CONTACT_OBJECT,
        'Opportunity': OPPORTUNITY_OBJECT,
        'Case': CASE_OBJECT,
        'Lead': LEAD_OBJECT
    };

    get listViewOptions() {
        return this.listViewOptionsMap[this.selectedObject] || [];
    }

    get formattedLastModified() {
        if (this.listViewData?.lastModifiedDate) {
            const date = new Date(this.listViewData.lastModifiedDate);
            return date.toLocaleString();
        }
        return 'N/A';
    }

    get formattedError() {
        if (this.error) {
            if (this.error.body?.message) {
                return this.error.body.message;
            } else if (this.error.message) {
                return this.error.message;
            } else if (typeof this.error === 'string') {
                return this.error;
            }
            return JSON.stringify(this.error);
        }
        return '';
    }

    handleObjectChange(event) {
        this.selectedObject = event.detail.value;
        this.selectedListView = '';
        this.listViewData = null;
        this.error = null;
    }

    handleListViewChange(event) {
        this.selectedListView = event.detail.value;
        this.listViewData = null;
        this.error = null;
        
        // Only fetch data if a valid list view is selected
        if (this.selectedListView) {
            this.isLoading = true;
            // Fire toast message when a list view is selected
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: `Selected list view: ${this.selectedListView}`,
                    variant: 'success'
                })
            );
        }
    }

    @wire(getListInfoByName, {
        objectApiName: '$selectedObject',
        listViewApiName: '$selectedListView'
    })
    wiredListView({ data, error }) {
        // Only process results if we actually have a list view to fetch and it's not empty
        if (this.selectedListView && this.selectedListView.trim() !== '') {
            this.isLoading = false;
            
            if (data) {
                this.listViewData = data;
                this.error = null;
                
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: `Loaded metadata for "${data.label}"`,
                        variant: 'success'
                    })
                );
            } else if (error) {
                // Only show error if we actually tried to fetch data (not on initial load)
                if (this.selectedListView) {
                    this.listViewData = null;
                    this.error = error;
                    
                    console.error('Error fetching list view:', error);
                    
                    let errorMessage = 'Failed to fetch list view metadata';
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
                }
            }
        }
    }
}
