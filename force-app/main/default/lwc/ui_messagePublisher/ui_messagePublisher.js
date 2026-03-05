import { LightningElement, wire } from 'lwc';

import { publish, MessageContext } from 'lightning/messageService';

import RECORD_CHANNEL from '@salesforce/messageChannel/RecordMessageChannel__c';

export default class Ui_messagePublisher extends LightningElement {

    @wire(MessageContext)
    messageContext;

    publishMessage() {

        const payload = {

            recordId: '001XXXXXXXXXXXX'

        };

        publish(this.messageContext, RECORD_CHANNEL, payload);

        console.log('Message published', payload.recordId);

    }

}