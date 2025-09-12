import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import dayjs from "dayjs";

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
} from "@fortawesome/free-solid-svg-icons";

export default function Show({ inquiry }) {
    const buyer = inquiry?.buyer;
    const property = inquiry?.property;

    return (
        <BrokerLayout>
            <main className="flex-grow ">
                <article className="bg-white rounded-xl">
                    <header className="mb-12">
                        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Lot Inquiry Details</h2>
                        <p className="mt-2 text-gray-600 text-lg">
                            Detailed information about the lot and buyer inquiry.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Property Information */}
                        <section
                            aria-labelledby="lot-info-title"
                            className="space-y-8 rounded-2xl p-8 border border-gray-100 shadow-sm"
                        >
                            <h3
                                id="lot-info-title"
                                className="text-xl font-semibold text-primary border-b border-green-300 pb-3 mb-6"
                            >
                                Property Information
                            </h3>
                            <dl className="space-y-6 text-gray-800">
                                <div className="flex items-center space-x-4">
                                    <FontAwesomeIcon icon={faHome} className="h-6 w-6 text-accent flex-shrink-0" />
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Property Title</dt>
                                        <dd className="text-lg font-semibold">{property.title}</dd>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <FontAwesomeIcon
                                        icon={faMapMarkerAlt}
                                        className="h-6 w-6 text-accent flex-shrink-0"
                                    />
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Location</dt>
                                        <dd className="text-lg font-semibold">{property.address}</dd>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <FontAwesomeIcon
                                        icon={faBuilding}
                                        className="h-6 w-6 text-accent flex-shrink-0"
                                    />
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Type</dt>
                                        <dd className="text-lg font-semibold">{property.property_type}</dd>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <FontAwesomeIcon
                                        icon={faRulerCombined}
                                        className="h-6 w-6 text-accent flex-shrink-0"
                                    />
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Size</dt>
                                        <dd className="text-lg font-semibold">
                                            {property?.lot_area}
                                            {property?.floor_area} square meters
                                        </dd>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <FontAwesomeIcon icon={faTag} className="h-6 w-6 text-accent flex-shrink-0" />
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Price</dt>
                                        <dd className="text-lg font-semibold">
                                            {property.price
                                                ? new Intl.NumberFormat("en-PH", {
                                                    style: "currency",
                                                    currency: "PHP",
                                                    minimumFractionDigits: 0,
                                                }).format(property.price)
                                                : "Not available"}
                                        </dd>
                                    </div>
                                </div>
                            </dl>
                        </section>

                        {/* Buyer Information */}
                        <section
                            aria-labelledby="buyer-info-title"
                            className="space-y-8 border border-gray-100 rounded-2xl p-8 shadow-sm"
                        >
                            <h3
                                id="buyer-info-title"
                                className="text-2xl font-semibold text-primary border-b border-green-300 pb-3 mb-6"
                            >
                                Buyer Information
                            </h3>
                            <dl className="space-y-6 text-gray-800">
                                <div className="flex items-center space-x-4">
                                    <FontAwesomeIcon icon={faUser} className="h-6 w-6 text-accent flex-shrink-0" />
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Buyer Name</dt>
                                        <dd className="text-lg font-semibold">{buyer.name}</dd>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <FontAwesomeIcon
                                        icon={faEnvelope}
                                        className="h-6 w-6 text-accent flex-shrink-0"
                                    />
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                                        <dd>
                                            <a
                                                href={`mailto:${buyer.email}`}
                                                className="text-blue-600 underline hover:text-blue-800 transition"
                                            >
                                                {buyer.email}
                                            </a>
                                        </dd>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <FontAwesomeIcon icon={faPhone} className="h-6 w-6 text-accent flex-shrink-0" />
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                                        <dd className="text-lg font-semibold">
                                            {buyer.contact_number ? buyer.contact_number : "No contact number"}
                                        </dd>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <FontAwesomeIcon
                                        icon={faCalendarAlt}
                                        className="h-6 w-6 text-accent flex-shrink-0"
                                    />
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Inquiry Date</dt>
                                        <dd className="text-lg font-semibold">
                                            {dayjs(inquiry.created_at).format("MMMM D, YYYY")}
                                        </dd>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <FontAwesomeIcon
                                        icon={faInfoCircle}
                                        className="h-6 w-6 text-accent flex-shrink-0"
                                    />
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                                        <dd>
                                            <span className="inline-block px-6 py-2 rounded-full bg-green-600 text-white font-semibold tracking-wide shadow-md select-none">
                                                {inquiry.status === "accepted"
                                                    ? "Accepted"
                                                    : inquiry.status === "rejected"
                                                        ? "Rejected"
                                                        : inquiry.status === "pending"
                                                            ? "Pending"
                                                            : inquiry.status === "cancelled"
                                                                ? "Cancelled"
                                                                : "Unknown"}
                                            </span>
                                        </dd>
                                    </div>
                                </div>
                            </dl>
                        </section>
                    </div>

                    {/* Buyer Message */}
                    <section
                        aria-labelledby="buyer-message-title"
                        className="mt-16 max-w-5xl mx-auto border border-gray-200 rounded-2xl p-8 shadow-sm bg-gray-50"
                    >
                        <h3
                            id="buyer-message-title"
                            className="text-2xl font-semibold text-primary border-b border-indigo-300 pb-3 mb-6"
                        >
                            Buyer Message
                        </h3>
                        <div className="message-box max-h-48 overflow-y-auto text-gray-900 text-lg leading-relaxed whitespace-pre-line">
                            {inquiry.notes ? inquiry.notes : "No message available."}
                        </div>
                    </section>

                    <footer className="mt-16 text-center text-gray-500 text-sm select-none">
                        Inquiry ID: <span className="font-mono">{inquiry.id}</span> &nbsp;|&nbsp; Last updated:{" "}
                        {dayjs(inquiry.updated_at).format("MMMM D, YYYY, h:mm A")}
                    </footer>
                </article>
            </main>
        </BrokerLayout>
    );
}
