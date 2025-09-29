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
        sub_type: "",              // ✅ use `sub_type` (server friendly)
        price: "",
        address: "",
        lot_area: "",
        floor_area: "",
        total_rooms: "",
        bedrooms: "",              // ✅ normalized
        bathrooms: "",             // ✅ normalized
        car_slots: "",
        isPresell: false,
        image_url: null,           // main image (File)
        image_urls: [],            // new images (Files)
        boundary: null,
        pin: null,
        agent_ids: [],
        allowMultipleAgent: false,

        // payload for server
        images_to_delete: [],
        features_to_delete: [],
        new_feature_names: [],     // only NEW names
    });

    // ---------- REFS / UI ----------
    const editorRef = useRef(null);
    const quillRef = useRef(null);
    const mapRef = useRef(null);

    const [selectedType, setSelectedType] = useState(null);
    const [selectedSubType, setSelectedSubType] = useState(null);

    const [preview, setPreview] = useState(null);            // main image preview
    const [existingImages, setExistingImages] = useState([]); // [{id, url}]
    const [newImagePreviews, setNewImagePreviews] = useState([]); // [{file, url}]
    const [featureName, setFeatureName] = useState("");
    const [existingFeatures, setExistingFeatures] = useState([]); // [{id, name}]
    const [newFeatureNames, setNewFeatureNames] = useState([]);   // [string]

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

        // fill base fields
        setData((prev) => ({
            ...prev,
            title: property.title ?? "",
            description: property.description ?? "",
            property_type: property.property_type ?? "",
            sub_type: property.sub_type ?? "",              // ✅
            price: property.price ?? "",
            address: property.address ?? "",
            lot_area: property.lot_area ?? "",
            floor_area: property.floor_area ?? "",
            total_rooms: property.total_rooms ?? "",
            bedrooms: property.bedrooms ?? property.total_bedrooms ?? "",  // ✅
            bathrooms: property.bathrooms ?? property.total_bathrooms ?? "",// ✅
            car_slots: property.car_slots ?? "",
            isPresell: !!(property.isPresell === true || property.isPresell === 1 || property.isPresell === "1"),
            allowMultipleAgent: !!property.allow_multiple_agents,
        }));

        // set editor value
        if (quillRef.current) {
            quillRef.current.root.innerHTML = property.description || "";
        }

        // main image preview
        setPreview(property.image_url ? `/storage/${property.image_url}` : null);

        // selected type & subtype
        const t = property_type.find((t) => t.name === property.property_type) || null;
        setSelectedType(t);
        setSelectedSubType(property.sub_type || null);

        // existing images
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

        // existing features
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

    // keep editor synced if prop.description changes (after mount)
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
        if (!id) return; // existing w/o id treated as plain text; just filter it out
        setExistingFeatures((prev) => prev.filter((f) => f.id !== id));
        setData("features_to_delete", (prev) => [...prev, id]); // ✅ send to server
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
        setData("images_to_delete", (prev) => [...prev, id]); // ✅
    };

    const handleRemoveNewImage = (index) => {
        const target = newImagePreviews[index];
        if (target?.url?.startsWith("blob:")) URL.revokeObjectURL(target.url);
        setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
        setData("image_urls", (prev) => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        return () => {
            // cleanup blob urls
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
            {/* Header card */}
            <div className="bg-white rounded-3xl p-8 mb-8 border border-white/20 shadow-md">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold gradient-text mb-1">Edit Property Listing</h1>
                        <p className="text-gray-600">Update your property details and showcase its best features.</p>
                    </div>
                    <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">{property?.status ?? "Draft"}</span>
                    </div>
                </div>
            </div>

            <form className="space-y-10" onSubmit={onSubmit}>
                {/* BASIC INFO */}
                <section className="bg-white rounded-2xl p-8 border border-white/20 shadow-md space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl grid place-items-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
                            <p className="text-gray-600">Essential property details</p>
                        </div>
                    </div>

                    {/* Pre-selling */}
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-gray-800">Pre-selling Property</p>
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
                    <div>
                        <label htmlFor="title" className="text-sm font-semibold text-gray-800">Property Title*</label>
                        <TextInput id="title" name="title" value={data.title} onChange={(e) => setData("title", e.target.value)} className="mt-1 w-full" required />
                        <InputError message={errors.title} className="mt-1" />
                    </div>

                    {/* Description */}
                    <div>
                        <p className="text-sm font-semibold text-gray-800">Property Description</p>
                        <div ref={editorRef} className="bg-white rounded-md border border-gray-300" style={{ height: 300 }} />
                        <InputError message={errors.description} className="mt-1" />
                    </div>
                </section>

                {/* TYPE */}
                <section className="bg-white rounded-2xl p-8 border border-white/20 shadow-md space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl grid place-items-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Property Type</h2>
                            <p className="text-gray-600">Select the property category</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Property Type *</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {property_type.map((type) => (
                                <div
                                    key={type.name}
                                    className={`border p-5 rounded-xl cursor-pointer transition hover:shadow ${
                                        selectedType?.name === type.name ? "bg-green-50 border-primary" : "bg-white hover:border-primary"
                                    }`}
                                    onClick={() => {
                                        setSelectedType(type);
                                        setData("property_type", type.name);
                                        setSelectedSubType(null);
                                        setData("sub_type", "");
                                    }}
                                >
                                    <type.icon className={`w-8 h-8 mb-2 ${selectedType?.name === type.name ? "text-primary" : "text-gray-600"}`} />
                                    <p className={`text-sm font-medium ${selectedType?.name === type.name ? "text-primary" : "text-gray-700"}`}>{type.name}</p>
                                </div>
                            ))}
                        </div>
                        <InputError message={errors.property_type} className="mt-1" />
                    </div>

                    {selectedType && (
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-800">Property Subtype *</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                {selectedType.subTypes.map((st) => (
                                    <button
                                        type="button"
                                        key={st}
                                        onClick={() => {
                                            setSelectedSubType(st);
                                            setData("sub_type", st); // ✅
                                        }}
                                        className={`px-4 py-2 text-sm rounded-xl border transition ${
                                            selectedSubType === st ? "bg-green-50 text-primary border-primary" : "bg-white text-primary hover:bg-green-50"
                                        }`}
                                    >
                                        {st}
                                    </button>
                                ))}
                            </div>
                            <InputError message={errors.sub_type} className="mt-1" />
                        </div>
                    )}
                </section>

                {/* DETAILS */}
                <section className="bg-white rounded-2xl p-8 border border-white/20 shadow-md space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl grid place-items-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Property Details</h2>
                            <p className="text-gray-600">Detailed specifications</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Address */}
                        <div className="md:col-span-2">
                            <p className="text-sm font-medium mb-1">Address</p>
                            <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                </span>
                                <TextInput id="address" name="address" value={data.address} onChange={(e) => setData("address", e.target.value)} className="pl-10 w-full" required />
                            </div>
                            <InputError message={errors.address} className="mt-1" />
                        </div>

                        {/* Price */}
                        <div>
                            <p className="text-sm font-medium mb-1">Price</p>
                            <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <FontAwesomeIcon icon={faMoneyBillWave} />
                </span>
                                <TextInput id="price" name="price" type="number" min="0" step="1" value={data.price} onChange={(e) => setData("price", e.target.value)} className="pl-10 w-full" required />
                            </div>
                            <InputError message={errors.price} className="mt-1" />
                        </div>

                        {/* Lot/Floor */}
                        <div>
                            <p className="text-sm font-medium mb-1">{selectedType?.name === "Land" ? "Lot Area (m²)" : "Floor Area (m²)"}</p>
                            <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <FontAwesomeIcon icon={selectedType?.name === "Land" ? faRuler : faRulerCombined} />
                </span>
                                <TextInput
                                    id={selectedType?.name === "Land" ? "lot_area" : "floor_area"}
                                    name={selectedType?.name === "Land" ? "lot_area" : "floor_area"}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={selectedType?.name === "Land" ? data.lot_area : data.floor_area}
                                    onChange={(e) => setData(selectedType?.name === "Land" ? "lot_area" : "floor_area", e.target.value)}
                                    className="pl-10 w-full"
                                    required
                                />
                            </div>
                            <InputError message={selectedType?.name === "Land" ? errors.lot_area : errors.floor_area} className="mt-1" />
                        </div>

                        {/* Rooms */}
                        <div>
                            <p className="text-sm font-medium mb-1">Total Rooms</p>
                            <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <FontAwesomeIcon icon={faDoorClosed} />
                </span>
                                <TextInput id="total_rooms" name="total_rooms" type="number" min="0" step="1" value={data.total_rooms} onChange={(e) => setData("total_rooms", e.target.value)} className="pl-10 w-full" />
                            </div>
                            <InputError message={errors.total_rooms} className="mt-1" />
                        </div>

                        {/* Bedrooms */}
                        <div>
                            <p className="text-sm font-medium mb-1">Bedrooms</p>
                            <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <FontAwesomeIcon icon={faBed} />
                </span>
                                <TextInput id="bedrooms" name="bedrooms" type="number" min="0" step="1" value={data.bedrooms} onChange={(e) => setData("bedrooms", e.target.value)} className="pl-10 w-full" />
                            </div>
                            <InputError message={errors.bedrooms} className="mt-1" />
                        </div>

                        {/* Bathrooms */}
                        <div>
                            <p className="text-sm font-medium mb-1">Bathrooms</p>
                            <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <FontAwesomeIcon icon={faBath} />
                </span>
                                <TextInput id="bathrooms" name="bathrooms" type="number" min="0" step="1" value={data.bathrooms} onChange={(e) => setData("bathrooms", e.target.value)} className="pl-10 w-full" />
                            </div>
                            <InputError message={errors.bathrooms} className="mt-1" />
                        </div>

                        {/* Parking */}
                        <div>
                            <p className="text-sm font-medium mb-1">Parking Slots</p>
                            <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <FontAwesomeIcon icon={faCar} />
                </span>
                                <TextInput id="car_slots" name="car_slots" type="number" min="0" step="1" value={data.car_slots} onChange={(e) => setData("car_slots", e.target.value)} className="pl-10 w-full" />
                            </div>
                            <InputError message={errors.car_slots} className="mt-1" />
                        </div>
                    </div>
                </section>

                {/* FEATURES */}
                <section className="bg-white rounded-2xl p-8 border border-white/20 shadow-md space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl grid place-items-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Property Features</h2>
                            <p className="text-gray-600">List property features</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-md p-6">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {/* existing */}
                            {existingFeatures.map((f) => (
                                <span key={`ex-${f.id ?? f.name}`} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm">
                  {f.name}
                                    {f.id && (
                                        <button type="button" onClick={() => removeExistingFeature(f.id)} className="font-bold text-red-600 hover:text-red-700">
                                            &times;
                                        </button>
                                    )}
                </span>
                            ))}

                            {/* new */}
                            {newFeatureNames.map((name, i) => (
                                <span key={`new-${i}`} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-200 text-primary text-sm">
                  {name}
                                    <button type="button" onClick={() => removeNewFeature(i)} className="font-bold text-red-600 hover:text-red-700">
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
                                className="border w-full border-gray-300 rounded-md px-3 py-3 focus:outline-none focus:ring-0 focus:border-primary"
                            />
                            <button
                                type="button"
                                onClick={handleFeatureNameAdd}
                                disabled={!featureName.trim()}
                                className={`text-white px-6 py-2 rounded-md transition ${featureName.trim() ? "bg-primary hover:bg-accent" : "bg-gray-400 cursor-not-allowed"}`}
                            >
                                Add
                            </button>
                        </div>
                        <InputError message={errors.new_feature_names} className="mt-1" />
                    </div>
                </section>

                {/* MAIN IMAGE */}
                <section className="bg-white rounded-2xl p-8 border border-white/20 shadow-md space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl grid place-items-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Main Image</h2>
                            <p className="text-gray-600">Displayed as the hero image</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <label
                            htmlFor="property_image"
                            className={`flex flex-col items-center justify-center w-full h-48 md:h-80 border-2 border-dashed rounded-xl transition ${
                                preview ? "border-transparent" : "border-gray-300 bg-white hover:bg-gray-50 cursor-pointer"
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
                                <img src={preview} alt="Main preview" className="h-full w-full rounded-md object-cover border" />
                            )}
                        </label>

                        <input type="file" id="property_image" accept="image/*" className="hidden" onChange={handleImagePropertyChange} />
                        <InputError message={errors.image_url} className="mt-1" />
                    </div>

                    <button
                        type="button"
                        onClick={() => document.getElementById("property_image")?.click()}
                        className="flex items-center justify-center w-full py-3 text-sm font-bold text-white bg-accent hover:bg-primary rounded-full transition"
                    >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Change Image
                    </button>
                </section>

                {/* OTHER IMAGES */}
                <section className="bg-white rounded-2xl p-8 border border-white/20 shadow-md space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl grid place-items-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Other Images</h2>
                            <p className="text-gray-600">Add more photos</p>
                        </div>
                    </div>

                    {/* Existing */}
                    {existingImages.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            {existingImages.map((img) => (
                                <div key={img.id} className="relative h-48 md:h-64">
                                    <img src={img.url} alt="Existing" className="w-full h-full object-cover border rounded shadow" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveExistingImage(img.id)}
                                        className="absolute top-2 right-2 rounded-full p-1.5 bg-red-500 text-white shadow"
                                        title="Remove"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* New */}
                    {newImagePreviews.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            {newImagePreviews.map((img, idx) => (
                                <div key={idx} className="relative h-48 md:h-64">
                                    <img src={img.url} alt={`New ${idx}`} className="w-full h-full object-cover border rounded shadow" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveNewImage(idx)}
                                        className="absolute top-2 right-2 rounded-full p-1.5 bg-red-500 text-white shadow"
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
                        <div className="flex flex-col items-center justify-center px-6 pt-5 pb-6">
                            <div className="mb-3 bg-secondary rounded-full p-3">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1M12 12v6m0-6l-3 3m3-3l3 3M16 8a4 4 0 0 0-8 0v1H5a2 2 0 0 0 0 4h14a2 2 0 0 0 0-4h-3V8z" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-600">PNG, JPG, WebP — or click to browse</p>
                        </div>
                        <input id="image_upload" type="file" accept="image/*" multiple onChange={handleNewImagesChange} className="hidden" />
                    </label>
                    <InputError message={errors.image_urls} className="mt-2" />
                </section>

                {/* MAP */}
                <section className="bg-white rounded-2xl p-8 border border-white/20 shadow-md space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl grid place-items-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 01-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Location</h2>
                            <p className="text-gray-600">Set property pin and boundary</p>
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

                    <InputError message={errors.boundary} className="mt-1" />
                </section>

                {/* ACTIONS */}
                <div className="flex flex-col w-full">
                    <button
                        type="submit"
                        disabled={processing}
                        className={`flex items-center mb-4 justify-center px-6 py-3 rounded font-medium text-white ${
                            processing ? "bg-gray-400" : "bg-primary hover:bg-accent"
                        }`}
                    >
                        <CheckLine className="w-5 h-5 mr-2" />
                        {processing ? "Saving..." : "Save changes"}
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
        </BrokerLayout>
    );
}
