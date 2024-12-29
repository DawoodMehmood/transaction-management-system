import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Global toast configuration
export const toastConfig = {
  position: 'top-right',
  autoClose: 3000, // 3 seconds
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'light', // Options: "light" | "dark" | "colored"
};

// Success toast
export const showSuccessToast = (message) => {
  toast.success(message, toastConfig);
};

// Error toast
export const showErrorToast = (message) => {
  toast.error(message, toastConfig);
};

// Info toast
export const showInfoToast = (message) => {
  toast.info(message, toastConfig);
};

// Warning toast
export const showWarningToast = (message) => {
  toast.warn(message, toastConfig);
};
