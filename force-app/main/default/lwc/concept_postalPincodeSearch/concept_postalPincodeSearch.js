import { LightningElement, track } from 'lwc';

import searchByPincode from '@salesforce/apex/PostalPincodeController.searchByPincode';
import searchByPostOffice from '@salesforce/apex/PostalPincodeController.searchByPostOffice';

export default class PostalPincodeSearch extends LightningElement {

    @track records = [];
    @track errorMessage = '';
    @track isLoading = false;

    searchType = 'pincode';
    searchValue = '';

    columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'PIN Code', fieldName: 'Pincode' },
        { label: 'Branch Type', fieldName: 'BranchType' },
        { label: 'Delivery Status', fieldName: 'DeliveryStatus' },
        { label: 'District', fieldName: 'District' },
        { label: 'State', fieldName: 'State' },
        { label: 'Country', fieldName: 'Country' }
    ];

    get searchOptions() {
        return [
            { label: 'Search By PIN Code', value: 'pincode' },
            { label: 'Search By Post Office', value: 'postoffice' }
        ];
    }

    get inputLabel() {
        return this.searchType === 'pincode'
            ? 'Enter PIN Code'
            : 'Enter Post Office Name';
    }

    handleTypeChange(event) {
        this.searchType = event.detail.value;
        this.searchValue = '';
        this.records = [];
        this.errorMessage = '';
    }

    handleInputChange(event) {
        this.searchValue = event.target.value;
    }

    async handleSearch() {

        this.isLoading = true;
        this.errorMessage = '';
        this.records = [];

        try {

            let result;

            if(this.searchType === 'pincode') {

                result = await searchByPincode({
                    pincode: this.searchValue
                });

            } else {

                result = await searchByPostOffice({
                    postOfficeName: this.searchValue
                });
            }

            this.records = result;

        } catch(error) {

            this.errorMessage =
                error?.body?.message || 'Unknown Error';

        } finally {

            this.isLoading = false;
        }
    }
}