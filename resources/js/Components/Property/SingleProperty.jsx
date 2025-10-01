// resources/js/Components/Property/SingleProperty.jsx
import React, { useState, useMemo } from "react";
import { useForm } from "@inertiajs/react";
import PropertyHeader from "@/Components/Property/PropertyHeader.jsx";
import MainImage from "@/Components/Property/MainImage.jsx";
import Thumbnail from "@/Components/Property/Thumbnail.jsx";
import Descriptions from "@/Components/Property/Descriptions.jsx";
import PropertyMap from "@/Components/PropertyMap.jsx";
import AssignedAgents from "@/Components/Property/AssignedAgents.jsx";
import ContactBroker from "@/Components/Property/ContactBroker.jsx";
import Modal from "@/Components/Modal.jsx";
import ToastHandler from "@/Components/ToastHandler.jsx";
import DealFormModal from "@/Components/Deals/DealFormModal.jsx";
import InquiryForm from "@/Components/Inquiry/InquiryForm.jsx";

/* small utils */
const cn = (...c) => c.filter(Boolean).join(" ");
const isTruthy = (v) => v === true || v === 1 || v === "1";

/* Seller Contact Modal */
const SellerModal = ({ show, onClose, seller, message, onChangeMessage, onSubmit, processing }) => (
    <Modal show={show} onClose={onClose} maxWidth="2xl">
        <div className="p-6 bg-white rounded-xl shadow-lg relative">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
            >
                &times;
            </button>

            <div className="flex items-center gap-4 mb-6">
                {seller?.photo_url ? (
                    <img
                        src={`/storage/${seller?.photo_url}`}
                        alt={`${seller?.name || "Seller"} avatar`}
                        className="w-14 h-14 rounded-full object-cover border border-gray-200"
                        onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                    />
                ) : (
                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 text-lg font-semibold border">
                        {seller?.name?.charAt(0)?.toUpperCase() || "S"}
                    </div>
                )}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{seller?.name || "Seller"}</h3>
                    <p className="text-sm text-gray-500">Seller</p>
                </div>
            </div>

            <div className="mb-4">
                <label htmlFor="seller_message" className="text-sm font-medium text-gray-700">
                    Send a quick message
                </label>
                <textarea
                    id="seller_message"
                    rows={4}
                    maxLength={250}
                    value={message}
                    onChange={(e) => onChangeMessage(e.target.value)}
                    placeholder="Hi, I'm interested in this property. Please contact me…"
                    className="mt-2 w-full rounded-md border border-gray-200 focus:ring-2 focus:ring-primary focus:outline-none p-3 text-sm text-gray-800 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{`${message.length}/250`}</p>
            </div>

            <div className="flex justify-end">
                <button
                    disabled={processing || !message.trim()}
                    onClick={onSubmit}
                    className={cn(
                        "bg-primary text-white font-medium px-5 py-2 rounded-md transition shadow-sm",
                        processing || !message.trim() ? "opacity-60 cursor-not-allowed" : "hover:bg-accent"
                    )}
                >
                    {processing ? "Sending…" : "Send Message"}
                </button>
            </div>
        </div>
    </Modal>
);

export default function SingleProperty({ property, auth, agents, broker, seller, deal }) {
    const { data, setData, post, processing } = useForm({
        message: "",
        person: "",
    });

    const [isOpenModal, setIsOpenModal] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [isOpenDealForm, setIsOpenDealForm] = useState(false);
    const [isContactSeller, setIsContactSeller] = useState(false);

    /* optional: normalize flags once for header chips */
    const normalized = useMemo(
        () => ({
            ...property,
            isPresell: isTruthy(property?.isPresell),
        }),
        [property]
    );

    const handleSubmitInquiry = () => {
        const msg = data.message?.trim();
        if (!msg) return;

        // Decide endpoint: if reaching a specific person (agent/broker), use /properties/:id (your existing logic)
        // Otherwise, default to property owner/seller endpoint.
        const url = selectedPerson
            ? `/properties/${property.id}`
            : `/agents/properties/${property.id}/sent-inquiry`;

        if (selectedPerson) {
            setData("person", selectedPerson?.id);
        }

        post(url, {
            preserveScroll: true,
            onSuccess: () => {
                setData("message", "");
                setSelectedPerson(null);
                setIsOpenModal(false);
                setIsContactSeller(false);
            },
        });
    };

    return (
        <div className="flex flex-col gap-4 mt-4">
            <ToastHandler />

            {/* Deal Form */}
            <DealFormModal
                isOpen={isOpenDealForm}
                setIsOpen={setIsOpenDealForm}
                property={property}
                initialValue={deal}
            />

            {/* Inquiry Modal (agent/broker) */}
            <InquiryForm
                show={isOpenModal}
                onClose={() => setIsOpenModal(false)}
                person={selectedPerson}
                message={data.message}
                onChangeMessage={(val) => setData("message", val)}
                onSubmit={handleSubmitInquiry}
                processing={processing}
            />

            {/* Seller Modal */}
            <SellerModal
                show={isContactSeller}
                onClose={() => setIsContactSeller(false)}
                seller={seller}
                message={data.message}
                onChangeMessage={(val) => setData("message", val)}
                onSubmit={handleSubmitInquiry}
                processing={processing}
            />

            {/* Header + Media */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6">
                <PropertyHeader
                    title={normalized.title}
                    address={normalized.address}
                    isPresell={normalized.isPresell}
                />
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                        <MainImage image_url={normalized.image_url} title={normalized.title} />
                    </div>
                    <div className="lg:col-span-1">
                        <Thumbnail images={normalized.images} />
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <Descriptions
                            property_type={normalized.property_type}
                            sub_type={normalized.sub_type}
                            price={normalized.price}
                            total_rooms={normalized.total_rooms}
                            bedrooms={normalized.bedrooms}
                            bathrooms={normalized.bathrooms}
                            car_slots={normalized.car_slots}
                            features={normalized.features}
                            description={normalized.description}
                            lot_area={normalized.lot_area}
                            floor_area={normalized.floor_area}
                            auth={auth}
                            setIsContactSeller={setIsContactSeller}
                            isOpenDealForm={isOpenDealForm}
                            property={normalized}
                            deal={deal}
                            setIsOpenDealForm={setIsOpenDealForm}
                        />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Location</h2>
                        <PropertyMap coordinates={normalized.coordinate} />
                    </div>
                </div>

                {/* Right */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {Array.isArray(agents) && agents.length > 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <AssignedAgents
                                agents={agents}
                                auth={auth}
                                setIsOpenModal={setIsOpenModal}
                                setSelectedPerson={setSelectedPerson}
                            />
                        </div>
                    ) : broker ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <ContactBroker
                                broker={broker}
                                setIsOpenModal={setIsOpenModal}
                                setSelectedPerson={setSelectedPerson}
                                setData={setData}
                            />
                        </div>
                    ) : null}

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Preview</h3>
                        <img
                            src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/dc012d9f-6137-4d25-a18d-115e68b96429.png"
                            alt="Map preview"
                            className="w-full rounded-lg border border-gray-200"
                            onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                        />
                        <button
                            type="button"
                            className="mt-3 w-full text-primary hover:text-accent font-medium text-sm"
                            aria-label="Open full map"
                        >
                            View Full Map
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
