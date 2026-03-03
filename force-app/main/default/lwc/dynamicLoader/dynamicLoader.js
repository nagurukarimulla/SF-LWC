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
}