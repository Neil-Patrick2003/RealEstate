import React, { useEffect } from "react";
import InputError from "@/Components/InputError.jsx";
import { useForm, usePage } from "@inertiajs/react";
import Modal from "@/Components/Modal.jsx";

const CounterOfferModal = ({ show, onClose, property, buyer, deal }) => {
    const { data, setData, patch, processing, errors } = useForm({
        counterAmount: "",
        propertyListingId: property?.property_listing?.id,
        buyerId: buyer?.id,
    });

    const userId = usePage().props.auth.user.id;

    // Format currency helper
    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 0,
        }).format(amount || 0);

    // Normalize numbers safely
    const buyerOffer = Number(deal?.amount || 0);
    const numericCounter = Number((data.counterAmount || "").replace(/[^0-9.]/g, ""));
    const difference = numericCounter - buyerOffer;

    // Pre-fill input only if user was last to update
    useEffect(() => {
        if (deal?.amount_last_updated_by === userId) {
            setData("counterAmount", deal?.amount?.toString() || "");
        } else {
            setData("counterAmount", "");
        }
    }, [deal, userId, setData]);

    // Handle submit
    const handleSubmit = (e) => {
        e.preventDefault();

        patch(route("broker.deals.counter-offer", { deal: deal?.id }), {
            preserveScroll: true,
            onSuccess: () => {
                setData("counterAmount", "");
                onClose();
            },
        });
    };

    return (
        <Modal
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            show={show}
            onClose={onClose}
            maxWidth="4xl"
        >
            {/* Header */}
            <div className="border-b px-6 py-4">
                <h2 className="text-2xl font-semibold text-gray-900">
                    Counter Buyer&apos;s Offer
                </h2>
                <p className="text-gray-600 mt-1">
                    Negotiating offer for{" "}
                    <span className="font-medium">{property?.address}</span>
                </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
                {/* Property Overview */}
                <div className="flex flex-col md:flex-row gap-6">
                    <img
                        src={
                            property?.image_url
                                ? `/storage/${property.image_url}`
                                : "/placeholder-image.jpg"
                        }
                        alt="Property"
                        className="w-full md:w-1/2 h-48 md:h-56 object-cover rounded-lg shadow-sm"
                    />
                    <div className="flex flex-col justify-center space-y-2 md:w-1/2">
                        <h3 className="text-xl font-semibold text-gray-900">
                            {property?.address}
                        </h3>
                        <p className="text-accent font-bold text-2xl">
                            {formatCurrency(property?.price)}
                        </p>
                        <div className="flex space-x-6 text-gray-500 text-sm">
                            <span>{property?.bedrooms} beds</span>
                            <span>{property?.bathrooms} baths</span>
                            <span>
                                {property?.lot_area} {property?.floor_area} sqft
                            </span>
                        </div>
                    </div>
                </div>

                {/* Buyer's Offer */}
                <div className="bg-indigo-50 rounded-lg p-5">
                    <h4 className="text-lg font-semibold text-primary mb-4">
                        Buyer&apos;s Original Offer
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-gray-700 text-sm">
                        <div>
                            <span className="font-semibold">Name:</span>{" "}
                            {buyer?.name}
                        </div>
                        <div>
                            <span className="font-semibold">
                                {deal?.amount_last_updated_by === userId
                                    ? "Recent Offer"
                                    : "Client Offer"}
                                :
                            </span>
                            <span className="text-accent font-bold ml-1">
                                {formatCurrency(buyerOffer)}
                            </span>
                        </div>
                        <div>
                            <span className="font-semibold">Email:</span>{" "}
                            {buyer?.email}
                        </div>
                        <div>
                            <span className="font-semibold">Phone:</span>{" "}
                            {buyer?.phone || "N/A"}
                        </div>
                    </div>
                </div>

                {/* Counter Offer Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Counter Offer Input */}
                        <div>
                            <label
                                htmlFor="counterAmount"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Counter Offer Amount
                            </label>
                            <input
                                id="counterAmount"
                                type="text"
                                placeholder="Enter counter offer amount"
                                value={data.counterAmount}
                                onChange={(e) =>
                                    setData("counterAmount", e.target.value)
                                }
                                required
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            {data.counterAmount && (
                                <p className="mt-1 text-sm text-gray-500">
                                    {formatCurrency(numericCounter)}
                                </p>
                            )}
                            <InputError
                                message={errors.counterAmount}
                                className="mt-2"
                            />
                        </div>

                        {/* Difference */}
                        <div>
                            <label
                                htmlFor="priceDifference"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Price Difference
                            </label>
                            <input
                                id="priceDifference"
                                type="text"
                                readOnly
                                value={
                                    data.counterAmount
                                        ? formatCurrency(difference)
                                        : "₱0"
                                }
                                className="block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !numericCounter}
                            className={`px-5 py-2 rounded-md text-white transition ${
                                processing || !numericCounter
                                    ? "bg-emerald-300 cursor-not-allowed"
                                    : "bg-accent hover:bg-primary"
                            }`}
                        >
                            {processing
                                ? "Submitting..."
                                : "Submit Counter Offer"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default CounterOfferModal;
