import { LightningElement, track } from 'lwc';

export default class Concept_inputComponents extends LightningElement {
    // Initialize all values to prevent undefined errors
    @track selectedRadio = 'monthly';
    @track selectedCheckboxes = [];
    @track selectedCountry = '';
    @track selectedDepartment = 'Sales';
    @track selectedSkills = [];
    @track sliderValue = 5;
    @track selectedAccount = '';

    // All option arrays
    radioOptions = [
        { label: 'Monthly', value: 'monthly' },
        { label: 'Yearly', value: 'yearly' }
    ];

    checkboxOptions = [
        { label: 'Salesforce', value: 'sf' },
        { label: 'Apex', value: 'apex' },
        { label: 'LWC', value: 'lwc' }
    ];

    countryOptions = [
        { label: 'India', value: 'india' },
        { label: 'USA', value: 'usa' },
        { label: 'UK', value: 'uk' },
        { label: 'Canada', value: 'canada' },
        { label: 'Australia', value: 'australia' }
    ];

    skills = [
        { label: 'Java', value: 'java' },
        { label: 'Python', value: 'python' },
        { label: 'Salesforce', value: 'sf' },
        { label: 'JavaScript', value: 'js' },
        { label: 'Apex', value: 'apex' }
    ];

    // Demo account options for the combobox
    accountOptions = [
        { label: 'Acme Corporation', value: 'acme' },
        { label: 'Global Media', value: 'global' },
        { label: 'Tech Solutions', value: 'tech' },
        { label: 'Innovation Labs', value: 'innovation' }
    ];

    departmentOptions = [
    { label: 'Sales', value: 'Sales' },
    { label: 'Marketing', value: 'Marketing' },
    { label: 'Support', value: 'Support' }
];

    // Event handler for file upload
    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        console.log('Files uploaded:', uploadedFiles);
        // Show a toast or alert for demo purposes
        this.showNotification('Success', 'File uploaded successfully (demo mode)', 'success');
    }

    // Helper method for notifications (optional)
    showNotification(title, message, variant) {
        // You can implement toast notifications here if needed
        console.log(`${title}: ${message} (${variant})`);
    }

    // Lifecycle hook to log when component is loaded
    connectedCallback() {
        console.log('Input Components component loaded successfully');
    }
}