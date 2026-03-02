import { LightningElement } from 'lwc';
import logos from '@salesforce/resourceUrl/socialLogos';

export default class PortfolioSocial extends LightningElement {

    platforms = [
        {
            name: 'LinkedIn',
            icon: logos + '/linkedin.png',
            url: 'https://www.linkedin.com/in/naguru-karimulla-97a87b282/'
        },
        {
            name: 'Naukri',
            icon: logos + '/naukri.png',
            url: 'https://www.naukri.com/mnjuser/profile?id=&altresid'
        },
        {
            name: 'Foundit',
            icon: logos + '/foundit.png',
            url: 'https://www.foundit.in/seeker/profile'
        },
        {
            name: 'GitHub',
            icon: logos + '/github.png',
            url: 'https://github.com/nagurukarimulla'
        },
        {
            name: 'Trailhead',
            icon: logos + '/trailhead.png',
            url: 'https://www.salesforce.com/trailblazer/nkarim29'
        }
    ];

    redirect(event) {
        const url = event.currentTarget.dataset.url;
        window.open(url, '_blank');
    }
}