import React, { useEffect, useMemo, useState } from "react";
import {useForm, usePage} from "@inertiajs/react";
import {
    FaBed,
    FaBath,
    FaCar,
    FaRulerCombined,
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
    FaWifi,
    FaSwimmingPool,
    FaTv,
    FaUtensils,
    FaParking,
    FaShower,
    FaCouch,
    FaHome,
    FaChevronLeft,
    FaChevronRight,
    FaCalendarAlt,
    FaEye,
    FaTag,
    FaCheckCircle,
    FaBuilding,
    FaHeart,
    FaShareAlt,
    FaPrint
} from "react-icons/fa";
import parse from 'html-react-parser';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Typography from '@tiptap/extension-typography';
import PropertyMap from "@/Components/PropertyMap.jsx";
import BackButton from "@/Components/BackButton.jsx";
import AssignedAgents from "@/Components/Property/AssignedAgents.jsx";
import ContactBroker from "@/Components/Property/ContactBroker.jsx";
import AgentCompactCard from "../../../Components/Property/AgentCards/AgentCompactCard.jsx";
import Modal from "@/Components/Modal.jsx";
import {Search, Users, X} from "lucide-react";
import {AgentDetailedCard} from "@/Components/Property/AgentCards/index.js";
import InquiryForm from "@/Components/Inquiry/InquiryForm.jsx";
import ToastHandler from "@/Components/ToastHandler.jsx";

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_KEY;

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

export default function PropertyShow() {
    const { props } = usePage();
    const { property = {} } = props ?? {};


    const listing = property.property_listing ?? {};

    const agents = listing.agents ?? [];

    const broker = listing.broker ?? null;


// All agents fallback
    const allAgents = props.allAgents ?? [];


    // Get property marker coordinates
    const marker = useMemo(() => {
        if (!property || !Array.isArray(property.coordinate)) return null;
        return property.coordinate.find((c) => c.type === "marker") || null;
    }, [property]);

    const propertyLat = marker ? parseFloat(marker.coordinates.lat) : null;
    const propertyLon = marker ? parseFloat(marker.coordinates.lng) : null;

    // Nearby places state
    const [places, setPlaces] = useState([]);
    const [loadingPlaces, setLoadingPlaces] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (!property || !property.id || !propertyLat || !propertyLon) return;
        if (!GEOAPIFY_KEY) {
            console.error("Missing VITE_GEOAPIFY_KEY");
            return;
        }

        async function loadPlaces() {
            try {
                setLoadingPlaces(true);
                const res = await fetch(`/properties/${property.id}/nearby-places`);
                if (!res.ok) throw new Error("Failed to load nearby places");
                const data = await res.json();

                const features = (data.features || []).filter(
                    (f) => f.geometry && f.geometry.type === "Point"
                );

                const sorted = features.sort((a, b) => {
                    const da = a.properties?.distance ?? 0;
                    const db = b.properties?.distance ?? 0;
                    return da - db;
                });

                const limited = sorted.slice(0, 10);

                const withTravel = await Promise.all(
                    limited.map(async (place) => {
                        const [lon, lat] = place.geometry.coordinates;

                        const url = `https://api.geoapify.com/v1/routing?waypoints=${propertyLat},${propertyLon}|${lat},${lon}&mode=drive&format=json&apiKey=${GEOAPIFY_KEY}`;

                        try {
                            const r = await fetch(url);
                            if (!r.ok) {
                                return {
                                    ...place,
                                    travelTimeMinutes: null,
                                    travelDistanceKm: null,
                                };
                            }

                            const routeData = await r.json();
                            const result =
                                routeData.results && routeData.results.length > 0
                                    ? routeData.results[0]
                                    : null;

                            const seconds = result?.time;
                            const meters = result?.distance;

                            const minutes =
                                typeof seconds === "number"
                                    ? Math.round(seconds / 60)
                                    : null;
                            const km =
                                typeof meters === "number"
                                    ? Number((meters / 1000).toFixed(1))
                                    : null;

                            return {
                                ...place,
                                travelTimeMinutes: minutes,
                                travelDistanceKm: km,
                            };
                        } catch (error) {
                            return {
                                ...place,
                                travelTimeMinutes: null,
                                travelDistanceKm: null,
                            };
                        }
                    })
                );

                setPlaces(withTravel);
            } catch (error) {
                console.error("Error loading places:", error);
                setPlaces([]);
            } finally {
                setLoadingPlaces(false);
            }
        }

        loadPlaces();
    }, [property, propertyLat, propertyLon]);

    // Filter places within 20 minutes
    const within20Mins = useMemo(() => {
        return places
            .filter(
                (p) =>
                    p.travelTimeMinutes != null &&
                    p.travelTimeMinutes <= 20
            )
            .sort((a, b) => a.travelTimeMinutes - b.travelTimeMinutes);
    }, [places]);

    // Format category label
    function formatCategory(place) {
        const cats = place.properties?.categories;
        if (!cats || !cats.length) return null;
        const main = cats[0];
        const parts = main.split(".");
        const label = parts[parts.length - 1].replace(/_/g, " ");
        return label.charAt(0).toUpperCase() + label.slice(1);
    }

    // Format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    // Feature icon mapping
    const getFeatureIcon = (featureName) => {
        const icons = {
            'wifi': <FaWifi className="text-emerald-600 text-lg" />,
            'pool': <FaSwimmingPool className="text-emerald-600 text-lg" />,
            'tv': <FaTv className="text-emerald-600 text-lg" />,
            'kitchen': <FaUtensils className="text-emerald-600 text-lg" />,
            'parking': <FaParking className="text-emerald-600 text-lg" />,
            'shower': <FaShower className="text-emerald-600 text-lg" />,
            'furnished': <FaCouch className="text-emerald-600 text-lg" />,
            'default': <FaHome className="text-emerald-600 text-lg" />
        };

        const lowerName = featureName.toLowerCase();
        for (const [key, icon] of Object.entries(icons)) {
            if (lowerName.includes(key)) return icon;
        }
        return icons.default;
    };

    // WYSIWYG Editor configuration
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Typography,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Placeholder.configure({
                placeholder: 'Add property description...',
            }),
        ],
        content: property?.description || '',
        editable: false,
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none min-h-[200px]',
            },
        },
    });

    const images = property?.images || [];

    const auth = usePage().props.auth;

    const getDashboardUrl = () => {
        if (!auth || !auth.user) return '/login';

        switch (auth.user.role) {
            case 'Buyer':
                return '/dashboard';
            case 'Seller':
                return '/seller/dashboard';
            case 'Agent':
                return '/agents/dashboard';
            case 'Broker':
                return '/broker/dashboard';
            default:
                return '/dashboard';
        }
    };

    const { data, setData, post, processing, reset } = useForm({ message: "", person: "" });
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [isOpenDealForm, setIsOpenDealForm] = useState(false);
    const [isContactSeller, setIsContactSeller] = useState(false);
    const [showAgentsModal, setShowAgentsModal] = useState(false);

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header Actions */}
            <ToastHandler/>
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <BackButton color='teal' />
                            <p>Back</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            {!auth?.user ? (
                                <a href="/login" className="text-emerald-600">Login</a>
                            ) : (
                                <a href={getDashboardUrl()} className="text-green-600">
                                    Dashboard
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="mb-8">
                    <ol className="flex items-center space-x-3 text-sm">
                        <li>
                            <a href="/" className="text-gray-500 hover:text-emerald-600 transition-colors">Home</a>
                        </li>
                        <li className="text-gray-300">/</li>
                        <li>
                            <a href="/properties" className="text-gray-500 hover:text-emerald-600 transition-colors">Properties</a>
                        </li>
                        <li className="text-gray-300">/</li>
                        <li className="font-medium text-emerald-700">{property?.title}</li>
                    </ol>
                </nav>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column - Property Details */}
                    <div className="lg:w-2/3 space-y-8">
                        {/* Property Images */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                            <div className="relative">
                                {/* Main Image */}
                                <div className="relative h-[500px] bg-gradient-to-br from-gray-100 to-gray-200">
                                    {images.length > 0 ? (
                                        <img
                                            src={`/storage/${images[currentImageIndex].image_url}`}
                                            alt={property?.title}
                                            className="w-full h-full object-cover transition-opacity duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FaBuilding className="text-gray-300 text-8xl" />
                                        </div>
                                    )}

                                    {/* Image Navigation */}
                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setCurrentImageIndex((prev) => prev > 0 ? prev - 1 : images.length - 1)}
                                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                            >
                                                <FaChevronLeft className="text-gray-700" />
                                            </button>
                                            <button
                                                onClick={() => setCurrentImageIndex((prev) => prev < images.length - 1 ? prev + 1 : 0)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                            >
                                                <FaChevronRight className="text-gray-700" />
                                            </button>
                                        </>
                                    )}

                                    {/* Image Counter */}
                                    {images.length > 1 && (
                                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                                            {currentImageIndex + 1} / {images.length}
                                        </div>
                                    )}
                                </div>

                                {/* Property Status Badge */}
                                <div className="absolute top-4 left-4">
                                    <div className={`px-4 py-2 rounded-full backdrop-blur-sm text-white font-semibold text-sm shadow-lg ${
                                        property?.property_listing?.status === 'Sold'
                                            ? 'bg-red-500/90'
                                            : 'bg-emerald-500/90'
                                    }`}>
                                        {property?.property_listing?.status || 'Available'}
                                    </div>
                                </div>

                                {/* Price Badge */}
                                <div className="absolute top-4 right-4">
                                    <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-xl">
                                        <div className="text-2xl font-bold text-emerald-700">
                                            {formatPrice(property?.price || 0)}
                                        </div>
                                        {!property?.isFixPrice && (
                                            <div className="text-xs text-gray-500 mt-1">Negotiable</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Thumbnail Images */}
                            {images.length > 1 && (
                                <div className="p-4 bg-gradient-to-r from-gray-50 to-white">
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                        {images.map((image, index) => (
                                            <button
                                                key={image.id}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-3 transition-all transform hover:scale-105 ${
                                                    currentImageIndex === index
                                                        ? 'border-emerald-500 shadow-lg'
                                                        : 'border-transparent hover:border-emerald-200'
                                                }`}
                                            >
                                                <img
                                                    src={`/storage/${image.image_url}`}
                                                    alt={`Property ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Property Information */}
                        <div className="space-y-8">
                            {/* Title and Basic Info */}
                            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                                    {property?.title}
                                </h1>
                                <div className="flex items-center text-gray-600 mb-6">
                                    <FaMapMarkerAlt className="mr-3 text-emerald-600" />
                                    <span className="text-lg">{property?.address}</span>
                                </div>

                                {/* Property Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                                    {property?.bedrooms > 0 && (
                                        <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-white rounded-xl border border-emerald-100 hover:border-emerald-200 transition-all">
                                            <div className="p-3 bg-emerald-100 rounded-lg">
                                                <FaBed className="text-2xl text-emerald-600" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                                                <div className="text-sm text-gray-500">Bedrooms</div>
                                            </div>
                                        </div>
                                    )}

                                    {property?.bathrooms > 0 && (
                                        <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-white rounded-xl border border-emerald-100 hover:border-emerald-200 transition-all">
                                            <div className="p-3 bg-emerald-100 rounded-lg">
                                                <FaBath className="text-2xl text-emerald-600" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                                                <div className="text-sm text-gray-500">Bathrooms</div>
                                            </div>
                                        </div>
                                    )}

                                    {property?.car_slots > 0 && (
                                        <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-white rounded-xl border border-emerald-100 hover:border-emerald-200 transition-all">
                                            <div className="p-3 bg-emerald-100 rounded-lg">
                                                <FaCar className="text-2xl text-emerald-600" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-gray-900">{property.car_slots}</div>
                                                <div className="text-sm text-gray-500">Car Slots</div>
                                            </div>
                                        </div>
                                    )}

                                    {property?.floor_area && (
                                        <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-white rounded-xl border border-emerald-100 hover:border-emerald-200 transition-all">
                                            <div className="p-3 bg-emerald-100 rounded-lg">
                                                <FaRulerCombined className="text-2xl text-emerald-600" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-gray-900">{property.floor_area}</div>
                                                <div className="text-sm text-gray-500">Floor Area (sqm)</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Additional Info */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <FaTag className="text-emerald-600" />
                                        <div>
                                            <div className="text-sm text-gray-500">Property Type</div>
                                            <div className="font-medium">{property?.property_type}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <FaEye className="text-emerald-600" />
                                        <div>
                                            <div className="text-sm text-gray-500">Views</div>
                                            <div className="font-medium">{property?.views || 0}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <FaCalendarAlt className="text-emerald-600" />
                                        <div>
                                            <div className="text-sm text-gray-500">Listed On</div>
                                            <div className="font-medium">
                                                {new Date(property?.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description with WYSIWYG */}
                            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                                    Property Description
                                </h2>
                                {editor ? (
                                    <EditorContent
                                        editor={editor}
                                        className="min-h-[200px]"
                                    />
                                ) : (
                                    <div className="prose prose-lg max-w-none text-gray-700">
                                        {parse(property?.description || 'No description available.')}
                                    </div>
                                )}
                            </div>

                            {/* Features & Amenities */}
                            {property?.features && property.features.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                                        Features & Amenities
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {property.features.map((feature) => (
                                            <div
                                                key={feature.id}
                                                className="flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-50 to-white rounded-xl border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all"
                                            >
                                                {getFeatureIcon(feature.name)}
                                                <span className="font-medium text-gray-800">{feature.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Detailed Specifications */}
                            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                                    Detailed Specifications
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                            <span className="text-gray-600">Property Type</span>
                                            <span className="font-medium">{property?.property_type}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                            <span className="text-gray-600">Sub Type</span>
                                            <span className="font-medium">{property?.sub_type}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                            <span className="text-gray-600">Total Rooms</span>
                                            <span className="font-medium">{property?.total_rooms || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                            <span className="text-gray-600">Lot Area</span>
                                            <span className="font-medium">{property?.lot_area ? `${property.lot_area} sqm` : 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                            <span className="text-gray-600">Year Built</span>
                                            <span className="font-medium">N/A</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                            <span className="text-gray-600">Parking Type</span>
                                            <span className="font-medium">Covered</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                            <span className="text-gray-600">Condition</span>
                                            <span className="font-medium">Excellent</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                            <span className="text-gray-600">Furnishing</span>
                                            <span className="font-medium">Semi-furnished</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                                    Location
                                </h2>
                                <PropertyMap coordinates={property.coordinate} />
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Seller & Nearby Places */}
                    <div className="lg:w-1/3 space-y-8">
                        <aside className="lg:col-span-1">
                            <div className="sticky">
                                {Array.isArray(agents) && agents.length > 0 ? (
                                    <AssignedAgents
                                        agents={agents}
                                        auth={auth.user}
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
                                                        console.log(agent)
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

                        {/* Nearby Places */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Nearby Amenities
                                </h2>
                                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                    ≤ 20 mins drive
                                </span>
                            </div>

                            {loadingPlaces && (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                                    <p className="text-sm text-gray-500">Finding nearby amenities...</p>
                                </div>
                            )}

                            {!loadingPlaces && within20Mins.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 mb-3">
                                        <FaMapMarkerAlt className="text-4xl mx-auto" />
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        No amenities found within 20 minutes drive.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                {within20Mins.map((place) => {
                                    const p = place.properties || {};
                                    const categoryLabel = formatCategory(place);

                                    return (
                                        <div
                                            key={p.place_id}
                                            className="group p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                                                        {p.name || "Unnamed place"}
                                                    </div>
                                                    {categoryLabel && (
                                                        <div className="flex items-center mt-1">
                                                            <span className="text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                                                                {categoryLabel}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {p.address_line1 && (
                                                        <div className="text-xs text-gray-500 mt-2">
                                                            {p.address_line1}
                                                        </div>
                                                    )}
                                                </div>
                                                {place.travelTimeMinutes != null && (
                                                    <div className="text-right">
                                                        <div className="text-lg font-bold text-emerald-600">
                                                            {place.travelTimeMinutes} min
                                                        </div>
                                                        {place.travelDistanceKm != null && (
                                                            <div className="text-xs text-gray-500">
                                                                {place.travelDistanceKm} km
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {within20Mins.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-500 text-center">
                                        Showing {within20Mins.length} nearby amenities
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Property ID & Tags */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">Property ID</span>
                                    <span className="font-mono font-bold text-gray-900">#{property?.id}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">Last Updated</span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(property?.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
            <InquiryForm
                show={isOpenModal}
                onClose={() => setIsOpenModal(false)}
                person={selectedPerson}
                message={data.message}
                onChangeMessage={(val) => setData("message", val)}
                onSubmit={handleSubmitInquiry}
                processing={processing}
            />
        </div>
    );
}
