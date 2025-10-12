// resources/js/Components/Property/SingleProperty.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useForm, router } from "@inertiajs/react";
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
import { Heart, Share2 } from "lucide-react";

/* small utils */
const cn = (...c) => c.filter(Boolean).join(" ");
const isTruthy = (v) => v === true || v === 1 || v === "1";

/* Tiny toast (local) */
function InlineToast({ toast, onClose }) {
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(onClose, 2200);
        return () => clearTimeout(t);
    }, [toast, onClose]);
    if (!toast) return null;
    return (
        <div className="fixed bottom-5 right-5 z-50">
            <div
                className={cn(
                    "px-4 py-3 rounded-xl shadow-lg backdrop-blur text-white",
                    toast.type === "error" ? "bg-red-600/95" : "bg-emerald-600/95"
                )}
            >
                {toast.msg}
            </div>
        </div>
    );
}

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

export default function SingleProperty({ property, auth, agents, broker, seller, deal, initialFavorites = [] }) {
    const { data, setData, post, processing } = useForm({
        message: "",
        person: "",
    });

    const [isOpenModal, setIsOpenModal] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [isOpenDealForm, setIsOpenDealForm] = useState(false);
    const [isContactSeller, setIsContactSeller] = useState(false);

    // favorites + share
    const [favoriteIds, setFavoriteIds] = useState(
        Array.isArray(initialFavorites) ? initialFavorites : []
    );
    const isFavorite = favoriteIds.includes(property?.id);
    const [toast, setToast] = useState(null);

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

        const url = selectedPerson
            ? `/properties/${property.id}` // agent/broker inquiry
            : `/agents/properties/${property.id}/sent-inquiry`; // seller inquiry

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

    const toggleFavorite = (id) => {
        const willAdd = !favoriteIds.includes(id);
        setFavoriteIds((prev) => (willAdd ? [...prev, id] : prev.filter((x) => x !== id)));

        router.post(
            `/properties/${id}/favorites`,
            { id },
            {
                preserveScroll: true,
                onSuccess: () =>
                    setToast({
                        type: "success",
                        msg: willAdd ? "Added to favorites" : "Removed from favorites",
                    }),
                onError: () => {
                    // revert
                    setFavoriteIds((prev) => (willAdd ? prev.filter((x) => x !== id) : [...prev, id]));
                    setToast({ type: "error", msg: "Failed to update favorites" });
                },
            }
        );
    };

    const shareProperty = async () => {
        const url = `${window.location.origin}/properties/${property?.id}`;
        const title = property?.title || "Property";
        try {
            if (navigator.share) {
                await navigator.share({
                    title,
                    text: property?.address || "",
                    url,
                });
                return;
            }
        } catch {
            // fall through to clipboard
        }
        try {
            await navigator.clipboard.writeText(url);
            setToast({ type: "success", msg: "Link copied to clipboard" });
        } catch {
            // old school
            prompt("Copy this link:", url);
        }
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

                {/* Media with action overlays */}
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="relative lg:col-span-2">
                        {/* overlay actions */}
                        <div className="absolute z-10 top-3 right-3 flex items-center gap-2">
                            <button
                                onClick={shareProperty}
                                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur ring-1 ring-gray-200 hover:bg-white"
                                title="Share"
                                aria-label="Share"
                            >
                                <Share2 className="w-5 h-5 text-gray-700" />
                            </button>

                            <button
                                onClick={() => toggleFavorite(property?.id)}
                                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur ring-1 ring-gray-200 hover:bg-white"
                                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                                aria-label="Toggle favorite"
                            >
                                <Heart
                                    className={cn(
                                        "w-5 h-5",
                                        isFavorite ? "fill-rose-500 text-rose-500" : "text-gray-700"
                                    )}
                                />
                            </button>
                        </div>

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
                        <div className="bg-white ">
                            <AssignedAgents
                                agents={agents}
                                auth={auth}
                                setIsOpenModal={setIsOpenModal}
                                setSelectedPerson={setSelectedPerson}
                            />
                        </div>
                    ) : broker ? (
                        <div className="bg-whitE">
                            <ContactBroker
                                broker={broker}
                                setIsOpenModal={setIsOpenModal}
                                setSelectedPerson={setSelectedPerson}
                                setData={setData}
                            />
                        </div>
                    ) : null}

                </div>
            </div>
        </div>
    );
}
