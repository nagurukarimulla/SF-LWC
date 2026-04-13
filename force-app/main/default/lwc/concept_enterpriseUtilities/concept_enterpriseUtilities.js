import { LightningElement, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import { encodeDefaultFieldValues } from 'lightning/pageReferenceUtils';
import { log } from 'lightning/logger';
import { isCategoryAllowedForCurrentConsent } from 'lightning/userConsentCookie';

export default class UtilityModulesPlayground extends NavigationMixin(LightningElement) {
    resultMessage = '';
    errorMessage = '';
    outputMessage = '';
    generatedUrl = '';
    showSpinner = false;

    @wire(CurrentPageReference)
    pageRef;

    // Helper method to clear messages
    clearMessages() {
        this.resultMessage = '';
        this.errorMessage = '';
        this.showSpinner = false;
    }

    /* NAVIGATION MODULE */
    navigateToAccount() {
        this.clearMessages();
        
        try {
            this[NavigationMixin.Navigate]({
                type: 'standard__objectPage',
                attributes: {
                    objectApiName: 'Account',
                    actionName: 'home'
                }
            });
            this.resultMessage = 'Navigating to Account Home...';
        } catch (error) {
            this.errorMessage = 'Navigation failed: ' + error.message;
        }
    }

    /* GENERATE URL */
    generateUrl() {
        this.clearMessages();
        this.showSpinner = true;
        this.generatedUrl = '';
        
        // Use a more realistic record ID format
        const recordId = '0015g00000rGmPHAA0'; 
        
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                actionName: 'view'
            }
        })
        .then(url => {
            this.generatedUrl = url;
            this.resultMessage = 'URL generated successfully';
            this.outputMessage = 'URL is now available please click the link to navigate';
            this.showSpinner = false;
        })
        .catch(error => {
            this.errorMessage = 'Failed to generate URL: ' + error.message;
            this.showSpinner = false;
        });
    }

    /* PAGE REFERENCE UTILS */
    encodeFields() {
        this.clearMessages();
        
        try {
            const defaultValues = {
                Name: 'Enterprise Demo Account',
                Industry: 'Technology',
                Type: 'Prospect',
                Phone: '(555) 123-4567',
                Website: 'www.enterprise-demo.com'
            };
            
            const encoded = encodeDefaultFieldValues(defaultValues);
            
            // Store both the raw encoded value and a human-readable version
            this.resultMessage = 'Fields encoded successfully';
            this.outputMessage = `Encoded values: ${encoded}\n\n` +
                               `Original values: ${JSON.stringify(defaultValues, null, 2)}`;
            
        } catch (error) {
            this.errorMessage = 'Encoding failed: ' + error.message;
        }
    }

    /* LOGGER MODULE */
    logEvent() {
        this.clearMessages();
        
        try {
            const eventData = {
                type: 'click',
                component: 'Utility Playground',
                action: 'Logger Button',
                timestamp: new Date().toISOString(),
                userId: 'current-user', // This would be dynamically populated
                pageRef: this.pageRef
            };

            // Check if logger is available
            if (typeof log === 'function') {
                log(eventData);
                this.resultMessage = 'Event logged to Event Monitoring';
                this.outputMessage = `Event data: ${JSON.stringify(eventData, null, 2)}`;
            } else {
                // Fallback for environments where logger isn't available
                this.resultMessage = 'Logger module not available in this environment';
                this.outputMessage = 'Event data (not logged): ' + JSON.stringify(eventData, null, 2);
            }
        } catch (error) {
            this.errorMessage = 'Logging failed: ' + error.message;
        }
    }

    /* COOKIE CONSENT MODULE */
    checkCookie() {
        this.clearMessages();
        
        try {
            // Test multiple cookie categories
            const categories = ['Marketing', 'Analytics', 'Essential', 'Personalization'];
            const results = {};
            
            categories.forEach(category => {
                try {
                    results[category] = isCategoryAllowedForCurrentConsent(category);
                } catch (categoryError) {
                    results[category] = 'Error: ' + categoryError.message;
                }
            });

            // Format the output
            this.resultMessage = 'Cookie consent check completed';
            this.outputMessage = 'Cookie categories status:\n' + 
                Object.entries(results)
                    .map(([category, allowed]) => `${category}: ${allowed}`)
                    .join('\n');

            // Also show a specific message for Marketing category
            const marketingAllowed = results['Marketing'];
            this.resultMessage += ` | Marketing cookies: ${marketingAllowed}`;

        } catch (error) {
            this.errorMessage = 'Cookie consent check failed: ' + error.message;
            
            // Provide fallback information
            this.outputMessage = 'Note: Cookie consent module may not be available ' +
                               'in all environments. This is expected in sandboxes ' +
                               'or developer orgs without proper consent setup.';
        }
    }

    /* UTILITY METHODS */
    // Helper to handle async operations safely
    async handleAsyncOperation(operation, successMessage) {
        this.clearMessages();
        this.showSpinner = true;
        
        try {
            await operation();
            this.resultMessage = successMessage || 'Operation completed successfully';
        } catch (error) {
            this.errorMessage = error.message || 'An unexpected error occurred';
        } finally {
            this.showSpinner = false;
        }
    }

    // Lifecycle hooks
    connectedCallback() {
        // Initialize component
        this.outputMessage = 'Ready to test utility modules. Click any button to begin.';
    }
}