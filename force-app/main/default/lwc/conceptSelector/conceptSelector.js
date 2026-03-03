import { LightningElement, track } from 'lwc';

export default class ConceptSelector extends LightningElement {

    @track searchKey = '';

    concepts = [
        { label: 'Wire Example', value: 'wireExample' },
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