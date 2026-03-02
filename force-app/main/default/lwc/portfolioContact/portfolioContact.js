import { LightningElement, track } from 'lwc';
import createLead from '@salesforce/apex/PortfolioController.createLead';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PortfolioContact extends LightningElement {
    @track name = '';
    @track email = '';
    @track message = '';

    createLead() {
        // Validate form fields
        if (!this.name || !this.email || !this.message) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please fill in all fields',
                    variant: 'error'
                })
            );
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please enter a valid email address',
                    variant: 'error'
                })
            );
            return;
        }

        createLead({
            name: this.name,
            email: this.email,
            message: this.message
        })
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Message sent successfully!',
                    variant: 'success',
                    mode: 'dismissable'
                })
            );
            // Clear form
            this.name = '';
            this.email = '';
            this.message = '';
            
            // Reset form fields
            const inputs = this.template.querySelectorAll('lightning-input, lightning-textarea');
            inputs.forEach(input => {
                input.value = '';
            });
        })
        .catch(error => {
            console.error('Error:', error);
            let errorMessage = 'An error occurred. Please try again.';
            
            if (error.body && error.body.message) {
                errorMessage = error.body.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: errorMessage,
                    variant: 'error'
                })
            );
        });
    }

    handleName(event) { 
        this.name = event.target.value; 
    }
    
    handleEmail(event) { 
        this.email = event.target.value; 
    }
    
    handleMessage(event) { 
        this.message = event.target.value; 
    }

    download() {
    const link = document.createElement('a');
    link.href = '/resource/KarimResume'; 
    link.download = 'Naguru_Karimulla_Resume.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.dispatchEvent(
        new ShowToastEvent({
            title: 'Success',
            message: 'Resume downloaded successfully!',
            variant: 'success'
        })
    );
}
}