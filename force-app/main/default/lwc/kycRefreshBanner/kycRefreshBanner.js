import { LightningElement, api, wire } from 'lwc';
import getKycBanner from '@salesforce/apex/KycRefreshBannerController.getKycBanner';

export default class KycRefreshBanner extends LightningElement {

    @api recordId;

    showBanner = false;
    bannerType;
    message;
    daysDifference;

    @wire(getKycBanner, { accountId: '$recordId' })
    wiredBanner({ data, error }) {

        if (data) {

            this.showBanner = data.showBanner;
            this.bannerType = data.bannerType;
            this.message = data.message;
            this.daysDifference = data.daysDifference;

        } else if (error) {
            console.error(error);
        }
    }

    get bannerTitle() {

        switch (this.bannerType) {

            case 'ERROR':
                return 'KYC Refresh Overdue';

            case 'INFO':
                return 'KYC Refresh Due Soon';

            default:
                return 'KYC Refresh Reminder';
        }
    }

    get bannerClass() {

        switch (this.bannerType) {

            case 'ERROR':
                return 'banner error';

            case 'INFO':
                return 'banner info';

            default:
                return 'banner warning';
        }
    }

    get iconName() {

        switch (this.bannerType) {

            case 'ERROR':
                return 'utility:error';

            case 'INFO':
                return 'utility:info';

            default:
                return 'utility:warning';
        }
    }
}