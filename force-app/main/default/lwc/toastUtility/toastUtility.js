import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const showToast = (component, title, message, variant) => {
    component.dispatchEvent(
        new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        })
    );
};

const showSuccess = (component, title, message) => {
    showToast(component, title, message, 'success');
};

const showError = (component, title, message) => {
    showToast(component, title, message, 'error');
};

const showWarning = (component, title, message) => {
    showToast(component, title, message, 'warning');
};

const showInfo = (component, title, message) => {
    showToast(component, title, message, 'info');
};

export { showToast, showSuccess, showError, showWarning, showInfo };