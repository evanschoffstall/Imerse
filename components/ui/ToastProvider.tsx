'use client';

import { Toaster } from 'sonner';

/**
 * Toast notification wrapper using Sonner
 * Place this component in the root layout to enable toasts throughout the app
 * 
 * Usage in components:
 * import { toast } from 'sonner';
 * toast.success('Campaign created successfully!');
 * toast.error('Failed to create campaign');
 * toast.info('Processing...');
 * toast.warning('Are you sure?');
 */
export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        className: 'toast',
        style: {
          padding: '16px',
        },
      }}
    />
  );
}
