import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getBiometricsService } from 'lightning/mobileCapabilities';

export default class BiometricsAuthenticator extends LightningElement {

    biometricsService;

    @track status = 'Waiting for action...';
    @track logs = [];

    isLoading = false;

    connectedCallback() {
        this.biometricsService = getBiometricsService();
        this.addLog('Component Initialized');
    }

    addLog(message) {
        this.logs = [
            {
                id: Date.now(),
                message: new Date().toLocaleTimeString() + ' - ' + message
            },
            ...this.logs
        ];
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }

    checkAvailability() {
        if (this.biometricsService?.isAvailable()) {
            this.status = 'Biometric Service Available';
            this.showToast('Success', 'Biometric service available', 'success');
            this.addLog('Biometric service detected');
        } else {
            this.status = 'Biometric Service Not Available';
            this.showToast('Error', 'Open inside Salesforce Mobile App', 'error');
            this.addLog('Service unavailable');
        }
    }

    async checkReady() {
        if (!this.biometricsService?.isAvailable()) {
            return;
        }

        try {
            this.isLoading = true;
            const result = await this.biometricsService.isBiometricsReady();
            this.status = JSON.stringify(result);
            this.addLog('Biometrics ready check completed');
        } catch (error) {
            this.status = error.message;
            this.addLog('Ready check failed');
        } finally {
            this.isLoading = false;
        }
    }

    async authenticateUser() {
        if (!this.biometricsService?.isAvailable()) {
            this.showToast('Error', 'Biometric Service unavailable', 'error');
            return;
        }

        try {
            this.isLoading = true;
            const options = {
                permissionRequestBody: 'Authentication required to access secure Salesforce data.',
                additionalSupportedPolicies: ['PIN_CODE']
            };
            const result = await this.biometricsService.checkUserIsDeviceOwner(options);

            if (result === true) {
                this.status = 'Authentication Successful';
                this.showToast('Verified', 'User identity verified', 'success');
                this.addLog('Authentication successful');
            } else {
                this.status = 'Authentication Failed';
                this.showToast('Failed', 'Verification failed', 'warning');
                this.addLog('Authentication failed');
            }
        } catch (error) {
            this.status = error.message;
            this.showToast('Error', error.message, 'error');
            this.addLog('Authentication exception');
            console.error(error);
        } finally {
            this.isLoading = false;
        }
    }
}