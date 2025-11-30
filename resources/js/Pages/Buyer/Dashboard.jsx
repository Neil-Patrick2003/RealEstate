import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import { usePage, Link, Head, router } from "@inertiajs/react";
import PropertiesMap from "@/Components/PropertiesMap.jsx";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import Progress from "@/Components/Progress.jsx";
import PropertyCard from "@/Components/Property/PropertyCard.jsx";
import CustomCarousel from "@/Components/Slider/custom.slider.jsx";
import ProfileProgress from "@/Components/ProfileProgress.jsx";
import logo from "../../../assets/real estate.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHouse,
    faCheckCircle,
    faUserTie,
    faHeart,
    faMapLocationDot,
    faChevronRight,
    faChevronLeft,
    faMagnifyingGlass,
    faStar,
    faHome,
    faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";

/** UTILITIES **/
const statusStyles = {
    accepted: "badge-success",
    rejected: "badge-error",
    pending: "badge-warning",
    cancelled: "badge-gray",
    default: "badge-primary",
};

const StatusPill = ({ value }) => {
    const key = String(value || "").toLowerCase();
    const cls = statusStyles[key] || statusStyles.default;
    return (
        <span className={`badge ${cls}`}>
            <span className={`block h-2 w-2 rounded-full ${
                key === "accepted" ? "bg-emerald-500" :
                    key === "rejected" ? "bg-rose-500" :
                        key === "pending" ? "bg-amber-500" :
                            key === "cancelled" ? "bg-gray-500" :
                                "bg-primary-500"
            }`} />
            {String(value || "Unknown").replace(/^./, (c) => c.toUpperCase())}
        </span>
    );
};

const EmptyRow = ({ colSpan = 5, text = "No items found." }) => (
    <tr>
        <td colSpan={colSpan} className="text-center py-12 text-gray-400 text-lg">
            <div className="flex flex-col items-center gap-3">
                <FontAwesomeIcon icon={faHome} className="text-4xl text-gray-300" />
                <span>{text}</span>
            </div>
        </td>
    </tr>
);

export default function Dashboard({ properties = [], inquiries = [], saveCount = 0 }) {
    const auth = usePage().props?.auth?.user ?? null;
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [toast, setToast] = useState(null);

    const name = auth?.name?.split(" ")[0] || "there";

    /** Derived stats **/
    const stats = useMemo(() => {
        const totalProps = properties.length;
        const totalInquiries = inquiries.length;
        const accepted = inquiries.filter((i) => i.status === "accepted").length;
        const pending = inquiries.filter((i) => i.status === "pending").length;
        return { totalProps, totalInquiries, accepted, pending };
    }, [properties, inquiries]);

    const progressInquiry = inquiries.find((i) => i.status === "accepted");

    /** Favorite toggling with optimistic UI */
    const toggleFavorite = (propertyId) => {
        const optimisticAdded = !favoriteIds.includes(propertyId);
        setFavoriteIds((prev) =>
            prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]
        );

        router.post(
            `/properties/${propertyId}/favorites`,
            { id: propertyId },
            {
                preserveScroll: true,
                onSuccess: () => setToast({
                    type: "success",
                    msg: optimisticAdded ? "Added to favorites" : "Removed from favorites"
                }),
                onError: () => {
                    setFavoriteIds((prev) =>
                        optimisticAdded ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]
                    );
                    setToast({ type: "error", msg: "Failed to update favorites" });
                },
            }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            {/* Toast */}
            {toast && (
                <div
                    role="status"
                    className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-2xl shadow-hover text-sm font-semibold backdrop-blur-lg border ${
                        toast.type === "success"
                            ? "alert-success border-emerald-200/60"
                            : "alert-error border-rose-200/60"
                    } animate-slide-up`}
                    onAnimationEnd={() => setTimeout(() => setToast(null), 3000)}
                >
                    <div className="flex items-center gap-3">
                        <FontAwesomeIcon
                            icon={toast.type === "success" ? faCheckCircle : faExclamationTriangle}
                            className={toast.type === "success" ? "text-emerald-600" : "text-rose-600"}
                        />
                        {toast.msg}
                    </div>
                </div>
            )}

            <div className="page-content space-y-12">
                {/* Welcome + Quick Stats + Carousel */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Welcome Card */}
                    <div className="lg:col-span-2 card-hover bg-gradient-to-br from-primary-500 to-emerald-600 rounded-3xl p-8 text-white relative overflow-hidden">
                        <div className="relative z-10 space-y-6">
                            <div className="space-y-3">
                                <p className="text-4xl font-bold  text-emerald-800 dark:text-emerald-400 tracking-tight animate-fade-in">
                                    Welcome back, {name} 👋
                                </p>
                                <p className="text-slate-100/90 text-lg max-w-2xl">
                                    Explore a personalized experience to help you find the perfect lot. Track saved properties and manage your inquiries — all in one place.
                                </p>
                            </div>

                        </div>

                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
                        </div>

                        {/* Quick stats for large screens */}
                        <div className="hidden lg:grid grid-cols-3 gap-4 absolute bottom-6 right-6 left-6">
                            {[
                                { label: "Saved", value: saveCount, icon: faHeart, color: "from-rose-400 to-pink-500" },
                                { label: "Inquiries", value: stats.totalInquiries, icon: faChartLine, color: "from-blue-400 to-cyan-500" },
                                { label: "Accepted", value: stats.accepted, icon: faCheckCircle, color: "from-emerald-400 to-green-500" },
                            ].map((s, i) => (
                                <div key={i} className={`glass-card bg-gradient-to-br ${s.color} p-4 text-white backdrop-blur-lg border-white/20`}>
                                    <div className="flex items-center gap-3">
                                        <div className="feature-icon bg-white/20">
                                            <FontAwesomeIcon icon={s.icon} className="text-white text-lg" />
                                        </div>
                                        <div>
                                            <div className="text-sm opacity-90">{s.label}</div>
                                            <div className="text-xl font-bold">{s.value}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Carousel */}
                    <div className="relative z-10">
                        <div className="card-hover overflow-hidden">
                            <CustomCarousel>
                                {/* Slide 1 */}
                                <div className="relative rounded-3xl h-80 flex flex-col justify-center items-center text-center p-8 text-white overflow-hidden bg-gradient-to-br from-primary-500 to-emerald-600">
                                    <FontAwesomeIcon icon={faHouse} className="absolute text-white/20 text-9xl top-4 left-1/2 -translate-x-1/2 animate-float" />
                                    <h2 className="text-3xl font-bold mb-4 animate-fade-in">Find Your Dream Home</h2>
                                    <p className="text-lg max-w-md animate-fade-in">Browse hundreds of properties across the country.</p>
                                </div>

                                {/* Slide 2 */}
                                <div className="relative rounded-3xl h-80 flex flex-col justify-center items-center text-center p-8 text-white overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600">
                                    <FontAwesomeIcon icon={faCheckCircle} className="absolute text-white/20 text-9xl top-4 left-1/2 -translate-x-1/2 animate-float" />
                                    <h2 className="text-3xl font-bold mb-4 animate-fade-in">Verified Listings Only</h2>
                                    <p className="text-lg max-w-md animate-fade-in">We make sure every property is checked and trusted.</p>
                                </div>

                                {/* Slide 3 */}
                                <div className="relative rounded-3xl h-80 flex flex-col justify-center items-center text-center p-8 text-white overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600">
                                    <FontAwesomeIcon icon={faUserTie} className="absolute text-white/20 text-9xl top-4 left-1/2 -translate-x-1/2 animate-float" />
                                    <h2 className="text-3xl font-bold mb-4 animate-fade-in">Connect With Local Agents</h2>
                                    <p className="text-lg max-w-md animate-fade-in">Get expert advice directly from certified professionals.</p>
                                </div>
                            </CustomCarousel>
                        </div>
                    </div>
                </section>

                {/* Featured Properties */}
                <section className="page-section">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">Recommended Properties</h2>
                            <p className="section-description">
                                Handpicked listings that match your preferences and search history
                            </p>
                        </div>
                        <Link href="/all-properties" className="btn-ghost">
                            View All <FontAwesomeIcon icon={faChevronRight} />
                        </Link>
                    </div>

                    {properties.length ? (
                        <div className="grid-properties">
                            {properties.slice(0, 8).map((property) => (
                                <PropertyCard
                                    key={property.id}
                                    property={property}
                                    favoriteIds={favoriteIds}
                                    toggleFavorite={toggleFavorite}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="card text-center py-16">
                            <FontAwesomeIcon icon={faHome} className="text-6xl text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No featured properties yet</h3>
                            <p className="text-gray-500 mb-6">Start exploring available listings in your area</p>
                            <Link href="/all-properties" className="btn-primary">
                                <FontAwesomeIcon icon={faMagnifyingGlass} /> Browse Listings
                            </Link>
                        </div>
                    )}
                </section>

                {/* Map View */}
                <section className="page-section">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">Explore on Map</h2>
                            <p className="section-description">
                                Interactive map of your nearby and saved listings
                            </p>
                        </div>
                        <div className="badge-primary">
                            <FontAwesomeIcon icon={faMapLocationDot} />
                            Live View
                        </div>
                    </div>
                    <div className="card overflow-hidden">
                        <PropertiesMap properties={properties} />
                    </div>
                </section>

                {/* Inquiries Section */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Inquiries Table */}
                    <div className="lg:col-span-2">
                        <div className="section-header">
                            <h2 className="section-title">Recent Inquiries</h2>
                            <Link href="/buyer/inquiries" className="btn-ghost">
                                View All <FontAwesomeIcon icon={faChevronRight} />
                            </Link>
                        </div>
                        <div className="card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-left">
                                    <thead className="bg-gray-50/80 border-b border-gray-100/60">
                                    <tr>
                                        <th className="p-6 font-semibold text-gray-900">Property</th>
                                        <th className="p-6 font-semibold text-gray-900">Agent</th>
                                        <th className="p-6 font-semibold text-gray-900">Status</th>
                                        <th className="p-6 font-semibold text-gray-900">Date Inquired</th>
                                        <th className="p-6 font-semibold text-gray-900">Action</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100/60">
                                    {inquiries.length > 0 ? (
                                        inquiries.slice(0, 8).map((inquiry) => (
                                            <tr key={inquiry.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                                                <td className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={`/storage/${inquiry.property?.image_url}`}
                                                            onError={(e) => {
                                                                e.currentTarget.src = "/placeholder.png";
                                                            }}
                                                            alt={inquiry.property?.title || "Property"}
                                                            className="w-16 h-16 object-cover rounded-2xl shadow-soft"
                                                        />
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-gray-900 truncate">
                                                                {inquiry.property?.title ?? "Unknown Property"}
                                                            </p>
                                                            <p className="text-sm text-gray-500 truncate">
                                                                {inquiry.property?.property_type} | {inquiry.property?.sub_type}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <Link
                                                        href={`/agents/${inquiry.agent?.id || inquiry.broker?.id || "#"}`}
                                                        className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
                                                    >
                                                        {inquiry.agent?.name ?? inquiry.broker?.name ?? "N/A"}
                                                    </Link>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        {inquiry.agent?.email || inquiry.broker?.email || "—"}
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <StatusPill value={inquiry.status} />
                                                </td>
                                                <td className="p-6 text-gray-600">
                                                    {dayjs(inquiry.created_at).format("MMM D, YYYY")}
                                                </td>
                                                <td className="p-6">
                                                    <Link
                                                        href={`/buyer/inquiries/${inquiry.id}`}
                                                        className="btn-ghost btn-sm"
                                                    >
                                                        View <FontAwesomeIcon icon={faChevronRight} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <EmptyRow colSpan={5} text="No inquiries found. Start exploring properties!" />
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Inquiry Progress Card */}
                    <div className="space-y-6">
                        <h2 className="section-title text-2xl">In Progress Inquiry</h2>
                        <div className="card-hover p-6">
                            {progressInquiry ? (
                                <div className="space-y-6">
                                    <img
                                        src={`/storage/${progressInquiry.property.image_url}`}
                                        alt={progressInquiry.property.title}
                                        onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                                        className="rounded-2xl h-48 w-full object-cover shadow-soft"
                                    />
                                    <div className="space-y-3">
                                        <h3 className="font-bold text-gray-900 text-lg line-clamp-2">
                                            {progressInquiry.property.title}
                                        </h3>
                                        <div className="text-sm text-gray-500">
                                            Last update: {dayjs(progressInquiry.updated_at || progressInquiry.created_at).format("MMM D, YYYY h:mm A")}
                                        </div>
                                        <Progress inquiryStatus={progressInquiry.status} />
                                    </div>
                                </div>
                            ) : (
                                <ProfileProgress user={auth} />
                            )}
                        </div>

                        {/* Quick Stats Card */}
                        <div className="card p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Your Activity</h3>
                            <div className="space-y-4">
                                {[
                                    { label: "Properties Viewed", value: stats.totalProps, color: "bg-blue-500" },
                                    { label: "Total Inquiries", value: stats.totalInquiries, color: "bg-amber-500" },
                                    { label: "Accepted Offers", value: stats.accepted, color: "bg-emerald-500" },
                                    { label: "Pending Reviews", value: stats.pending, color: "bg-purple-500" },
                                ].map((stat, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-gray-600">{stat.label}</span>
                                        <span className="font-semibold text-gray-900">{stat.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sticky CTA Section on mobile */}
                <div className="lg:hidden fixed bottom-6 inset-x-6 flex justify-center pointer-events-none z-40">
                    <Link
                        href="/buyer/properties"
                        className="btn-primary shadow-hover pointer-events-auto animate-bounce-in"
                    >
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                        Explore Properties
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
