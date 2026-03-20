import { LightningElement } from 'lwc';

export default class Concept_relatedListSortChecker extends LightningElement {
    selectedObject = '';

    // List of standard objects that DON'T support multiple-column sort
    unsupportedObjects = [
        'AccountBrand', 'AccountInsight', 'AccountTeamMember', 'AccountUserTerritory2View',
        'AcctMgrTarget', 'ActionableListMemberStatus', 'ActionCadence', 'ActionPlan',
        'ActivationTarget', 'ActivityHistory', 'ActnblListKeyPrfmIndAsgnt', 'AdSpaceGroupMember',
        'AdvAcctForecastFactAdj', 'AdvAcctForecastSetPartner', 'AdvAcctForecastSetUse',
        'AlternativePaymentMethod', 'AppAnalyticsDeliveryConfig', 'AppExtension', 'AppMenuItem',
        'ApptBundleAggrPolicy', 'ApptBundlePropagatePolicy', 'AssetWarranty', 'AttachedContentNote',
        'BatchJob', 'BatchJobPart', 'BillingPeriodTaxItem', 'BusinessHours', 'BusinessUnitMember',
        'BuyerGroupMember', 'CallTemplate', 'Campaign', 'CampaignInfluence', 'CampaignMember',
        'CardPaymentMethod', 'CartItemPriceAdjustment', 'CartValidationOutput', 'CaseComment',
        'CaseFileProcessDependency', 'CaseFileProcessExecution', 'ChannelObjectLinkingRule',
        'CleanRule', 'CollaborationGroup', 'CommerceEntitlementBuyerGroup', 'CommerceEntitlementPolicy',
        'CommerceEntitlementProduct', 'CompiledProduct', 'ContactPointEmail', 'ContactPointPhone',
        'ContactRequest', 'ContactSuggestionInsight', 'ContentDocument', 'ContentNote',
        'ContentVersion', 'ContentWorkspace', 'ConversationBroadcast', 'CryptoTransEnvelopeChgSnp',
        'CspTrustedSite', 'Dashboard', 'DataConnectorS3', 'DataLakeObjectInstance', 'DataSpace',
        'DataStream', 'DefinedSkill', 'DelegatedAccount', 'DigitalWallet', 'Disclosure',
        'DisclosureDefinition', 'DisclosureDefinitionVersion', 'DisclosureType', 'DocumentChecklistItem',
        'DsarPolicyLog', 'DuplicateRecordItem', 'DuplicateRecordSet', 'ECart', 'EmailContent',
        'EmailMessage', 'EmailTemplate', 'EmbeddedServiceConfig', 'EmbeddedServiceLiveAgent',
        'EmbeddedServiceMenuSettings', 'EnablementMeasureDefinition', 'EnablementProgram',
        'EngagementProgram', 'EnhancedEmailTemplate', 'EnhancedLetterhead', 'EnqueueOrderSummary',
        'EnvironmentHubMember', 'Event', 'ExplainabilityMsgTemplate', 'ExpressionSetView',
        'ExtDataShare', 'ExtDataShareTarget', 'FavoriteConfiguration', 'FeedItem',
        'FieldServiceMobileExtension', 'FieldServiceMobileSettings', 'FlowDefinitionView',
        'FlowInterview', 'FlowOrchestrationLog', 'Folder', 'FtestAllContactPoint',
        'FtestApplication2CInterface', 'FtestContactPointEmail', 'FtestContactPointPhone',
        'GenericAsmtTaskContext', 'GenericAssessmentTask', 'GnrcAsmtTaskContextRela', 'Holiday',
        'IdentityResolution', 'Individual', 'IPAddressRange', 'LandingPage', 'LearnerSkill',
        'LearningItem', 'ListEmail', 'ListEmailSentResult', 'LiveChatSensitiveDataRule',
        'LiveChatTranscript', 'Location', 'LocWaitlistMsgTemplate', 'LoyaltyProgramBadge',
        'LoyaltyProgramPartnerLedger', 'LoyaltyProgramProcessParameter', 'LoyaltyProgramProcessRule',
        'Macro', 'ManagedContentVariant', 'ManufacturingProgram', 'MarketingAppExtAction',
        'MarketingAppExtActivity', 'MarketingAppExtAssignment', 'MarketingAppExtension',
        'MarketSegment', 'MarketSegmentActivation', 'MessagingChannel', 'MessagingDeliveryError',
        'MessagingSession', 'MessagingTemplate', 'MfgProgramCpntFrcstFact', 'MfgProgramForecastFact',
        'MfgProgramVariantFrcstFact', 'MktAiPredictiveInsight', 'MktCalculatedInsight',
        'MktDataTransform', 'MktMLModel', 'MobileSettingsAssignment', 'MsgChannelLanguageKeyword',
        'NetworkReferencedObject', 'ObjectTerritory2Association', 'ObjectUserTerritory2View',
        'OpenActivity', 'OpportunityContactRole', 'OpportunityContactRoleSuggestionInsight',
        'OpportunityHistory', 'OpportunityInsight', 'OpportunityLineItem', 'OpportunityLineItemSchedule',
        'OpportunityPartner', 'OpportunitySplit', 'OpportunityTeamMember', 'OrderAdjustmentAggregateSummary',
        'OrderItem', 'OrderItemSummary', 'OrderSummary', 'Payment', 'PaymentActivity',
        'PaymentAuthorization', 'PaymentGatewayProvider', 'PendingOrderSummary', 'PersonListMember',
        'PgmRebateTypBnftMapping', 'PriceAdjustmentTier', 'PriceBookPriceGuidance', 'PriceRule',
        'PrivacyJobSession', 'ProcessException', 'ProcessInstanceHistory', 'ProcessInstanceStep',
        'ProcessInstanceWorkitem', 'ProductAttributeSet', 'ProductAttributeSetItem', 'ProductCategory',
        'ProductRelatedMaterial', 'ProductTransfer', 'ProfileSkill', 'ProfileSkillUser', 'Promotion',
        'PublicKeyCertificate', 'PublicKeyCertificateSet', 'QuickText', 'QuoteAdjustmentGroup',
        'QuoteDocument', 'QuoteLineItem', 'RebatePayoutSnapshot', 'Recommendation',
        'RecordAlertTemplate', 'RecordMergeHistory', 'RecordsetFilterCriteriaRule', 'Refund',
        'RegulatoryTrxnFee', 'RelationshipGraphView', 'Report', 'SalesAgreement',
        'SalesAgreementStatus', 'SalesforceContract', 'SalesforceInvoice', 'SalesforcePayment',
        'SalesforceQuote', 'SharingRecordCollectionItem', 'ShiftTemplate', 'SiqExchangeConnection',
        'Skill', 'Snippet', 'SnippetAssignment', 'SocialPost', 'SurveyEmailBranding',
        'SurveyInvitation', 'SurveyQuestion', 'SurveyVersion', 'SvcCatalogItemDef', 'TagCategory',
        'Task', 'TaxCertificate', 'TimelineObjectDefinition', 'TimeSheetTemplate', 'Topic',
        'TopicAssignment', 'UhsCategorySyncState', 'UnifiedActivity', 'UnitOfMeasureUnit',
        'User', 'UserAppMenuItem', 'UserDefinedLabel', 'UserRole', 'UserTerritory2AssocLog',
        'WebCart', 'WebCartAdjustmentBasis', 'WebCartAdjustmentGroup', 'WebCartDocument',
        'WebStore', 'WorkPlan', 'WorkSkillRouting', 'WorkStep', 'WorkStepTemplate'
    ];

    standardObjectOptions = [
        { label: 'Account', value: 'Account' },
        { label: 'Contact', value: 'Contact' },
        { label: 'Opportunity', value: 'Opportunity' },
        { label: 'Case', value: 'Case' },
        { label: 'Campaign', value: 'Campaign' },
        { label: 'Task', value: 'Task' },
        { label: 'Event', value: 'Event' },
        { label: 'User', value: 'User' },
        { label: 'Report', value: 'Report' },
        { label: 'Dashboard', value: 'Dashboard' }
    ];

    get unsupportedCount() {
        return this.unsupportedObjects.length;
    }

    get isSupported() {
        return !this.unsupportedObjects.includes(this.selectedObject);
    }

    get isNotSupported() {
        return this.unsupportedObjects.includes(this.selectedObject);
    }

    handleObjectChange(event) {
        this.selectedObject = event.detail.value;
    }
}