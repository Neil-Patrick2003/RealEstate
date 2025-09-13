import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { router } from "@inertiajs/react";

export default function ScheduleVisitModal({ open, setOpen, visitData }) {

    console.log(visitData);

    const [form, setForm] = useState({
        date: '',
        time: '',
        notes: '',
        agentId: null,
        brokerId: null,
        inquiryId: null,

    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (visitData) {
            setForm({
                date: '',
                time: '',
                notes: '',
                agentId: visitData.agentId || null,
                brokerId: visitData.brokerId || null,
                inquiryId: visitData.inquiryId || null,
            });
        }
    }, [visitData]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post('/trippings', {
            property_id: visitData?.property?.id,
            agent_id: form.agentId,
            inquiry_id: form.inquiryId,
            broker_id: form.brokerId,
            date: form.date,
            time: form.time,
            notes: form.notes,
        }, {
            onSuccess: () => {
                setIsSubmitting(false);
                setOpen(false);
            },
            onError: (errors) => {
                setIsSubmitting(false);
                console.error(errors);
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
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
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
                                <Dialog.Title className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    🗓️ Schedule a Property Visit
                                </Dialog.Title>
                                <p className="text-sm text-gray-500 mt-1 mb-4">
                                    Choose your preferred date and time. Our agent will confirm your request.
                                </p>

                                {/* Property Summary */}
                                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg mb-5 border">
                                    <img
                                        src={`/storage/${property.image_url}`}
                                        alt={property.title}
                                        className="w-20 h-20 rounded-md object-cover border"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 line-clamp-1">{property.title}</h4>
                                        <p className="text-sm text-gray-500 line-clamp-1">{property.address}</p>
                                        <p className="text-sm font-bold text-primary mt-1">₱ {property.price.toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Form Section */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Preferred Date</label>
                                        <input
                                            type="date"
                                            name="date"
                                            min={new Date().toISOString().split("T")[0]}
                                            value={form.date}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Preferred Time</label>
                                        <input
                                            type="time"
                                            name="time"
                                            value={form.time}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
                                        <textarea
                                            name="notes"
                                            rows={3}
                                            placeholder="Any specific requests or questions?"
                                            value={form.notes}
                                            onChange={handleChange}
                                            className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700"
                                            onClick={() => setOpen(false)}
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-md text-sm font-medium transition"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Scheduling..." : "Confirm Schedule"}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
