import { LightningElement, wire, track } from 'lwc';
import getActiveObjects from '@salesforce/apex/EOC_Controller.getActiveObjects';

export default class ObjectSelectorPanel extends LightningElement {

    @track options = [];
    selectedObject;

    @wire(getActiveObjects)
    wiredObjects({ data, error }) {
        if (data) {
            this.options = data;
            if(data.length > 0){
                this.selectedObject = data[0].value;
                this.dispatchObjectChange();
            }
        }
        if (error) {
            console.error(error);
        }
    }

    handleChange(event){
        this.selectedObject = event.detail.value;
        this.dispatchObjectChange();
    }

    dispatchObjectChange(){
        this.dispatchEvent(new CustomEvent('objectchange',{
            detail: { objectApiName: this.selectedObject }
        }));
    }
}