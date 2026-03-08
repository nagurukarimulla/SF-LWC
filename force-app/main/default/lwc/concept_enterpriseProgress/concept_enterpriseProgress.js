import { LightningElement, track } from 'lwc';
import getStageDistribution from '@salesforce/apex/OpportunityProgressController.getStageDistribution';
import getRecords from '@salesforce/apex/OpportunityProgressController.getRecords';

export default class Concept_enterpriseProgress extends LightningElement {
    
    @track objectApiName = '';
    @track stageField = '';
    @track stageList = [];
    @track totalRecords = 0;
    @track progressValue = 0;
    @track currentStep = ''; // This will now show selected record's stage
    @track isLoading = false;
    @track selectedRecordId = '';
    @track recordOptions = [];
    @track selectedRecordDetails = {};
    @track errorMessage = '';
    @track selectedRecordStage = '';
    @track overallCurrentStep = ''; // Keep track of overall process stage
    
    objectOptions = [
        { label: '--Select Object--', value: '' },
        { label: 'Opportunity', value: 'Opportunity' },
        { label: 'Case', value: 'Case' },
        { label: 'Lead', value: 'Lead' }
    ];
    
    // Stage field mapping
    stageFieldMap = {
        'Opportunity': 'StageName',
        'Case': 'Status',
        'Lead': 'Status'
    };
    
    // Closed stage keywords for progress calculation (case insensitive)
    closedStageKeywords = {
        'Opportunity': ['closed won', 'closed lost'],
        'Case': ['closed'],
        'Lead': ['converted', 'closed']
    };
    
    handleObjectChange(event) {
        // Clear all existing data first
        this.clearAllData();
        
        this.objectApiName = event.detail.value;
        
        if (this.objectApiName) {
            this.stageField = this.stageFieldMap[this.objectApiName];
            this.isLoading = true;
            this.errorMessage = '';
            
            // Load stage data first
            this.loadStageData()
                .then(() => {
                    // Then load records
                    return this.loadRecords();
                })
                .catch(error => {
                    this.errorMessage = 'Error loading data: ' + (error.body?.message || error.message);
                    console.error('Error:', JSON.stringify(error));
                })
                .finally(() => {
                    this.isLoading = false;
                });
        }
    }
    
    clearAllData() {
        this.stageList = [];
        this.totalRecords = 0;
        this.progressValue = 0;
        this.currentStep = '';
        this.overallCurrentStep = '';
        this.selectedRecordId = '';
        this.recordOptions = [{ label: '--Select Record--', value: '' }];
        this.selectedRecordDetails = {};
        this.selectedRecordStage = '';
        this.errorMessage = '';
    }
    
    handleRecordChange(event) {
        this.selectedRecordId = event.detail.value;
        if (this.selectedRecordId) {
            this.loadRecordDetails();
        } else {
            this.selectedRecordDetails = {};
            this.selectedRecordStage = '';
            // When no record selected, show overall process stage
            this.currentStep = this.overallCurrentStep;
        }
    }
    
    loadStageData() {
        return getStageDistribution({
            objectApiName: this.objectApiName,
            stageField: this.stageField
        })
        .then(result => {
            this.totalRecords = result.total || 0;
            this.stageList = [];
            
            let closedCount = 0;
            const closedKeywords = this.closedStageKeywords[this.objectApiName] || [];
            
            // Sort stages for better display
            const sortedStages = this.sortStagesByPriority(Object.keys(result.stages));
            
            // Process each stage from the actual data
            sortedStages.forEach(stageName => {
                const count = result.stages[stageName];
                const isClosed = this.isClosedStage(stageName, closedKeywords);
                
                this.stageList.push({
                    name: stageName,
                    count: count,
                    value: stageName,
                    isClosed: isClosed,
                    originalName: stageName
                });
                
                if (isClosed) {
                    closedCount += count;
                }
            });
            
            // Calculate progress percentage
            this.progressValue = this.totalRecords > 0 ? 
                Math.round((closedCount / this.totalRecords) * 100) : 0;
            
            // Set overall current step for progress indicator
            this.updateOverallCurrentStep();
            
            // If no record is selected, show overall step
            if (!this.selectedRecordId) {
                this.currentStep = this.overallCurrentStep;
            }
        });
    }
    
    sortStagesByPriority(stages) {
        // Define priority order for common stages
        const priorityOrder = {
            'Open - Not Contacted': 1,
            'Working - Contacted': 2,
            'Closed - Converted': 3,
            'Closed - Not Converted': 3
        };
        
        return stages.sort((a, b) => {
            const aPriority = priorityOrder[a] || 999;
            const bPriority = priorityOrder[b] || 999;
            
            if (aPriority === bPriority) {
                return a.localeCompare(b);
            }
            return aPriority - bPriority;
        });
    }
    
    updateOverallCurrentStep() {
        if (this.stageList.length === 0) {
            this.overallCurrentStep = '';
            return;
        }
        
        // Find stages with records
        const stagesWithRecords = this.stageList.filter(stage => stage.count > 0);
        
        if (stagesWithRecords.length === 0) {
            // If no stages have records, show the first stage
            this.overallCurrentStep = this.stageList[0].name;
            return;
        }
        
        // Find the first non-closed stage with records (for overall process)
        const activeStage = stagesWithRecords.find(stage => !stage.isClosed);
        
        if (activeStage) {
            this.overallCurrentStep = activeStage.name;
        } else {
            // If all stages with records are closed, show the stage with most records
            const stageWithMostRecords = stagesWithRecords.reduce((max, stage) => 
                stage.count > max.count ? stage : max, stagesWithRecords[0]);
            this.overallCurrentStep = stageWithMostRecords.name;
        }
    }
    
    isClosedStage(stageName, closedKeywords) {
        const stageLower = stageName.toLowerCase();
        return closedKeywords.some(keyword => 
            stageLower.includes(keyword.toLowerCase())
        );
    }
    
    loadRecords() {
        return getRecords({ objectApiName: this.objectApiName })
        .then(result => {
            // Clear existing options except the first placeholder
            this.recordOptions = [{ label: '--Select Record--', value: '' }];
            
            // Add the records
            if (result && result.length > 0) {
                result.forEach(record => {
                    // Handle different name fields and get the actual stage/status
                    let displayName = '';
                    let stageValue = '';
                    
                    if (this.objectApiName === 'Case') {
                        displayName = record.CaseNumber || record.Subject || record.Id;
                        stageValue = record.Status || '';
                    } else if (this.objectApiName === 'Opportunity') {
                        displayName = record.Name || record.Id;
                        stageValue = record.StageName || '';
                    } else if (this.objectApiName === 'Lead') {
                        displayName = record.Name || record.Company || record.Id;
                        stageValue = record.Status || '';
                    } else {
                        displayName = record.Name || record.Id;
                    }
                    
                    // Create display label with stage/status
                    let label = displayName;
                    if (stageValue) {
                        label = `${displayName} [${stageValue}]`;
                    }
                    
                    this.recordOptions.push({
                        label: label,
                        value: record.Id,
                        stage: stageValue, // Store stage for later use
                        record: record // Store full record for details
                    });
                });
            } else {
                // Add a message if no records found
                this.recordOptions.push({
                    label: 'No records found',
                    value: '',
                    disabled: true
                });
            }
        })
        .catch(error => {
            console.error('Error loading records:', JSON.stringify(error));
            this.recordOptions = [
                { label: '--Select Record--', value: '' },
                { label: 'Error loading records', value: '', disabled: true }
            ];
            throw error;
        });
    }
    
    loadRecordDetails() {
        const selected = this.recordOptions.find(opt => opt.value === this.selectedRecordId);
        if (selected) {
            // Store the actual stage of the selected record
            this.selectedRecordStage = selected.stage || 'Not available';
            
            this.selectedRecordDetails = {
                Id: this.selectedRecordId,
                Name: selected.label.replace(/\s*\[.*?\]\s*$/, ''), // Remove stage from name
                ObjectType: this.objectApiName,
                Stage: this.selectedRecordStage
            };
            
            // IMPORTANT: Set the current step to the selected record's stage
            // This moves the dot in the progress indicator
            this.currentStep = this.selectedRecordStage;
            
            console.log('Selected Record Stage:', this.selectedRecordStage);
            console.log('Current Step (for dot):', this.currentStep);
        }
    }
    
    get steps() {
        return this.stageList.map(stage => ({
            label: stage.name,
            value: stage.name
        }));
    }
    
    get hasRecords() {
        return this.totalRecords > 0;
    }
    
    get hasSelectedRecord() {
        return this.selectedRecordId && Object.keys(this.selectedRecordDetails).length > 0;
    }
    
    get showContent() {
        return this.objectApiName && !this.isLoading;
    }
    
    get progressBarVariant() {
        if (this.progressValue >= 75) return 'success';
        if (this.progressValue >= 50) return 'warning';
        return 'base';
    }
    
    get currentStageDisplay() {
        // If a record is selected, show its stage
        if (this.hasSelectedRecord && this.selectedRecordStage) {
            return this.selectedRecordStage;
        }
        // Otherwise show the overall process current stage
        if (this.overallCurrentStep) {
            return this.overallCurrentStep;
        }
        return 'No active stage';
    }
}