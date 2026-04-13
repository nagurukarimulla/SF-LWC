import { LightningElement, wire,api } from 'lwc';
import { getNavItems } from 'lightning/uiAppsApi';
import FORM_FACTOR from '@salesforce/client/formFactor';

export default class Concept_getNavItems extends LightningElement {
    @api tabs; // optional filter
    navItems = [];
    error;
    formFactor = FORM_FACTOR;

    @wire(getNavItems, {
        formFactor: FORM_FACTOR,
        navItemNames: '$tabs',
        pageSize: 30
    })
    wiredNavItems({ data, error }) {
        if (data) {
            this.navItems = data.navItems;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.navItems = [];
        }
    }

    get totalItems() {
        return this.navItems.length;
    }
}