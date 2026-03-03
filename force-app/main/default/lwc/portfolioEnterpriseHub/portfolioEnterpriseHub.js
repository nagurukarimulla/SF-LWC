import { LightningElement } from 'lwc';

export default class PortfolioEnterpriseHub extends LightningElement {

    openHub() {
        window.open(
            'https://nagurukarim-dev-ed.develop.my.site.com/',
            '_blank'
        );
    }
}