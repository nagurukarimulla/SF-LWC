import { LightningElement, wire, track } from 'lwc';
import getAccounts from '@salesforce/apex/EnterpriseTableTreeController.getAccounts';
import getAccountHierarchy from '@salesforce/apex/EnterpriseTableTreeController.getAccountHierarchy';

export default class EnterpriseDataExplorer extends LightningElement {
    // State management
    @track activeView = 'accounts';
    @track isLoading = false;
    @track tableData = [];
    @track hierarchyData = [];
    @track searchTerm = '';
    @track currentPage = 1;
    @track selectedRows = [];
    
    pageSize = 5;
    
    // Column definitions for Accounts Table
    tableColumns = [
        { label: 'Account Name', fieldName: 'Name', type: 'text' },
        { label: 'Type', fieldName: 'Type', type: 'text' },
        { label: 'Industry', fieldName: 'Industry', type: 'text' },
        { label: 'Annual Revenue', fieldName: 'AnnualRevenue', type: 'currency' },
        { label: 'Phone', fieldName: 'Phone', type: 'phone' }
    ];

    // Column definitions for Hierarchy Tree
    hierarchyColumns = [
    { 
        type: 'tree',
        fieldName: 'name',
        label: 'Name',
        initialWidth: 250,
        wrapText: true,
        cellAttributes: { tooltip: { fieldName: 'name' } }  
    },
    { label: 'Type', fieldName: 'type', type: 'text', initialWidth: 120, wrapText: true },
    { label: 'Detail', fieldName: 'detail', type: 'text', initialWidth: 150, wrapText: true },
    { label: 'Value', fieldName: 'status', type: 'text', initialWidth: 150, wrapText: true }
];



    // Clean navigation structure
    navigationItems = [
        {
            label: 'ACCOUNTS TABLE',
            name: 'accounts-section',
            expanded: true,
            items: [
                { 
                    label: 'All Accounts', 
                    name: 'accounts', 
                    icon: 'standard:account'
                }
            ]
        },
        {
            label: 'ACCOUNT HIERARCHY',
            name: 'hierarchy-section',
            expanded: true,
            items: [
                { 
                    label: 'View Hierarchy', 
                    name: 'hierarchy', 
                    icon: 'standard:hierarchy'
                }
            ]
        }
    ];

    // Computed properties for Accounts Table
    get isAccountsView() {
        return this.activeView === 'accounts';
    }

    get isHierarchyView() {
        return this.activeView === 'hierarchy';
    }

    // Filter accounts based on search
    get filteredTableData() {
        if (!this.searchTerm) return this.tableData;
        
        const searchLower = this.searchTerm.toLowerCase();
        return this.tableData.filter(item => 
            (item.Name && item.Name.toLowerCase().includes(searchLower)) ||
            (item.Industry && item.Industry.toLowerCase().includes(searchLower))
        );
    }

    // Paginated accounts data
    get paginatedTableData() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.filteredTableData.slice(start, end);
    }

    // Paginated hierarchy data
    get paginatedHierarchyData() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.hierarchyData.slice(start, end);
}


    get totalRecords() {
        if (this.isAccountsView) {
            return this.filteredTableData.length;
        } else {
            return this.hierarchyData.length;
        }
    }

    get totalPages() {
        if (this.totalRecords === 0) return 1;
        return Math.ceil(this.totalRecords / this.pageSize);
    }

    get hasPreviousPage() {
        return this.currentPage > 1;
    }

    get hasNextPage() {
        return this.currentPage < this.totalPages;
    }

    get pageInfo() {
        if (this.totalRecords === 0) {
            return 'No records found';
        }
        const start = ((this.currentPage - 1) * this.pageSize) + 1;
        const end = Math.min(this.currentPage * this.pageSize, this.totalRecords);
        return `Showing ${start} to ${end} of ${this.totalRecords} records`;
    }

    get selectedCount() {
        return this.selectedRows.length;
    }

    // Wire services
    @wire(getAccounts)
    wiredAccounts({ error, data }) {
        if (data) {
            console.log('Accounts loaded:', data.length); // Debug log
            this.tableData = data.map(acc => ({
                Id: acc.Id,
                Name: acc.Name,
                Type: acc.Type || '—',
                Industry: acc.Industry || '—',
                AnnualRevenue: acc.AnnualRevenue || 0,
                Phone: acc.Phone || '—'
            }));
            this.isLoading = false;
            this.currentPage = 1;
            // Force re-render to update pagination
            this.refreshPagination();
        } else if (error) {
            console.error('Error loading accounts', error);
            this.isLoading = false;
        }
    }

    @wire(getAccountHierarchy)
    wiredHierarchy({ error, data }) {
        if (data) {
            console.log('Hierarchy loaded:', data.length); // Debug log
            this.hierarchyData = this.buildHierarchyData(data);
            this.isLoading = false;
            this.currentPage = 1;
            // Force re-render to update pagination
            this.refreshPagination();
        } else if (error) {
            console.error('Error loading hierarchy', error);
            this.isLoading = false;
        }
    }

    // Force pagination to update
    refreshPagination() {
        // This forces the component to re-evaluate all getters
        const temp = this.currentPage;
        this.currentPage = temp;
    }

    // Build hierarchy tree data
    buildHierarchyData(accounts) {
        return accounts.map(acc => {
            const children = [];
            
            if (acc.Opportunities && acc.Opportunities.length > 0) {
                acc.Opportunities.forEach(opp => {
                    children.push({
                        id: opp.Id,
                        name: opp.Name,
                        type: 'Opportunity',
                        detail: opp.StageName || '—',
                        status: opp.Amount ? `$${opp.Amount.toLocaleString()}` : '—'
                    });
                });
            }
            
            if (acc.Cases && acc.Cases.length > 0) {
                acc.Cases.forEach(c => {
                    children.push({
                        id: c.Id,
                        name: 'Case ' + c.CaseNumber,
                        type: 'Case',
                        detail: c.Priority || 'Normal',
                        status: c.Status || '—'
                    });
                });
            }
            
            return {
                id: acc.Id,
                name: acc.Name,
                type: 'Account',
                detail: acc.Industry || '—',
                status: '—',
                _children: children
            };
        });
    }

    // Event handlers
    handleNavigationSelect(event) {
        const selectedName = event.detail.name;
        console.log('Selected:', selectedName);
        
        if (selectedName === 'accounts') {
            this.activeView = 'accounts';
            this.isLoading = true;
            this.searchTerm = '';
            this.currentPage = 1;
            this.selectedRows = [];
            
            setTimeout(() => {
                this.isLoading = false;
                this.refreshPagination();
            }, 300);
        } else if (selectedName === 'hierarchy') {
            this.activeView = 'hierarchy';
            this.isLoading = true;
            this.searchTerm = '';
            this.currentPage = 1;
            this.selectedRows = [];
            
            setTimeout(() => {
                this.isLoading = false;
                this.refreshPagination();
            }, 300);
        }
    }

    handleRowSelection(event) {
        this.selectedRows = event.detail.selectedRows;
    }

    handleSearch(event) {
        this.searchTerm = event.target.value;
        this.currentPage = 1;
        this.refreshPagination();
    }

    handlePreviousPage() {
        if (this.hasPreviousPage) {
            this.currentPage = this.currentPage - 1;
            console.log('Previous page:', this.currentPage); // Debug log
        }
    }

    handleNextPage() {
        if (this.hasNextPage) {
            this.currentPage = this.currentPage + 1;
            console.log('Next page:', this.currentPage, 'Total pages:', this.totalPages); // Debug log
        }
    }

    handleRefresh() {
        this.isLoading = true;
        this.currentPage = 1;
        this.searchTerm = '';
        
        if (this.isAccountsView) {
            getAccounts()
                .then(data => {
                    this.tableData = data.map(acc => ({
                        Id: acc.Id,
                        Name: acc.Name,
                        Type: acc.Type || '—',
                        Industry: acc.Industry || '—',
                        AnnualRevenue: acc.AnnualRevenue || 0,
                        Phone: acc.Phone || '—'
                    }));
                    this.isLoading = false;
                    this.refreshPagination();
                })
                .catch(error => {
                    console.error('Refresh failed', error);
                    this.isLoading = false;
                });
        } else {
            getAccountHierarchy()
                .then(data => {
                    this.hierarchyData = this.buildHierarchyData(data);
                    this.isLoading = false;
                    this.refreshPagination();
                })
                .catch(error => {
                    console.error('Refresh failed', error);
                    this.isLoading = false;
                });
        }
    }

    handleExport() {
        try {
            const dataToExport = this.isAccountsView ? 
                this.filteredTableData : 
                this.flattenHierarchyData(this.hierarchyData);
            
            if (!dataToExport || dataToExport.length === 0) {
                alert('No data to export');
                return;
            }
            
            const headers = ['Name', 'Type', 'Detail', 'Value'];
            const csvRows = [headers.join(',')];
            
            for (const row of dataToExport) {
                const values = [
                    `"${(row.name || row.Name || '').replace(/"/g, '""')}"`,
                    `"${(row.type || '').replace(/"/g, '""')}"`,
                    `"${(row.detail || row.Industry || '').replace(/"/g, '""')}"`,
                    `"${(row.status || row.AnnualRevenue || '').replace(/"/g, '""')}"`
                ];
                csvRows.push(values.join(','));
            }
            
            const csvString = csvRows.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.activeView}_export.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Export failed', error);
            alert('Export failed');
        }
    }

    flattenHierarchyData(data) {
        const flattened = [];
        data.forEach(item => {
            flattened.push({
                name: item.name,
                type: item.type,
                detail: item.detail,
                value: item.status
            });
            if (item._children && item._children.length > 0) {
                item._children.forEach(child => flattened.push({
                    name: child.name,
                    type: child.type,
                    detail: child.detail,
                    value: child.status
                }));
            }
        });
        return flattened;
    }
    // Add this getter for next button disabled state
get isNextDisabled() {
    return !this.hasNextPage;
}

// Add this getter for previous button disabled state
get isPreviousDisabled() {
    return !this.hasPreviousPage;
}
}