public with sharing class UserInfoDebug{

    public static void printUserInfoDetails() {

        System.debug('========== USER INFO DETAILS START ==========');

        // Basic User Details
        System.debug('User ID: ' + UserInfo.getUserId());
        System.debug('Username: ' + UserInfo.getUserName());
        System.debug('Full Name: ' + UserInfo.getName());
        System.debug('First Name: ' + UserInfo.getFirstName());
        System.debug('Last Name: ' + UserInfo.getLastName());
        System.debug('Email: ' + UserInfo.getUserEmail());

        // Organization Details
        System.debug('Organization ID: ' + UserInfo.getOrganizationId());
        System.debug('Organization Name: ' + UserInfo.getOrganizationName());

        // Profile & Role
        System.debug('Profile ID: ' + UserInfo.getProfileId());
        System.debug('Role ID: ' + UserInfo.getUserRoleId());

        // Locale & Language
        System.debug('Language: ' + UserInfo.getLanguage());
        System.debug('Locale: ' + UserInfo.getLocale());

        // Currency
        System.debug('Default Currency: ' + UserInfo.getDefaultCurrency());
        System.debug('Is Multi Currency Org: ' + UserInfo.isMultiCurrencyOrganization());

        // User Type
        System.debug('User Type: ' + UserInfo.getUserType());

        // UI Theme
        System.debug('Preferred UI Theme: ' + UserInfo.getUiTheme());
        System.debug('Displayed UI Theme: ' + UserInfo.getUiThemeDisplayed());

        // Session ID
        System.debug('Session ID: ' + UserInfo.getSessionId());

        // Time Zone
        TimeZone tz = UserInfo.getTimeZone();

        System.debug('TimeZone Display Name: ' + tz.getDisplayName());
        System.debug('TimeZone ID: ' + tz.getID());

        // Guest User UVID
        System.debug('Current UVID: ' + UserInfo.getCurrentUvid());

        // Package License Checks
        // Replace with actual namespace/package Id if needed
        try {
            Boolean hasLicense = UserInfo.isCurrentUserLicensed('mypackage');
            System.debug('Is Current User Licensed for Namespace: ' + hasLicense);
        } catch (Exception e) {
            System.debug('License Check Exception: ' + e.getMessage());
        }

        System.debug('========== USER INFO DETAILS END ==========');
    }
}
//UserInfoDebug.printUserInfoDetails();