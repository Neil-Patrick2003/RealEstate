import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import dayjs from "dayjs";
import { Head } from "@inertiajs/react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHome,
    faMapMarkerAlt,
    faBuilding,
    faRulerCombined,
    faTag,
    faUser,
    faEnvelope,
    faPhone,
    faCalendarAlt,
    faInfoCircle,
    faArrowLeft,
    faMessage,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";

export default function Show({ inquiry }) {
    const buyer = inquiry?.buyer || {};
    const property = inquiry?.property || {};

    const formatPrice = (price) => {
        if (!price) return "—";
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            accepted: "badge-success",
            rejected: "badge-error",
            pending: "badge-warning",
            cancelled: "badge-gray",
        };
        return statusMap[status] || "badge-secondary";
    };

    const getStatusText = (status) => {
        const textMap = {
            accepted: "Accepted",
            rejected: "Rejected",
            pending: "Pending Review",
            cancelled: "Cancelled",
        };
        return textMap[status] || "Unknown";
    };

    const getArea = () => {
        if (property?.lot_area) return `${property.lot_area} sqm (Lot Area)`;
        if (property?.floor_area) return `${property.floor_area} sqm (Floor Area)`;
        return "Not specified";
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Inquiry - ${property?.title || 'Details'}`} />

            <div className="page-content space-y-6">
                {/* Header with Back Navigation */}
                <div className="page-header">
                    <div className="flex items-center gap-4 mb-4">
                        <Link
                            href="/broker/inquiries"
                            className="btn-ghost btn-sm"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" />
                            Back to Inquiries
                        </Link>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Inquiry Details</h1>
                            <p className="text-gray-600 mt-1">
                                Detailed information about the property inquiry and buyer
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`badge ${getStatusBadge(inquiry?.status)} text-sm`}>
                                {getStatusText(inquiry?.status)}
                            </span>
                            <span className="text-xs text-gray-500">
                                ID: {inquiry?.id}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Property Information Card */}
                    <section className="card">
                        <div className="card-header">
                            <div className="flex items-center gap-3">
                                <div className="feature-icon">
                                    <FontAwesomeIcon icon={faHome} className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Property Information</h2>
                                    <p className="text-gray-600 text-sm">Details about the inquired property</p>
                                </div>
                            </div>
                        </div>

                        <div className="card-body space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label">Property Title</label>
                                    <div className="text-sm font-medium text-gray-900">
                                        {property?.title || "—"}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Property Type</label>
                                    <div className="text-sm font-medium text-gray-900">
                                        {property?.property_type || "—"}
                                        {property?.sub_type && (
                                            <span className="text-gray-600 ml-1">({property.sub_type})</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 text-gray-400" />
                                    {property?.address || "No address provided"}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label">Size</label>
                                    <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faRulerCombined} className="w-4 h-4 text-gray-400" />
                                        {getArea()}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Price</label>
                                    <div className="text-sm font-semibold text-primary-600 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faTag} className="w-4 h-4" />
                                        {formatPrice(property?.price)}
                                    </div>
                                </div>
                            </div>

                            {property?.id && (
                                <div className="pt-4 border-t border-gray-100">
                                    <Link
                                        href={`/properties/${property.id}`}
                                        className="btn-outline btn-sm"
                                    >
                                        <FontAwesomeIcon icon={faHome} className="w-4 h-4 mr-2" />
                                        View Property Details
                                    </Link>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Buyer Information Card */}
                    <section className="card">
                        <div className="card-header">
                            <div className="flex items-center gap-3">
                                <div className="feature-icon">
                                    <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Buyer Information</h2>
                                    <p className="text-gray-600 text-sm">Contact details and inquiry information</p>
                                </div>
                            </div>
                        </div>

                        <div className="card-body space-y-4">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-gray-400" />
                                    {buyer?.name || "—"}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <div className="text-sm">
                                        {buyer?.email ? (
                                            <a
                                                href={`mailto:${buyer.email}?subject=Regarding ${property?.title || 'Property Inquiry'}`}
                                                className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-2"
                                            >
                                                <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
                                                {buyer.email}
                                            </a>
                                        ) : (
                                            <span className="text-gray-500">No email provided</span>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <div className="text-sm">
                                        {buyer?.contact_number ? (
                                            <a
                                                href={`tel:${buyer.contact_number}`}
                                                className="text-gray-900 hover:text-primary-600 flex items-center gap-2"
                                            >
                                                <FontAwesomeIcon icon={faPhone} className="w-4 h-4 text-gray-400" />
                                                {buyer.contact_number}
                                            </a>
                                        ) : (
                                            <span className="text-gray-500">Not provided</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label">Inquiry Date</label>
                                    <div className="text-sm text-gray-900 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 text-gray-400" />
                                        {inquiry?.created_at ? dayjs(inquiry.created_at).format("MMMM D, YYYY") : "—"}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Last Updated</label>
                                    <div className="text-sm text-gray-500">
                                        {inquiry?.updated_at ? dayjs(inquiry.updated_at).format("MMM D, YYYY") : "—"}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex gap-2">
                                {buyer?.email && (
                                    <a
                                        href={`mailto:${buyer.email}?subject=Regarding ${property?.title || 'Property Inquiry'}`}
                                        className="btn-primary btn-sm"
                                    >
                                        <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 mr-2" />
                                        Send Email
                                    </a>
                                )}
                                {buyer?.contact_number && (
                                    <a
                                        href={`tel:${buyer.contact_number}`}
                                        className="btn-outline btn-sm"
                                    >
                                        <FontAwesomeIcon icon={faPhone} className="w-4 h-4 mr-2" />
                                        Call Buyer
                                    </a>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Buyer Message Card */}
                <section className="card">
                    <div className="card-header">
                        <div className="flex items-center gap-3">
                            <div className="feature-icon">
                                <FontAwesomeIcon icon={faMessage} className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Buyer Message</h2>
                                <p className="text-gray-600 text-sm">Message from the buyer regarding this property</p>
                            </div>
                        </div>
                    </div>

                    <div className="card-body">
                        <div className="gray-card">
                            <div className="max-h-60 overflow-y-auto">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {inquiry?.notes ? (
                                        inquiry.notes
                                    ) : (
                                        <span className="text-gray-500 italic">
                                            No message provided by the buyer.
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer Metadata */}
                <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-4">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                        <span>Inquiry Reference: <strong className="font-mono">{inquiry?.id}</strong></span>
                        <span className="hidden sm:block">•</span>
                        <span>Created: {inquiry?.created_at ? dayjs(inquiry.created_at).format("MMMM D, YYYY [at] h:mm A") : "—"}</span>
                        <span className="hidden sm:block">•</span>
                        <span>Last updated: {inquiry?.updated_at ? dayjs(inquiry.updated_at).format("MMM D, YYYY") : "—"}</span>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
