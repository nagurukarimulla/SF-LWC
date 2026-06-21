import { LightningElement, track } from 'lwc';
import { subscribe, unsubscribe, onError } from 'lightning/empApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AccountSubscriber extends LightningElement {
    channelName = '/event/Account_Notification__e';
    subscription = null;
    @track accounts = [];
    @track isSubscribed = false;
    @track error = null;

    connectedCallback() {
        this.subscribeToEvent();
        
        // Global error handler for EMP API
        onError(error => {
            console.error('EMP API Error:', error);
            this.error = 'Connection error: ' + JSON.stringify(error);
            this.showToast('Streaming Error', this.error, 'error');
        });
    }

    subscribeToEvent() {
        const callback = (response) => {
            console.log('Event received:', response);
            
            if (response && response.data && response.data.payload) {
                const payload = response.data.payload;
                
                const accountData = {
                    id: payload.AccountId__c,
                    name: payload.AccountName__c,
                    industry: payload.Industry__c,
                    receivedAt: new Date().toLocaleTimeString()
                };
                
                this.accounts = [accountData, ...this.accounts];
                
                // Show toast for new event
                this.showToast(
                    'New Account Created', 
                    `${accountData.name} (${accountData.industry || 'No industry'})`,
                    'info'
                );
            }
        };

            subscribe(this.channelName, -1, callback)
            .then(response => {
                this.subscription = response;
                this.isSubscribed = true;
                console.log('Subscribed to:', this.channelName);
                this.showToast('Success', 'Subscribed to account events', 'success');
            })
            .catch(error => {
                console.error('Subscription failed:', error);
                this.error = 'Subscription failed: ' + JSON.stringify(error);
                this.showToast('Subscription Error', this.error, 'error');
            });
    }

    unsubscribeFromEvent() {
        if (this.subscription) {
            unsubscribe(this.subscription)
                .then(() => {
                    this.isSubscribed = false;
                    this.subscription = null;
                    console.log('Unsubscribed successfully');
                })
                .catch(error => {
                    console.error('Unsubscribe error:', error);
                });
        }
    }

    get badgeLabel() {
        return this.isSubscribed ? 'Connected' : 'Disconnected';
    }

    get badgeVariant() {
        return this.isSubscribed ? 'success' : 'error';
    }

    disconnectedCallback() {
        this.unsubscribeFromEvent();
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
    
    clearAccounts() {
        this.accounts = [];
        this.showToast('Cleared', 'All notifications cleared', 'warning');
    }
}