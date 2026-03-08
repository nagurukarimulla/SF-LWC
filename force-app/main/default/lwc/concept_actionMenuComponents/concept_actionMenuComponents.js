import { LightningElement, api, track } from 'lwc';

export default class Concept_actionMenuComponents extends LightningElement {

    @api recordId;

    @track isFavorite = false;
    @track isLiked = false;

    showFlow = false;

    flowName = 'Account_Onboarding'; // Flow API Name

    phoneNumber = '+14155552671';

    errorMessage;


    /* BUTTON ACTIONS */

    handleRefresh() {

        try {

            console.log('Refreshing account data');

        }
        catch (error) {

            this.errorMessage = error.message;

        }

    }

    handleCreateOpportunity() {

        try {

            console.log('Create opportunity action');

        }
        catch (error) {

            this.errorMessage = error.message;

        }

    }

    handleDownload() {

        try {

            console.log('Downloading report');

        }
        catch (error) {

            this.errorMessage = error.message;

        }

    }


    /* STATEFUL BUTTONS */

    toggleFavorite() {

        try {

            this.isFavorite = !this.isFavorite;

        }
        catch (error) {

            this.errorMessage = error.message;

        }

    }

    toggleLike() {

        try {

            this.isLiked = !this.isLiked;

        }
        catch (error) {

            this.errorMessage = error.message;

        }

    }


    /* MENU ACTION */

    handleMenuAction(event) {

        try {

            const action = event.detail.value;

            switch (action) {

                case 'view':
                    console.log('View account selected');
                    break;

                case 'email':
                    console.log('Send email selected');
                    break;

                case 'activity':
                    console.log('Log activity selected');
                    break;

            }

        }
        catch (error) {

            this.errorMessage = error.message;

        }

    }


    /* FLOW ACTION */

    startFlow() {

        try {

            this.showFlow = true;

        }
        catch (error) {

            this.errorMessage = error.message;

        }

    }

    handleFlowStatus(event) {

        try {

            if (event.detail.status === 'FINISHED') {

                this.showFlow = false;

                console.log('Flow finished');

            }

        }
        catch (error) {

            this.errorMessage = error.message;

        }

    }

}