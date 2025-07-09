// resources/js/Components/ToastHandler.jsx

import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast, Toaster } from 'react-hot-toast';

export default function ToastHandler() {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
        if (flash.info) toast(flash.info);
    }, [flash]);

    return <Toaster position="top-right" />;
}
