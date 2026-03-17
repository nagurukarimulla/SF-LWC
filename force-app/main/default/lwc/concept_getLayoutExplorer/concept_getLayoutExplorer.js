import { LightningElement, wire, track } from 'lwc';
import { getLayout } from 'lightning/uiLayoutApi';

export default class Concept_getLayoutExplorer extends LightningElement {
    @track selectedObject = 'Account';
    @track selectedLayout = 'Compact';
    @track selectedMode = 'Edit';

    layoutData;
    error;
    isLoading = false;

    // Options for dropdowns
    objectOptions = [
        { label: 'Account', value: 'Account' },
        { label: 'Contact', value: 'Contact' },
        { label: 'Opportunity', value: 'Opportunity' },
        { label: 'Lead', value: 'Lead' },
        { label: 'Case', value: 'Case' }
    ];

    layoutOptions = [
        { label: 'Compact', value: 'Compact' },
        { label: 'Full', value: 'Full' }
    ];

    modeOptions = [
        { label: 'Edit', value: 'Edit' },
        { label: 'View', value: 'View' },
        { label: 'Create', value: 'Create' }
    ];

    // Wire adapter with reactive parameters
    @wire(getLayout, {
        objectApiName: '$selectedObject',
        layoutType: '$selectedLayout',
        mode: '$selectedMode'
    })
    wiredLayout({ error, data }) {
        this.isLoading = true;
        if (data) {
            this.layoutData = data;
            this.error = undefined;
            console.log('Layout Data:', JSON.stringify(data, null, 2));
        } else if (error) {
            this.error = error;
            this.layoutData = undefined;
            console.error('Error:', error);
        }
        this.isLoading = false;
    }

    // Getter for error message
    get errorMessage() {
        if (this.error) {
            return this.error.body?.message || this.error.message || 'Unknown error occurred';
        }
        return '';
    }

    // Getter for section count
    get sectionCount() {
        return this.layoutData?.layoutSections?.length || 0;
    }

    // Getter for total field count
    get fieldCount() {
        if (!this.layoutData?.layoutSections) return 0;
        
        return this.layoutData.layoutSections.reduce((total, section) => {
            return total + (section.layoutRows?.reduce((rowTotal, row) => {
                return rowTotal + (row.layoutItems?.length || 0);
            }, 0) || 0);
        }, 0);
    }

    // Getter for no sections
    get noSections() {
        return this.layoutData && this.sectionCount === 0;
    }

    // Process sections for display
    get processedSections() {
        if (!this.layoutData?.layoutSections) return [];
        
        return this.layoutData.layoutSections.map((section, sectionIndex) => {
            const fields = [];
            let fieldCounter = 0;
            
            // Process each row in the section
            if (section.layoutRows) {
                section.layoutRows.forEach((row, rowIndex) => {
                    if (row.layoutItems) {
                        row.layoutItems.forEach((item) => {
                            fields.push({
                                id: `field-${sectionIndex}-${rowIndex}-${fieldCounter++}`,
                                label: item.layoutComponent?.details?.label || item.field || 'No Label',
                                field: item.field || 'N/A',
                                required: item.required || false,
                                readOnly: item.readOnly || false,
                                displayType: item.layoutComponent?.details?.displayType || 'Unknown',
                                
                                // Helper properties for icons
                                requiredIcon: item.required ? 'utility:check' : 'utility:clear',
                                requiredClass: item.required ? 'slds-text-color_success' : 'slds-text-color_weak',
                                readOnlyIcon: item.readOnly ? 'utility:lock' : 'utility:unlock',
                                readOnlyClass: item.readOnly ? 'slds-text-color_default' : 'slds-text-color_weak'
                            });
                        });
                    }
                });
            }
            
            return {
                id: `section-${sectionIndex}`,
                name: section.label || `Section ${sectionIndex + 1}`,
                fields: fields,
                fieldCount: fields.length
            };
        });
    }

    handleObjectChange(event) {
        this.selectedObject = event.detail.value;
    }

    handleLayoutChange(event) {
        this.selectedLayout = event.detail.value;
    }

    handleModeChange(event) {
        this.selectedMode = event.detail.value;
    }
}