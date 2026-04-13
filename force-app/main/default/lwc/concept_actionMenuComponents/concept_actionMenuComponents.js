import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

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
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: 'Account data refreshed successfully',
                variant: 'success'
            }));

        }
        catch (error) {
            this.errorMessage = error.message;
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: error.message,
                variant: 'error'
            }));
        }
    }
    handleCreateOpportunity() {
        try {
            console.log('Create opportunity action');
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: 'Opportunity created successfully',
                variant: 'success'
            }));
        }
        catch (error) {
            this.errorMessage = error.message;
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: error.message,
                variant: 'error'
            }));
        }
    }

    handleDownload() {
        try {
            console.log('Downloading report');
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: 'Report downloaded successfully',
                variant: 'success'
            }));
        }
        catch (error) {
         this.errorMessage = error.message;
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: error.message,
                variant: 'error'
            }));

        }

    }


    /* STATEFUL BUTTONS */

    toggleFavorite() {
        try {
            this.isFavorite = !this.isFavorite;
            const message = this.isFavorite ? 'Added to favorites' : 'Removed from favorites';
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: message,
                variant: 'success'
            }));
        }
        catch (error) {
            this.errorMessage = error.message;
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: error.message,
                variant: 'error'
            }));
     }
    }
    toggleLike() {
        try {
            this.isLiked = !this.isLiked;
            const message = this.isLiked ? 'Liked' : 'Unliked';
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: message,
                variant: 'success'
            }));

        }
        catch (error) {
            this.errorMessage = error.message;
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: error.message,
                variant: 'error'

            }));
        }
    }
    /* MENU ACTION */
    handleMenuAction(event) {
        try {
            const action = event.detail.value;
            switch (action) {
                case 'view':
                    console.log('View account selected');
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Success',
                        message: 'Viewing account',
                        variant: 'success'
                    }));
                    break;
                case 'email':
                    console.log('Send email selected');
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Success',
                        message: 'Email sent',
                        variant: 'success'
                    }));
                    break;
                case 'activity':
                    console.log('Log activity selected');
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Success',
                        message: 'Activity logged',
                        variant: 'success'
                    }));
                    break;

            }

        }
        catch (error) {
            this.errorMessage = error.message;
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: error.message,
                variant: 'error'
            }));
        }
    }

    /* FLOW ACTION */
    startFlow() {
        try {
            this.showFlow = true;
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: 'Flow started',
                variant: 'success'
            }));
        }
        catch (error) {
            this.errorMessage = error.message;
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: error.message,
                variant: 'error'
            }));
        }
    }
    handleFlowStatus(event) {
        try {
            if (event.detail.status === 'FINISHED') {
                this.showFlow = false;
                console.log('Flow finished');
                this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                    message: 'Flow completed successfully',
                    variant: 'success'
                }));

            }
        }
        catch (error) {
            this.errorMessage = error.message;
            this.dispatchEvent(new ShowToastEvent({
               title: 'Error',
                message: error.message,
                variant: 'error'
            }));

        }

    }

}