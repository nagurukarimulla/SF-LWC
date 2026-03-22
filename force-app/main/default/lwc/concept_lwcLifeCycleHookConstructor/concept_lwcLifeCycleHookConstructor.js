import { LightningElement, track, api } from 'lwc';

export default class Concept_lwcLifeCycleHookConstructor extends LightningElement {
    // Public properties
    @api componentId;
    @api debugMode = false;
    @api requiredProps = ['recordId', 'objectName'];
    
    // Tracked properties for UI
    @track constructorLogs = [];
    @track initializationStatus = {
        started: false,
        completed: false,
        timestamp: null,
        errors: []
    };
    
    // Private properties
    _privateConfig = null;
    _startTime = null;
    _validationResults = null;
    
    constructor() {
        // ✅ DO: First statement MUST be super() with no parameters
        super();
        
        // ✅ DO: Track initialization start time
        this._startTime = Date.now();
        
        // ✅ DO: Initialize private properties
        this._privateConfig = {
            version: '1.0.0',
            environment: 'production',
            features: ['analytics', 'logging', 'validation']
        };
        
        // ✅ DO: Set up internal state
        this.initializationStatus.started = true;
        this.initializationStatus.timestamp = new Date().toISOString();
        
        // ✅ DO: Log constructor execution
        this._addLog('info', 'Constructor invoked', {
            timestamp: this.initializationStatus.timestamp,
            config: this._privateConfig
        });
        
        // ✅ DO: Perform validation of required setup
        this._validateEnvironment();
        
        // ✅ DO: Set up early return for debug mode
        if (this.debugMode) {
            this._addLog('debug', 'Debug mode enabled - early return pattern used');
            return; // ✅ DO: Simple early return is allowed
        }
        
        // ✅ DO: Initialize data structures
        this._validationResults = {
            checks: [],
            passed: true
        };
        
        // ✅ DO: Set default values for future use
        this._pendingOperations = new Map();
        this._subscriptions = new Set();
        
        // ❌ DON'T: Access @api properties (they're not set yet)
        // This would log undefined - we'll demonstrate this in UI
        this._addLog('warning', '⚠️ @api properties not accessible yet', {
            componentId: this.componentId, // Will be undefined
            message: 'Properties are set after constructor completes'
        });
        
        // ❌ DON'T: Access DOM elements
        try {
            const host = this; // this is available but host element not fully ready
            this._addLog('info', 'Host element exists but not fully constructed');
        } catch (e) {
            this._addLog('error', 'DOM access attempted', e);
        }
        
        // ❌ DON'T: Add attributes to host element
        // This would be unreliable - we'll demonstrate the correct approach
        // this.classList.add('constructor-class'); // DON'T DO THIS
        
        // ✅ DO: Complete initialization
        this.initializationStatus.completed = true;
    }
    
    // Helper method to add logs
    _addLog(level, message, data = null) {
        const logEntry = {
            id: this.constructorLogs.length + 1,
            level,
            message,
            data: data ? JSON.stringify(data, null, 2) : null,
            timestamp: new Date().toISOString(),
            phase: 'constructor'
        };
        
        this.constructorLogs = [...this.constructorLogs, logEntry];
        
        // Console output for debugging
        const consoleMethod = level === 'error' ? 'error' : 
                             level === 'warning' ? 'warn' : 
                             level === 'debug' ? 'debug' : 'log';
        console[consoleMethod](`[Constructor] ${message}`, data || '');
    }
    
    _validateEnvironment() {
        // ✅ DO: Environment validation in constructor
        const checks = [
            { name: 'Browser Support', passed: typeof window !== 'undefined' },
            { name: 'ES6 Features', passed: typeof Map !== 'undefined' },
            { name: 'LWC Context', passed: !!this.template }
        ];
        
        checks.forEach(check => {
            if (!check.passed) {
                this._addLog('error', `Environment check failed: ${check.name}`);
                this.initializationStatus.errors.push(check.name);
            } else {
                this._addLog('debug', `Environment check passed: ${check.name}`);
            }
        });
    }
    
    // ✅ DO: Expose constructor info for parent components
    @api
    getConstructorInfo() {
        return {
            initialized: this.initializationStatus.completed,
            startTime: this._startTime,
            config: this._privateConfig,
            logs: this.constructorLogs
        };
    }
    
    // ✅ DO: Get validation results
    @api
    getValidationResults() {
        return this._validationResults;
    }
    
    // ✅ DO: Provide method to check if properties are ready
    @api
    isReady() {
        return this.initializationStatus.completed && 
               this.componentId !== undefined;
    }
    
    // Getter for UI to show current state
    get statusSummary() {
        return {
            ...this.initializationStatus,
            duration: this._startTime ? `${Date.now() - this._startTime}ms` : 'N/A',
            config: this._privateConfig
        };
    }
    
    // Getter to demonstrate property access timing
    get propertyAccessStatus() {
        return {
            componentId: this.componentId || '⚠️ Not yet available (set after constructor)',
            debugMode: this.debugMode || '⚠️ Not yet available',
            timestamp: new Date().toISOString()
        };
    }
    
    // Getter to show constructor limitations
    get constructorLimitations() {
        return [
            '❌ Cannot access @api properties',
            '❌ Cannot access child elements',
            '❌ Cannot add attributes to host element',
            '❌ Cannot use document.write() or document.open()',
            '❌ Cannot return values (except early return)',
            '✅ Can initialize private properties',
            '✅ Can set up internal data structures',
            '✅ Can perform environment validation'
        ];
    }
    
    // Getter to show best practices
    get constructorBestPractices() {
        return [
            '✅ Always call super() as first statement',
            '✅ Initialize private properties and data structures',
            '✅ Perform environment validation',
            '✅ Use early returns for debug/special cases',
            '✅ Log constructor execution for debugging',
            '✅ Set up configuration defaults',
            '✅ Don\'t access DOM or @api properties'
        ];
    }

     handleRefresh() {
        this._addLog('info', 'Manual refresh triggered', {
            timestamp: new Date().toISOString(),
            componentState: {
                initialized: this.initializationStatus.completed,
                hasComponentId: !!this.componentId
            }
        });
        
        // Show current state
        const currentState = {
            properties: {
                componentId: this.componentId,
                debugMode: this.debugMode
            },
            status: this.initializationStatus
        };
        
        this._addLog('debug', 'Current component state', currentState);
    }
    
    handleSimulatePropertyAccess() {
        // Simulate what would happen if we tried to access properties in constructor
        this._addLog('warning', '⚠️ Property Access Simulation', {
            scenario: 'If accessed in constructor:',
            componentId: 'undefined (not set yet)',
            debugMode: 'false (default value only)',
            message: 'Properties are NOT available during construction phase'
        });
        
        // Show alert for educational purposes
        const alertMessage = [
            '⚠️ Property Access During Constructor Demo',
            '',
            'If you tried to access @api properties in constructor:',
            '- componentId would be: undefined',
            '- debugMode would be: false (default)',
            '',
            'Properties are only set AFTER constructor completes',
            'and BEFORE connectedCallback() executes.'
        ].join('\n');
        
        // eslint-disable-next-line no-alert
        alert(alertMessage);
    }
    
    handleClearLogs() {
        this.constructorLogs = [];
        this._addLog('info', 'Logs cleared manually');
    }
    
    handleShowData(event) {
        const button = event.target.closest('button');
        const logId = button?.dataset.id;
        const log = this.constructorLogs.find(l => l.id === parseInt(logId));
        
        if (log && log.data) {
            // eslint-disable-next-line no-alert
            alert(`Data from constructor:\n${log.data}`);
        }
    }
    
    // Computed getter for status icon
    get statusIcon() {
        return this.initializationStatus.completed ? 
            'standard:success' : 
            'standard:error';
    }
    
    // Getter for property access status
    get propertyAccessStatus() {
        return {
            componentId: this.componentId || '⚠️ Not available in constructor',
            debugMode: this.debugMode || '⚠️ Not available',
            timestamp: new Date().toISOString()
        };
    }
}