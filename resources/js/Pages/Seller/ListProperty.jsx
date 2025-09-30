import React, { useEffect, useRef, useState } from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

import { Trash2, X, RotateCcw, Check as CheckLine, MapPin as LucideMapPin, House, Building2, Building, Landmark } from "lucide-react";
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

/* ---------------- theme helpers ---------------- */
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
        subTypes: ["Penthouse", "Loft", "Bedspace", "Room"]
    },
    {
        name: "Commercial",
        icon: Building,
        subTypes: ["Retail", "Offices", "Building", "Warehouse", "Serviced Office", "Coworking Space"]
    },
    {
        name: "Condominium",
        icon: Building2,
        subTypes: ["Loft", "Studio", "Penthouse", "Other", "Condotel"]
    },
    {
        name: "House",
        icon: House,
        subTypes: ["Townhouse", "Beach House", "Single Family House", "Villas"]
    },
    {
        name: "Land",
        icon: LucideMapPin,
        subTypes: ["Beach Lot", "Memorial Lot", "Agricultural Lot", "Commercial Lot", "Residential Lot", "Parking Lot"]
    }
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

    /* ---------------- quill init ---------------- */
    useEffect(() => {
        if (editorRef.current && !quillRef.current) {
            const quill = new Quill(editorRef.current, { theme: "snow" });
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
    }, []); // run once

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
            // cleanup object URLs
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

    const pages = [
        { name: "Properties", href: "/seller/properties", current: false },
        { name: "Create", href: "/post-property", current: true }
    ];

    const isLand = selectedType?.name === "Land";

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <NavBar />
            <ToastHandler />
            <Breadcrumb pages={pages} />

            {/* Page Header */}
            <div className="bg-white rounded-3xl p-8 mb-8 border border-white/20 shadow-md">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold gradient-text mb-1">Create Property Listing</h1>
                        <p className="text-gray-600">Add property details and showcase its best features.</p>
                    </div>
                    <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">Draft</span>
                    </div>
                </div>
            </div>

            <form className="space-y-10" onSubmit={handleSubmit}>
                {/* Basic Info */}
                <section className="bg-white rounded-2xl p-8 border border-white/20 shadow-md space-y-6">
                    <Header title="Basic Information" subtitle="Essential property details" />

                    <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-gray-800">Pre-selling Property</p>
                            <p className="text-sm text-gray-600">Mark if this is a pre-construction sale.</p>
                        </div>
                        <Toggle data={data} setData={setData} name="isPresell" />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-semibold text-gray-800">Property Title *</label>
                        <TextInput
                            id="title"
                            name="title"
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                            className="mt-1 block w-full"
                            autoComplete="off"
                            required
                        />
                        <InputError message={errors.title} className="text-sm" />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-800">Property Description</p>
                        <div ref={editorRef} id="editor" className="bg-white rounded-md border border-gray-300" style={{ height: 300 }} />
                        <InputError message={errors.description} className="text-sm" />
                    </div>
                </section>

                {/* Property Type */}
                <section className="bg-white rounded-2xl p-8 border border-white/20 shadow-md space-y-6">
                    <Header title="Property Type" subtitle="Select the property category" />

                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-800">Property Type *</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                            {PROPERTY_TYPES.map((type) => {
                                const active = selectedType?.name === type.name;
                                const Icon = type.icon;
                                return (
                                    <button
                                        type="button"
                                        key={type.name}
                                        className={`border p-5 flex flex-col items-center justify-center text-center rounded-xl transition hover:scale-[1.02] ${
                                            active ? "bg-green-50 border-primary" : "bg-white hover:border-primary hover:bg-gray-50"
                                        }`}
                                        onClick={() => {
                                            setSelectedType(type);
                                            setData("property_type", type.name);
                                            setSelectedSubType(null);
                                            setData("property_sub_type", "");
                                        }}
                                    >
                                        <Icon className={`w-8 h-8 mb-2 ${active ? "text-primary" : "text-gray-600"}`} />
                                        <span className={`text-sm font-medium ${active ? "text-primary" : "text-gray-700"}`}>{type.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <InputError message={errors.property_type} className="mt-1" />
                    </div>

                    {selectedType && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-gray-800">Property Subtype *</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedType.subTypes.map((sub) => {
                                    const active = selectedSubType === sub;
                                    return (
                                        <button
                                            type="button"
                                            key={sub}
                                            className={`px-3 py-2 rounded-xl border text-sm transition ${
                                                active ? "bg-green-50 text-primary border-primary" : "bg-white text-primary hover:bg-green-50"
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
                            {/* fixed: correct key name */}
                            <InputError message={errors.property_sub_type} className="mt-1" />
                        </div>
                    )}
                </section>

                {/* Property Details */}
                <section className="bg-white rounded-2xl p-8 border border-white/20 shadow-md space-y-6">
                    <Header title="Property Details" subtitle="Detailed property specifications" />

                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Address */}
                        <div className="md:col-span-2">
                            <LabelWithIcon label="Address" icon={faMapMarkerAlt} />
                            <TextInput
                                id="address"
                                name="address"
                                value={data.address}
                                onChange={(e) => setData("address", e.target.value)}
                                className="pl-10 mt-1 block w-full"
                                autoComplete="off"
                                required
                            />
                            <InputError message={errors.address} className="mt-1" />
                        </div>

                        {/* Price */}
                        <div>
                            <LabelWithIcon label="Price" icon={faMoneyBillWave} />
                            <TextInput
                                id="price"
                                name="price"
                                type="number"
                                inputMode="decimal"
                                value={data.price}
                                onChange={(e) => setData("price", e.target.value)}
                                className="pl-10 mt-1 block w-full"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">{money(data.price)}</p>
                            <InputError message={errors.price} className="mt-1" />
                        </div>

                        {/* Lot or Floor Area */}
                        <div>
                            <LabelWithIcon label={isLand ? "Lot Area (m²)" : "Floor Area (m²)"} icon={isLand ? faRuler : faRulerCombined} />
                            <TextInput
                                id={isLand ? "lot_area" : "floor_area"}
                                name={isLand ? "lot_area" : "floor_area"}
                                type="number"
                                inputMode="numeric"
                                value={isLand ? data.lot_area : data.floor_area}
                                onChange={(e) => setData(isLand ? "lot_area" : "floor_area", e.target.value)}
                                className="pl-10 mt-1 block w-full"
                                required
                            />
                            <InputError message={isLand ? errors.lot_area : errors.floor_area} className="mt-1" />
                        </div>

                        {/* Total Rooms */}
                        <div>
                            <LabelWithIcon label="Total Rooms" icon={faDoorClosed} />
                            <TextInput
                                id="total_rooms"
                                name="total_rooms"
                                type="number"
                                inputMode="numeric"
                                value={data.total_rooms}
                                onChange={(e) => setData("total_rooms", e.target.value)}
                                className="pl-10 mt-1 block w-full"
                            />
                            <InputError message={errors.total_rooms} className="mt-1" />
                        </div>

                        {/* Bedrooms */}
                        <div>
                            <LabelWithIcon label="Total Bedrooms" icon={faBed} />
                            <TextInput
                                id="total_bedrooms"
                                name="total_bedrooms"
                                type="number"
                                inputMode="numeric"
                                value={data.total_bedrooms}
                                onChange={(e) => setData("total_bedrooms", e.target.value)}
                                className="pl-10 mt-1 block w-full"
                            />
                            <InputError message={errors.total_bedrooms} className="mt-1" />
                        </div>

                        {/* Bathrooms */}
                        <div>
                            <LabelWithIcon label="Total Bathrooms" icon={faBath} />
                            <TextInput
                                id="total_bathrooms"
                                name="total_bathrooms"
                                type="number"
                                inputMode="numeric"
                                value={data.total_bathrooms}
                                onChange={(e) => setData("total_bathrooms", e.target.value)}
                                className="pl-10 mt-1 block w-full"
                            />
                            <InputError message={errors.total_bathrooms} className="mt-1" />
                        </div>

                        {/* Parking */}
                        <div>
                            <LabelWithIcon label="Parking Slots" icon={faCar} />
                            <TextInput
                                id="car_slots"
                                name="car_slots"
                                type="number"
                                inputMode="numeric"
                                value={data.car_slots}
                                onChange={(e) => setData("car_slots", e.target.value)}
                                className="pl-10 mt-1 block w-full"
                            />
                            <InputError message={errors.car_slots} className="mt-1" />
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="bg-white rounded-2xl p-8 border border-white/20 shadow-md space-y-6">
                    <Header title="Property Features" subtitle="List property features" />

                    <div className="bg-gray-50 rounded-md p-6">
                        {/* chips */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {(data.feature_name || []).map((tag, index) => (
                                <span key={`${tag}-${index}`} className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-200 text-sm text-primary">
                  {tag}
                                    <button type="button" onClick={() => removeFeature(index)} className="text-red-600 hover:text-red-700 font-bold">
                    &times;
                  </button>
                </span>
                            ))}
                            {(data.feature_name || []).length === 0 && (
                                <span className="text-sm text-gray-500">No features yet.</span>
                            )}
                        </div>

                        {/* add feature */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={featureName}
                                onChange={(e) => setFeatureName(e.target.value)}
                                onKeyDown={(e) => (e.key === "Enter" ? (e.preventDefault(), addFeature()) : null)}
                                placeholder="Enter feature name and press Enter"
                                className="border w-full border-gray-300 rounded-md px-3 py-3 focus:outline-none focus:ring-0 focus:border-primary transition"
                            />
                            <button
                                type="button"
                                onClick={addFeature}
                                disabled={!featureName.trim()}
                                className={`text-white px-6 py-2 rounded-md transition ${featureName.trim() ? "bg-primary hover:bg-accent" : "bg-gray-400 cursor-not-allowed"}`}
                            >
                                Add
                            </button>
                        </div>
                        <InputError message={errors.feature_name} className="mt-1" />
                    </div>
                </section>

                {/* Main Image */}
                <section className="bg-white rounded-2xl p-8 border border-white/20 shadow-md space-y-6">
                    <Header title="Main Image" subtitle="Display image in main listing" />

                    <div className="flex flex-col items-center">
                        <label
                            htmlFor="property_image"
                            className={`flex flex-col items-center justify-center w-full h-48 md:h-80 border-2 border-dashed rounded-xl transition ${
                                preview ? "border-transparent" : "border-gray-300 bg-white hover:bg-gray-50 cursor-pointer"
                            }`}
                        >
                            {!preview ? (
                                <EmptyUpload />
                            ) : (
                                <div className="relative w-full h-full">
                                    <img src={preview} alt="Main Preview" className="h-full w-full rounded-md object-cover border" />
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
                        <InputError message={errors.image_url} className="mt-1" />

                        <button
                            type="button"
                            onClick={() => document.getElementById("property_image")?.click()}
                            className="mt-4 flex items-center justify-center w-full py-3 text-sm font-semibold text-white bg-primary hover:bg-accent rounded-full transition"
                        >
                            <RotateCcw className="w-5 h-5 mr-2" />
                            {preview ? "Change Image" : "Upload Image"}
                        </button>
                    </div>
                </section>

                {/* Other Images */}
                <section className="bg-white rounded-2xl p-8 border border-white/20 shadow-md space-y-6">
                    <Header title="Other Images" subtitle="Add more property images" />

                    {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {imagePreviews.map((img, index) => (
                                <div key={index} className="relative h-48 md:h-80">
                                    <img src={img.url} alt={`Preview ${index}`} className="w-full h-full object-cover border rounded shadow" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute top-2 right-2 rounded-full p-1 shadow bg-red-600 text-white"
                                        title="Remove"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <label
                        htmlFor="image_upload"
                        className="mt-2 flex flex-col items-center justify-center w-full h-[25vh] border-2 border-dashed border-gray-300 rounded-xl bg-amber-50 cursor-pointer hover:bg-amber-100 transition"
                    >
                        <UploadGlyph />
                        <p className="mb-1 text-lg font-semibold text-gray-700">Drag & Drop Files Here</p>
                        <p className="text-sm text-gray-500 text-center">PNG, JPG, WebP — or click to browse</p>
                        <input id="image_upload" type="file" accept="image/*" multiple onChange={handleImagesChange} className="hidden" />
                    </label>
                    <InputError message={errors.image_urls} className="mt-1" />
                </section>

                {/* Location */}
                <section className="bg-white rounded-2xl p-8 border border-white/20 shadow-md space-y-6">
                    <Header title="Location" subtitle="Pin & draw boundary on map" />

                    <div className="flex flex-col items-center">
                        <MapWithDraw
                            userId={authId}
                            boundary={data.boundary}
                            pin={data.pin}
                            onChange={handleMapChange}
                            whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
                        />
                    </div>
                    <InputError message={errors.boundary} className="mt-1" />
                </section>

                {/* Agents */}
                <section className="bg-white rounded-2xl p-8 border border-white/20 shadow-md space-y-6">
                    <Header title="Agents" subtitle="Choose who can handle this listing" />

                    <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-gray-800">Allow Multiple Agents</p>
                            <p className="text-sm text-gray-600">Let several agents co-handle this property.</p>
                        </div>
                        <AllowMultiAgentToggle data={data} setData={setData} name="allowMultipleAgent" />
                    </div>

                    {agents.length > 0 ? (
                        <div className="space-y-3">
                            {agents.map((agent) => (
                                <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                                    <div className="flex items-center gap-3">
                                        {agent.photo_url ? (
                                            <img
                                                src={`/storage/${agent.photo_url}`}
                                                alt={`${agent.name}`}
                                                className="w-10 h-10 rounded-full object-cover border border-gray-300"
                                                onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-semibold border border-gray-300">
                                                {agent.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-gray-800">{agent.name}</p>
                                            <p className="text-sm text-gray-600">{agent.email}</p>
                                        </div>
                                    </div>

                                    <input
                                        type="checkbox"
                                        id={`agent-${agent.id}`}
                                        checked={selectedAgentIds.includes(agent.id)}
                                        onChange={() => toggleAgentSelection(agent.id)}
                                        className="border-gray-300 rounded-sm w-5 h-5"
                                        aria-label={`Select ${agent.name}`}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No agents available.</p>
                    )}
                </section>

                {/* Actions */}
                <div className="flex flex-col gap-3 w-full">
                    <button
                        type="submit"
                        disabled={processing}
                        className={`flex items-center justify-center px-6 py-3 rounded font-medium text-white ${
                            processing ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-accent"
                        }`}
                    >
                        <CheckLine className="w-5 h-5 mr-2" />
                        {processing ? "Creating..." : "Create Property"}
                    </button>

                    <Link
                        href="/broker/properties"
                        className="flex items-center justify-center w-full gap-2 border px-4 py-2 rounded text-gray-700 hover:bg-gray-100 transition"
                    >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                    </Link>
                </div>
            </form>
        </div>
    );
}

/* ---------------- small pieces ---------------- */
function Header({ title, subtitle }) {
    return (
        <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                {/* decorative dot */}
                <span className="w-2 h-2 rounded-full bg-white/90" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                <p className="text-gray-600">{subtitle}</p>
            </div>
        </div>
    );
}

function LabelWithIcon({ label, icon }) {
    return (
        <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
      <span className="inline-flex w-6 justify-center text-gray-500">
        <FontAwesomeIcon icon={icon} />
      </span>
            {label}
        </label>
    );
}

function EmptyUpload() {
    return (
        <div className="flex flex-col items-center justify-center px-6 pt-5 pb-6">
            <div className="mb-3 bg-gray-100 rounded-full p-3">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M4 16v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1M12 12v6m0-6l-3 3m3-3l3 3M16 8a4 4 0 0 0-8 0v1H5a2 2 0 0 0 0 4h14a2 2 0 0 0 0-4h-3V8z"/>
                </svg>
            </div>
            <p className="mb-1 text-sm font-medium text-gray-700">Drag & Drop or Click to Upload</p>
            <p className="text-xs text-gray-500">PNG, JPG, WebP</p>
        </div>
    );
}

function UploadGlyph() {
    return (
        <div className="mb-3 bg-secondary rounded-full p-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M4 16v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1M12 12v6m0-6l-3 3m3-3l3 3M16 8a4 4 0 0 0-8 0v1H5a2 2 0 0 0 0 4h14a2 2 0 0 0 0-4h-3V8z"/>
            </svg>
        </div>
    );
}
