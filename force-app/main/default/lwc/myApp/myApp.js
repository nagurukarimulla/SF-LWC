import { LightningElement } from 'lwc';

import MyModal from 'c/myModal';

export default class MyApp extends LightningElement {

    result = 'No Selection';

    // Open Modal
    async handleOpenModal() {

        console.log('Opening Modal...');

        const result = await MyModal.open({

            // Modal Size
            size: 'small',

            // Modal Description
            description: 'LWC Modal Window',

            // Data passed to modal
            options: [
                {
                    id: '1',
                    label: 'Option 1'
                },
                {
                    id: '2',
                    label: 'Option 2'
                },
                {
                    id: '3',
                    label: 'Option 3'
                }
            ]
        });

        console.log('Returned Result => ', result);

        this.result = result;
    }
}