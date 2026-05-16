import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Ui_internalBubbleChild extends LightningElement {

    handleClick() {
        console.log('🔘 [CHILD] Button clicked - Dispatching internal bubble event');

        const evt = new CustomEvent('internalbubble', {
            detail: {
                message: 'Event bubbling inside component template',
                timestamp: new Date().toLocaleTimeString(),
                source: 'c-ui_internal-bubble-child'
            },
            bubbles: true,
            composed: false  // ⚠️ Does NOT cross shadow boundary
        });

        // Show toast on dispatch
        this.dispatchToast(
            'Event Dispatched',
            `Child component is firing "internalbubble" event with bubbles: true, composed: false`,
            'info'
        );

        this.dispatchEvent(evt);

        console.log('✅ [CHILD] Event dispatched:', {
            eventName: 'internalbubble',
            detail: evt.detail,
            bubbles: evt.bubbles,
            composed: evt.composed,
            target: this.constructor.name
        });
    }

    dispatchToast(title, message, variant = 'success') {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
                mode: 'sticky'
            })
        );
    }

}