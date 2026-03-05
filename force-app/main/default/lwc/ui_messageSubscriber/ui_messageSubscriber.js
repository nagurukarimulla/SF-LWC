import { LightningElement, wire } from 'lwc';

import { subscribe, MessageContext } from 'lightning/messageService';

import RECORD_CHANNEL from '@salesforce/messageChannel/RecordMessageChannel__c';

export default class Ui_messageSubscriber extends LightningElement {

    recordId;

    subscription;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {

        this.subscribeToChannel();

    }

    subscribeToChannel() {

        this.subscription = subscribe(

            this.messageContext,

            RECORD_CHANNEL,

            (message) => {

                this.recordId = message.recordId;

                console.log('Message received:', message.recordId);

            }

        );

    }

}