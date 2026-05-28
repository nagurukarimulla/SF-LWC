import { LightningElement, track } from 'lwc';
import { getNfcService } from 'lightning/mobileCapabilities';

export default class NfcUtility extends LightningElement {

    @track isAvailable = false;
    @track readPayload = '';
    @track writeText = '';
    @track errorMessage = '';

    nfcService;

    connectedCallback() {

        try {

            // Initialize NFC Service
            this.nfcService = getNfcService();

            console.log('NFC Service:', this.nfcService);

        } catch (error) {

            console.error('Initialization Error:', error);

            this.errorMessage =
                'NFC Service Initialization Failed';
        }
    }

    // Check NFC Availability
    checkAvailability() {

        try {

            if (this.nfcService) {

                this.isAvailable =
                    this.nfcService.isAvailable();

                console.log(
                    'NFC Available:',
                    this.isAvailable
                );

            } else {

                this.errorMessage =
                    'NFC Service not initialized';
            }

        } catch (error) {

            this.handleError(error);
        }
    }

    // Handle Input
    handleInput(event) {

        this.writeText = event.target.value;
    }

    // Read NFC
    async readNFC() {

        this.errorMessage = '';

        try {

            const options = {
                instructionText:
                    'Hold device near NFC tag',
                successText:
                    'NFC Read Successful'
            };

            const result =
                await this.nfcService.read(options);

            console.log(
                'Read Result:',
                JSON.stringify(result)
            );

            if (
                result &&
                result.length > 0 &&
                result[0].records.length > 0
            ) {

                const parsed =
                    result[0].records[0].parsed;

                if (parsed) {

                    this.readPayload =
                        atob(parsed.payload);

                } else {

                    this.readPayload =
                        'No parsed payload found';
                }
            }

        } catch (error) {

            this.handleError(error);
        }
    }

    // Write NFC
    async writeNFC() {

        this.errorMessage = '';

        try {

            if (!this.writeText) {

                this.errorMessage =
                    'Enter text first';

                return;
            }

            const payload = {
                text: this.writeText,
                langId: 'en'
            };

            // Create NFC Record
            const record =
                await this.nfcService
                    .createTextRecord(payload);

            console.log(
                'Generated Record:',
                JSON.stringify(record)
            );

            const options = {
                instructionText:
                    'Hold device near NFC tag',
                successText:
                    'Write Successful'
            };

            // Write NFC
            await this.nfcService.write(
                [record],
                options
            );

            this.readPayload =
                'Data Written Successfully';

        } catch (error) {

            this.handleError(error);
        }
    }

    // Error Handler
    handleError(error) {

        console.error(
            'NFC Error:',
            JSON.stringify(error)
        );

        this.errorMessage =
            (error?.code || '') +
            ' ' +
            (error?.message || 'Unknown Error');
    }
}