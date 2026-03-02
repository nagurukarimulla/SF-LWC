// productSyncDashboard.js - UPDATED with syncTime and eventTime
import { LightningElement, track, wire } from 'lwc';
import { subscribe, unsubscribe, onError } from 'lightning/empApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getRecentSyncs from '@salesforce/apex/ProductSyncDashboardController.getRecentSyncs';
import getSyncStats from '@salesforce/apex/ProductSyncDashboardController.getSyncStats';
import getRealtimeEvents from '@salesforce/apex/ProductSyncDashboardController.getRealtimeEvents';

export default class ProductSyncDashboard extends LightningElement {
    @track totalSyncs = 0;
    @track successfulSyncs = 0;
    @track failedSyncs = 0;
    @track recentSyncs = [];
    @track realtimeEvents = [];
    @track isLoading = true;
    @track errorMessage;
    
    channelName = '/event/Product_Sync_Event__e';
    subscription = {};
    
    // UPDATED: Using syncTime instead of time
    columns = [
        { label: 'Product ID', fieldName: 'productId', type: 'text' },
        { label: 'Operation', fieldName: 'operation', type: 'text' },
        { 
            label: 'Status', 
            fieldName: 'status', 
            type: 'text',
            cellAttributes: {
                class: { fieldName: 'statusClass' }
            }
        },
        { label: 'Time', fieldName: 'syncTime', type: 'text' },  // CHANGED: from 'time' to 'syncTime'
        { label: 'Target Org', fieldName: 'targetOrg', type: 'text' }
    ];
    
    connectedCallback() {
        console.log('🔌 Dashboard connected - Named Credential: LWC_org');
        this.loadData();
        this.handleSubscribe();
        
        // Register error listener
        onError(error => {
            console.error('Platform event error:', error);
        });
        
        // Refresh every 15 seconds
        this.intervalId = setInterval(() => {
            console.log('🔄 Auto-refreshing');
            this.loadData();
        }, 15000);
    }
    
    disconnectedCallback() {
        if (this.subscription) {
            unsubscribe(this.subscription);
        }
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
    
    loadData() {
        this.isLoading = true;
        this.errorMessage = null;
        
        Promise.all([
            this.loadStats(),
            this.loadRecentSyncs(),
            this.loadRealtimeEvents()
        ]).then(() => {
            this.isLoading = false;
            console.log('✅ Data refreshed');
        }).catch(error => {
            console.error('❌ Error:', error);
            this.isLoading = false;
            this.errorMessage = 'Failed to load data: ' + JSON.stringify(error);
            this.showToast('Error', 'Failed to load dashboard data', 'error');
        });
    }
    
    loadStats() {
        return getSyncStats()
            .then(result => {
                if (result) {
                    this.totalSyncs = result.total || 0;
                    this.successfulSyncs = result.successful || 0;
                    this.failedSyncs = result.failed || 0;
                }
            })
            .catch(error => {
                console.error('Stats error:', error);
                throw error;
            });
    }
    
    loadRecentSyncs() {
        return getRecentSyncs()
            .then(result => {
                console.log('Recent syncs:', result);
                this.recentSyncs = result || [];
            })
            .catch(error => {
                console.error('Recent syncs error:', error);
                throw error;
            });
    }
    
    loadRealtimeEvents() {
        return getRealtimeEvents()
            .then(result => {
                console.log('Realtime events:', result);
                this.realtimeEvents = result || [];
            })
            .catch(error => {
                console.error('Realtime events error:', error);
                throw error;
            });
    }
    
    handleSubscribe() {
        subscribe(this.channelName, -1, message => {
            this.handlePlatformEvent(message);
        }).then(response => {
            this.subscription = response;
            console.log('✅ Subscribed to platform events');
        }).catch(error => {
            console.error('❌ Subscription failed:', error);
        });
    }
    
    handlePlatformEvent(message) {
        if (!message || !message.data || !message.data.payload) return;
        
        const eventData = message.data.payload;
        console.log('📨 Event received:', eventData);
        
        // Refresh data immediately
        this.loadData();
        
        // Show toast
        if (eventData.Status__c === 'Failed') {
            this.showToast(
                'Sync Failed', 
                `Product ${eventData.Product_ID__c} failed to sync`,
                'error'
            );
        } else if (eventData.Status__c === 'Sent') {
            this.showToast(
                'Sync Successful', 
                `Product ${eventData.Product_ID__c} synced`,
                'success'
            );
        }
    }
    
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({ title, message, variant })
        );
    }
    
    handleRefresh() {
        this.loadData();
        this.showToast('Refreshing', 'Dashboard updated', 'info');
    }
}