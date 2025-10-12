import React, { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FlashMessage = () => {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success, {
                toastId: `success-${Date.now()}-${Math.random()}`
            });
        }

        if (flash.error) {
            toast.error(flash.error, {
                toastId: `error-${Date.now()}-${Math.random()}`
            });
        }
    }, [flash.success, flash.error]);

    return (
        <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            pauseOnFocusLoss={false}
            draggable
        />
    );
};

export default FlashMessage;
