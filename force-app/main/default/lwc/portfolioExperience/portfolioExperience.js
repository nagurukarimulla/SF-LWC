import { LightningElement } from 'lwc';

export default class PortfolioExperience extends LightningElement {

    experienceList = [
        {
            company: 'Tata Consultancy Services (TCS) Ltd, Hyderabad',
            duration: 'Feb 2026 – Present',
            client: 'Royal Bank of Canada (RBC)',
            role: 'Salesforce Engineer',
            description: 'Working on enterprise-scale Salesforce solutions for the Royal Bank of Canada, focusing on integrations, secure architecture, and scalable system design.'
        },
        {
            company: 'P99Soft Pvt Ltd, Hyderabad',
            duration: 'Sept 2024 – Feb 2026',
            client: 'Electronic Arts (EA Sports)',
            role: 'Salesforce Admin & Developer',
            description: 'Developing and enhancing TOS & Advisor Hub systems with LWC, Apex, REST APIs, and real-time integrations with AWS Bifrost & Sovereign.'
        },
        {
            company: 'CittaCore Technologies Ind Ltd, Hyderabad',
            duration: 'Jul 2022 – Aug 2024',
            client: 'Multiple Enterprise Clients',
            role: 'Salesforce Developer',
            description: 'Built enterprise Salesforce applications, REST integrations, automation flows, and scalable CRM solutions.'
        },
        {
            company: 'Narayana Engineering College, Nellore',
            duration: 'Sept 2021 – Jun 2022',
            client: 'NEPC',
            role: 'CRM Consultant & Assistant Professor',
            description: 'Implemented campus management Salesforce platform for admissions, academics, placements, and alumni operations.'
        }
    ];
}