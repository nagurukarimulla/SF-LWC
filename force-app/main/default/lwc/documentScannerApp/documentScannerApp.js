import { LightningElement, track } from 'lwc';
import { getDocumentScanner } from 'lightning/mobileCapabilities';

export default class DocumentScannerApp extends LightningElement {
    @track scannedDocument;
    @track scannerError;

    // ================================
    // Camera Scan
    // ================================
    handleScanCamera() {
        this.scanDocument('DEVICE_CAMERA');
    }

    // ================================
    // Gallery Scan
    // ================================
    handleScanGallery() {
        this.scanDocument('PHOTO_LIBRARY');
    }

    // ================================
    // Main Scan Logic
    // ================================
    scanDocument(sourceType) {
        this.resetResults();
        const scanner = getDocumentScanner();
        // Check availability
        if (!scanner.isAvailable()) {
            this.scannerError =
                'Document Scanner is only supported in Salesforce Mobile App.';
            return;
        }
        // Scanner Options
        const options = {
            imageSource: sourceType,
            scriptHint: 'LATIN',
            returnImageBytes: true
        };
        // Start Scan
        scanner
            .scan(options)
            .then((results) => {
                this.processResults(results);
            })
            .catch((error) => {
                this.handleError(error);
            });
    }

    // ================================
    // Process Results
    // ================================
    processResults(results) {
        if (results && results.length > 0) {
            this.scannedDocument = results[0];
        }
    }

    // ================================
    // Handle Errors
    // ================================
    handleError(error) {
        this.scannerError =
            `Error Code: ${error.code}
             Error Message: ${error.message}`;
    }

    // ================================
    // Reset Data
    // ================================
    resetResults() {
        this.scannedDocument = null;
        this.scannerError = null;
    }

    // ================================
    // Highlight OCR Text Blocks
    // ================================
    addImageHighlights(event) {
        const textBlocks = this.scannedDocument?.blocks;
        if (!textBlocks) {
            return;
        }
        const img = event.target;
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        let svg =
            `<svg xmlns="http://www.w3.org/2000/svg"
                  width="${width}"
                  height="${height}"
                  viewBox="0 0 ${width} ${height}"
                  class="svg-overlay">`;
        textBlocks.forEach(block => {
            block.lines.forEach(line => {
                line.elements.forEach(element => {
                    const frame = element.frame;
                    svg += `
                        <rect
                            x="${frame.x}"
                            y="${frame.y}"
                            width="${frame.width}"
                            height="${frame.height}"
                            style="
                                fill:lime;
                                fill-opacity:0.25;
                                stroke:green;
                                stroke-width:2;">
                        </rect>
                    `;
                });
            });
        });
        svg += `</svg>`;
        const overlay =
            this.template.querySelector('.overlay-container');
        overlay.innerHTML = svg;
    }
}