import { LightningElement, wire } from 'lwc';
import { getNavItems } from 'lightning/uiAppsApi';
import FORM_FACTOR from '@salesforce/client/formFactor';

export default class Concept_getNavItems extends LightningElement {
    selectedFormFactor = FORM_FACTOR;
    currentPage = 0;
    pageSize = 30;
    navItemsResponse;

    formFactorOptions = [
        { label: 'Desktop (Large)', value: 'Large' },
        { label: 'Tablet (Medium)', value: 'Medium' },
        { label: 'Phone (Small)', value: 'Small' }
    ];

   @wire(getNavItems, {
    formFactor: '$selectedFormFactor',
    page: '$currentPage',
    pageSize: '$pageSize'
})
navItemsResponse(response) {
    console.log('Form Factor:', this.selectedFormFactor);
    console.log('Raw Response:', JSON.stringify(response));
    this.navItemsResponse = response;
}
   

    get navItems() {
        if (!this.navItemsResponse.data) return [];
        
        return this.navItemsResponse.data.navItems.map(item => ({
            id: item.id,
            label: item.label,
            developerName: item.developerName,
            type: this.getNavItemType(item),
            typeVariant: this.getTypeVariant(item),
            icon: this.getNavItemIcon(item)
        }));
    }

    get totalNavItems() {
        return this.navItemsResponse.data?.total || 0;
    }

    get hasNavItems() {
        return this.navItemsResponse.data && 
               this.navItemsResponse.data.navItems && 
               this.navItemsResponse.data.navItems.length > 0;
    }

    get isLoading() {
        return !this.navItemsResponse.data && !this.navItemsResponse.error;
    }

    get error() {
        if (this.navItemsResponse.error) {
            return this.navItemsResponse.error.body?.message || 'Error loading navigation items';
        }
        return null;
    }

    get showNoItems() {
        return this.navItemsResponse.data && 
               (!this.navItemsResponse.data.navItems || 
                this.navItemsResponse.data.navItems.length === 0);
    }

    getNavItemType(item) {
        if (item.isStandard) return 'Standard';
        if (item.isCustom) return 'Custom';
        return 'App';
    }

    getTypeVariant(item) {
        if (item.isStandard) return 'success';
        if (item.isCustom) return 'brand';
        return 'neutral';
    }

    getNavItemIcon(item) {
        // Map common nav item types to icons
        const iconMap = {
            'Account': 'standard:account',
            'Contact': 'standard:contact',
            'Opportunity': 'standard:opportunity',
            'Case': 'standard:case',
            'Lead': 'standard:lead',
            'Dashboard': 'standard:dashboard',
            'Report': 'standard:report'
        };
        
        return iconMap[item.label] || 'standard:app';
    }

    handleFormFactorChange(event) {
        this.selectedFormFactor = event.detail.value;
        this.currentPage = 0; // Reset to first page
    }

    handlePreviousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
        }
    }

    handleNextPage() {
        if ((this.currentPage + 1) * this.pageSize < this.totalNavItems) {
            this.currentPage++;
        }
    }
}