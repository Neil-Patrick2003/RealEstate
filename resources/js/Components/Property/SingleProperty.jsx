// resources/js/Components/Property/SingleProperty.jsx
import React, { useState, useMemo, useEffect, useCallback } from "react";
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
import { Heart, Share2, X, MapPin, Home, BadgeInfo, Tag, Users, Star, Search,  } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import AgentCompactCard from "@/Components/Property/AgentCards/AgentCompactCard.jsx";
import {AgentDetailedCard} from "@/Components/Property/AgentCards/index.js";
import BackButton from "@/Components/BackButton.jsx";
dayjs.extend(relativeTime);

/* utils */
const cn = (...c) => c.filter(Boolean).join(" ");
const isTruthy = (v) => v === true || v === 1 || v === "1";

/* Toast */
function InlineToast({ toast, onClose }) {
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(onClose, 2400);
        return () => clearTimeout(t);
    }, [toast, onClose]);
    if (!toast) return null;
    return (
        <div className="fixed bottom-5 right-5 z-[70]">
            <div
                className={cn(
                    "px-4 py-3 rounded-xl border shadow-sm backdrop-blur text-sm font-medium",
                    toast.type === "error"
                        ? "bg-red-50 text-red-800 border-red-200"
                        : "bg-emerald-50 text-emerald-900 border-emerald-200"
                )}
            >
                {toast.msg}
            </div>
        </div>
    );
}

function AgentsModal({ show, onClose, agents, onAgentSelect }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAgents = agents.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="bg-white rounded-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">All Available Agents</h3>
                            <p className="text-gray-600 text-sm mt-1">Select an agent to contact about this property</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-4 relative">
                        <input
                            type="text"
                            placeholder="Search agents by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    </div>
                </div>

                {/* Agents List */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        {filteredAgents.map((agent) => (
                            <AgentDetailedCard
                                key={agent.id}
                                agent={agent}
                                onClick={() => onAgentSelect(agent)}
                            />
                        ))}
                    </div>

                    {filteredAgents.length === 0 && (
                        <div className="text-center py-8">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">No agents found</p>
                            <p className="text-sm text-gray-500 mt-1">Try adjusting your search</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}

/* Seller Contact Modal */
const SellerModal = ({ show, onClose, seller, message, onChangeMessage, onSubmit, processing }) => (
    <Modal show={show} onClose={onClose} maxWidth="lg">
        <div className="p-6 md:p-8 bg-white rounded-2xl shadow-sm relative">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                aria-label="Close modal"
            >
                <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Contact Property Owner</h2>
                <p className="text-gray-500 mt-1">Send a direct inquiry to the person selling this property.</p>
            </div>

            <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                {seller?.photo_url ? (
                    <img
                        src={`/storage/${seller?.photo_url}`}
                        alt={`${seller?.name || "Seller"} avatar`}
                        className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover"
                        onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                    />
                ) : (
                    <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-primary/20 text-primary-900 text-lg font-bold">
                        {seller?.name?.charAt(0)?.toUpperCase() || "S"}
                    </div>
                )}
                <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">{seller?.name || "Seller"}</h3>
                    <p className="text-sm text-primary font-semibold">Property Owner</p>
                </div>
            </div>

            <div className="mb-6">
                <label htmlFor="seller_message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Message (Max 250 characters)
                </label>
                <textarea
                    id="seller_message"
                    rows={5}
                    maxLength={250}
                    value={message}
                    onChange={(e) => onChangeMessage(e.target.value)}
                    placeholder="Hi, I'm interested in this property. I'd like to schedule a viewing or request a full details package."
                    className="w-full border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60"
                />
                <p className="text-xs text-gray-500 mt-2 text-right">{`${message.length}/250`}</p>
            </div>

            <div className="flex justify-end pt-3">
                <button
                    disabled={processing || !message.trim()}
                    onClick={onSubmit}
                    className={cn(
                        "bg-primary text-white font-semibold px-6 py-3 rounded-xl transition",
                        processing || !message.trim() ? "opacity-60 cursor-not-allowed" : "hover:bg-primary/90"
                    )}
                >
                    {processing ? "Sending…" : "Send Message Securely"}
                </button>
            </div>
        </div>
    </Modal>
);

export default function SingleProperty({ property, auth, agents, broker, seller, deal, initialFavorites = [], allAgents =[] }) {

    const { data, setData, post, processing, reset } = useForm({ message: "", person: "" });

    const [isOpenModal, setIsOpenModal] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [isOpenDealForm, setIsOpenDealForm] = useState(false);
    const [isContactSeller, setIsContactSeller] = useState(false);
    const [showAgentsModal, setShowAgentsModal] = useState(false);

    /* MEDIA */
    const [activeImageUrl, setActiveImageUrl] = useState(property?.image_url || null);
    useEffect(() => {
        if (property?.image_url && !activeImageUrl) setActiveImageUrl(property.image_url);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [property?.image_url]);

    /* FAVORITES + TOAST */
    const [favoriteIds, setFavoriteIds] = useState(Array.isArray(initialFavorites) ? initialFavorites : []);
    const isFavorite = favoriteIds.includes(property?.id);
    const [toast, setToast] = useState(null);
    const closeToast = useCallback(() => setToast(null), []);

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

        const url = selectedPerson ? `/properties/${property.id}` : `/agents/properties/${property.id}/sent-inquiry`;
        if (selectedPerson) setData("person", selectedPerson?.id);

        post(url, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setSelectedPerson(null);
                setIsOpenModal(false);
                setIsContactSeller(false);
                setToast({ type: "success", msg: selectedPerson ? `Inquiry sent to ${selectedPerson.name}!` : "Message sent successfully!" });
            },
        });
    };

    const toggleFavorite = (id) => {
        if (!auth?.user) {
            router.get(route("login"));
            return;
        }
        const willAdd = !favoriteIds.includes(id);
        setFavoriteIds((prev) => (willAdd ? [...prev, id] : prev.filter((x) => x !== id)));

        router.post(
            `/properties/${id}/favorites`,
            { id },
            {
                preserveScroll: true,
                onSuccess: () => setToast({ type: "success", msg: willAdd ? "Added to watchlist" : "Removed from watchlist" }),
                onError: () => {
                    setFavoriteIds((prev) => (willAdd ? prev.filter((x) => x !== id) : [...prev, id]));
                    setToast({ type: "error", msg: "Could not update watchlist. Try logging in again." });
                },
            }
        );
    };

    const shareProperty = async () => {
        const url = `${window.location.origin}/properties/${property?.id}`;
        const title = property?.title || "Property";
        try {
            if (navigator.share) {
                await navigator.share({ title, text: property?.address || "", url });
                return;
            }
        } catch {}
        try {
            await navigator.clipboard.writeText(url);
            setToast({ type: "success", msg: "Link copied to clipboard" });
        } catch {
            // eslint-disable-next-line no-alert
            prompt("Copy this link:", url);
        }
    };


    const InfoChip = ({ icon: Icon, label, value }) => (
        <div className="inline-flex items-center gap-2 rounded-full borader border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
            {Icon ? <Icon className="h-3.5 w-3.5 text-gray-500" /> : null}
            <span className="text-gray-500">{label}:</span>
            <span className="text-gray-900">{value ?? "—"}</span>
        </div>
    );

    return (
        <div className="w-full bg-gradient-to-b from-gray-50 to-white min-h-screen">
            <InlineToast toast={toast} onClose={closeToast} />
            <ToastHandler />

            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Quick facts chips */}

                    <div className="mt-4 flex flex-wrap gap-2">
                        <BackButton color='emerald'/>

                        <InfoChip
                            icon={Tag}
                            label="Posted"
                            value={
                                property.property_listing?.updated_at
                                    ? `Posted ${dayjs(property.property_listing.updated_at).fromNow()}`
                                    : "—"
                            }
                        />
                    </div>

                    <div className="flex items-center gap-2">

                        <button
                            onClick={shareProperty}
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <Share2 className="h-4 w-4" /> Share
                        </button>
                        <button
                            onClick={() => toggleFavorite(property?.id)}
                            aria-pressed={isFavorite}
                            className={cn(
                                "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium",
                                isFavorite ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                            )}
                        >
                            <Heart className={cn("h-4 w-4", isFavorite ? "fill-rose-600 text-rose-600" : "")} />
                            {isFavorite ? "Watching" : "Add to Watchlist"}
                        </button>
                    </div>
                </div>

                {/* Header Card */}
                <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200 p-5 sm:p-6 lg:p-8 shadow-sm">
                    <PropertyHeader title={normalized.title} address={normalized.address} isPresell={normalized.isPresell} />



                    {/* Media */}
                    <div className="mt-6 gap-6">
                        {/* Gallery */}
                        <div className="lg:col-span-2">
                            <div className="relative overflow-hidden rounded-2xl border border-gray-200 group">
                                {/* overlay actions */}
                                <div className="absolute z-10 top-4 right-4 flex items-center gap-2">
                                    <button
                                        onClick={() => toggleFavorite(property?.id)}
                                        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur border border-gray-200 hover:bg-white"
                                        title={isFavorite ? "Remove from watchlist" : "Add to watchlist"}
                                        aria-label="Toggle favorite"
                                    >
                                        <Heart className={cn("w-5 h-5", isFavorite ? "fill-rose-600 text-rose-600" : "text-gray-700")} />
                                    </button>
                                </div>
                                <div className="relative">
                                    <MainImage image_url={activeImageUrl || normalized.image_url} title={normalized.title} />
                                    <div className="pointer-events-none absolute inset-0 scale-100 group-hover:scale-[1.01] transition-transform"></div>
                                </div>
                            </div>

                            <div className="mt-3">
                                <Thumbnail images={normalized.images} activeImageUrl={activeImageUrl} onSelect={setActiveImageUrl} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details & Map */}
                <div className="mt-6 lg:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <section className="lg:col-span-2 rounded-2xl bg-white border border-gray-200 p-6 lg:p-8 shadow-sm">
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
                        <div className="mt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" /> Location & Map
                            </h2>
                            <div className="h-[380px] overflow-hidden rounded-xl border border-gray-200">
                                <PropertyMap coordinates={normalized.coordinate} />
                            </div>
                            {normalized?.address ? (
                                <p className="mt-4 text-sm text-gray-600 leading-relaxed">{normalized.address}</p>
                            ) : null}
                        </div>


                    </section>
                    <aside className="lg:col-span-1">
                        <div className="sticky">
                            {Array.isArray(agents) && agents.length > 0 ? (
                                <AssignedAgents
                                    agents={agents}
                                    auth={auth}
                                    setIsOpenModal={setIsOpenModal}
                                    setSelectedPerson={setSelectedPerson}
                                    setData={setData}
                                />
                            ) : broker ? (
                                <ContactBroker
                                    broker={broker}
                                    setIsOpenModal={setIsOpenModal}
                                    setSelectedPerson={setSelectedPerson}
                                    setData={setData} />
                            ) : (
                                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">Contact Agent</h3>
                                        <p className="text-gray-600 text-sm">Please select your preferred agent</p>
                                    </div>

                                    {/* Show only top 3 agents */}
                                    <div className="space-y-3">
                                        {allAgents.slice(0, 3).map((agent) => (
                                            <AgentCompactCard
                                                key={agent.id}
                                                agent={agent}
                                                onClick={() => {
                                                    setData('person', agent.id);
                                                    setSelectedPerson(agent);
                                                    setIsOpenModal(true);
                                                }}
                                            />
                                        ))}
                                    </div>

                                    {/* Show "View All" button if more agents */}
                                    {allAgents.length > 3 && (
                                        <button
                                            onClick={() => setShowAgentsModal(true)}
                                            className="w-full mt-4 py-2 text-center text-emerald-600 text-sm font-semibold border border-dashed border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
                                        >
                                            View All {allAgents.length} Agents
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Agents Modal */}
                    <AgentsModal
                        show={showAgentsModal}
                        onClose={() => setShowAgentsModal(false)}
                        agents={allAgents}
                        onAgentSelect={(agent) => {
                            console.log(agent);
                            setData('person', agent.id);
                            setSelectedPerson(agent);
                            setIsOpenModal(true);
                            setShowAgentsModal(false);
                        }}
                    />
                </div>

                <div className="h-4" />
            </div>

            {/* Modals */}
            <DealFormModal isOpen={isOpenDealForm} setIsOpen={setIsOpenDealForm} property={property} initialValue={deal} />
            <InquiryForm
                show={isOpenModal}
                onClose={() => setIsOpenModal(false)}
                person={selectedPerson}
                message={data.message}
                onChangeMessage={(val) => setData("message", val)}
                onSubmit={handleSubmitInquiry}
                processing={processing}
            />
            <SellerModal
                show={isContactSeller}
                onClose={() => setIsContactSeller(false)}
                seller={seller}
                message={data.message}
                onChangeMessage={(val) => setData("message", val)}
                onSubmit={handleSubmitInquiry}
                processing={processing}
            />

        </div>
    );
}
