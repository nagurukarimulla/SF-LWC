import { LightningElement, track } from 'lwc';

export default class ConceptSelector extends LightningElement {
    @track searchKey = '';
    @track currentPage = 1;
    @track pageSize = 10;
    @track pageSizes = [5, 10, 20, 50, 100];
    
    concepts = [
        {label:'Refresh Apex Cache',value:'concept_refreshApexCache'},
        {label:'Apex Client-Side Caching',value:'concept_apexClientCaching'},
        {label:'Pass Values to Apex',value:'concept_passValuesToApex'},
        {label:'Imperative Apex with Parameters', value:'concept_apexImperativeWithParams'},
        {label:'Wire Service with Base Components',value:'concept_wireWithBaseComponents'},
        {label: 'Import Schema References',value: 'concept_importSchemaReferences'},
        {label: 'Reactive Wire Configuration',value: 'concept_wireReactiveConfig'},
        {label: 'Wire Function',value: 'concept_wireFunction'},
        {label: 'Wire Property',value: 'concept_wireProperty'},
        {label: 'Lightning Message Service',value: 'concept_lightningMessageService'},
        {label: 'Full Event Propagation',value: 'concept_eventFullPropagation'},
        {label: 'Event Bubbling Inside Shadow DOM',value: 'concept_eventBubbleInternal'},
        {label: 'Default Event Propagation',value: 'concept_eventDefaultPropagation'},
        {label: 'Configure Event Propagation', value: 'concept_configureEventPropagation'},
        {label: 'Remove Event Listeners', value: 'concept_removeEventListeners'},
        {label: 'Input Change Handling',value: 'concept_inputChangeHandling'},
        {label: 'Event Target vs CurrentTarget',value: 'concept_eventTargetVsCurrentTarget'},
        {label: 'Event Retargeting',value: 'concept_eventRetargeting'},
        {label: 'Event Listener Scope and Event Target',value: 'concept_eventListenerScopeAndTarget'},
        {label: 'Imperative Event Listener Registration', value: 'concept_imperativeEventListenerRegistration'},
        {label: 'Dynamic Event Strategy Switching', value: 'concept_dynamicEventStrategySwitching'},
        {label: 'Declarative Multi Event Binding', value: 'concept_declarativeMultiEventBinding'},
        {label: 'Imperative – Risk Evaluator', value: 'concept_imperativeRiskEvaluator'},
        {label: 'Wire – Revenue Analytics', value: 'concept_wireRevenueAnalytics'},
        {label: 'Expose Apex – Structured Service', value: 'concept_exposeApexStructuredService'},
        {label: 'LDS Example', value: 'ldsExample'},
        {label: 'Parent Child', value: 'parentChildExample'},
        {label: 'Lifecycle Hooks', value: 'lifecycleHooks'}
    ];

    // Computed property for filtered concepts
    get filteredConcepts() {
        if (!this.searchKey) {
            return this.concepts;
        }
        return this.concepts.filter(item =>
            item.label.toLowerCase().includes(this.searchKey.toLowerCase())
        );
    }

    // Pagination computed properties
    get totalRecords() {
        return this.filteredConcepts.length;
    }

    get totalPages() {
        return Math.ceil(this.totalRecords / this.pageSize);
    }

    get hasPreviousPage() {
        return this.currentPage > 1;
    }

    get hasNextPage() {
        return this.currentPage < this.totalPages;
    }

    get startRecord() {
        return Math.min((this.currentPage - 1) * this.pageSize + 1, this.totalRecords);
    }

    get endRecord() {
        return Math.min(this.currentPage * this.pageSize, this.totalRecords);
    }

    get paginatedConcepts() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = Math.min(startIndex + this.pageSize, this.totalRecords);
        return this.filteredConcepts.slice(startIndex, endIndex);
    }

    get pageInfo() {
        if (this.totalRecords === 0) {
            return 'No records found';
        }
        return `Showing ${this.startRecord} - ${this.endRecord} of ${this.totalRecords} concepts`;
    }

    get disablePageSizeChange() {
        return this.totalRecords === 0;
    }

    // Page size options with labels
    get pageSizeOptions() {
        return this.pageSizes.map(size => ({
            label: `${size} per page`,
            value: size
        }));
    }

    // Event handlers
    handleSearch(event) {
        this.searchKey = event.target.value;
        this.currentPage = 1; // Reset to first page on search
    }

    handlePageSizeChange(event) {
        const newPageSize = parseInt(event.detail.value, 10);
        this.pageSize = newPageSize;
        this.currentPage = 1; // Reset to first page when changing page size
    }

    handlePreviousPage() {
        if (this.hasPreviousPage) {
            this.currentPage--;
        }
    }

    handleNextPage() {
        if (this.hasNextPage) {
            this.currentPage++;
        }
    }

    handleFirstPage() {
        this.currentPage = 1;
    }

    handleLastPage() {
        this.currentPage = this.totalPages;
    }

    handlePageInputChange(event) {
        // Allow only numbers
        const inputValue = event.target.value.replace(/[^0-9]/g, '');
        const pageNumber = parseInt(inputValue, 10);
        
        if (inputValue === '') {
            // Clear the input but don't navigate
            const pageInput = this.template.querySelector('[data-id="pageInput"]');
            if (pageInput) {
                pageInput.value = '';
            }
            return;
        }
        
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= this.totalPages) {
            this.currentPage = pageNumber;
        }
    }

    handlePageInputBlur(event) {
        // Reset input to current page if invalid value was entered
        const pageInput = this.template.querySelector('[data-id="pageInput"]');
        if (pageInput) {
            pageInput.value = this.currentPage;
        }
    }

    selectConcept(event) {
        const selected = event.currentTarget.dataset.value;
        this.dispatchEvent(
            new CustomEvent('conceptselect', {
                detail: selected,
                bubbles: true,
                composed: true
            })
        );
    }

    // Lifecycle hooks
    connectedCallback() {
        // Load saved preferences from localStorage if needed
        const savedPageSize = localStorage.getItem('conceptSelector_pageSize');
        if (savedPageSize && this.pageSizes.includes(parseInt(savedPageSize, 10))) {
            this.pageSize = parseInt(savedPageSize, 10);
        }
    }

    disconnectedCallback() {
        // Save user preferences
        localStorage.setItem('conceptSelector_pageSize', this.pageSize);
    }

    // Add these getters to your ConceptSelector class
get firstPageDisabled() {
    return !this.hasPreviousPage;
}

get previousPageDisabled() {
    return !this.hasPreviousPage;
}

get nextPageDisabled() {
    return !this.hasNextPage;
}

get lastPageDisabled() {
    return !this.hasNextPage;
}

get pageInputDisabled() {
    return this.totalPages === 0;
}
}