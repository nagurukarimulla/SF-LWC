import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getBarcodeScanner } from 'lightning/mobileCapabilities';

export default class BarcodeScannerPro extends LightningElement {

    scanner;

    isScannerAvailable = false;

    scannedValue = '';

    @track scanHistory = [];

    connectedCallback() {

        this.scanner = getBarcodeScanner();

        if (this.scanner && this.scanner.isAvailable()) {
            this.isScannerAvailable = true;
        }
    }

    startScan() {

        if (!this.isScannerAvailable) {

            this.showToast(
                'Error',
                'Scanner unavailable. Open in Salesforce Mobile App.',
                'error'
            );
            return;
        }

        const options = {

            barcodeTypes: [
                this.scanner.barcodeTypes.QR,
                this.scanner.barcodeTypes.CODE_128,
                this.scanner.barcodeTypes.EAN_13
            ],

            scannerSize: 'FULLSCREEN',

            cameraFacing: 'BACK',

            showSuccessCheckMark: true,

            enableBulkScan: false,

            enableMultiScan: false
        };

        this.scanner
            .scan(options)
            .then((results) => {

                if (results && results.length > 0) {

                    const value = results[0].value;

                    this.scannedValue = value;

                    const duplicate = this.scanHistory.some(
                        item => item.value === value
                    );

                    if (!duplicate) {

                        this.scanHistory.unshift({
                            id: Date.now(),
                            value: value
                        });
                    }

                    this.showToast(
                        'Success',
                        'Barcode scanned successfully',
                        'success'
                    );
                }
            })
            .catch(error => {

                console.error(error);

                this.showToast(
                    'Error',
                    error.message,
                    'error'
                );
            })
            .finally(() => {

                this.scanner.dismiss();
            });
    }
    showToast(title, message, variant) {

        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}