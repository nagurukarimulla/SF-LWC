import { LightningElement, track } from 'lwc';
import getHolidays from '@salesforce/apex/HolidayAPIController.getHolidays';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class HolidayExplorer extends LightningElement {

    countryCode = 'IN';
    year = new Date().getFullYear();

    isLoading = false;

    @track holidays = [];

    columns = [
        {
            label: 'Holiday',
            fieldName: 'name',
            type: 'text'
        },
        {
            label: 'Date',
            fieldName: 'date',
            type: 'date'
        },
        {
            label: 'Observed',
            fieldName: 'observed',
            type: 'date'
        },
        {
            label: 'Public Holiday',
            fieldName: 'public',
            type: 'boolean'
        },
        {
            label: 'Country',
            fieldName: 'country',
            type: 'text'
        }
    ];

    get holidayCount() {
        return this.holidays?.length;
    }

    handleCountryChange(event) {
        this.countryCode = event.target.value;
    }

    handleYearChange(event) {
        this.year = event.target.value;
    }

    async loadHolidays() {

        try {

            this.isLoading = true;

            const result = await getHolidays({
                countryCode: this.countryCode,
                yearValue: this.year.toString()
            });

            console.log('Holiday API raw result:', result);
            const response = JSON.parse(result);
            console.log('Holiday API parsed response:', response);

            this.holidays = response.holidays || [];

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: `${this.holidays.length} holidays loaded`,
                    variant: 'success'
                })
            );

        } catch(error) {

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message:
                        error.body?.message ||
                        error.message,
                    variant: 'error'
                })
            );

        } finally {
            this.isLoading = false;
        }
    }
}