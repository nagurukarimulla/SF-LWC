import { LightningElement, api } from 'lwc';

export default class DynamicLoader extends LightningElement {

    @api selectedComponent;

    get isWire() {
        return this.selectedComponent === 'wireExample';
    }

    get isImperative() {
        return this.selectedComponent === 'imperativeApex';
    }

    get isLds() {
        return this.selectedComponent === 'ldsExample';
    }
    get isRiskEvaluator() {
    return this.selectedComponent === 'concept_imperativeRiskEvaluator';
}
get isWireRevenue() {
    return this.selectedComponent === 'concept_wireRevenueAnalytics';
}
get isExposeApexStructuredService() {
    return this.selectedComponent === 'concept_exposeApexStructuredService';
}
get isDeclarativeMultiEvent() {
    return this.selectedComponent === 'concept_declarativeMultiEventBinding';
}
get isDynamicEventStrategySwitching() {
    return this.selectedComponent === 'concept_dynamicEventStrategySwitching';
}
get isImperativeEventListenerRegistration() {
    return this.selectedComponent ===
        'concept_imperativeEventListenerRegistration';
}
get isEventListenerScopeAndTarget() {
    return this.selectedComponent === 'concept_eventListenerScopeAndTarget';
}
get isEventRetargeting() {
    return this.selectedComponent === 'concept_eventRetargeting';
}
get isEventTargetVsCurrentTarget() {
    return this.selectedComponent ===
        'concept_eventTargetVsCurrentTarget';
}
get isInputChangeHandling() {
    return this.selectedComponent === 'concept_inputChangeHandling';
}
get isRemoveEventListeners() {
    return this.selectedComponent === 'concept_removeEventListeners';
}
get isConfigureEventPropagation() {
    return this.selectedComponent ===
        'concept_configureEventPropagation';
}
get isEventDefaultPropagation() {
    return this.selectedComponent === 'concept_eventDefaultPropagation';
}
}