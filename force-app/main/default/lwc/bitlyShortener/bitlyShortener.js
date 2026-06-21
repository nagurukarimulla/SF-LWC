import { LightningElement, track } from 'lwc';
import shortenUrl from '@salesforce/apex/BitlyAPIService.shortenUrl';

export default class BitlyShortener extends LightningElement {
    @track longUrl = '';
    @track domain = 'bit.ly';
    @track groupGuid = '';
    @track shortenedLink = '';
    @track errorMessage = '';
    @track isLoading = false;

    handleUrlChange(event) {
        this.longUrl = event.target.value;
    }

    

    clearForm() {
        this.longUrl = '';
        this.domain = 'bit.ly';
        this.groupGuid = '';
        this.shortenedLink = '';
        this.errorMessage = '';
    }

    shortenUrl() {
        if (!this.longUrl) {
            this.errorMessage = 'Please enter a URL';
            return;
        }

        // Add https:// if missing
        let url = this.longUrl.trim();
        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.shortenedLink = '';

        // Call Apex with simple parameters
        shortenUrl({ 
            longUrl: url, 
            domain: this.domain, 
            groupGuid: this.groupGuid 
        })
        .then(result => {
            this.isLoading = false;
            console.log('Result: ', result);
            
            let response = JSON.parse(result);
            
            if (response.link) {
                this.shortenedLink = response.link;
            } else if (response.message) {
                this.errorMessage = response.message;
            } else {
                this.errorMessage = 'Unknown error occurred';
            }
        })
        .catch(error => {
            this.isLoading = false;
            this.errorMessage = error.body ? error.body.message : error.message;
            console.error('Error: ', error);
        });
    }

    copyToClipboard() {
        if (this.shortenedLink) {
            navigator.clipboard.writeText(this.shortenedLink);
            alert('Copied to clipboard!');
        }
    }
}