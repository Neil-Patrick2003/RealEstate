import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import { router, useForm, usePage, Link } from "@inertiajs/react";
import InputError from "@/Components/InputError.jsx";
import React, { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { CheckLine, RotateCcw, Trash2, X } from "lucide-react";
import MapWithDraw from "@/Components/MapWithDraw";
import Toggle from "@/Components/Toggle/Toggle.jsx";
import TextInput from "@/Components/TextInput.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMapMarkerAlt,
    faMoneyBillWave,
    faRulerCombined,
    faRuler,
    faDoorClosed,
    faBed,
    faBath,
    faCar,
} from "@fortawesome/free-solid-svg-icons";
import { MapPin, House, Building2, Building, Landmark } from "lucide-react";

export default function Edit({ property }) {
    const authId = usePage().props.auth.user.id;

    // ---------- FORM ----------
    const { data, setData, processing, reset, errors } = useForm({
        title: "",
        description: "",
        property_type: "",
        sub_type: "",
        price: "",
        address: "",
        lot_area: "",
        floor_area: "",
        total_rooms: "",
        bedrooms: "",
        bathrooms: "",
        car_slots: "",
        isPresell: false,
        image_url: null,
        image_urls: [],
        boundary: null,
        pin: null,
        agent_ids: [],
        allowMultipleAgent: false,
        images_to_delete: [],
        features_to_delete: [],
        new_feature_names: [],
    });

    // ---------- REFS / UI ----------
    const editorRef = useRef(null);
    const quillRef = useRef(null);
    const mapRef = useRef(null);

    const [selectedType, setSelectedType] = useState(null);
    const [selectedSubType, setSelectedSubType] = useState(null);

    const [preview, setPreview] = useState(null);
    const [existingImages, setExistingImages] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
    const [featureName, setFeatureName] = useState("");
    const [existingFeatures, setExistingFeatures] = useState([]);
    const [newFeatureNames, setNewFeatureNames] = useState([]);

    // ---------- TYPE OPTIONS ----------
    const property_type = [
        { name: "Apartment", icon: Landmark, subTypes: ["Penthouse", "Loft", "Bedspace", "Room"] },
        { name: "Commercial", icon: Building, subTypes: ["Retail", "Offices", "Building", "Warehouse", "Serviced Office", "Coworking Space"] },
        { name: "Condominium", icon: Building2, subTypes: ["Loft", "Studio", "Penthouse", "Other", "Condotel"] },
        { name: "House", icon: House, subTypes: ["Townhouse", "Beach House", "Single Family House", "Villas"] },
        { name: "Land", icon: MapPin, subTypes: ["Beach Lot", "Memorial Lot", "Agricultural Lot", "Commercial Lot", "Residential Lot", "Parking Lot"] }
    ];

    // ---------- QUILL ----------
    useEffect(() => {
        if (!editorRef.current || quillRef.current) return;

        const quill = new Quill(editorRef.current, {
            theme: "snow",
            placeholder: "Describe the property, highlights and nearby places...",
            modules: {
                toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    [{ align: [] }],
                    ["link", "clean"],
                ],
            },
        });

        quill.on("text-change", () => {
            setData("description", quill.root.innerHTML);
        });

        quillRef.current = quill;
    }, [setData]);

    // ---------- POPULATE FROM PROP ----------
    useEffect(() => {
        if (!property) {
            reset();
            setPreview(null);
            setExistingImages([]);
            setExistingFeatures([]);
            return;
        }

        setData((prev) => ({
            ...prev,
            title: property.title ?? "",
            description: property.description ?? "",
            property_type: property.property_type ?? "",
            sub_type: property.sub_type ?? "",
            price: property.price ?? "",
            address: property.address ?? "",
            lot_area: property.lot_area ?? "",
            floor_area: property.floor_area ?? "",
            total_rooms: property.total_rooms ?? "",
            bedrooms: property.bedrooms ?? property.total_bedrooms ?? "",
            bathrooms: property.bathrooms ?? property.total_bathrooms ?? "",
            car_slots: property.car_slots ?? "",
            isPresell: !!(property.isPresell === true || property.isPresell === 1 || property.isPresell === "1"),
            allowMultipleAgent: !!property.allow_multiple_agents,
        }));

        if (quillRef.current) {
            quillRef.current.root.innerHTML = property.description || "";
        }

        setPreview(property.image_url ? `/storage/${property.image_url}` : null);

        const t = property_type.find((t) => t.name === property.property_type) || null;
        setSelectedType(t);
        setSelectedSubType(property.sub_type || null);

        if (Array.isArray(property.images) && property.images.length) {
            setExistingImages(
                property.images.map((img) => ({
                    id: img.id,
                    url: `/storage/${img.image_url}`,
                }))
            );
        } else {
            setExistingImages([]);
        }

        if (Array.isArray(property.features) && property.features.length) {
            setExistingFeatures(
                property.features.map((f) =>
                    typeof f === "string" ? { id: null, name: f } : { id: f.id ?? null, name: f.name ?? "" }
                )
            );
        } else {
            setExistingFeatures([]);
        }
        setNewFeatureNames([]);
    }, [property]);

    useEffect(() => {
        if (quillRef.current && property?.description != null) {
            quillRef.current.root.innerHTML = property.description;
        }
    }, [property?.description]);

    // ---------- MAP SYNC ----------
    useEffect(() => {
        if (!property?.coordinate) return;
        const boundaryData = property.coordinate.find((c) => c.type === "polygon")?.coordinates || null;
        const pinData = property.coordinate.find((c) => c.type === "marker")?.coordinates || null;

        setData("boundary", boundaryData);
        setData("pin", pinData);
    }, [property?.coordinate, setData]);

    // ---------- FEATURES ----------
    const handleFeatureNameAdd = () => {
        const name = featureName.trim();
        if (!name) return;
        setNewFeatureNames((prev) => [...prev, name]);
        setData("new_feature_names", (prev) => [...prev, name]);
        setFeatureName("");
    };

    const removeNewFeature = (idx) => {
        setNewFeatureNames((prev) => prev.filter((_, i) => i !== idx));
        setData("new_feature_names", (prev) => prev.filter((_, i) => i !== idx));
    };

    const removeExistingFeature = (id) => {
        if (!id) return;
        setExistingFeatures((prev) => prev.filter((f) => f.id !== id));
        setData("features_to_delete", (prev) => [...prev, id]);
    };

    // ---------- IMAGES ----------
    const handleImagePropertyChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
        setPreview(url);
        setData("image_url", file);
    };

    const handleNewImagesChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const previews = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
        setNewImagePreviews((prev) => [...prev, ...previews]);
        setData("image_urls", (prev) => [...prev, ...files]);
    };

    const handleRemoveExistingImage = (id) => {
        setExistingImages((prev) => prev.filter((img) => img.id !== id));
        setData("images_to_delete", (prev) => [...prev, id]);
    };

    const handleRemoveNewImage = (index) => {
        const target = newImagePreviews[index];
        if (target?.url?.startsWith("blob:")) URL.revokeObjectURL(target.url);
        setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
        setData("image_urls", (prev) => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        return () => {
            if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
            newImagePreviews.forEach((p) => p.url?.startsWith("blob:") && URL.revokeObjectURL(p.url));
        };
    }, [preview, newImagePreviews]);

    // ---------- SUBMIT ----------
    const onSubmit = (e) => {
        e.preventDefault();
        router.post(route("broker.properties.update", property.id), {
            _method: "patch",
            ...data,
        }, { forceFormData: true });
    };

    return (
        <BrokerLayout>
            {/* Header */}
            <div className="page-header bg-white rounded-lg border border-gray-200 p-6 mb-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Property Listing</h1>
                        <p className="text-gray-600">Update your property details and showcase its best features.</p>
                    </div>
                    <div className="badge-success flex items-center gap-2 px-3 py-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">{property?.status ?? "Draft"}</span>
                    </div>
                </div>
            </div>

            <form className="space-y-6" onSubmit={onSubmit}>
                {/* BASIC INFO */}
                <section className="card p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="feature-icon">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                            <p className="text-gray-600 text-sm">Essential property details</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Pre-selling */}
                        <div className="alert-success p-4 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-gray-900">Pre-selling Property</p>
                                <p className="text-sm text-gray-600">Mark if this is a pre-construction sale.</p>
                            </div>
                            <Toggle
                                name="isPresell"
                                checked={!!data.isPresell}
                                onChange={(val) => setData("isPresell", val)}
                                ariaLabel="Pre-selling"
                            />
                        </div>

                        {/* Title */}
                        <div className="form-group">
                            <label htmlFor="title" className="form-label">Property Title*</label>
                            <TextInput
                                id="title"
                                name="title"
                                value={data.title}
                                onChange={(e) => setData("title", e.target.value)}
                                className="form-input"
                                required
                            />
                            <InputError message={errors.title} className="form-error" />
                        </div>

                        {/* Description */}
                        <div className="form-group">
                            <label className="form-label">Property Description</label>
                            <div ref={editorRef} className="bg-white rounded-lg border border-gray-300" style={{ height: 300 }} />
                            <InputError message={errors.description} className="form-error" />
                        </div>
                    </div>
                </section>

                {/* TYPE */}
                <section className="card p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="feature-icon">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Property Type</h2>
                            <p className="text-gray-600 text-sm">Select the property category</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="form-group">
                            <label className="form-label">Property Type *</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                {property_type.map((type) => (
                                    <button
                                        type="button"
                                        key={type.name}
                                        onClick={() => {
                                            setSelectedType(type);
                                            setData("property_type", type.name);
                                            setSelectedSubType(null);
                                            setData("sub_type", "");
                                        }}
                                        className={`card p-4 text-center transition-all duration-200 ${
                                            selectedType?.name === type.name
                                                ? "border-primary-500 bg-primary-50"
                                                : "hover:border-gray-300"
                                        }`}
                                    >
                                        <type.icon className={`w-6 h-6 mb-2 mx-auto ${
                                            selectedType?.name === type.name ? "text-primary-600" : "text-gray-600"
                                        }`} />
                                        <p className={`text-sm font-medium ${
                                            selectedType?.name === type.name ? "text-primary-600" : "text-gray-700"
                                        }`}>{type.name}</p>
                                    </button>
                                ))}
                            </div>
                            <InputError message={errors.property_type} className="form-error" />
                        </div>

                        {selectedType && (
                            <div className="form-group">
                                <label className="form-label">Property Subtype *</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                    {selectedType.subTypes.map((st) => (
                                        <button
                                            type="button"
                                            key={st}
                                            onClick={() => {
                                                setSelectedSubType(st);
                                                setData("sub_type", st);
                                            }}
                                            className={`px-3 py-2 text-sm rounded-md border transition-all ${
                                                selectedSubType === st
                                                    ? "bg-primary-50 text-primary-700 border-primary-500"
                                                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                                            }`}
                                        >
                                            {st}
                                        </button>
                                    ))}
                                </div>
                                <InputError message={errors.sub_type} className="form-error" />
                            </div>
                        )}
                    </div>
                </section>

                {/* DETAILS */}
                <section className="card p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="feature-icon">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Property Details</h2>
                            <p className="text-gray-600 text-sm">Detailed specifications</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Address */}
                        <div className="md:col-span-2 lg:col-span-3">
                            <div className="form-group">
                                <label htmlFor="address" className="form-label">Address</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4" />
                                    </span>
                                    <TextInput
                                        id="address"
                                        name="address"
                                        value={data.address}
                                        onChange={(e) => setData("address", e.target.value)}
                                        className="form-input pl-10"
                                        required
                                    />
                                </div>
                                <InputError message={errors.address} className="form-error" />
                            </div>
                        </div>

                        {/* Price */}
                        <div className="form-group">
                            <label htmlFor="price" className="form-label">Price</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                    <FontAwesomeIcon icon={faMoneyBillWave} className="w-4 h-4" />
                                </span>
                                <TextInput
                                    id="price"
                                    name="price"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={data.price}
                                    onChange={(e) => setData("price", e.target.value)}
                                    className="form-input pl-10"
                                    required
                                />
                            </div>
                            <InputError message={errors.price} className="form-error" />
                        </div>

                        {/* Lot/Floor */}
                        <div className="form-group">
                            <label htmlFor={selectedType?.name === "Land" ? "lot_area" : "floor_area"} className="form-label">
                                {selectedType?.name === "Land" ? "Lot Area (m²)" : "Floor Area (m²)"}
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                    <FontAwesomeIcon icon={selectedType?.name === "Land" ? faRuler : faRulerCombined} className="w-4 h-4" />
                                </span>
                                <TextInput
                                    id={selectedType?.name === "Land" ? "lot_area" : "floor_area"}
                                    name={selectedType?.name === "Land" ? "lot_area" : "floor_area"}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={selectedType?.name === "Land" ? data.lot_area : data.floor_area}
                                    onChange={(e) => setData(selectedType?.name === "Land" ? "lot_area" : "floor_area", e.target.value)}
                                    className="form-input pl-10"
                                    required
                                />
                            </div>
                            <InputError message={selectedType?.name === "Land" ? errors.lot_area : errors.floor_area} className="form-error" />
                        </div>

                        {/* Rooms */}
                        <div className="form-group">
                            <label htmlFor="total_rooms" className="form-label">Total Rooms</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                    <FontAwesomeIcon icon={faDoorClosed} className="w-4 h-4" />
                                </span>
                                <TextInput
                                    id="total_rooms"
                                    name="total_rooms"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={data.total_rooms}
                                    onChange={(e) => setData("total_rooms", e.target.value)}
                                    className="form-input pl-10"
                                />
                            </div>
                            <InputError message={errors.total_rooms} className="form-error" />
                        </div>

                        {/* Bedrooms */}
                        <div className="form-group">
                            <label htmlFor="bedrooms" className="form-label">Bedrooms</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                    <FontAwesomeIcon icon={faBed} className="w-4 h-4" />
                                </span>
                                <TextInput
                                    id="bedrooms"
                                    name="bedrooms"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={data.bedrooms}
                                    onChange={(e) => setData("bedrooms", e.target.value)}
                                    className="form-input pl-10"
                                />
                            </div>
                            <InputError message={errors.bedrooms} className="form-error" />
                        </div>

                        {/* Bathrooms */}
                        <div className="form-group">
                            <label htmlFor="bathrooms" className="form-label">Bathrooms</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                    <FontAwesomeIcon icon={faBath} className="w-4 h-4" />
                                </span>
                                <TextInput
                                    id="bathrooms"
                                    name="bathrooms"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={data.bathrooms}
                                    onChange={(e) => setData("bathrooms", e.target.value)}
                                    className="form-input pl-10"
                                />
                            </div>
                            <InputError message={errors.bathrooms} className="form-error" />
                        </div>

                        {/* Parking */}
                        <div className="form-group">
                            <label htmlFor="car_slots" className="form-label">Parking Slots</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                    <FontAwesomeIcon icon={faCar} className="w-4 h-4" />
                                </span>
                                <TextInput
                                    id="car_slots"
                                    name="car_slots"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={data.car_slots}
                                    onChange={(e) => setData("car_slots", e.target.value)}
                                    className="form-input pl-10"
                                />
                            </div>
                            <InputError message={errors.car_slots} className="form-error" />
                        </div>
                    </div>
                </section>

                {/* FEATURES */}
                <section className="card p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="feature-icon">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Property Features</h2>
                            <p className="text-gray-600 text-sm">List property features</p>
                        </div>
                    </div>

                    <div className="gray-card">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {existingFeatures.map((f) => (
                                <span key={`ex-${f.id ?? f.name}`} className="badge-primary inline-flex items-center gap-2">
                                    {f.name}
                                    {f.id && (
                                        <button
                                            type="button"
                                            onClick={() => removeExistingFeature(f.id)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            &times;
                                        </button>
                                    )}
                                </span>
                            ))}

                            {newFeatureNames.map((name, i) => (
                                <span key={`new-${i}`} className="badge-success inline-flex items-center gap-2">
                                    {name}
                                    <button
                                        type="button"
                                        onClick={() => removeNewFeature(i)}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={featureName}
                                onChange={(e) => setFeatureName(e.target.value)}
                                placeholder="Enter feature name"
                                className="form-input flex-1"
                            />
                            <button
                                type="button"
                                onClick={handleFeatureNameAdd}
                                disabled={!featureName.trim()}
                                className={`btn ${featureName.trim() ? "btn-primary" : "btn-secondary"}`}
                            >
                                Add
                            </button>
                        </div>
                        <InputError message={errors.new_feature_names} className="form-error mt-2" />
                    </div>
                </section>

                {/* MAIN IMAGE */}
                <section className="card p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="feature-icon">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Main Image</h2>
                            <p className="text-gray-600 text-sm">Displayed as the hero image</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <label
                            htmlFor="property_image"
                            className={`flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed rounded-lg transition ${
                                preview ? "border-transparent" : "border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                            }`}
                        >
                            {!preview ? (
                                <div className="flex flex-col items-center justify-center px-6 pt-5 pb-6">
                                    <div className="mb-3 bg-gray-100 rounded-full p-3">
                                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1M12 12v6m0-6l-3 3m3-3l3 3M16 8a4 4 0 0 0-8 0v1H5a2 2 0 0 0 0 4h14a2 2 0 0 0 0-4h-3V8z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-gray-600">PNG, JPG, WebP</p>
                                </div>
                            ) : (
                                <img src={preview} alt="Main preview" className="h-full w-full rounded-md object-cover" />
                            )}
                        </label>

                        <input type="file" id="property_image" accept="image/*" className="hidden" onChange={handleImagePropertyChange} />
                        <InputError message={errors.image_url} className="form-error mt-2" />
                    </div>

                    <button
                        type="button"
                        onClick={() => document.getElementById("property_image")?.click()}
                        className="btn-outline w-full mt-4"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Change Image
                    </button>
                </section>

                {/* OTHER IMAGES */}
                <section className="card p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="feature-icon">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Other Images</h2>
                            <p className="text-gray-600 text-sm">Add more photos</p>
                        </div>
                    </div>

                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {existingImages.map((img) => (
                                <div key={img.id} className="relative h-48">
                                    <img src={img.url} alt="Existing" className="w-full h-full object-cover rounded-lg border" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveExistingImage(img.id)}
                                        className="absolute top-2 right-2 rounded-full p-1.5 bg-red-500 text-white shadow-sm hover:bg-red-600 transition-colors"
                                        title="Remove"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* New Images */}
                    {newImagePreviews.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {newImagePreviews.map((img, idx) => (
                                <div key={idx} className="relative h-48">
                                    <img src={img.url} alt={`New ${idx}`} className="w-full h-full object-cover rounded-lg border" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveNewImage(idx)}
                                        className="absolute top-2 right-2 rounded-full p-1.5 bg-red-500 text-white shadow-sm hover:bg-red-600 transition-colors"
                                        title="Remove"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <label
                        htmlFor="image_upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex flex-col items-center justify-center">
                            <div className="mb-2 bg-primary-500 rounded-full p-2">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-600">Click to browse or drag and drop</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP up to 10MB</p>
                        </div>
                        <input id="image_upload" type="file" accept="image/*" multiple onChange={handleNewImagesChange} className="hidden" />
                    </label>
                    <InputError message={errors.image_urls} className="form-error mt-2" />
                </section>

                {/* MAP */}
                <section className="card p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="feature-icon">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 01-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Location</h2>
                            <p className="text-gray-600 text-sm">Set property pin and boundary</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <MapWithDraw
                            userId={authId}
                            boundary={data.boundary}
                            pin={data.pin}
                            onChange={({ boundary, pin }) => {
                                setData("boundary", boundary);
                                setData("pin", pin);
                            }}
                            whenCreated={(m) => (mapRef.current = m)}
                        />
                    </div>

                    <InputError message={errors.boundary} className="form-error mt-2" />
                </section>

                {/* ACTIONS */}
                <div className="flex flex-col gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className={`btn btn-primary ${processing ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {processing ? (
                            <>
                                <div className="spinner-sm mr-2" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckLine className="w-4 h-4 mr-2" />
                                Save changes
                            </>
                        )}
                    </button>

                    <Link
                        href="/broker/properties"
                        className="btn-outline text-center"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </Link>
                </div>
            </form>
        </BrokerLayout>
    );
}
