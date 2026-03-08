import { LightningElement, track, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

// Apex imports
import getAccountMetrics from '@salesforce/apex/NavigationController.getAccountMetrics';
import getContactMetrics from '@salesforce/apex/NavigationController.getContactMetrics';
import getOpportunityMetrics from '@salesforce/apex/NavigationController.getOpportunityMetrics';
import getCaseMetrics from '@salesforce/apex/NavigationController.getCaseMetrics';
import getTaskMetrics from '@salesforce/apex/NavigationController.getTaskMetrics';
import getRecentItems from '@salesforce/apex/NavigationController.getRecentItems';
import searchRecords from '@salesforce/apex/NavigationController.searchRecords';

export default class Concept_enterpriseNavigation extends LightningElement {
    @track selectedItem = 'dashboard';
    @track searchTerm = '';
    @track showSearchResults = false;
    @track isLoading = false;
    @track lastSyncTime = new Date().toLocaleTimeString();
    @track connectionStatus = {
        icon: 'utility:connected_apps',
        message: 'Connected'
    };

    // Data stores
    @track accountData = [];
    @track contactData = [];
    @track opportunityData = [];
    @track caseData = [];
    @track taskData = [];
    @track reportData = {};
    @track recentItems = [];
    @track searchResults = [];

    // Counts for badges
    @track accountCount = 0;
    @track contactCount = 0;
    @track openCaseCount = 0;
    @track taskCount = 0;
    @track totalOpportunityValue = 0;

    // Breadcrumbs with dynamic data
    breadcrumbs = [
        { label: 'Home', name: 'home', active: false, activeClass: '' },
        { label: 'Enterprise Navigation', name: 'navigation', active: true, activeClass: 'slds-breadcrumb_active' }
    ];

    // Wire adapters for real-time data
    @wire(getAccountMetrics)
    wiredAccounts({ error, data }) {
        if (data) {
            this.accountCount = data.totalCount;
            this.accountData = data.records;
            this.updateSyncTime();
        } else if (error) {
            this.handleError(error);
        }
    }

    @wire(getContactMetrics)
    wiredContacts({ error, data }) {
        if (data) {
            this.contactCount = data.totalCount;
            this.contactData = data.records;
        } else if (error) {
            this.handleError(error);
        }
    }

    @wire(getOpportunityMetrics)
    wiredOpportunities({ error, data }) {
        if (data) {
            this.opportunityData = data.records;
            this.totalOpportunityValue = data.totalValue || 0;
        } else if (error) {
            this.handleError(error);
        }
    }

    @wire(getCaseMetrics)
    wiredCases({ error, data }) {
        if (data) {
            this.openCaseCount = data.openCount || 0;
            this.caseData = data.records;
        } else if (error) {
            this.handleError(error);
        }
    }

    @wire(getTaskMetrics)
    wiredTasks({ error, data }) {
        if (data) {
            this.taskCount = data.pendingCount || 0;
            this.taskData = data.records;
        } else if (error) {
            this.handleError(error);
        }
    }

    @wire(getRecentItems)
    wiredRecentItems({ error, data }) {
        if (data) {
            this.recentItems = data;
        } else if (error) {
            this.handleError(error);
        }
    }

    // Computed getters for active section
    get isDashboard() { return this.selectedItem === 'dashboard'; }
    get isAccounts() { return this.selectedItem === 'accounts'; }
    get isContacts() { return this.selectedItem === 'contacts'; }
    get isOpportunities() { return this.selectedItem === 'opportunities'; }
    get isCases() { return this.selectedItem === 'cases'; }
    get isTasks() { return this.selectedItem === 'tasks'; }
    get isReports() { return this.selectedItem === 'reports'; }
    get isRecent() { return this.selectedItem === 'recent'; }

    // Badge classes based on priority
    get caseBadgeClass() {
        return this.openCaseCount > 5 ? 'slds-theme_warning' : 
               this.openCaseCount > 10 ? 'slds-theme_error' : '';
    }

    get taskBadgeClass() {
        return this.taskCount > 3 ? 'slds-theme_warning' : 
               this.taskCount > 7 ? 'slds-theme_error' : '';
    }

    // Current content based on selection
    get currentContent() {
        const contentMap = {
            dashboard: {
                title: 'Dashboard',
                description: 'Real-time overview of your business metrics',
                canRefresh: true,
                canCreate: false
            },
            accounts: {
                title: `Accounts (${this.accountCount})`,
                description: 'Manage customer accounts and relationships',
                canRefresh: true,
                canCreate: true
            },
            contacts: {
                title: `Contacts (${this.contactCount})`,
                description: 'View and manage your contacts',
                canRefresh: true,
                canCreate: true
            },
            opportunities: {
                title: `Opportunities ($${this.formatNumber(this.totalOpportunityValue)})`,
                description: 'Track sales opportunities and pipeline',
                canRefresh: true,
                canCreate: true
            },
            cases: {
                title: `Open Cases (${this.openCaseCount})`,
                description: 'Manage customer support cases',
                canRefresh: true,
                canCreate: true
            },
            tasks: {
                title: `My Tasks (${this.taskCount})`,
                description: 'Track and manage your tasks',
                canRefresh: true,
                canCreate: true
            },
            reports: {
                title: 'Analytics & Reports',
                description: 'View performance metrics and insights',
                canRefresh: true,
                canCreate: true
            },
            recent: {
                title: 'Recently Viewed',
                description: 'Quick access to your recently viewed records',
                canRefresh: true,
                canCreate: false
            }
        };
        return contentMap[this.selectedItem];
    }
// Add these getters at the end of your component class, before the utility methods

// Data check getters for templates
get noSearchResults() {
    return this.searchResults && this.searchResults.length === 0 && this.searchTerm.length >= 3;
}

get noAccountData() {
    return this.accountData && this.accountData.length === 0;
}

get noContactData() {
    return this.contactData && this.contactData.length === 0;
}

get noOpportunityData() {
    return this.opportunityData && this.opportunityData.length === 0;
}

get noCaseData() {
    return this.caseData && this.caseData.length === 0;
}

get noTaskData() {
    return this.taskData && this.taskData.length === 0;
}

get noRecentData() {
    return this.recentItems && this.recentItems.length === 0;
}
    // Navigation handlers
    handleNavigation(event) {
        this.selectedItem = event.detail.name;
        this.updateBreadcrumbs();
        this.loadSectionData();
    }

    handleBreadcrumb(event) {
        const label = event.target.label;
        if (label === 'Home') {
            this.selectedItem = 'dashboard';
            this.updateBreadcrumbs();
        }
    }

    // Search functionality
    handleSearch(event) {
        this.searchTerm = event.target.value;
        if (this.searchTerm.length >= 3) {
            this.performSearch();
        } else {
            this.showSearchResults = false;
        }
    }

    handleSearchKeyUp(event) {
        if (event.key === 'Escape') {
            this.showSearchResults = false;
        }
    }

    async performSearch() {
        this.isLoading = true;
        try {
            const results = await searchRecords({ searchTerm: this.searchTerm });
            this.searchResults = results.map(result => ({
                ...result,
                icon: this.getObjectIcon(result.objectApiName)
            }));
            this.showSearchResults = true;
        } catch (error) {
            this.handleError(error);
        } finally {
            this.isLoading = false;
        }
    }

    handleResultSelect(event) {
        const recordId = event.currentTarget.dataset.id;
        const objectApiName = event.currentTarget.dataset.object;
        this.showSearchResults = false;
        this.searchTerm = '';
        
        // Navigate to the record
        this.navigateToRecord(recordId, objectApiName);
    }

    // Data loading
    loadSectionData() {
        this.isLoading = true;
        // Simulate data loading
        setTimeout(() => {
            this.isLoading = false;
        }, 500);
    }

    // Actions
    handleRefresh() {
        this.isLoading = true;
        this.updateSyncTime();
        
        // Refresh all wired data
        refreshApex(this.wiredAccounts);
        refreshApex(this.wiredContacts);
        refreshApex(this.wiredOpportunities);
        refreshApex(this.wiredCases);
        refreshApex(this.wiredTasks);
        refreshApex(this.wiredRecentItems);
        
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'Data refreshed successfully', 'success');
        }, 1000);
    }

    handleCreate() {
        // Open new record modal
        this.showToast('Info', `Create new ${this.selectedItem.slice(0, -1)}`, 'info');
    }

    handleRecordSelect(event) {
        const recordId = event.detail.recordId;
        const objectType = event.detail.objectType;
        this.navigateToRecord(recordId, objectType);
    }

    handleTaskComplete(event) {
        const taskId = event.detail.taskId;
        // Update task completion
        this.showToast('Success', 'Task completed', 'success');
        this.handleRefresh();
    }

    handleRecentItemSelect(event) {
        const item = event.detail;
        this.navigateToRecord(item.id, item.objectApiName);
    }

    // Navigation helper
    navigateToRecord(recordId, objectApiName) {
        // Using NavigationMixin would be better, but this is a simplified version
        window.open(`/lightning/r/${objectApiName}/${recordId}/view`, '_blank');
    }

    // Utility methods
    updateSyncTime() {
        this.lastSyncTime = new Date().toLocaleTimeString();
    }

    updateBreadcrumbs() {
        this.breadcrumbs = this.breadcrumbs.map(crumb => {
            const active = crumb.name === 'home' ? this.selectedItem === 'dashboard' : true;
            return {
                ...crumb,
                active,
                activeClass: active ? 'slds-breadcrumb_active' : ''
            };
        });
    }

    // Template-safe boolean for empty search results (LWC template cannot use expressions)
    get isSearchEmpty() {
        return Array.isArray(this.searchResults) && this.searchResults.length === 0;
    }

    getObjectIcon(objectApiName) {
        const iconMap = {
            'Account': 'standard:account',
            'Contact': 'standard:contact',
            'Opportunity': 'standard:opportunity',
            'Case': 'standard:case',
            'Task': 'standard:task'
        };
        return iconMap[objectApiName] || 'standard:default';
    }

    formatNumber(value) {
        if (!value) return '0';
        return value.toLocaleString();
    }

    handleError(error) {
        this.connectionStatus = {
            icon: 'utility:error',
            message: 'Connection Error'
        };
        
        this.showToast('Error', error.body?.message || 'An error occurred', 'error');
        console.error('Error:', error);
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
}