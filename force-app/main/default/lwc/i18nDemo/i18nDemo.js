import { LightningElement } from "lwc";
import LANG from "@salesforce/i18n/lang";
import DIR from "@salesforce/i18n/dir";
import LOCALE from "@salesforce/i18n/locale";
import CURRENCY from "@salesforce/i18n/currency";
import TIMEZONE from "@salesforce/i18n/timeZone";
import FIRSTDAYOFWEEK from "@salesforce/i18n/firstDayOfWeek";
import SHORT_DATE_FORMAT from "@salesforce/i18n/dateTime.shortDateFormat";
import LONG_DATE_FORMAT from "@salesforce/i18n/dateTime.longDateFormat";
import CURRENCY_FORMAT from "@salesforce/i18n/number.currencyFormat";
import CURRENCY_SYMBOL from "@salesforce/i18n/number.currencySymbol";
import PERCENT_FORMAT from "@salesforce/i18n/number.percentFormat";

export default class I18nDemo extends LightningElement {
    // Store internationalization properties as component properties
    lang = LANG;
    dir = DIR;
    locale = LOCALE;
    currency = CURRENCY;
    timeZone = TIMEZONE;
    firstDayOfWeek = FIRSTDAYOFWEEK;
    shortDateFormat = SHORT_DATE_FORMAT;
    longDateFormat = LONG_DATE_FORMAT;
    currencyFormat = CURRENCY_FORMAT;
    currencySymbol = CURRENCY_SYMBOL;
    percentFormat = PERCENT_FORMAT;

    // Sample date for formatting
    sampleDate = new Date(2026, 6, 21); // June 21, 2026
    
    // Formatted date using Intl API
    get formattedDate() {
        return new Intl.DateTimeFormat(LOCALE, {
            dateStyle: 'full',
            timeStyle: 'long'
        }).format(this.sampleDate);
    }

    // Sample number for formatting
    sampleNumber = 123456.78;

    // Formatted number using Intl API
    get formattedNumber() {
        return new Intl.NumberFormat(LOCALE, {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(this.sampleNumber);
    }

    // Formatted currency using Intl API
    get formattedCurrency() {
        return new Intl.NumberFormat(LOCALE, {
            style: 'currency',
            currency: CURRENCY,
            currencyDisplay: 'symbol'
        }).format(this.sampleNumber);
    }
}