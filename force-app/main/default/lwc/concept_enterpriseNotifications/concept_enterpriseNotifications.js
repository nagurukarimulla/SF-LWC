import { LightningElement, track, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from 'lightning/empApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LightningAlert from 'lightning/alert';
import LightningConfirm from 'lightning/confirm';
import LightningPrompt from 'lightning/prompt';
import Toast from 'lightning/toast';

// Import field references
import OPPORTUNITY_NAME_FIELD from '@salesforce/schema/Opportunity.Name';
import OPPORTUNITY_STAGE_FIELD from '@salesforce/schema/Opportunity.StageName';
import OPPORTUNITY_AMOUNT_FIELD from '@salesforce/schema/Opportunity.Amount';
import OPPORTUNITY_CLOSE_DATE_FIELD from '@salesforce/schema/Opportunity.CloseDate';
import CASE_PRIORITY_FIELD from '@salesforce/schema/Case.Priority';
import CASE_STATUS_FIELD from '@salesforce/schema/Case.Status';
import LEAD_STATUS_FIELD from '@salesforce/schema/Lead.Status';

export default class EnterpriseNotifications extends LightningElement {
    @track logs = [];
    @track recordData = null;
    @track currentRecord = null;
    @track recordFields = [];
    @track connectionStatus = 'disconnected';
    @track lastUpdateTime = '';
    @track monitorChanges = false;
    @track monitorFields = false;
    @track monitorProcess = false;
    @track monitorSystem = false;
    
    recordId = '';
    selectedObject = '';
    channelName = '';
    subscription = null;
    
    // Object options
    objectOptions = [
        { label: 'Opportunity', value: 'Opportunity' },
        { label: 'Case', value: 'Case' },
        { label: 'Lead', value: 'Lead' },
        { label: 'Account', value: 'Account' },
        { label: 'Contact', value: 'Contact' }
    ];
    
    // Field mappings
    fieldMappings = {
        Opportunity: [
            { label: 'Name', field: OPPORTUNITY_NAME_FIELD },
            { label: 'Stage', field: OPPORTUNITY_STAGE_FIELD },
            { label: 'Amount', field: OPPORTUNITY_AMOUNT_FIELD },
            { label: 'Close Date', field: OPPORTUNITY_CLOSE_DATE_FIELD }
        ],
        Case: [
            { label: 'Priority', field: CASE_PRIORITY_FIELD },
            { label: 'Status', field: CASE_STATUS_FIELD }
        ],
        Lead: [
            { label: 'Company', field: LEAD_STATUS_FIELD },
            { label: 'Status', field: LEAD_STATUS_FIELD }
        ]
    };
    
    // Lifecycle hook
    connectedCallback() {
        this.checkStreamingApiStatus();
        this.setupErrorHandler();
    }
    
    // Check if Streaming API is enabled
    checkStreamingApiStatus() {
        isEmpEnabled().then(enabled => {
            if (!enabled) {
                this.addLog('Streaming API is not enabled in this org', 'error');
                this.connectionStatus = 'error';
                this.showToastMessage(
                    'Streaming API Error',
                    'Streaming API is not enabled. Check permissions.',
                    'error'
                );
            }
        });
    }
    
    // Setup global error handler
    setupErrorHandler() {
        onError((error) => {
            console.error('EMP API Error:', error);
            this.connectionStatus = 'error';
            
            // Parse the error for better logging
            let errorMessage = 'Streaming connection error';
            if (error && typeof error === 'object') {
                errorMessage = error.message || error.error || JSON.stringify(error);
            }
            
            this.addLog(`Streaming error: ${errorMessage}`, 'error');
            
            // Attempt to reconnect after error
            setTimeout(() => {
                if (this.recordId && this.currentRecord) {
                    this.setupStreamingChannel();
                }
            }, 5000);
        });
    }
    
     // Contextual actions based on record type
    get contextualActions() {
        const baseActions = [
            { name: 'alert', label: 'Show Alert', variant: 'neutral' },
            { name: 'confirm', label: 'Show Confirm', variant: 'neutral' },
            { name: 'prompt', label: 'Show Prompt', variant: 'neutral' },
            { name: 'eventToast', label: 'Show Event Toast', variant: 'neutral' },
            { name: 'toast', label: 'Show LWC Toast', variant: 'neutral' }
        ];
        
        if (this.currentRecord) {
            // Add contextual actions based on record type
            switch(this.currentRecord.ObjectType) {
                case 'Opportunity':
                    baseActions.push(
                        { name: 'stageChange', label: 'Stage Changed', variant: 'brand' },
                        { name: 'amountAlert', label: 'Amount Alert', variant: 'destructive' }
                    );
                    break;
                case 'Case':
                    baseActions.push(
                        { name: 'escalate', label: 'Escalate Case', variant: 'warning' },
                        { name: 'priorityAlert', label: 'Priority Alert', variant: 'destructive' }
                    );
                    break;
                case 'Lead':
                    baseActions.push(
                        { name: 'convert', label: 'Convert Lead', variant: 'success' },
                        { name: 'qualify', label: 'Qualify Lead', variant: 'brand' }
                    );
                    break;
            }
        }
        
        return baseActions;
    }
    // Wire service
    @wire(getRecord, { recordId: '$recordId', fields: '$fieldList' })
    wiredRecord({ error, data }) {
        if (data) {
            this.recordData = data;
            this.processRecordData(data);
            this.addLog(`Record loaded: ${data.fields.Name?.value}`, 'success');
            
            // Setup streaming after record is loaded
            if (!this.subscription) {
                this.setupStreamingChannel();
            }
        } else if (error) {
            this.addLog(`Error loading record: ${error.body?.message || error.message}`, 'error');
        }
    }
    
    get fieldList() {
        if (!this.selectedObject || !this.fieldMappings[this.selectedObject]) {
            return [];
        }
        return this.fieldMappings[this.selectedObject].map(f => f.field);
    }
    
    // Handle object change
    handleObjectChange(event) {
        this.selectedObject = event.detail.value;
        this.recordId = '';
        this.currentRecord = null;
        this.recordFields = [];
        
        // Unsubscribe from previous channel
        this.unsubscribeFromChannel();
    }
    
    // Handle record ID input
    handleRecordIdChange(event) {
        this.recordId = event.detail.value;
    }
    // Add this getter method
// Add this getter that returns boolean
get isLoadButtonDisabled() {
    return !this.recordId;
}

  @track recordId = '';    
    // Load record
    loadRecord() {
        if (!this.recordId) {
            this.showToastMessage('Error', 'Please enter a Record ID', 'error');
            return;
        }
        
        // Record will be loaded via wire service
        this.addLog(`Loading record: ${this.recordId}`, 'info');
    }
    
    // FIXED: Correct channel name format for Change Data Capture
    setupStreamingChannel() {
        if (!this.recordId || !this.selectedObject) {
            this.addLog('Missing record ID or object type', 'error');
            return;
        }
        
        // Unsubscribe from previous channel
        this.unsubscribeFromChannel();
        
        // IMPORTANT FIX: Correct CDC channel format
        // For standard objects: /data/OpportunityChangeEvent
        // For custom objects: /data/MyObject__ChangeEvent
        const objectApiName = this.selectedObject;
        this.channelName = `/data/${objectApiName}ChangeEvent`;
        
        this.addLog(`Attempting to subscribe to: ${this.channelName}`, 'info');
        
        // Set connection as connecting
        this.connectionStatus = 'connecting';
        
        // Message callback for events
        const messageCallback = (response) => {
            this.handleStreamingEvent(response);
        };
        
        // Subscribe with error handling
        subscribe(this.channelName, -1, messageCallback)
            .then(response => {
                this.subscription = response;
                this.connectionStatus = 'connected';
                this.addLog(`✅ Successfully subscribed to ${this.channelName}`, 'success');
                
                this.showToastMessage(
                    'Connected',
                    `Listening for changes on ${this.selectedObject}`,
                    'success'
                );
            })
            .catch(error => {
                this.connectionStatus = 'error';
                
                // Parse error for better message
                let errorDetail = 'Unknown error';
                if (error && error.message) {
                    errorDetail = error.message;
                } else if (error && typeof error === 'object') {
                    errorDetail = JSON.stringify(error);
                } else if (typeof error === 'string') {
                    errorDetail = error;
                }
                
                this.addLog(`❌ Subscription failed: ${errorDetail}`, 'error');
                
                // Show specific error message
                if (errorDetail.includes('not supported') || errorDetail.includes('404')) {
                    this.showToastMessage(
                        'Channel Not Found',
                        `Object ${this.selectedObject} may not be enabled for Change Data Capture. Check CDC settings in Setup.`,
                        'error'
                    );
                } else if (errorDetail.includes('permission') || errorDetail.includes('403')) {
                    this.showToastMessage(
                        'Permission Error',
                        'User does not have permission to subscribe to events',
                        'error'
                    );
                } else {
                    this.showToastMessage(
                        'Subscription Failed',
                        `Could not subscribe to ${this.channelName}. Check console for details.`,
                        'error'
                    );
                }
            });
    }
    
    // Unsubscribe helper
    unsubscribeFromChannel() {
        if (this.subscription) {
            unsubscribe(this.subscription, () => {
                this.addLog('Unsubscribed from previous channel', 'info');
                this.subscription = null;
            }).catch(error => {
                console.error('Unsubscribe error:', error);
                this.subscription = null;
            });
        }
    }
    
    // Handle streaming events
    handleStreamingEvent(response) {
        this.lastUpdateTime = new Date().toLocaleTimeString();
        
        try {
            console.log('Event received:', JSON.stringify(response));
            
            const eventData = response.data;
            const payload = eventData.payload;
            const header = payload.ChangeEventHeader || {};
            
            // Log the event
            this.addLog(
                `Event: ${header.changeType || 'UPDATE'} on ${header.entityName || this.selectedObject}`,
                'info'
            );
            
            // Check if this event is for our current record
            if (header.recordIds && header.recordIds.includes(this.recordId)) {
                this.handleRecordSpecificEvent(header, payload);
            }
            
            // Monitor field changes if enabled
            if (this.monitorFields && header.changedFields) {
                header.changedFields.forEach(field => {
                    this.addLog(`Field changed: ${field}`, 'warning');
                    
                    // Critical field alerts
                    this.checkCriticalFields(field, header.changeType);
                });
            }
            
            // Show toast for monitored changes
            if (this.shouldNotify(header)) {
                this.showToastMessage(
                    `${header.changeType || 'Record'} Update`,
                    `Changes detected in ${header.entityName || this.selectedObject}`,
                    'info'
                );
            }
            
        } catch (error) {
            console.error('Error processing event:', error);
            this.addLog(`Error processing event: ${error.message}`, 'error');
        }
    }
    
    // Handle record-specific events
    handleRecordSpecificEvent(header, payload) {
        this.addLog(`🔔 Your record ${this.currentRecord?.Name} was ${header.changeType}`, 'warning');
        
        // Reload record data
        if (header.changeType !== 'DELETE') {
            // Force record refresh via wire service
            // This will happen automatically if you have a mechanism to refresh
        }
        
        // Special handling by change type
        switch(header.changeType) {
            case 'CREATE':
                this.showToastMessage('Record Created', 'A new record was created', 'success');
                break;
            case 'UPDATE':
                this.showToastMessage('Record Updated', 'Record changes detected', 'info');
                break;
            case 'DELETE':
                this.showToastMessage('Record Deleted', 'This record no longer exists', 'error');
                break;
            case 'UNDELETE':
                this.showToastMessage('Record Restored', 'Record has been restored', 'success');
                break;
        }
    }
    
    // Check critical fields
    checkCriticalFields(field, changeType) {
        if (changeType !== 'UPDATE') return;
        
        const criticalFields = ['StageName', 'Priority', 'Status', 'Amount'];
        
        if (criticalFields.includes(field)) {
            this.showToastMessage(
                'Critical Field Changed',
                `${field} has been updated`,
                'warning'
            );
        }
    }
    
    // Determine if we should show toast
    shouldNotify(header) {
        if (!this.monitorSystem) return false;
        
        // Notify for all changes if system monitoring is on
        return true;
    }
    
    // Handle monitor toggles
    handleMonitorToggle(event) {
        const type = event.target.dataset.type;
        const value = event.target.checked;
        
        switch(type) {
            case 'changes':
                this.monitorChanges = value;
                break;
            case 'fields':
                this.monitorFields = value;
                break;
            case 'process':
                this.monitorProcess = value;
                break;
            case 'system':
                this.monitorSystem = value;
                break;
        }
        
        this.addLog(`Monitoring ${type} ${value ? 'enabled' : 'disabled'}`, 'info');
        
        // If enabling monitoring and no subscription, try to connect
        if (value && !this.subscription && this.recordId) {
            this.setupStreamingChannel();
        }
    }
    
    // Process record data
    processRecordData(data) {
        this.currentRecord = {
            Id: data.id,
            Name: data.fields.Name?.value || 'N/A',
            ObjectType: data.apiName,
            OwnerName: data.fields.Owner?.displayValue || 'N/A',
            LastModifiedDate: new Date(data.fields.LastModifiedDate?.value).toLocaleString()
        };
        
        // Process fields
        this.recordFields = [];
        if (this.fieldMappings[this.selectedObject]) {
            this.fieldMappings[this.selectedObject].forEach(field => {
                const value = this.getFieldValue(data, field.field);
                this.recordFields.push({
                    name: field.label,
                    label: field.label,
                    value: value || 'N/A'
                });
            });
        }
    }
    
    // Get field value helper
    getFieldValue(data, field) {
        try {
            return getFieldValue(data, field);
        } catch (e) {
            return null;
        }
    }
    
    // Handle action buttons
    // Handle all notification actions
    async handleAction(event) {
        const type = event.target.dataset.type;
        
        switch(type) {
            case 'alert':
                await this.showAlert();
                break;
            case 'confirm':
                await this.showConfirm();
                break;
            case 'prompt':
                await this.showPrompt();
                break;
            case 'eventToast':
                this.showEventToast();
                break;
            case 'toast':
                this.showToast();
                break;
            // Contextual actions
            case 'stageChange':
                await this.handleStageChange();
                break;
            case 'amountAlert':
                await this.handleAmountAlert();
                break;
            case 'escalate':
                await this.handleCaseEscalation();
                break;
            case 'convert':
                await this.handleLeadConversion();
                break;
        }
    }
    
    // Notification methods
    async showAlert() {
        const message = this.currentRecord 
            ? `Record ${this.currentRecord.Name} has triggered this alert`
            : 'System alert triggered';
            
        await LightningAlert.open({
            message: message,
            theme: this.currentRecord ? 'warning' : 'info',
            label: 'Alert'
        });
        
        this.addLog(`Alert displayed`, 'info');
    }
    // Show confirm with record context
    async showConfirm() {
        const message = this.currentRecord 
            ? `Do you want to proceed with ${this.currentRecord.Name}?`
            : 'Do you want to continue?';
            
        const result = await LightningConfirm.open({
            message: message,
            label: 'Confirmation'
        });
        
        this.addLog(`Confirm result for ${this.currentRecord?.Name || 'system'}: ${result}`, 'info');
        
        if (result && this.currentRecord) {
            this.handleConfirmedAction();
        }
    }
    // Show prompt with record context
    async showPrompt() {
        const message = this.currentRecord 
            ? `Enter notes for ${this.currentRecord.Name}`
            : 'Provide input';
            
        const value = await LightningPrompt.open({
            label: 'Input Required',
            message: message,
            defaultValue: this.currentRecord?.Name || ''
        });
        
        if (value) {
            this.addLog(`Prompt value for ${this.currentRecord?.Name || 'system'}: ${value}`, 'info');
            this.handlePromptValue(value);
        }
    }
    
    // Show event toast with context
    showEventToast() {
        const title = this.currentRecord 
            ? `${this.currentRecord.ObjectType} Update`
            : 'Success';
            
        const message = this.currentRecord 
            ? `${this.currentRecord.Name} has been processed`
            : 'Event based toast';
            
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: 'success'
            })
        );
        
        this.addLog(`Event toast fired for ${this.currentRecord?.Name || 'system'}`, 'info');
    }
    
    // Show LWC toast
    showToast() {
        Toast.show({
            label: this.currentRecord?.Name || 'LWC Toast',
            message: this.currentRecord 
                ? `Toast using lightning/toast for ${this.currentRecord.ObjectType}`
                : 'Toast using lightning/toast',
            variant: 'info'
        });
        
        this.addLog(`Toast component used for ${this.currentRecord?.Name || 'system'}`, 'info');
    }
    
    // Helper method to show toast
    showToastMessage(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
    
    // Handle confirmed action
    handleConfirmedAction() {
        this.addLog(`Confirmed action for ${this.currentRecord.Name}`, 'success');
        this.showToastMessage('Action Confirmed', `Processing ${this.currentRecord.Name}`, 'success');
    }
    
    // Handle prompt value
    handlePromptValue(value) {
        if (this.currentRecord) {
            // Here you would typically update the record
            this.addLog(`Notes added to ${this.currentRecord.Name}: ${value}`, 'info');
        }
    }
    
    // Contextual action handlers
    async handleStageChange() {
        this.addLog(`Stage change initiated for ${this.currentRecord.Name}`, 'info');
        this.showToastMessage('Stage Change', 'Opening stage selection...', 'info');
        
        // Simulate stage change workflow
        const newStage = await LightningPrompt.open({
            label: 'Change Stage',
            message: 'Enter new stage name:',
            defaultValue: 'Prospecting'
        });
        
        if (newStage) {
            this.addLog(`Stage changed to ${newStage} for ${this.currentRecord.Name}`, 'warning');
            this.showToastMessage('Stage Updated', `Stage changed to ${newStage}`, 'success');
        }
    }
    
    async handleAmountAlert() {
        if (this.currentRecord && this.currentRecord.ObjectType === 'Opportunity') {
            const amount = Math.random() * 1000000;
            this.addLog(`Amount alert: New opportunity value $${amount.toFixed(2)}`, 'warning');
            
            await LightningAlert.open({
                message: `Opportunity value has changed to $${amount.toFixed(2)}`,
                theme: amount > 500000 ? 'error' : 'warning',
                label: 'Amount Alert'
            });
        }
    }
    
    async handleCaseEscalation() {
        this.addLog(`Case escalation initiated for ${this.currentRecord.Name}`, 'critical');
        
        const confirmed = await LightningConfirm.open({
            message: `Escalate case ${this.currentRecord.Name} to Level 2 support?`,
            label: 'Case Escalation'
        });
        
        if (confirmed) {
            this.addLog(`Case escalated: ${this.currentRecord.Name}`, 'critical');
            this.showToastMessage('Case Escalated', 'Case has been escalated to Level 2', 'error');
        }
    }
    
    async handleLeadConversion() {
        this.addLog(`Lead conversion initiated for ${this.currentRecord.Name}`, 'success');
        
        const confirmed = await LightningConfirm.open({
            message: `Convert lead ${this.currentRecord.Name} to opportunity?`,
            label: 'Lead Conversion'
        });
        
        if (confirmed) {
            this.addLog(`Lead converted: ${this.currentRecord.Name}`, 'success');
            this.showToastMessage('Lead Converted', 'Lead successfully converted to opportunity', 'success');
        }
    }
    
    // Add log entry
    addLog(message, severity = 'info') {
        this.logs = [
            ...this.logs,
            {
                id: Date.now(),
                message: message,
                severity: severity,
                timestamp: new Date().toLocaleTimeString()
            }
        ].slice(-50);
    }
}