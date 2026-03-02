import { LightningElement } from 'lwc';
import certs from '@salesforce/resourceUrl/sfCerts';

export default class PortfolioCertifications extends LightningElement {

    certifications = [
        {
            name: 'Salesforce Certified Agentforce Specialist',
            icon: certs + '/agentforce.png'
        },
        {
            name: 'Salesforce Certified Platform Administrator',
            icon: certs + '/admin.png'
        },
        {
            name: 'Salesforce Certified Platform App Builder',
            icon: certs + '/appbuilder.png'
        },
        {
            name: 'Salesforce Certified Platform Developer I',
            icon: certs + '/dev1.png'
        },
        {
            name: 'Salesforce Certified Platform Developer II',
            icon: certs + '/dev2.png'
        },
        {
            name: 'Salesforce Certified AI Associate',
            icon: certs + '/aiassociate.png'
        }
    ];
}