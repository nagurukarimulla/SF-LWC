import { LightningElement } from 'lwc';

export default class Concept_visualComponents extends LightningElement {

mapMarkers = [
    {
        location: {
            City: 'Hyderabad',
            Country: 'India'
        },
        title: 'Hyderabad Office'
    },
    {
        location: {
            City: 'Bangalore',
            Country: 'India'
        },
        title: 'Bangalore Office'
    }
];


pills = [
    {
        label: 'Salesforce'
    },
    {
        label: 'LWC'
    },
    {
        label: 'Apex'
    }
];


handleRemove(event){

const index = event.detail.index;

this.pills = this.pills
.filter((item, i) => i !== index);

}

}