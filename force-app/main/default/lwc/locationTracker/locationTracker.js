import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getLocationService } from 'lightning/mobileCapabilities';

export default class LocationTracker extends LightningElement {
    currentLocation;
    locationService;
    disableButton = false;
    isLoading = false;

    connectedCallback() {
        this.locationService = getLocationService();
        // Check Mobile Support
        if (
            this.locationService == null ||
            !this.locationService.isAvailable()
        ) {
            this.disableButton = true;
        }
    }

    handleGetLocation() {
        this.currentLocation = null;
        if (
            this.locationService != null &&
            this.locationService.isAvailable()
        ) {
            const options = {
                enableHighAccuracy: true
            };
            this.isLoading = true;
            this.locationService
                .getCurrentPosition(options)
                .then((result) => {
                    this.currentLocation = result;
                    console.log(
                        'Current Location => ',
                        JSON.stringify(result)
                    );
                    this.showToast(
                        'Success',
                        'Location fetched successfully',
                        'success'
                    );
                })
                .catch((error) => {
                    console.error('Location Error => ', error);
                    this.showToast(
                        'Error',
                        JSON.stringify(error),
                        'error'
                    );
                })
                .finally(() => {
                    this.isLoading = false;
                });
        } else {
            this.showToast(
                'Error',
                'Location Service not available. Use Salesforce Mobile App.',
                'error'
            );
        }
    }

    // Latitude
    get latitude() {
        return this.currentLocation?.coords?.latitude;
    }

    // Longitude
    get longitude() {
        return this.currentLocation?.coords?.longitude;
    }

    // Map Marker
    get mapMarkers() {
        return [
            {
                location: {
                    Latitude: this.latitude,
                    Longitude: this.longitude
                },
                title: 'My Current Location'
            }
        ];
    }

    // Reusable Toast
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