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
    get isEventBubbleInternal() {
        return this.selectedComponent === 'concept_eventBubbleInternal';
    }
    get isEventFullPropagation() {
        return this.selectedComponent === 'concept_eventFullPropagation';
    }
    get isLightningMessageService() {
        return this.selectedComponent === 'concept_lightningMessageService';
    }
    get isWireProperty() {
        return this.selectedComponent === 'concept_wireProperty';
    }
    get isWireFunction() {
        return this.selectedComponent === 'concept_wireFunction';
    }
    get isWireReactiveConfig() {
        return this.selectedComponent === 'concept_wireReactiveConfig';
    }
    get isImportSchemaReferences() {
        return this.selectedComponent === 'concept_importSchemaReferences';
    }
    get isWireWithBaseComponents() {
        return this.selectedComponent === 'concept_wireWithBaseComponents';
    }
    get isApexImperativeWithParams() {
        return this.selectedComponent === 'concept_apexImperativeWithParams';
    }
    get isPassValuesToApex() {
        return this.selectedComponent === 'concept_passValuesToApex';
    }
    get isApexClientCaching() {
        return this.selectedComponent === 'concept_apexClientCaching';
    }
    get isRefreshApexCache() {
        return this.selectedComponent === 'concept_refreshApexCache';
    }
    get isRefreshWiredProperty() {
        return this.selectedComponent === 'concept_refreshWiredProperty';
    }
    get isRefreshWiredFunction() {
        return this.selectedComponent === 'concept_refreshWiredFunction';
    }
    get isApexSchemaImport(){

return this.selectedComponent === 'concept_apexSchemaImport';

}
get isActionMenuComponents() {
return this.selectedComponent === 'concept_actionMenuComponents';
}
get isContainerComponents(){
        return this.selectedComponent === 'concept_containerComponents';
    }
    get isVisualComponents(){
return this.selectedComponent === 'concept_visualComponents';
}
get isInputComponents(){
return this.selectedComponent === 'concept_inputComponents';
}
get isRecordForms(){
return this.selectedComponent === 'concept_enterpriseRecordForms';
}
get isNavigation(){
return this.selectedComponent === 'concept_enterpriseNavigation';
}
get isNotifications(){
return this.selectedComponent === 'concept_enterpriseNotifications';
}
get isProgress(){
return this.selectedComponent === 'concept_enterpriseProgress';
}
get isTablesTrees(){
return this.selectedComponent === 'concept_enterpriseTablesTrees';
}
get isUtilities(){
return this.selectedComponent === 'concept_enterpriseUtilities';
}
get isFfLibFramework() {
        return this.selectedComponent === 'concept_ffLibFramework';
    }
 get isFflibSendCases(){
return this.selectedComponent === 'concept_fflibSendCases';
}
get isCursor(){
return this.selectedComponent === 'concept_apexCursorMonitor';
}
get isPaginationCursor(){
return this.selectedComponent === 'concept_apexPaginationCursor';
}
get isCreateRecord(){
return this.selectedComponent === 'concept_dynamicRecordCreator';
}
}

