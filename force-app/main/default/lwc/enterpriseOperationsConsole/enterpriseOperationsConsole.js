import { LightningElement, track } from 'lwc';

export default class EnterpriseOperationsConsole extends LightningElement {

    @track selectedObject;

    handleObjectChange(event){
        this.selectedObject = event.detail.objectApiName;
    }
}