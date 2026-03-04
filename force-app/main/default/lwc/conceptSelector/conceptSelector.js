import { LightningElement, track } from 'lwc';

export default class ConceptSelector extends LightningElement {

    @track searchKey = '';

    concepts = [
        { label: 'Wire Example', value: 'wireExample' },
        {label: 'Default Event Propagation',value: 'concept_eventDefaultPropagation'},
        {label: 'Configure Event Propagation', value: 'concept_configureEventPropagation'},
        {label: 'Remove Event Listeners', value: 'concept_removeEventListeners'},
        {label: 'Input Change Handling',value: 'concept_inputChangeHandling'},
        {label: 'Event Target vs CurrentTarget',value: 'concept_eventTargetVsCurrentTarget'},
        {label: 'Event Retargeting',value: 'concept_eventRetargeting'},
        {label: 'Event Listener Scope and Event Target',value: 'concept_eventListenerScopeAndTarget'},
        
        {label: 'Imperative Event Listener Registration', value: 'concept_imperativeEventListenerRegistration'},
        { label: 'Dynamic Event Strategy Switching', value: 'concept_dynamicEventStrategySwitching' },
        { label: 'Declarative Multi Event Binding', value: 'concept_declarativeMultiEventBinding' },
        { label: 'Imperative – Risk Evaluator', value: 'concept_imperativeRiskEvaluator' },
        { label: 'Wire – Revenue Analytics', value: 'concept_wireRevenueAnalytics' },
        { label: 'Expose Apex – Structured Service', value: 'concept_exposeApexStructuredService' },
        { label: 'LDS Example', value: 'ldsExample' },
        { label: 'Parent Child', value: 'parentChildExample' },
        { label: 'Lifecycle Hooks', value: 'lifecycleHooks' }
    ];

    get filteredConcepts() {
        return this.concepts.filter(item =>
            item.label.toLowerCase().includes(this.searchKey.toLowerCase())
        );
    }

    handleSearch(event) {
        this.searchKey = event.target.value;
    }

    selectConcept(event) {
        const selected = event.currentTarget.dataset.value;

        this.dispatchEvent(
            new CustomEvent('conceptselect', {
                detail: selected
            })
        );
    }
}