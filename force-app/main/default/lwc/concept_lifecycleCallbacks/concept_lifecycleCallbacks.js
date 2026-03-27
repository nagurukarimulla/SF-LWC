import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Concept_lifecycleCallbacks extends LightningElement {
    // Public properties
    @api recordId;
    @api componentTitle = 'Lifecycle Hooks Demo';
    @api enablePolling = false;
    
    // Tracked properties for UI
    @track connectionStatus = {
        isConnected: false,
        connectTime: null,
        disconnectTime: null,
        connectionCount: 0,
        lastAction: null
    };
    
    @track eventLogs = [];
    @track showDataModal = false;
    @track modalData = null;
    @track subscriptionStatus = {
        messageChannel: false,
        resizeListener: false,
        visibilityListener: false,
        pollingActive: false
    };
    
    @track performanceMetrics = {
        connectedTime: null,
        disconnectedTime: null,
        timeToConnect: null,
        totalTimeInDOM: null
    };
    
    // Private properties
    _pollingInterval = null;
    _resizeObserver = null;
    _mutationObserver = null;
    _dataCache = new Map();
    _subscriptions = new Set();
    _startTime = null;
    
    // ========== LIFECYCLE HOOKS ==========
    
    // connectedCallback - Called when component inserted into DOM
    connectedCallback() {
        // Track connection start time
        this._startTime = Date.now();
        
        // Update connection status (use true — prefer tracked state over runtime `isConnected`)
        this.connectionStatus.isConnected = true;
        this.connectionStatus.connectTime = new Date().toISOString();
        this.connectionStatus.connectionCount++;
        this.connectionStatus.lastAction = 'connected';
        
        // Log connection event
        this._addLog('info', '✅ connectedCallback triggered - Component inserted into DOM', {
            connectionCount: this.connectionStatus.connectionCount,
            timestamp: this.connectionStatus.connectTime,
            isConnected: this.isConnected
        });
        
        // ✅ DO: Add attributes to host element
        this.classList.add('enterprise-component');
        this.setAttribute('data-component-id', `lifecycle-${Date.now()}`);
        this.setAttribute('data-connected', 'true');
        this._addLog('debug', 'Host element attributes added', {
            classes: this.classList.toString(),
            attributes: ['data-component-id', 'data-connected']
        });
        
        // ✅ DO: Initialize performance tracking
        this.performanceMetrics.connectedTime = Date.now();
        this._addLog('debug', 'Performance tracking initialized', {
            connectedTime: this.performanceMetrics.connectedTime,
            startTime: this._startTime
        });
        
        // ✅ DO: Subscribe to window events
        this._setupEventListeners();
        
        // ✅ DO: Initialize message channel subscription
        this._setupMessageChannel();
        
        // ✅ DO: Set up polling if enabled
        if (this.enablePolling) {
            this._startPolling();
        }
        
        // ✅ DO: Initialize third-party integrations
        this._initializeThirdParty();
        
        // ✅ DO: Cache initialization
        this._initializeCache();
        
        // ✅ DO: Validate required props
        this._validateRequiredProps();
        
        // ✅ DO: Trigger data fetching
        this._loadInitialData();
        
        // Log successful connection
        this._addLog('success', '🎉 Component successfully connected and initialized', {
            duration: `${Date.now() - this._startTime}ms`,
            features: this._getActiveFeatures()
        });
    }
    
    // disconnectedCallback - Called when component removed from DOM
    disconnectedCallback() {
        // Track disconnection
        this.connectionStatus.disconnectTime = new Date().toISOString();
        this.connectionStatus.isConnected = false;
        this.connectionStatus.lastAction = 'disconnected';
        
        // Log disconnection
        this._addLog('warning', '⚠️ disconnectedCallback triggered - Component removed from DOM', {
            timeInDOM: this.performanceMetrics.connectedTime ? 
                `${Date.now() - this.performanceMetrics.connectedTime}ms` : 'N/A',
            connectionCount: this.connectionStatus.connectionCount
        });
        
        // ❗ CRITICAL: Clean up all resources
        
        // ✅ DO: Clear polling intervals
        if (this._pollingInterval) {
            clearInterval(this._pollingInterval);
            this._pollingInterval = null;
            this.subscriptionStatus.pollingActive = false;
            this._addLog('info', 'Polling interval cleared');
        }
        
        // ✅ DO: Remove event listeners
        this._removeEventListeners();
        
        // ✅ DO: Unsubscribe from message channels
        this._unsubscribeMessageChannel();
        
        // ✅ DO: Disconnect observers
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }
        
        if (this._mutationObserver) {
            this._mutationObserver.disconnect();
            this._mutationObserver = null;
        }
        
        // ✅ DO: Clear cache
        this._clearCache();
        
        // ✅ DO: Clean up subscriptions
        this._subscriptions.clear();
        
        // ✅ DO: Remove host attributes
        this.removeAttribute('data-connected');
        this._addLog('debug', 'Host attributes cleaned up');
        
        // Update performance metrics
        this.performanceMetrics.disconnectedTime = Date.now();
        if (this.performanceMetrics.connectedTime) {
            this.performanceMetrics.totalTimeInDOM = 
                this.performanceMetrics.disconnectedTime - this.performanceMetrics.connectedTime;
        }
        
        this._addLog('success', '🧹 Component cleanup completed successfully', {
            cleanupDuration: `${Date.now() - this.performanceMetrics.disconnectedTime}ms`,
            resourcesCleared: ['intervals', 'listeners', 'subscriptions', 'cache', 'observers']
        });
    }
    
    // ========== PRIVATE METHODS ==========
    
    _setupEventListeners() {
        // ✅ DO: Register window-level event listeners
        window.addEventListener('resize', this._handleResize.bind(this));
        this.subscriptionStatus.resizeListener = true;
        this._addLog('debug', 'Resize event listener registered', {
            resizeListener: this.subscriptionStatus.resizeListener,
            viewportWidth: typeof window !== 'undefined' ? window.innerWidth : null
        });
        
        // ✅ DO: Visibility change detection
        document.addEventListener('visibilitychange', this._handleVisibilityChange.bind(this));
        this.subscriptionStatus.visibilityListener = true;
        this._addLog('debug', 'Visibility change listener registered', {
            visibilityListener: this.subscriptionStatus.visibilityListener,
            currentState: typeof document !== 'undefined' ? document.visibilityState : null
        });
        
        // ✅ DO: Custom event listeners
        window.addEventListener('online', this._handleOnline.bind(this));
        window.addEventListener('offline', this._handleOffline.bind(this));
        this._addLog('debug', 'Network status listeners registered', {
            onlineListener: true,
            offlineListener: true,
            navigatorOnLine: typeof navigator !== 'undefined' ? navigator.onLine : null
        });
    }
    
    _removeEventListeners() {
        // ✅ DO: Clean up all event listeners
        window.removeEventListener('resize', this._handleResize.bind(this));
        window.removeEventListener('visibilitychange', this._handleVisibilityChange.bind(this));
        window.removeEventListener('online', this._handleOnline.bind(this));
        window.removeEventListener('offline', this._handleOffline.bind(this));
        
        this.subscriptionStatus.resizeListener = false;
        this.subscriptionStatus.visibilityListener = false;
        
        this._addLog('debug', 'All event listeners removed');
    }
    
    _setupMessageChannel() {
        // ✅ DO: Subscribe to message channel (simulated)
        this._addLog('info', '📡 Message channel subscription initialized', {
            channel: 'app-events',
            subscribers: ['data-update', 'user-action', 'system-notification']
        });
        this.subscriptionStatus.messageChannel = true;
    }
    
    _unsubscribeMessageChannel() {
        // ✅ DO: Unsubscribe from message channels
        this._addLog('info', '📡 Message channel unsubscribed');
        this.subscriptionStatus.messageChannel = false;
    }
    
    _startPolling() {
        // ✅ DO: Set up polling with cleanup
        // Guard against creating multiple intervals or starting when flag already true
        if (this._pollingInterval || this.subscriptionStatus.pollingActive) {
            this._addLog('debug', 'Polling already running; _startPolling skipped');
            return;
        }

        this._pollingInterval = setInterval(() => {
            if (this.isConnected) {
                this._pollData();
            } else {
                // Auto-cleanup if component disconnected
                clearInterval(this._pollingInterval);
                this._pollingInterval = null;
            }
        }, 5000);
        
        this.subscriptionStatus.pollingActive = true;
        this._addLog('info', '🔄 Polling started (every 5 seconds)', {
            intervalId: this._pollingInterval,
            componentConnected: this.isConnected
        });
    }
    
    _initializeThirdParty() {
        // ✅ DO: Initialize analytics
        this._addLog('debug', '📊 Analytics initialized', {
            trackingId: 'UA-LWC-DEMO-001',
            environment: 'production'
        });
        
        // ✅ DO: Initialize logging service
        this._addLog('debug', '📝 Logging service initialized', {
            service: 'console-logger',
            level: 'debug'
        });
    }
    
    _initializeCache() {
        // ✅ DO: Set up data cache
        this._dataCache.set('initialized', true);
        this._dataCache.set('timestamp', Date.now());
        this._addLog('debug', '💾 Cache initialized', {
            cacheSize: this._dataCache.size,
            cacheKeys: Array.from(this._dataCache.keys())
        });
    }
    
    _validateRequiredProps() {
        // ✅ DO: Validate required properties
        const required = ['recordId'];
        const missing = required.filter(prop => !this[prop]);
        
        if (missing.length > 0) {
            this._addLog('warning', '⚠️ Missing required properties', {
                missingProps: missing,
                currentValues: {
                    recordId: this.recordId,
                    componentTitle: this.componentTitle
                }
            });
        } else {
            this._addLog('success', '✅ All required properties present');
        }
    }
    
    _loadInitialData() {
        // ✅ DO: Fetch initial data (simulated)
        setTimeout(() => {
            if (this.isConnected) {
                this._addLog('info', '📊 Initial data loaded', {
                    recordId: this.recordId || 'No ID',
                    dataSource: 'cache-first',
                    responseTime: '250ms'
                });
            }
        }, 100);
    }
    
    _pollData() {
        // Simulated polling
        this._addLog('debug', '🔄 Polling data', {
            timestamp: new Date().toISOString(),
            recordId: this.recordId
        });
    }
    
    _clearCache() {
        // ✅ DO: Clear cache on disconnect
        this._dataCache.clear();
        this._addLog('debug', '💾 Cache cleared');
    }
    
    _getActiveFeatures() {
        return {
            polling: this.subscriptionStatus.pollingActive,
            messageChannel: this.subscriptionStatus.messageChannel,
            resizeListener: this.subscriptionStatus.resizeListener,
            visibilityListener: this.subscriptionStatus.visibilityListener
        };
    }
    
    // ========== EVENT HANDLERS ==========
    
    _handleResize() {
        if (this.isConnected) {
            this._addLog('debug', 'Window resized', {
                width: window.innerWidth,
                height: window.innerHeight,
                viewport: window.innerWidth <= 768 ? 'mobile' : 
                         window.innerWidth <= 1024 ? 'tablet' : 'desktop'
            });
        }
    }
    
    _handleVisibilityChange() {
        if (this.isConnected) {
            const isVisible = document.visibilityState === 'visible';
            this._addLog('info', `Page visibility changed: ${isVisible ? 'visible' : 'hidden'}`, {
                visibilityState: document.visibilityState,
                timestamp: new Date().toISOString()
            });
            
            // ✅ DO: Optimize polling based on visibility
            if (!isVisible && this._pollingInterval) {
                this._addLog('debug', 'Pausing polling (page hidden)');
            } else if (isVisible && this._pollingInterval) {
                this._addLog('debug', 'Resuming polling (page visible)');
            }
        }
    }
    
    _handleOnline() {
        this._addLog('success', '🌐 Network connection restored');
    }
    
    _handleOffline() {
        this._addLog('warning', '📡 Network connection lost');
    }
    
    // ========== HELPER METHODS ==========
    
    _addLog(level, message, data = null) {
        const logEntry = {
            id: this.eventLogs.length + 1,
            level,
            message,
            data: data ? JSON.stringify(data, null, 2) : null,
            timestamp: new Date().toISOString(),
            // Use tracked connectionStatus as the source of truth (supports simulated lifecycle)
            phase: this.connectionStatus.isConnected ? 'connected' : 'disconnected'
        };

        // Compute presentation classes so templates don't use inline expressions
        logEntry.phaseClass = logEntry.phase === 'connected' ? 'slds-badge slds-theme_success' : 'slds-badge slds-theme_error';
        logEntry.levelClass = level === 'error' ? 'slds-badge slds-theme_error' :
                              level === 'warning' ? 'slds-badge slds-theme_warning' :
                              level === 'debug' ? 'slds-badge slds-theme_light' :
                              level === 'success' ? 'slds-badge slds-theme_success' :
                              'slds-badge slds-theme_info';

        this.eventLogs = [...this.eventLogs, logEntry];
        
        // Console output
        const consoleMethod = level === 'error' ? 'error' : 
                             level === 'warning' ? 'warn' : 
                             level === 'debug' ? 'debug' : 'log';
        console[consoleMethod](`[Lifecycle] ${message}`, data || '');
    }
    
    // ========== PUBLIC METHODS ==========
    
    @api
    getConnectionInfo() {
        return {
            ...this.connectionStatus,
            isConnected: this.isConnected,
            subscriptions: this.subscriptionStatus,
            metrics: this.performanceMetrics
        };
    }
    
    @api
    forceCleanup() {
        this.disconnectedCallback();
        this._addLog('info', 'Manual cleanup triggered');
    }
    
    // ========== GETTERS ==========
    
    get statusIcon() {
        return this.connectionStatus.isConnected ? 'standard:success' : 'standard:error';
    }
    
    get connectionBadge() {
        return this.connectionStatus.isConnected ? 
            'slds-badge slds-theme_success' : 
            'slds-badge slds-theme_error';
    }
    
    get connectionText() {
        return this.connectionStatus.isConnected ? '✅ Connected to DOM' : '❌ Disconnected from DOM';
    }

    // Derived UI getters to avoid template expressions
    get lastActionText() {
        return this.connectionStatus.lastAction || 'N/A';
    }

    get messageChannelClass() {
        return this.subscriptionStatus.messageChannel ? 'slds-text-color_success' : 'slds-text-color_error';
    }

    get messageChannelText() {
        return this.subscriptionStatus.messageChannel ? '✅ Active' : '❌ Inactive';
    }

    get resizeListenerClass() {
        return this.subscriptionStatus.resizeListener ? 'slds-text-color_success' : 'slds-text-color_error';
    }

    get resizeListenerText() {
        return this.subscriptionStatus.resizeListener ? '✅ Active' : '❌ Inactive';
    }

    get visibilityListenerClass() {
        return this.subscriptionStatus.visibilityListener ? 'slds-text-color_success' : 'slds-text-color_error';
    }

    get visibilityListenerText() {
        return this.subscriptionStatus.visibilityListener ? '✅ Active' : '❌ Inactive';
    }

    get pollingClass() {
        return this.subscriptionStatus.pollingActive ? 'slds-text-color_success' : 'slds-text-color_error';
    }

    get pollingText() {
        return this.subscriptionStatus.pollingActive ? '🔄 Active (5s)' : '⏸️ Inactive';
    }

    get pollingButtonLabel() {
        return this.subscriptionStatus.pollingActive ? 'Stop Polling' : 'Start Polling';
    }
    
    get totalConnections() {
        return this.connectionStatus.connectionCount;
    }
    
    get timeInDOM() {
        if (this.performanceMetrics.connectedTime && !this.performanceMetrics.disconnectedTime) {
            return `${Date.now() - this.performanceMetrics.connectedTime}ms (active)`;
        } else if (this.performanceMetrics.totalTimeInDOM) {
            return `${this.performanceMetrics.totalTimeInDOM}ms`;
        }
        return 'N/A';
    }
    
    // Do's and Don'ts for UI
    get connectedCallbackDos() {
        return [
            '✅ Add attributes to host element',
            '✅ Set up event listeners (resize, visibility, etc.)',
            '✅ Subscribe to message channels',
            '✅ Initialize third-party libraries',
            '✅ Fetch initial data',
            '✅ Set up polling intervals',
            '✅ Validate required properties',
            '✅ Initialize cache',
            '✅ Perform environment checks'
        ];
    }
    
    get connectedCallbackDonts() {
        return [
            '❌ Don\'t assume single execution (can fire multiple times)',
            '❌ Don\'t access child elements (they don\'t exist yet)',
            '❌ Don\'t perform heavy synchronous operations',
            '❌ Don\'t forget to clean up in disconnectedCallback',
            '❌ Don\'t register listeners without cleanup',
            '❌ Don\'t rely on this.isConnected for critical operations',
            '❌ Don\'t start intervals without stopping them'
        ];
    }
    
    get disconnectedCallbackDos() {
        return [
            '✅ Clear all intervals and timeouts',
            '✅ Remove all event listeners',
            '✅ Unsubscribe from message channels',
            '✅ Disconnect observers (ResizeObserver, MutationObserver)',
            '✅ Clear caches',
            '✅ Remove host attributes',
            '✅ Clean up subscriptions',
            '✅ Nullify references for garbage collection'
        ];
    }
    
    // Handler methods
    handleSimulateReconnection() {
        // Simulate reconnection by forcing lifecycle
        this._addLog('info', '🔄 Simulating component reconnection', {
            currentConnection: this.connectionStatus.isConnected,
            willReconnect: true
        });

        if (!this.connectionStatus.isConnected) {
            // simulate connect
            this.connectedCallback();
        } else {
            // simulate a disconnect then reconnect
            this.disconnectedCallback();
            setTimeout(() => this.connectedCallback(), 100);
        }
    }
    
    handleTogglePolling() {
        if (this.subscriptionStatus.pollingActive) {
            if (this._pollingInterval) {
                clearInterval(this._pollingInterval);
                this._pollingInterval = null;
            }
            this.subscriptionStatus.pollingActive = false;
            this._addLog('info', 'Polling stopped manually');
        } else {
            this._startPolling();
        }
    }
    
    handleClearLogs() {
        this.eventLogs = [];
        this._addLog('info', 'Logs cleared manually');
    }
    
    handleShowData(event) {
        // Prefer event.currentTarget (the button with the listener).
        // Fall back to closest() in case of unexpected event shapes.
        const button = event.currentTarget || event.target.closest && event.target.closest('button');
        const logId = button?.dataset?.id;
        const log = this.eventLogs.find(l => l.id === parseInt(logId, 10));

        if (log && log.data) {
            // Show full data in an in-component modal instead of a truncated toast
            this.modalData = log.data;
            this.showDataModal = true;
        }
    }

    closeModal() {
        this.showDataModal = false;
        this.modalData = null;
    }
}