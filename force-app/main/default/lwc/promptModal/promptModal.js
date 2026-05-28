import { LightningElement } from 'lwc';
import LightningPrompt from 'lightning/prompt';

export default class PromptModal extends LightningElement {
    userInput = '';
    cancelMessage = '';

    async handlePromptClick() {

        const result = await LightningPrompt.open({
            message: 'Please enter your feedback below.',
            label: 'Feedback Prompt',
            theme: 'shade',
            defaultValue: 'Type here...'
        });

        // If user clicks OK
        if (result !== null) {
            this.userInput = result;
            this.cancelMessage = '';

            console.log('User Input:', result);
        }
        // If user clicks Cancel
        else {
            this.userInput = '';
            this.cancelMessage = 'User cancelled the prompt modal.';

            console.log('Prompt Cancelled');
        }
    }
}