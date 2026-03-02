// addressForm.js
import { LightningElement, api } from 'lwc';

export default class AddressForm extends LightningElement {
    @api countryCode = 'US'; // Public property with default
    @api showPostalCode = false;
    @api formTitle = 'Address Information';
    
    @api 
    resetForm() {
        // Public method that parent can call
        const inputs = this.template.querySelectorAll('lightning-input');
        inputs.forEach(input => { input.value = ''; });
        this.showNotification('Form has been reset');
    }
    
    @api
    validateAndSubmit() {
        // Public method for parent-triggered validation
        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .every(input => !input.reportValidity?.());
            
        if (allValid) {
            this.dispatchEvent(new CustomEvent('addresssubmit', {
                detail: this.collectFormData()
            }));
        }
        return allValid;
    }
    
    showNotification(message) {
        // Internal method
        console.log('Notification:', message);
    }
    
    collectFormData() {
        // Internal data collection logic
        return {
            street: this.template.querySelector('input[data-field="street"]')?.value,
            city: this.template.querySelector('input[data-field="city"]')?.value,
            postalCode: this.template.querySelector('input[data-field="postalCode"]')?.value
        };
    }
}