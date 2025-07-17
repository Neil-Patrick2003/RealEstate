import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function Modal({
                                  children,
                                  show = false,
                                  maxWidth = '2xl',
                                  closeable = true,
                                  onClose = () => {},
                              }) {
    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
    }[maxWidth];

    const handleClose = () => {
        if (closeable) {
            onClose();
        }
    };

    const handleBackdropClick = (event) => {
        if (!closeable) {
            event.stopPropagation();
        } else {
            handleClose();
        }
    };

    return (
        <Transition show={show} leave="duration-200">
            <Dialog
                as="div"
                id="modal"
                className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6"
                onClose={handleClose}
            >
                {/* Backdrop */}
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div
                        className="absolute inset-0 bg-gray-500/75 dark:bg-gray-900/75"
                        onClick={handleBackdropClick}
                    />
                </TransitionChild>

                {/* Close Button Outside */}
                {closeable && (
                    <button
                        onClick={handleClose}
                        className="fixed top-6 right-6 z-[60] bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70"                    >
                        <XMarkIcon className="w-7 h-7" />
                    </button>
                )}

                {/* Modal Panel */}
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <DialogPanel
                        className={`relative max-h-[80vh] transform overflow-y-auto rounded-lg bg-white shadow-xl transition-all sm:mx-auto sm:w-full dark:bg-gray-800 ${maxWidthClass}`}
                    >
                        <div className="p-6">{children}</div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}
