'use client'

import { Fragment } from 'react'
import {
    Dialog,
    Transition,
    DialogPanel,
    DialogTitle
} from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function Drawer({ open, setOpen, children }) {
    return (
        <Transition show={open} as={Fragment}>
            <Dialog as="div" className="relative z-[1000]" onClose={setOpen}>
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                </Transition.Child>

                {/* Drawer Panel */}
                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed top-[60px] bottom-0 right-0 flex max-w-full pl-10 sm:pl-16">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500 sm:duration-700"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500 sm:duration-700"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <DialogPanel
                                    className="pointer-events-auto relative w-screen max-w-md bg-white shadow-xl"
                                    style={{ height: 'calc(100vh - 60px)' }}
                                >
                                    {/* Close Button */}
                                    <div className="absolute left-0 top-0 -ml-8 flex pr-2 pt-4 sm:-ml-10 sm:pr-4">
                                        <button
                                            type="button"
                                            className="rounded-md text-gray-300 hover:text-black focus:outline-none focus:ring-2 focus:ring-white"
                                            onClick={() => setOpen(false)}
                                        >
                                            <span className="sr-only">Close panel</span>
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="flex h-full flex-col overflow-y-auto py-6">
                                        <div className="px-4 sm:px-6">
                                            <DialogTitle className="text-base font-semibold text-gray-900">
                                                Panel Title
                                            </DialogTitle>
                                        </div>
                                        <div className="relative mt-6 flex-1 px-4 sm:px-6">
                                            {children}
                                        </div>
                                    </div>
                                </DialogPanel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
