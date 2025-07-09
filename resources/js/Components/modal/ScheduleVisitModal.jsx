import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import {router} from "@inertiajs/react";

export default function ScheduleVisitModal({ open, setOpen, visitData }) {
    const [form, setForm] = useState({
        date: '',
        time: '',
        notes: '',
        agentId: null,
        inquiryId: null,
    });

    useEffect(() => {
        if (visitData) {
            setForm({
                date: '',
                time: '',
                notes: '',
                agentId: visitData.agentId || null,
                inquiryId: visitData.inquiryId || null,
            });
        }
    }, [visitData]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        router.post('/trippings', {
            property_id: visitData?.property?.id,
            agent_id: form.agentId,
            inquiry_id: form.inquiryId,
            date: form.date,
            time: form.time,
            notes: form.notes,
        }, {
            onSuccess: () => {
                setOpen(false);
            },
            onError: (errors) => {
                // Handle validation errors here if needed
                console.log(errors);
            },
        });


    };


    if (!visitData) return null;

    const { property } = visitData;

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => setOpen(false)}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900">
                                    🗓️ Schedule a Property Visit
                                </Dialog.Title>
                                <p className="text-sm text-gray-500 mt-1 mb-4">
                                    Choose your preferred date and time. The agent will confirm availability.
                                </p>

                                {/* Property Summary */}
                                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-md mb-5 border">
                                    <img
                                        src={`/storage/${property.image_url}`}
                                        alt={property.title}
                                        className="w-20 h-20 rounded-md object-cover"
                                    />
                                    <div>
                                        <h4 className="font-semibold text-gray-800">{property.title}</h4>
                                        <p className="text-sm text-gray-500">{property.address}</p>
                                        <p className="text-sm text-primary font-semibold">₱ {property.price.toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Form */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700" htmlFor='date'>
                                            Preferred Date
                                        </label>
                                        <div className="mt-1 relative">
                                            <input
                                                type="date"
                                                name="date"
                                                value={form.date}
                                                onChange={handleChange}
                                                className="w-full border-gray-300 rounded-md shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700" htmlFor='time'>
                                            Preferred Time
                                        </label>
                                        <div className="mt-1 relative">
                                            <input
                                                type="time"
                                                name="time"

                                                value={form.time}
                                                onChange={handleChange}
                                                className="w-full border-gray-300 rounded-md shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700" htmlFor='notes'>Additional Notes</label>
                                        <textarea
                                            name="notes"
                                            rows={3}
                                            value={form.notes}
                                            onChange={handleChange}
                                            placeholder="Add any specific requests or questions..."
                                            className="w-full border-gray-300 rounded-md shadow-sm"
                                        />
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50 text-gray-700"
                                        onClick={() => setOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-md text-sm font-medium transition"
                                    >
                                        Confirm Schedule
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
