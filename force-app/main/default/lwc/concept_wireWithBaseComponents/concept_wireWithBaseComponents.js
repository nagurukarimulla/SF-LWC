import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

import FIRSTNAME_FIELD from '@salesforce/schema/Contact.FirstName';
import LASTNAME_FIELD from '@salesforce/schema/Contact.LastName';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';
import PHONE_FIELD from '@salesforce/schema/Contact.Phone';
import DESCRIPTION_FIELD from '@salesforce/schema/Contact.Description';

import STREET_FIELD from '@salesforce/schema/Contact.MailingStreet';
import CITY_FIELD from '@salesforce/schema/Contact.MailingCity';
import STATE_FIELD from '@salesforce/schema/Contact.MailingState';
import COUNTRY_FIELD from '@salesforce/schema/Contact.MailingCountry';
import POSTAL_FIELD from '@salesforce/schema/Contact.MailingPostalCode';

const FIELDS = [
    FIRSTNAME_FIELD,
    LASTNAME_FIELD,
    EMAIL_FIELD,
    PHONE_FIELD,
    DESCRIPTION_FIELD,
    STREET_FIELD,
    CITY_FIELD,
    STATE_FIELD,
    COUNTRY_FIELD,
    POSTAL_FIELD
];

export default class Concept_wireWithBaseComponents extends LightningElement {

    @api recordId;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    contact;

    get firstName() {
        return this.contact.data ? 
            this.contact.data.fields.FirstName?.value || '-' : 
            '-';
    }
    
    get lastName() {
        return this.contact.data ? 
            this.contact.data.fields.LastName?.value || '-' : 
            '-';
    }
    
    get email() {
        return this.contact.data ? 
            this.contact.data.fields.Email?.value || '-' : 
            '-';
    }
    
    get phone() {
        return this.contact.data ? 
            this.contact.data.fields.Phone?.value || '-' : 
            '-';
    }
    
    get description() {
        return this.contact.data ? 
            this.contact.data.fields.Description?.value || '-' : 
            '-';
    }

    get street() {
        const value = this.contact.data ? 
            this.contact.data.fields.MailingStreet?.value || '-' : 
            '-';
        console.log('📍 Street value:', value);
        return value;
    }
    
    get city() {
        const value = this.contact.data ? 
            this.contact.data.fields.MailingCity?.value || '-' : 
            '-';
        console.log('🏙️ City value:', value);
        return value;
    }
    
    get state() {
        const value = this.contact.data ? 
            this.contact.data.fields.MailingState?.value || '-' : 
            '-';
        console.log('🗺️ State value:', value);
        return value;
    }
    
    get country() {
        const value = this.contact.data ? 
            this.contact.data.fields.MailingCountry?.value || '-' : 
            '-';
        console.log('🌍 Country value:', value);
        return value;
    }
    
    get postal() {
        const value = this.contact.data ? 
            this.contact.data.fields.MailingPostalCode?.value || '-' : 
            '-';
        console.log('📮 Postal code value:', value);
        return value;
    }

    // Add a rendered callback to log all address values together
    renderedCallback() {
        if (this.contact?.data) {
            console.log('=== COMPLETE ADDRESS DATA ===');
            console.log('Street:', this.street);
            console.log('City:', this.city);
            console.log('State:', this.state);
            console.log('Country:', this.country);
            console.log('Postal:', this.postal);
            console.log('=============================');
        }
    }

    revenue = 500000;
    website = "https://salesforce.com";
    notes = "Enterprise customer with global operations";
    latitude = 37.7749;
    longitude = -122.4194;
    lastActivity = new Date();
    preferredTime = "13:45:00";
}