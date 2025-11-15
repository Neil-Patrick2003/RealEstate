import React, { useEffect, useRef, useState } from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import Modal from "@/Components/Modal.jsx";

import {
    Trash2,
    X,
    RotateCcw,
    Check as CheckLine,
    MapPin as LucideMapPin,
    House,
    Building2,
    Building,
    Landmark,
    Upload,
    Image as ImageIcon,
    Map,
    Users,
    Star,
    FileText,
    AlertCircle,
    CheckCircle2,
    Lightbulb,
    Home,
    Shield,
    Sparkles
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBath,
    faBed,
    faCar,
    faDoorClosed,
    faMapMarkerAlt,
    faMoneyBillWave,
    faRuler,
    faRulerCombined
} from "@fortawesome/free-solid-svg-icons";

import NavBar from "@/Components/NavBar.jsx";
import Breadcrumb from "@/Components/Breadcrumbs.jsx";
import TextInput from "@/Components/TextInput.jsx";
import InputError from "@/Components/InputError.jsx";
import Toggle from "@/Components/Toggle.jsx";
import AllowMultiAgentToggle from "@/Components/Toggle/AllowMultiAgentToggle.jsx";
import MapWithDraw from "@/Components/MapWithDraw";
import ToastHandler from "@/Components/ToastHandler.jsx";

/* ---------------- Design Constants ---------------- */
const DESIGN = {
    colors: {
        primary: {
            50: '#f0fdf4',
            100: '#dcfce7',
            600: '#22c55e',
            700: '#15803d',
            900: '#14532d',
        },
        accent: {
            50: '#fff7ed',
            600: '#ea580c',
        }
    }
};

const money = (n) =>
    Number(n || 0).toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0
    });

/* ---------------- constants ---------------- */
const PROPERTY_TYPES = [
    {
        name: "Apartment",
        icon: Landmark,
        subTypes: ["Penthouse", "Loft", "Bedspace", "Room"],
        color: "from-primary to-accent"
    },
    {
        name: "Commercial",
        icon: Building,
        subTypes: ["Retail", "Offices", "Building", "Warehouse", "Serviced Office", "Coworking Space"],
        color: "from-primary to-accent"
    },
    {
        name: "Condominium",
        icon: Building2,
        subTypes: ["Loft", "Studio", "Penthouse", "Other", "Condotel"],
        color: "from-primary to-accent"
    },
    {
        name: "House",
        icon: House,
        subTypes: ["Townhouse", "Beach House", "Single Family House", "Villas"],
        color: "from-primary to-accent"
    },
    {
        name: "Land",
        icon: LucideMapPin,
        subTypes: ["Beach Lot", "Memorial Lot", "Agricultural Lot", "Commercial Lot", "Residential Lot", "Parking Lot"],
        color: "from-primary to-accent"
    }
];

const REQUIREMENTS = [
    "Valid government-issued ID (seller)",
    "Proof of ownership / Title (TCT/CCT) or SPA if applicable",
    "Latest Real Property Tax (RPT) receipt",
    "Association dues / utility clearance (if applicable)",
    "Signed listing authority or authorization letter",
];

export default function Create({ agents = [] }) {
    const authId = usePage().props?.auth?.user?.id;
    const { data, setData, processing, post, reset, errors } = useForm({
        title: "",
        description: "",
        property_type: "",
        property_sub_type: "",
        price: "",
        address: "",
        lot_area: "",
        floor_area: "",
        total_rooms: "",
        total_bedrooms: "",
        total_bathrooms: "",
        car_slots: "",
        isPresell: false,
        image_url: "",
        feature_name: [],
        image_urls: [],
        boundary: null,
        pin: null,
        agent_ids: [],
        allowMultipleAgent: false
    });

    /* ---------------- state ---------------- */
    const editorRef = useRef(null);
    const quillRef = useRef(null);
    const mapRef = useRef(null);

    const [selectedType, setSelectedType] = useState(null);
    const [selectedSubType, setSelectedSubType] = useState(null);
    const [preview, setPreview] = useState(null);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [featureName, setFeatureName] = useState("");
    const [selectedAgentIds, setSelectedAgentIds] = useState([]);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [acceptChecked, setAcceptChecked] = useState(false);
    const [activeSection, setActiveSection] = useState("basic");

    /* ---------------- quill init ---------------- */
    useEffect(() => {
        if (editorRef.current && !quillRef.current) {
            const quill = new Quill(editorRef.current, {
                theme: "snow",
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link', 'image'],
                        ['clean']
                    ]
                }
            });
            quill.on("text-change", () => {
                const html = quill.root.innerHTML;
                setData("description", html);
            });
            quillRef.current = quill;
        }
    }, [setData]);

    /* ---------------- selected type from form (if coming back) ---------------- */
    useEffect(() => {
        if (data.property_type) {
            const t = PROPERTY_TYPES.find((x) => x.name === data.property_type);
            setSelectedType(t || null);
        }
        if (data.property_sub_type) {
            setSelectedSubType(data.property_sub_type);
        }
    }, []);

    /* ---------------- features ---------------- */
    const addFeature = () => {
        const t = featureName.trim();
        if (!t) return;
        setData("feature_name", [...(data.feature_name || []), t]);
        setFeatureName("");
    };
    const removeFeature = (i) =>
        setData("feature_name", (data.feature_name || []).filter((_, idx) => idx !== i));

    /* ---------------- images ---------------- */
    const handleImagePropertyChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(url);
        setData("image_url", file);
    };

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const newPreviews = files.map((file) => ({
            file,
            url: URL.createObjectURL(file)
        }));
        setImagePreviews((prev) => [...prev, ...newPreviews]);
        setData("image_urls", [...(data.image_urls || []), ...files]);
    };

    const handleRemoveImage = (index) => {
        setImagePreviews((prev) => {
            const copy = [...prev];
            const rm = copy.splice(index, 1)[0];
            if (rm?.url) URL.revokeObjectURL(rm.url);
            return copy;
        });
        setData("image_urls", (data.image_urls || []).filter((_, i) => i !== index));
    };

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
            imagePreviews.forEach((p) => p?.url && URL.revokeObjectURL(p.url));
        };
    }, [preview, imagePreviews]);

    /* ---------------- map ---------------- */
    const handleMapChange = ({ boundary, pin }) => {
        setData("boundary", boundary);
        setData("pin", pin);
    };

    /* ---------------- agents ---------------- */
    const toggleAgentSelection = (id) => {
        setSelectedAgentIds((prev) => {
            let next;
            if (data.allowMultipleAgent) {
                next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
            } else {
                next = prev.includes(id) ? [] : [id];
            }
            setData("agent_ids", next);
            return next;
        });
    };

    /* ---------------- submit ---------------- */
    const handleSubmit = (e) => {
        e.preventDefault();
        post("/post-property", {
            onSuccess: () => {
                reset();
                setImagePreviews((prev) => {
                    prev.forEach((p) => p?.url && URL.revokeObjectURL(p.url));
                    return [];
                });
                if (preview) URL.revokeObjectURL(preview);
                setPreview(null);
                setSelectedType(null);
                setSelectedSubType(null);
                setSelectedAgentIds([]);
                quillRef.current?.setText("");
            },
            forceFormData: true
        });
    };

    const openReviewModal = (e) => {
        e.preventDefault();
        setShowReviewModal(true);
    };

    const confirmAndSubmit = () => {
        setShowReviewModal(false);
        setAcceptChecked(false);
        handleSubmit(new Event("submit"));
    };

    const commissionAmount = Number(data.price || 0) * 0.05;
    const isLand = selectedType?.name === "Land";
    const pages = [
        { name: "Properties", href: "/seller/properties", current: false },
        { name: "Create", href: "/post-property", current: true }
    ];

    /* ---------------- Progress Tracking ---------------- */
    const progressSections = [
        { id: "basic", label: "Basic Info", icon: FileText },
        { id: "type", label: "Property Type", icon: Home },
        { id: "details", label: "Details", icon: Star },
        { id: "features", label: "Features", icon: Lightbulb },
        { id: "media", label: "Media", icon: ImageIcon },
        { id: "location", label: "Location", icon: Map },
        { id: "agents", label: "Agents", icon: Users }
    ];

    return (
        <div className="min-h-screen pt-20 bg-gradient-to-l from-emerald-50/30 to-emerald-50/20">
            <NavBar />
            <ToastHandler />

            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">

                {/* Enhanced Page Header */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 border border-emerald-200/50 shadow-lg sm:shadow-xl">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="p-2 sm:p-3 bg-gradient-to-br from-primary to-accent rounded-xl sm:rounded-2xl">
                                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Create Property Listing</h1>
                                <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl">
                                    Showcase your property with stunning details and reach potential buyers faster.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 bg-emerald-100 text-emerald-800 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-emerald-200 mt-4 lg:mt-0">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-600 rounded-full animate-pulse" />
                            <span className="font-semibold text-sm sm:text-base">Draft Mode</span>
                            <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                    </div>

                    {/* Progress Tracker */}
                    <div className="mt-6 sm:mt-8">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Creation Progress</h3>
                            <span className="text-xs sm:text-sm text-gray-600">
                                {Math.round((progressSections.findIndex(s => s.id === activeSection) + 1) / progressSections.length * 100)}% Complete
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                            {progressSections.map((section, index) => {
                                const isActive = section.id === activeSection;
                                const isCompleted = progressSections.findIndex(s => s.id === activeSection) > index;
                                const Icon = section.icon;

                                return (
                                    <React.Fragment key={section.id}>
                                        <button
                                            onClick={() => setActiveSection(section.id)}
                                            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm ${
                                                isActive
                                                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg transform scale-105'
                                                    : isCompleted
                                                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span className="font-medium hidden xs:block">{section.label}</span>
                                        </button>
                                        {index < progressSections.length - 1 && (
                                            <div className={`hidden sm:block w-4 sm:w-6 md:w-8 h-1 rounded-full ${
                                                isCompleted ? 'bg-emerald-600' : 'bg-gray-200'
                                            }`} />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <form className="space-y-6 sm:space-y-8" onSubmit={openReviewModal}>
                    {/* Basic Info */}
                    <section
                        className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-emerald-200/50 shadow-lg space-y-6 sm:space-y-8"
                        onFocus={() => setActiveSection("basic")}
                    >
                        <SectionHeader
                            title="Basic Information"
                            subtitle="Essential property details that attract buyers"
                            icon={FileText}
                            status={data.title && data.description ? "complete" : "incomplete"}
                        />

                        {/* Presell Toggle Card */}
                        <div className="bg-gradient-to-r from-emerald-50 to-emerald-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-emerald-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="p-2 sm:p-3 bg-emerald-600 rounded-lg sm:rounded-xl">
                                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-base sm:text-lg">Pre-selling Property</p>
                                        <p className="text-emerald-700 text-xs sm:text-sm">Mark if this is a pre-construction sale</p>
                                    </div>
                                </div>
                                <Toggle data={data} setData={setData} name="isPresell" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-6 sm:gap-8">
                            <div className="space-y-4 sm:space-y-6">
                                <div className="space-y-2 sm:space-y-3">
                                    <label htmlFor="title" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                                        Property Title *
                                    </label>
                                    <TextInput
                                        id="title"
                                        name="title"
                                        value={data.title}
                                        onChange={(e) => setData("title", e.target.value)}
                                        className="w-full rounded-lg sm:rounded-xl border-gray-300 focus:border-emerald-600 focus:ring-emerald-600 text-base sm:text-lg py-2 sm:py-3"
                                        placeholder="e.g., Beautiful 3-Bedroom Condo in BGC"
                                        autoComplete="off"
                                        required
                                    />
                                    <InputError message={errors.title} className="text-sm" />
                                </div>
                            </div>

                            <div className="space-y-2 sm:space-y-3">
                                <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                                    Property Description
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl sm:rounded-2xl overflow-hidden hover:border-emerald-300 transition-colors">
                                    <div ref={editorRef} id="editor" className="bg-white min-h-[150px] sm:min-h-[200px]" />
                                </div>
                                <InputError message={errors.description} className="text-sm" />
                            </div>
                        </div>
                    </section>

                    {/* Property Type */}
                    <section
                        className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-emerald-200/50 shadow-lg space-y-6 sm:space-y-8"
                        onFocus={() => setActiveSection("type")}
                    >
                        <SectionHeader
                            title="Property Type"
                            subtitle="Choose the category that best describes your property"
                            icon={Home}
                            status={data.property_type ? "complete" : "incomplete"}
                        />

                        <div className="space-y-4 sm:space-y-6">
                            <div className="space-y-3 sm:space-y-4">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Property Type *</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                                    {PROPERTY_TYPES.map((type) => {
                                        const active = selectedType?.name === type.name;
                                        const Icon = type.icon;
                                        return (
                                            <button
                                                type="button"
                                                key={type.name}
                                                className={`relative p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center text-center rounded-lg sm:rounded-xl md:rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                                                    active
                                                        ? `border-emerald-600 bg-gradient-to-br ${type.color} text-white shadow-lg transform scale-105`
                                                        : "border-gray-200 bg-white hover:border-emerald-300"
                                                }`}
                                                onClick={() => {
                                                    setSelectedType(type);
                                                    setData("property_type", type.name);
                                                    setSelectedSubType(null);
                                                    setData("property_sub_type", "");
                                                }}
                                            >
                                                <Icon className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mb-2 sm:mb-3 ${active ? "text-white" : "text-gray-600"}`} />
                                                <span className={`font-semibold text-xs sm:text-sm ${active ? "text-white" : "text-gray-700"}`}>
                                                    {type.name}
                                                </span>
                                                {active && (
                                                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                                                        <CheckCircle2 className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                <InputError message={errors.property_type} className="mt-1" />
                            </div>

                            {selectedType && (
                                <div className="space-y-3 sm:space-y-4">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Property Subtype *</h3>
                                    <div className="flex flex-wrap gap-2 sm:gap-3">
                                        {selectedType.subTypes.map((sub) => {
                                            const active = selectedSubType === sub;
                                            return (
                                                <button
                                                    type="button"
                                                    key={sub}
                                                    className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
                                                        active
                                                            ? "bg-gradient-to-r from-primary to-accent text-white border-emerald-600 shadow-lg transform scale-105"
                                                            : "bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                                                    }`}
                                                    onClick={() => {
                                                        setSelectedSubType(sub);
                                                        setData("property_sub_type", sub);
                                                    }}
                                                >
                                                    {sub}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <InputError message={errors.property_sub_type} className="mt-1" />
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Property Details */}
                    <section
                        className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-emerald-200/50 shadow-lg space-y-6 sm:space-y-8"
                        onFocus={() => setActiveSection("details")}
                    >
                        <SectionHeader
                            title="Property Details"
                            subtitle="Detailed specifications that help buyers decide"
                            icon={Star}
                            status={data.price && data.address ? "complete" : "incomplete"}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                            {/* Address */}
                            <div className="md:col-span-2">
                                <LabelWithIcon label="Address *" icon={faMapMarkerAlt} />
                                <TextInput
                                    id="address"
                                    name="address"
                                    value={data.address}
                                    onChange={(e) => setData("address", e.target.value)}
                                    className="pl-10 sm:pl-12 mt-1 sm:mt-2 block w-full rounded-lg sm:rounded-xl border-gray-300 focus:border-emerald-600 focus:ring-emerald-600 py-2 sm:py-3"
                                    placeholder="Enter complete property address"
                                    autoComplete="off"
                                    required
                                />
                                <InputError message={errors.address} className="mt-1" />
                            </div>

                            {/* Price */}
                            <div>
                                <LabelWithIcon label="Price *" icon={faMoneyBillWave} />
                                <TextInput
                                    id="price"
                                    name="price"
                                    type="number"
                                    inputMode="decimal"
                                    value={data.price}
                                    onChange={(e) => setData("price", e.target.value)}
                                    className="pl-10 sm:pl-12 mt-1 sm:mt-2 block w-full rounded-lg sm:rounded-xl border-gray-300 focus:border-emerald-600 focus:ring-emerald-600 py-2 sm:py-3"
                                    placeholder="0.00"
                                    required
                                />
                                <div className="mt-1 sm:mt-2 p-2 sm:p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                    <p className="text-sm font-semibold text-emerald-800">{money(data.price)}</p>
                                </div>
                                <InputError message={errors.price} className="mt-1" />
                            </div>

                            {/* Area Fields */}
                            <div>
                                <LabelWithIcon label={isLand ? "Lot Area (m²) *" : "Floor Area (m²) *"} icon={isLand ? faRuler : faRulerCombined} />
                                <TextInput
                                    id={isLand ? "lot_area" : "floor_area"}
                                    name={isLand ? "lot_area" : "floor_area"}
                                    type="number"
                                    inputMode="numeric"
                                    value={isLand ? data.lot_area : data.floor_area}
                                    onChange={(e) => setData(isLand ? "lot_area" : "floor_area", e.target.value)}
                                    className="pl-10 sm:pl-12 mt-1 sm:mt-2 block w-full rounded-lg sm:rounded-xl border-gray-300 focus:border-emerald-600 focus:ring-emerald-600 py-2 sm:py-3"
                                    required
                                />
                                <InputError message={isLand ? errors.lot_area : errors.floor_area} className="mt-1" />
                            </div>

                            {/* Room Details */}
                            {[
                                { id: "total_rooms", label: "Total Rooms", icon: faDoorClosed },
                                { id: "total_bedrooms", label: "Total Bedrooms", icon: faBed },
                                { id: "total_bathrooms", label: "Total Bathrooms", icon: faBath },
                                { id: "car_slots", label: "Parking Slots", icon: faCar }
                            ].map((field) => (
                                <div key={field.id}>
                                    <LabelWithIcon label={field.label} icon={field.icon} />
                                    <TextInput
                                        id={field.id}
                                        name={field.id}
                                        type="number"
                                        inputMode="numeric"
                                        value={data[field.id]}
                                        onChange={(e) => setData(field.id, e.target.value)}
                                        className="pl-10 sm:pl-12 mt-1 sm:mt-2 block w-full rounded-lg sm:rounded-xl border-gray-300 focus:border-emerald-600 focus:ring-emerald-600 py-2 sm:py-3"
                                    />
                                    <InputError message={errors[field.id]} className="mt-1" />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Features */}
                    <section
                        className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-emerald-200/50 shadow-lg space-y-6 sm:space-y-8"
                        onFocus={() => setActiveSection("features")}
                    >
                        <SectionHeader
                            title="Property Features"
                            subtitle="Highlight what makes your property special"
                            icon={Lightbulb}
                            status={(data.feature_name || []).length > 0 ? "complete" : "incomplete"}
                        />

                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-200">
                            <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
                                {(data.feature_name || []).map((tag, index) => (
                                    <span key={`${tag}-${index}`} className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full bg-white border border-emerald-300 text-emerald-700 font-medium shadow-sm text-xs sm:text-sm">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className="text-red-600 hover:text-red-700 transition-colors text-sm"
                                        >
                                            &times;
                                        </button>
                                    </span>
                                ))}
                                {(data.feature_name || []).length === 0 && (
                                    <span className="text-emerald-600 italic text-sm sm:text-base">No features added yet. Start typing below!</span>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <input
                                    type="text"
                                    value={featureName}
                                    onChange={(e) => setFeatureName(e.target.value)}
                                    onKeyDown={(e) => (e.key === "Enter" ? (e.preventDefault(), addFeature()) : null)}
                                    placeholder="Enter feature (e.g., Swimming Pool, Garden, Smart Home...)"
                                    className="flex-1 border-2 border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 transition text-sm sm:text-base"
                                />
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    disabled={!featureName.trim()}
                                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all text-sm sm:text-base ${
                                        featureName.trim()
                                            ? "bg-gradient-to-r from-primary to-accent hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                                            : "bg-gray-300 text-gray-600 cursor-not-allowed"
                                    }`}
                                >
                                    Add Feature
                                </button>
                            </div>
                            <InputError message={errors.feature_name} className="mt-2 sm:mt-3" />
                        </div>
                    </section>

                    {/* Media Sections */}
                    <div className="flex flex-col gap-6 sm:gap-8">
                        {/* Main Image */}
                        <section
                            className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-emerald-200/50 shadow-lg space-y-4 sm:space-y-6"
                            onFocus={() => setActiveSection("media")}
                        >
                            <SectionHeader
                                title="Main Image"
                                subtitle="Primary photo that grabs attention"
                                icon={ImageIcon}
                                status={preview ? "complete" : "incomplete"}
                            />

                            <div className="flex flex-col items-center">
                                <label
                                    htmlFor="property_image"
                                    className={`flex flex-col items-center justify-center w-full h-48 sm:h-64 border-2 border-dashed rounded-xl sm:rounded-2xl transition-all duration-300 cursor-pointer ${
                                        preview
                                            ? "border-emerald-600 bg-emerald-50"
                                            : "border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50"
                                    }`}
                                >
                                    {!preview ? (
                                        <EmptyUpload />
                                    ) : (
                                        <div className="relative w-full h-full p-2 sm:p-4">
                                            <img src={preview} alt="Main Preview" className="w-full h-full rounded-lg sm:rounded-xl object-cover shadow-lg" />
                                            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-emerald-600 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold">
                                                Main Photo
                                            </div>
                                        </div>
                                    )}
                                </label>

                                <input
                                    type="file"
                                    id="property_image"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImagePropertyChange}
                                />
                                <InputError message={errors.image_url} className="mt-2 sm:mt-3" />

                                <button
                                    type="button"
                                    onClick={() => document.getElementById("property_image")?.click()}
                                    className="mt-4 sm:mt-6 w-full py-3 sm:py-4 text-base sm:text-lg font-semibold text-white bg-gradient-to-r from-primary to-accent hover:from-emerald-600 hover:to-emerald-700 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3"
                                >
                                    <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
                                    {preview ? "Change Main Image" : "Upload Main Image"}
                                </button>
                            </div>
                        </section>

                        {/* Other Images */}
                        <section className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-emerald-200/50 shadow-lg space-y-4 sm:space-y-6">
                            <SectionHeader
                                title="Gallery Images"
                                subtitle="Additional photos to showcase your property"
                                icon={ImageIcon}
                                status={imagePreviews.length > 0 ? "complete" : "incomplete"}
                            />

                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                                    {imagePreviews.map((img, index) => (
                                        <div key={index} className="relative group">
                                            <img src={img.url} alt={`Preview ${index}`} className="w-full h-24 sm:h-28 md:h-32 object-cover rounded-lg sm:rounded-xl shadow-md" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 sm:p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg text-xs"
                                                title="Remove"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                            <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black/50 text-white text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs">
                                                {index + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <label
                                htmlFor="image_upload"
                                className="flex flex-col items-center justify-center w-full h-40 sm:h-48 border-2 border-dashed border-gray-300 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-50 cursor-pointer hover:border-emerald-400 transition-all duration-300"
                            >
                                <UploadGlyph />
                                <p className="mb-1 text-base sm:text-lg font-semibold text-gray-700">Add More Photos</p>
                                <p className="text-xs sm:text-sm text-gray-600 text-center">PNG, JPG, WebP — click or drag & drop</p>
                                <input id="image_upload" type="file" accept="image/*" multiple onChange={handleImagesChange} className="hidden" />
                            </label>
                            <InputError message={errors.image_urls} className="mt-2 sm:mt-3" />
                        </section>
                    </div>

                    {/* Location */}
                    <section
                        className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-emerald-200/50 shadow-lg space-y-4 sm:space-y-6"
                        onFocus={() => setActiveSection("location")}
                    >
                        <SectionHeader
                            title="Location"
                            subtitle="Pin your property on the map for better visibility"
                            icon={Map}
                            status={data.pin ? "complete" : "incomplete"}
                        />

                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-200">
                            <div className="h-100 md:h-100">
                                <MapWithDraw
                                    userId={authId}
                                    boundary={data.boundary}
                                    pin={data.pin}
                                    onChange={handleMapChange}
                                    whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
                                />
                            </div>
                        </div>
                        <InputError message={errors.boundary} className="mt-2 sm:mt-3" />
                    </section>

                    {/* Agents */}
                    <section
                        className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-emerald-200/50 shadow-lg space-y-4 sm:space-y-6"
                        onFocus={() => setActiveSection("agents")}
                    >
                        <SectionHeader
                            title="Agents"
                            subtitle="Choose professionals to handle your listing"
                            icon={Users}
                            status={selectedAgentIds.length > 0 ? "complete" : "incomplete"}
                        />

                        {/* Multiple Agents Toggle */}
                        <div className="bg-gradient-to-r from-emerald-50 to-emerald-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-emerald-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="p-2 sm:p-3 bg-emerald-600 rounded-lg sm:rounded-xl">
                                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-base sm:text-lg">Allow Multiple Agents</p>
                                        <p className="text-emerald-700 text-xs sm:text-sm">Let several agents co-handle this property</p>
                                    </div>
                                </div>
                                <AllowMultiAgentToggle data={data} setData={setData} name="allowMultipleAgent" />
                            </div>
                        </div>

                        {agents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                {agents.map((agent) => (
                                    <div
                                        key={agent.id}
                                        className={`p-3 sm:p-4 border-2 rounded-xl sm:rounded-2xl transition-all duration-300 cursor-pointer ${
                                            selectedAgentIds.includes(agent.id)
                                                ? "border-emerald-600 bg-emerald-50 shadow-lg transform scale-105"
                                                : "border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md"
                                        }`}
                                        onClick={() => toggleAgentSelection(agent.id)}
                                    >
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            {agent.photo_url ? (
                                                <img
                                                    src={`/storage/${agent.photo_url}`}
                                                    alt={`${agent.name}`}
                                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl object-cover border-2 border-white shadow-md"
                                                    onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                                                />
                                            ) : (
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 text-white flex items-center justify-center text-base sm:text-lg font-semibold border-2 border-white shadow-md">
                                                    {agent.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{agent.name}</p>
                                                <p className="text-xs sm:text-sm text-gray-600 truncate">{agent.email}</p>
                                                <p className="text-xs text-emerald-600 font-medium mt-0.5 sm:mt-1">
                                                    {agent.role || "Real Estate Agent"}
                                                </p>
                                            </div>
                                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                                selectedAgentIds.includes(agent.id)
                                                    ? "bg-emerald-600 border-emerald-600"
                                                    : "border-gray-300"
                                            }`}>
                                                {selectedAgentIds.includes(agent.id) && (
                                                    <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 sm:py-8 bg-emerald-50 rounded-xl sm:rounded-2xl border border-emerald-200">
                                <Users className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 mx-auto mb-3 sm:mb-4" />
                                <p className="text-emerald-700 text-sm sm:text-base">No agents available at the moment.</p>
                                <p className="text-xs sm:text-sm text-emerald-600 mt-1">Please check back later or contact support.</p>
                            </div>
                        )}
                    </section>

                    {/* Enhanced Actions */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-emerald-200/50 shadow-lg">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 ${
                                    processing
                                        ? "bg-gray-400 cursor-not-allowed text-white"
                                        : "bg-gradient-to-r from-primary to-accent hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                                }`}
                            >
                                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                                {processing ? "Creating Property..." : "Review & Submit Listing"}
                            </button>

                            <Link
                                href="/"
                                className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-3 sm:py-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-base sm:text-lg"
                            >
                                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                Cancel Creation
                            </Link>
                        </div>
                    </div>
                </form>

                {/*Review Modal*/}
                <Modal show={showReviewModal} onClose={() => setShowReviewModal(false)} maxWidth="4xl">
                    <div className="relative bg-white md:rounded-3xl shadow-2xl w-full max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="flex-shrink-0 bg-gradient-to-r from-primary to-accent text-white p-4 sm:p-6 rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl">
                                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold">Ready to List Your Property</h3>
                                        <p className="text-emerald-100 text-xs sm:text-sm">Final review before publishing your listing</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowReviewModal(false)}
                                    className="p-1 sm:p-2 hover:bg-white/20 rounded-lg sm:rounded-xl transition-colors"
                                >
                                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                            <div className="space-y-6 sm:space-y-8">
                                {/* Requirements */}
                                <div className="bg-gradient-to-br from-emerald-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-200">
                                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                                        Required Documents Checklist
                                    </h4>
                                    <ul className="space-y-2 sm:space-y-3">
                                        {REQUIREMENTS.map((item, i) => (
                                            <li key={i} className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base">
                                                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-emerald-100 border border-emerald-300 rounded flex items-center justify-center flex-shrink-0">
                                                    <span className="text-emerald-600 text-xs sm:text-sm font-bold">{i + 1}</span>
                                                </div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-emerald-200">
                                        <p className="text-xs sm:text-sm text-emerald-700 flex items-center gap-1 sm:gap-2">
                                            <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <strong>Remember:</strong> This will be reviewed personally by assigned agent during the verification process.
                                        </p>
                                    </div>
                                </div>

                                {/* Commission */}
                                <div className="bg-gradient-to-br from-emerald-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-200">
                                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                                        <Star className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                                        Commission Structure
                                    </h4>
                                    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-emerald-200">
                                        <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4">
                                            The handling agent will receive <span className="font-semibold text-emerald-600">5% commission</span> from the seller upon successful closing of the property sale.
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                            <div className="space-y-1 sm:space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Listing Price:</span>
                                                    <span className="font-semibold text-gray-900">
                                        {money(data.price)}
                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Commission Rate:</span>
                                                    <span className="font-semibold text-emerald-600">5%</span>
                                                </div>
                                            </div>
                                            <div className="bg-emerald-50 rounded-lg p-2 sm:p-3 border border-emerald-200">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-700 font-semibold">Total Commission:</span>
                                                    <span className="text-base sm:text-lg font-bold text-emerald-700">
                                        {money(commissionAmount)}
                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Acceptance */}
                                <div className="bg-gradient-to-br from-emerald-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-200">
                                    <label className="flex items-start gap-3 sm:gap-4 cursor-pointer">
                                        <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-300 rounded focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                                                checked={acceptChecked}
                                                onChange={(e) => setAcceptChecked(e.target.checked)}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">Accept Terms & Conditions</p>
                                            <p className="text-xs sm:text-sm text-gray-700">
                                                I confirm that all provided information is accurate and complete to the best of my knowledge.
                                                I understand the commission structure and agree to provide required documents for verification.
                                                I accept the platform's terms of service and privacy policy.
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 sm:p-6 rounded-b-xl">
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowReviewModal(false)}
                                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base"
                                >
                                    Back to Editing
                                </button>
                                <button
                                    type="button"
                                    disabled={!acceptChecked || processing}
                                    onClick={confirmAndSubmit}
                                    className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-white transition-all duration-300 text-sm sm:text-base ${
                                        !acceptChecked || processing
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-primary to-accent hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl"
                                    }`}
                                >
                                    {processing ? (
                                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                                            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Publishing Listing...
                                        </div>
                                    ) : (
                                        "Publish Property Listing"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

/* ---------------- Enhanced Components ---------------- */
function SectionHeader({ title, subtitle, icon: Icon, status = "incomplete" }) {
    return (
        <div className="flex items-center gap-3 sm:gap-4">
            <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${
                status === "complete"
                    ? "bg-gradient-to-br from-primary to-accent text-white"
                    : "bg-gradient-to-br from-emerald-100 to-emerald-100 text-emerald-600"
            }`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
                <p className="text-gray-600 text-sm sm:text-base">{subtitle}</p>
            </div>
            {status === "complete" && (
                <div className="flex items-center gap-1 sm:gap-2 bg-emerald-100 text-emerald-700 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold">
                    <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    Complete
                </div>
            )}
        </div>
    );
}

function LabelWithIcon({ label, icon }) {
    return (
        <label className="text-sm font-semibold text-gray-800 flex items-center gap-2 sm:gap-3">
            <span className="inline-flex w-6 h-6 sm:w-8 sm:h-8 bg-emerald-100 rounded-lg items-center justify-center text-emerald-600 text-xs sm:text-sm">
                <FontAwesomeIcon icon={icon} />
            </span>
            {label}
        </label>
    );
}

function EmptyUpload() {
    return (
        <div className="flex flex-col items-center justify-center px-4 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-6">
            <div className="mb-3 sm:mb-4 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
            </div>
            <p className="mb-1 text-base sm:text-lg font-semibold text-gray-700">Upload Main Photo</p>
            <p className="text-xs sm:text-sm text-gray-600 text-center">Drag & drop or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP supported</p>
        </div>
    );
}

function UploadGlyph() {
    return (
        <div className="mb-3 sm:mb-4 bg-gradient-to-br from-primary to-accent rounded-xl sm:rounded-2xl p-3 sm:p-4">
            <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
    );
}
