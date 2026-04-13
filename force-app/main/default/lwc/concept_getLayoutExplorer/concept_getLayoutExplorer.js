import { LightningElement, wire, track } from 'lwc';
import { getLayout } from 'lightning/uiLayoutApi';

export default class Concept_getLayoutExplorer extends LightningElement {
    @track selectedObject = 'Account';
    @track selectedLayout = 'Compact';
    @track selectedMode = 'Edit';
    @track expandedSections = {}; // Track expanded state of sections

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
            console.log('Sections found:', data.sections?.length || 0);
            
            // Reset expanded sections when new data loads
            this.expandedSections = {};
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
        return this.layoutData?.sections?.length || 0;
    }

    // Getter for total field count
    get fieldCount() {
        if (!this.layoutData?.sections) return 0;
        
        return this.layoutData.sections.reduce((total, section) => {
            return total + (section.layoutRows?.reduce((rowTotal, row) => {
                return rowTotal + (row.layoutItems?.length || 0);
            }, 0) || 0);
        }, 0);
    }

    // Getter for no sections
    get noSections() {
        return this.layoutData && this.sectionCount === 0;
    }

    // Getter for layout display name
    get layoutDisplayName() {
        if (!this.layoutData) return '';
        
        if (this.layoutData.fullName) {
            return this.layoutData.fullName;
        }
        
        const parts = [];
        if (this.layoutData.objectApiName) parts.push(this.layoutData.objectApiName);
        if (this.layoutData.layoutType) parts.push(this.layoutData.layoutType);
        if (this.layoutData.mode) parts.push(this.layoutData.mode);
        
        return parts.length > 0 ? parts.join(' - ') : 'Layout';
    }

    // Handle section toggle
    handleSectionToggle(event) {
        let sectionId = event.currentTarget.dataset.sectionId;
        if (!sectionId) {
            const sectionElement = event.target.closest('[data-section-id]');
            if (sectionElement) {
                sectionId = sectionElement.dataset.sectionId;
            }
        }
        if (sectionId) {
            this.expandedSections = {
                ...this.expandedSections,
                [sectionId]: !this.expandedSections[sectionId]
            };
        }
    }

    // Process sections for display
    get processedSections() {
        if (!this.layoutData?.sections) return [];
        
        return this.layoutData.sections.map((section, sectionIndex) => {
            const sectionId = `section-${sectionIndex}`;
            const fields = [];
            let fieldCounter = 0;
            
            // Process each row in the section
            if (section.layoutRows) {
                section.layoutRows.forEach((row, rowIndex) => {
                    if (row.layoutItems) {
                        row.layoutItems.forEach((item) => {
                            let fieldLabel = 'No Label';
                            let fieldApiName = 'N/A';
                            let fieldType = 'Unknown';
                            let fieldDetails = [];
                            
                            if (item.layoutComponents && item.layoutComponents.length > 0) {
                                // Process all components in this layout item
                                item.layoutComponents.forEach((component, compIndex) => {
                                    const compName = component.apiName || '';
                                    const compLabel = component.label || '';
                                    
                                    if (compName) {
                                        fieldDetails.push({
                                            apiName: compName,
                                            label: compLabel,
                                            type: component.componentType
                                        });
                                    }
                                    
                                    // Store the first component as primary
                                    if (compIndex === 0) {
                                        fieldApiName = compName || 'N/A';
                                        fieldLabel = compLabel || item.label || 'No Label';
                                        fieldType = component.componentType || 'Unknown';
                                    }
                                });
                                
                                // Special handling for compound fields
                                if (fieldDetails.length > 1) {
                                    const labels = fieldDetails.map(f => f.label).filter(l => l);
                                    if (labels.length > 0) {
                                        fieldLabel = labels.join(' + ');
                                    }
                                    const apiNames = fieldDetails.map(f => f.apiName).filter(a => a);
                                    if (apiNames.length > 0) {
                                        fieldApiName = apiNames.join(', ');
                                    }
                                }
                            } else {
                                fieldLabel = item.label || 'No Label';
                                if (item.field) {
                                    fieldApiName = item.field;
                                }
                            }
                            
                            const isReadOnly = (!item.editableForNew && !item.editableForUpdate);
                            
                            fields.push({
                                id: `field-${sectionIndex}-${rowIndex}-${fieldCounter++}`,
                                label: fieldLabel,
                                field: fieldApiName,
                                required: item.required || false,
                                readOnly: isReadOnly,
                                displayType: fieldType,
                                requiredIcon: item.required ? 'utility:check' : 'utility:clear',
                                requiredClass: item.required ? 'slds-text-color_success' : 'slds-text-color_weak',
                                readOnlyIcon: isReadOnly ? 'utility:lock' : 'utility:unlock',
                                readOnlyClass: isReadOnly ? 'slds-text-color_default' : 'slds-text-color_weak'
                            });
                        });
                    }
                });
            }
            
            const expanded = this.expandedSections[sectionId] || false;
            return {
                id: sectionId,
                contentId: `${sectionId}-content`,
                ariaExpanded: expanded ? 'true' : 'false',
                toggleIconName: expanded ? 'utility:chevrondown' : 'utility:chevronright',
                name: section.heading || `Section ${sectionIndex + 1}`,
                fields: fields,
                fieldCount: fields.length,
                columns: section.columns || 2,
                collapsible: section.collapsible || false,
                expanded
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