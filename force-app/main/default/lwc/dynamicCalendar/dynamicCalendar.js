import { LightningElement } from 'lwc';
import { getCalendarService } from 'lightning/mobileCapabilities';

export default class DynamicCalendar extends LightningElement {

    calendarService;

    // Status UI
    isCalendarAvailable = false;
    serviceMessage = '';
    serviceClass = '';

    // Form Fields
    eventTitle = '';
    startDate = '';
    endDate = '';
    location = '';
    notes = '';

 connectedCallback() {

    try {

        this.calendarService = getCalendarService();

        this.serviceMessage =
            'Service Object Created Successfully';

        this.isCalendarAvailable =
            this.calendarService.isAvailable();

        if(this.isCalendarAvailable) {

            this.serviceMessage +=
                ' | Calendar API Supported';

        } else {

            this.serviceMessage +=
                ' | Calendar API NOT Supported';
        }

    } catch(error) {

        this.serviceMessage =
            'Initialization Error: ' +
            JSON.stringify(error);
    }
}

    handleInputChange(event) {

        const field = event.target.dataset.field;

        this[field] = event.target.value;
    }

    async handleAddToCalendar() {

        if (!this.isCalendarAvailable) {

            this.showAlert(
                'Calendar Service is unavailable.'
            );

            return;
        }

        if (!this.eventTitle ||
            !this.startDate ||
            !this.endDate) {

            this.showAlert(
                'Please fill required fields.'
            );

            return;
        }

        try {

            const calendars =
                await this.calendarService.getCalendars({
                    span: 'ThisEvent'
                });

            if (!calendars.length) {

                this.showAlert(
                    'No device calendars found.'
                );

                return;
            }

            const selectedCalendar = calendars[0];

            const eventData = {

                title: this.eventTitle,

                location: this.location,

                notes: this.notes,

                isAllDay: false,

                startDateSecondsUTC: Math.floor(
                    new Date(this.startDate).getTime() / 1000
                ),

                endDateSecondsUTC: Math.floor(
                    new Date(this.endDate).getTime() / 1000
                ),

                availability: 'Busy',

                calendarId: selectedCalendar.id
            };

            await this.calendarService.addEvent(
                eventData,
                {
                    span: 'ThisEvent'
                }
            );

            this.showAlert(
                'Event Added Successfully!'
            );

            this.clearForm();

        } catch (error) {

            this.showAlert(
                'Error: ' +
                (error.message || JSON.stringify(error))
            );
        }
    }

    showAlert(message) {

        alert(message);
    }

    clearForm() {

        this.eventTitle = '';
        this.startDate = '';
        this.endDate = '';
        this.location = '';
        this.notes = '';
    }
}