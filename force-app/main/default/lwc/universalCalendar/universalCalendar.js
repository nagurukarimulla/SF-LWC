import { LightningElement } from 'lwc';
export default class UniversalCalendar extends LightningElement {

    eventTitle = '';
    startDate = '';
    endDate = '';
    location = '';
    notes = '';

    handleInputChange(event) {

        const field = event.target.dataset.field;

        this[field] = event.target.value;
    }

    validateFields() {

        if (!this.eventTitle ||
            !this.startDate ||
            !this.endDate) {

            alert('Please fill all required fields.');

            return false;
        }

        return true;
    }

    formatDate(dateString) {

        const date = new Date(dateString);

        return date
            .toISOString()
            .replace(/-|:|\.\d+/g, '');
    }

    openGoogleCalendar() {

        if (!this.validateFields()) {
            return;
        }

        const start = this.formatDate(this.startDate);

        const end = this.formatDate(this.endDate);

        const url =
            `https://calendar.google.com/calendar/render?action=TEMPLATE` +
            `&text=${encodeURIComponent(this.eventTitle)}` +
            `&dates=${start}/${end}` +
            `&details=${encodeURIComponent(this.notes)}` +
            `&location=${encodeURIComponent(this.location)}`;

        window.open(url, '_blank');
    }

    openOutlookCalendar() {

        if (!this.validateFields()) {
            return;
        }

        const url =
            `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose` +
            `&subject=${encodeURIComponent(this.eventTitle)}` +
            `&startdt=${encodeURIComponent(this.startDate)}` +
            `&enddt=${encodeURIComponent(this.endDate)}` +
            `&body=${encodeURIComponent(this.notes)}` +
            `&location=${encodeURIComponent(this.location)}`;

        window.open(url, '_blank');
    }
clearForm() {

    this.eventTitle = '';

    this.startDate = '';

    this.endDate = '';

    this.location = '';

    this.notes = '';
}
}