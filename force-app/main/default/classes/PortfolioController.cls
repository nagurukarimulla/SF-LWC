/**
 * ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
 * Class Name      : PortfolioController
 * Author          : <YourName>
 * Created Date    : Feb 26, 2026
 * Last Modified By: <YourName>
 * Last Modified On: Feb 26, 2026
 * Description     : This class implements for......
 *  
 * Change History  :
 *  Date          │   Author     │   Change
 * ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
 *  Feb 26, 2026  │ <YourName>   │ Initial version
 * ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
 */

public with sharing class PortfolioController {

    @AuraEnabled
    public static void createLead(String name, String email, String message) {
        try {
            // Validate inputs
            if (String.isBlank(name) || String.isBlank(email) || String.isBlank(message)) {
                throw new AuraHandledException('All fields are required');
            }
            
            // Validate email format
            String emailRegex = '^[a-zA-Z0-9._|\\\\%#~`=?&/$^*!}{+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$';
            Pattern emailPattern = Pattern.compile(emailRegex);
            Matcher emailMatcher = emailPattern.matcher(email);
            
            if (!emailMatcher.matches()) {
                throw new AuraHandledException('Please enter a valid email address');
            }
            
            Lead l = new Lead(
                LastName = name,
                Company = 'Portfolio Website',
                Email = email,
                Description = message,
                Status = 'Open - Not Contacted'  // Required field for Lead
            );
            
            insert l;
            sendNotificationEmail(name, email, message, l.Id);
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    private static void sendNotificationEmail(String name, String email, String message, Id leadId) {

    Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();

    mail.setToAddresses(new String[] { 'nkarim0311@gmail.com' });
    mail.setSubject('🚀 New Portfolio Contact Submission');

    String body =
        'Hello Karim,\n\n' +
        'You have received a new portfolio inquiry.\n\n' +
        '---------------------------------\n' +
        'Name     : ' + name + '\n' +
        'Email    : ' + email + '\n' +
        'Message  : ' + message + '\n' +
        'Lead Id  : ' + leadId + '\n' +
        '---------------------------------\n\n' +
        'Login to Salesforce to review the lead.\n\n' +
        'Regards,\nPortfolio System';

    mail.setPlainTextBody(body);

    Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
}
}