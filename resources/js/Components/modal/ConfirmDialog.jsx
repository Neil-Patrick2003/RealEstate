import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useCallback } from 'react'

export default function ConfirmDialog({
                                          open,
                                          setOpen,
                                          title = 'Are you sure?',
                                          description = 'This action cannot be undone.',
                                          onConfirm,
                                          confirmText = 'Confirm',
                                          cancelText = 'Cancel',
                                          Icon = ExclamationTriangleIcon,
                                          loading = false,
                                      }) {
    const cancelButtonRef = useRef(null)

    const handleConfirm = useCallback(async () => {
        if (onConfirm) {
            await onConfirm()
            setOpen(false)
        }
    }, [onConfirm, setOpen])

    return (
        <AnimatePresence>
            {open && (
                <Dialog
                    as="div"
                    className="relative z-[9999]"   // ⬅️ ensure this is higher than any sidebar/nav
                    initialFocus={cancelButtonRef}
                    open={open}
                    onClose={setOpen}
                >
                    {/* Full-screen blurred backdrop */}
                    <DialogBackdrop
                        as={motion.div}
                        className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/75 z-[9998]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* Centered panel */}
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                        <DialogPanel
                            as={motion.div}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-8 text-left align-middle shadow-xl"
                        >
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                                </div>
                                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                    <DialogTitle
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        {title}
                                    </DialogTitle>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">{description}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={handleConfirm}
                                    className="inline-flex w-full justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent sm:ml-3 sm:w-auto disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : confirmText}
                                </button>
                                <button
                                    type="button"
                                    ref={cancelButtonRef}
                                    onClick={() => setOpen(false)}
                                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                >
                                    {cancelText}
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>
            )}
        </AnimatePresence>
    )
}
