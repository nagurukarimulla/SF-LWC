import { LightningElement, track } from 'lwc';

export default class PortfolioProjects extends LightningElement {

    @track projects = [
        {
            name: 'EA Sports Advisor & TOS Hubs',
            description: 'Advisor Hub is a Salesforce-powered advisor management platform designed to streamline advisor workflows, case handling, and decision-making processes, incorporating custom LWC, Aura components, and Apex automation. TOS Hub is a Salesforce-based case management system that handles player petitions related to in-game misconduct, integrating with AWS Bifrost, Sovereign, and EADP Studio to facilitate real-time data exchange and automate workflows.',
            open: false
        },
        {
            name: 'Employee Management System',
            description: 'A Salesforce application to streamline recruitment and employee management from job posting to onboarding. It includes role designation, certification tracking, and feedback systems to improve performance and engagement.',
            open: false
        },
        {
            name: 'Embark Sales Management',
            description: 'Embark automates sales and marketing for education savings plans using Salesforce CRM, enhancing efficiency and customer service.',
            open: false
        },
        {
            name: 'CareConnect Enablement',
            description: 'Developed and maintained Lead and Campaign Management in Salesforce, integrating with legacy systems to trigger third-party phone call services.',
            open: false
        },

    ];

    toggle(event) {
        const name = event.target.innerText;
        this.projects = this.projects.map(p => {
            if (p.name === name) {
                p.open = !p.open;
            }
            return p;
        });
    }
}