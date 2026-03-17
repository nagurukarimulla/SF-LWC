import { LightningElement, api, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { getFocusedTabInfo } from 'lightning/platformWorkspaceApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import userId from '@salesforce/user/Id';

// Object fields for context display
import ACCOUNT_NAME from '@salesforce/schema/Account.Name';
import CONTACT_NAME from '@salesforce/schema/Contact.Name';
import OPPORTUNITY_NAME from '@salesforce/schema/Opportunity.Name';
import CASE_SUBJECT from '@salesforce/schema/Case.Subject';
import LEAD_NAME from '@salesforce/schema/Lead.Name';

// Apex imports
import getFileHistory from '@salesforce/apex/FileUploadController.getFileHistory';
import deleteFile from '@salesforce/apex/FileUploadController.deleteFile';
import getObjectName from '@salesforce/apex/FileUploadController.getObjectName';

export default class Concept_EnterpriseFileUploader extends LightningElement {
    // Public properties - none required! Everything auto-detects
    @api allowMultiple = false;
    @api maxFileSize = 10;
    @api acceptedFileTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.png', '.txt'];
    @api showHistory = false;
    @api cardTitle = 'File Uploader';
    @api uploadLabel = 'Upload Files';

    // Private properties
    @track recordId = '';
    @track objectApiName = '';
    @track contextLabel = '';
    @track contextType = '';
    @track fileDescription = '';
    @track fileTags = '';
    @track uploadedFiles = [];
    @track fileHistory = [];
    @track isLoading = false;
    @track uploadedCount = 0;
    @track totalFiles = 0;
    @track uploadProgress = 0;

    // Track if we're in a record context
    hasRecordContext = false;
    currentUserId = userId;

    // Wire to get current page reference
    @wire(CurrentPageReference)
    pageRef(pageRef) {
        if (pageRef && pageRef.state) {
            console.log('Page Reference Detected:', pageRef);
            
            // Try multiple ways to get record ID from page reference
            if (pageRef.state.recordId) {
                this.setRecordContext(pageRef.state.recordId, pageRef.state.objectApiName);
            } else if (pageRef.attributes && pageRef.attributes.recordId) {
                this.setRecordContext(pageRef.attributes.recordId, pageRef.attributes.objectApiName);
            }
        }
    }

    // Wire to get record details if we have a record ID
    @wire(getRecord, { recordId: '$recordId', fields: [ACCOUNT_NAME, CONTACT_NAME, OPPORTUNITY_NAME, CASE_SUBJECT, LEAD_NAME] })
    recordDetails({ data, error }) {
        if (data) {
            this.updateContextLabel(data);
        } else if (error) {
            console.log('Not a standard object or no access:', error);
        }
    }

    // Lifecycle hook
    connectedCallback() {
        console.log('🔍 File Uploader initializing - auto-detecting context...');
        this.detectContext();
        window.addEventListener('popstate', this.handleUrlChange.bind(this));
    }

    disconnectedCallback() {
        window.removeEventListener('popstate', this.handleUrlChange.bind(this));
    }

    // Main context detection method
    async detectContext() {
        this.isLoading = true;
        
        try {
            // Method 1: Check URL first (most reliable for standard pages)
            const urlContext = this.getContextFromUrl();
            if (urlContext.recordId) {
                console.log('✅ Context found in URL:', urlContext);
                await this.setRecordContext(urlContext.recordId, urlContext.objectApiName);
                this.isLoading = false;
                return;
            }

            // Method 2: Check workspace (for console apps)
            const workspaceContext = await this.getContextFromWorkspace();
            if (workspaceContext.recordId) {
                console.log('✅ Context found in workspace:', workspaceContext);
                await this.setRecordContext(workspaceContext.recordId, workspaceContext.objectApiName);
                this.isLoading = false;
                return;
            }

            // Method 3: Check page DOM for any record context
            const domContext = this.getContextFromDOM();
            if (domContext.recordId) {
                console.log('✅ Context found in DOM:', domContext);
                await this.setRecordContext(domContext.recordId, domContext.objectApiName);
                this.isLoading = false;
                return;
            }

            // No record context found - personal files mode
            console.log('ℹ️ No record context - using personal files mode');
            this.hasRecordContext = false;
            this.contextLabel = 'My Personal Files';
            this.contextType = 'User';
            
        } catch (error) {
            console.error('Error detecting context:', error);
            this.hasRecordContext = false;
        } finally {
            this.isLoading = false;
            this.refreshHistory();
        }
    }

    // Get context from URL
    getContextFromUrl() {
        const url = window.location.href;
        console.log('Analyzing URL:', url);
        
        const result = { recordId: null, objectApiName: null };
        
        // Pattern 1: /lightning/r/Opportunity/006XXXXXXXXXXXXXXX/view
        const standardPattern = /\/lightning\/r\/([^\/]+)\/([a-zA-Z0-9]{15,18})\//;
        const match = url.match(standardPattern);
        if (match) {
            result.objectApiName = match[1];
            result.recordId = match[2];
            return result;
        }
        
        // Pattern 2: /006XXXXXXXXXXXXXXX (direct ID)
        const idPattern = /\/([a-zA-Z0-9]{15,18})(?:\/|$)/;
        const idMatch = url.match(idPattern);
        if (idMatch && this.isValidSalesforceId(idMatch[1])) {
            result.recordId = idMatch[1];
            // We'll get object name separately
            return result;
        }
        
        return result;
    }

    // Get context from workspace (console apps)
    async getContextFromWorkspace() {
        try {
            const tabInfo = await getFocusedTabInfo();
            if (tabInfo && tabInfo.recordId) {
                return {
                    recordId: tabInfo.recordId,
                    objectApiName: tabInfo.objectApiName
                };
            }
        } catch (error) {
            console.log('Not in workspace context');
        }
        return { recordId: null, objectApiName: null };
    }

    // Get context from DOM (look for any Salesforce record elements)
    getContextFromDOM() {
        // Look for elements with data-record-id attribute
        const recordElements = document.querySelectorAll('[data-record-id]');
        if (recordElements.length > 0) {
            const element = recordElements[0];
            return {
                recordId: element.getAttribute('data-record-id'),
                objectApiName: element.getAttribute('data-object-api-name')
            };
        }
        
        // Look for force-record-layout component
        const layout = document.querySelector('force-record-layout');
        if (layout) {
            const recordId = layout.getAttribute('record-id');
            if (recordId) {
                return { recordId, objectApiName: null };
            }
        }
        
        return { recordId: null, objectApiName: null };
    }

    // Set record context and load object info
    async setRecordContext(recordId, objectApiName) {
        this.recordId = recordId;
        this.hasRecordContext = true;
        
        if (objectApiName) {
            this.objectApiName = objectApiName;
            this.contextType = objectApiName;
        } else {
            // Try to get object API name from record ID
            try {
                this.objectApiName = await getObjectName({ recordId: recordId });
                this.contextType = this.objectApiName;
            } catch (error) {
                console.log('Could not determine object type');
                this.contextType = 'Record';
            }
        }
        
        // Set initial context label
        this.contextLabel = `${this.contextType} - Loading...`;
        
        console.log('Context set:', {
            recordId: this.recordId,
            objectApiName: this.objectApiName,
            contextType: this.contextType
        });
    }

    // Update context label with record name
    updateContextLabel(recordData) {
        // Try to get the name field based on object type
        let name = '';
        
        if (this.objectApiName === 'Account') {
            name = getFieldValue(recordData, ACCOUNT_NAME);
        } else if (this.objectApiName === 'Contact') {
            name = getFieldValue(recordData, CONTACT_NAME);
        } else if (this.objectApiName === 'Opportunity') {
            name = getFieldValue(recordData, OPPORTUNITY_NAME);
        } else if (this.objectApiName === 'Case') {
            name = getFieldValue(recordData, CASE_SUBJECT);
        } else if (this.objectApiName === 'Lead') {
            name = getFieldValue(recordData, LEAD_NAME);
        }
        
        if (name) {
            this.contextLabel = `${name} (${this.objectApiName})`;
        } else {
            this.contextLabel = `${this.objectApiName} Record`;
        }
    }

    // Handle URL changes (back/forward navigation)
    handleUrlChange() {
        console.log('URL changed - re-detecting context');
        this.detectContext();
    }

    // Validate Salesforce ID format
    isValidSalesforceId(id) {
        return /^[a-zA-Z0-9]{15,18}$/.test(id);
    }

    // Get effective record ID (empty string if no context)
    get effectiveRecordId() {
        return this.recordId || '';
    }

    // Handle file upload finished
    async handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        
        try {
            // Process each uploaded file
            for (const file of uploadedFiles) {
                const fileData = {
                    name: file.name,
                    documentId: file.documentId,
                    fileType: this.getFileType(file.name),
                    iconName: this.getFileIcon(file.name),
                    fileUrl: `/lightning/r/ContentDocument/${file.documentId}/view`,
                    uploadedDate: new Date().toLocaleString(),
                    description: this.fileDescription,
                    tags: this.fileTags,
                    size: file.size || 0,
                    formattedSize: this.formatFileSize(file.size || 0)
                };

                this.uploadedFiles = [fileData, ...this.uploadedFiles];
            }

            // Show success toast
            this.showToast(
                'Success',
                `${uploadedFiles.length} file(s) uploaded successfully to ${this.contextLabel || 'your files'}`,
                'success'
            );

            // Refresh history
            await this.refreshHistory();

            // Clear form
            this.fileDescription = '';
            this.fileTags = '';

        } catch (error) {
            this.handleUploadError(error);
        }
    }

    // Refresh file history based on current context
    async refreshHistory() {
        if (!this.showHistory) return;

        try {
            const params = {};
            if (this.recordId) {
                params.recordId = this.recordId;
            } else {
                params.userId = this.currentUserId;
            }

            const history = await getFileHistory(params);
            
            this.fileHistory = history.map(item => ({
                ...item,
                formattedSize: this.formatFileSize(item.contentSize || 0),
                uploadedDate: new Date(item.createdDate).toLocaleString(),
                fileUrl: `/lightning/r/ContentDocument/${item.contentDocumentId}/view`
            }));

        } catch (error) {
            console.error('Error refreshing history:', error);
        }
    }

    // Handle file deletion
    async handleDeleteFile(event) {
        const fileId = event.currentTarget.dataset.fileId;

        if (!confirm('Are you sure you want to delete this file?')) {
            return;
        }

        try {
            await deleteFile({ contentDocumentId: fileId });
            
            this.uploadedFiles = this.uploadedFiles.filter(f => f.documentId !== fileId);
            this.showToast('Success', 'File deleted successfully', 'success');
            await this.refreshHistory();

        } catch (error) {
            this.handleUploadError(error);
        }
    }

    // Handle upload progress
    handleUploadProgress(event) {
        this.totalFiles = event.detail.total;
        this.uploadedCount = event.detail.loaded;
        this.uploadProgress = (this.uploadedCount / this.totalFiles) * 100;
    }

    // Handle description change
    handleDescriptionChange(event) {
        this.fileDescription = event.target.value;
    }

    // Handle tags change
    handleTagsChange(event) {
        this.fileTags = event.target.value;
    }

    // Get progress bar style
    get progressStyle() {
        return `width: ${this.uploadProgress}%;`;
    }

    // Show progress summary
    get showProgressSummary() {
        return this.totalFiles > 0 && this.uploadedCount < this.totalFiles;
    }

    // Helper: Get file type
    getFileType(fileName) {
        const extension = fileName.split('.').pop().toUpperCase();
        return extension;
    }

    // Helper: Get file icon
    getFileIcon(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        
        const iconMap = {
            pdf: 'doctype:pdf',
            doc: 'doctype:word',
            docx: 'doctype:word',
            xls: 'doctype:excel',
            xlsx: 'doctype:excel',
            ppt: 'doctype:ppt',
            pptx: 'doctype:ppt',
            jpg: 'doctype:image',
            jpeg: 'doctype:image',
            png: 'doctype:image',
            gif: 'doctype:image',
            txt: 'doctype:txt',
            csv: 'doctype:csv'
        };

        return iconMap[extension] || 'doctype:unknown';
    }

    // Helper: Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Helper: Show toast
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }

    // Helper: Handle upload error
    handleUploadError(error) {
        console.error('Upload error:', error);
        
        let message = 'An error occurred during upload';
        if (error.body && error.body.message) {
            message = error.body.message;
        } else if (error.message) {
            message = error.message;
        }

        this.showToast('Error', message, 'error');
    }
}