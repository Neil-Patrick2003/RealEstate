import Modal from "@/Components/Modal.jsx";
import React from "react";
import {useForm} from "@inertiajs/react";
import InputError from "@/Components/InputError.jsx";

const DealFormModal = ({ property, isOpen, setIsOpen, initialValue }) => {
    const {data, setData, post, errors, put } = useForm({
        amount: initialValue?.amount ?? ''
    })

    const onSubmit = (e) => {
        e.preventDefault();

        initialValue ?
            put(route('property-listings.deals.update', { propertyListing: property.property_listing?.id, deal: initialValue?.id }), {
                onError: (error) => console.log(error),
                onSuccess: () => setIsOpen(false),
            }) :
            post(route('property-listings.deals.store', { propertyListing: property.property_listing?.id }), {
                onError: (error) => console.log(error),
                onSuccess: () => setIsOpen(false),
            })
    }

    return <Modal show={isOpen} onClose={() => setIsOpen(false)} maxWidth="2xl">
        <div className="p-6 bg-white rounded-xl shadow-lg transition-transform transform-gpu">
            {/* Close Button */}
            <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none"
                aria-label="Close modal"
            >
                &times;
            </button>

            <form onSubmit={onSubmit}>
                <div className="mb-4">
                    <label htmlFor="message" className="text-sm font-medium text-gray-700">
                        Amount
                    </label>

                    <input value={data.amount} onChange={(e) => setData('amount', e.target.value)} type={"number"} required className="mt-2 w-full rounded-md border border-gray-200 focus:ring-2 focus:ring-primary focus:outline-none p-3 text-sm text-gray-700 resize-none transition-shadow duration-200"/>
                </div>
                <InputError message={errors.amount} className="mt-2" />


                <div className="flex justify-end">
                    <button
                        type='submit'
                        className="bg-primary text-white font-medium px-5 py-2 rounded-md hover:bg-primary/90 transition duration-200 shadow-sm"
                    >
                        {initialValue ? 'Update Offer': 'Send Offer'}
                    </button>
                </div>
            </form>


        </div>
    </Modal>
}

export default DealFormModal
