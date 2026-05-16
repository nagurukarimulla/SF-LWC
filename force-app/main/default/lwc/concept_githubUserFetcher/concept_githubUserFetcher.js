import { LightningElement, track } from 'lwc';

import fetchGitHubUser from '@salesforce/apex/GitHubUserController.fetchGitHubUser';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Concept_githubUserFetcher extends LightningElement {

    username = '';

    @track userData;

    isLoading = false;

    handleChange(event) {
        this.username = event.target.value;
    }

    fetchUser() {

        if(!this.username){
            this.showToast(
                'Error',
                'Please enter GitHub username',
                'error'
            );
            return;
        }

        this.isLoading = true;

        fetchGitHubUser({
            username : this.username
        })
        .then(result => {

            this.userData = result;

        })
        .catch(error => {

            this.userData = null;

            this.showToast(
                'Error',
                error.body.message,
                'error'
            );
        })
        .finally(() => {
            this.isLoading = false;
        });
    }

    showToast(title, message, variant){

        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}