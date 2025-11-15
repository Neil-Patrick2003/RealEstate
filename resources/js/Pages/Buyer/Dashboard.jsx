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
} from "@fortawesome/free-solid-svg-icons";

/** UTILITIES **/
const statusStyles = {
    accepted: "bg-green-50 text-green-700 ring-green-200",
    rejected: "bg-red-50 text-red-700 ring-red-200",
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    cancelled: "bg-gray-50 text-gray-700 ring-gray-200",
    default: "bg-orange-50 text-orange-700 ring-orange-200",
};

const StatusPill = ({ value }) => {
    const key = String(value || "").toLowerCase();
    const cls = statusStyles[key] || statusStyles.default;
    return (
        <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ${cls}`}>
      <span
          className={`block h-1.5 w-1.5 rounded-full ${
              key === "accepted"
                  ? "bg-green-500"
                  : key === "rejected"
                      ? "bg-red-500"
                      : key === "pending"
                          ? "bg-amber-500"
                          : key === "cancelled"
                              ? "bg-gray-500"
                              : "bg-orange-500"
          }`}
      />
            {String(value || "Unknown").replace(/^./, (c) => c.toUpperCase())}
    </span>
    );
};

const EmptyRow = ({ colSpan = 5, text = "No items found." }) => (
    <tr>
        <td colSpan={colSpan} className="text-center py-8 text-gray-400">
            {text}
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
                onSuccess: () => setToast({ type: "success", msg: optimisticAdded ? "Added to favorites" : "Removed from favorites" }),
                onError: () => {
                    // revert
                    setFavoriteIds((prev) =>
                        optimisticAdded ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]
                    );
                    setToast({ type: "error", msg: "Failed to update favorites" });
                },
            }
        );
    };

    return (
        <BuyerLayout>
            <Head title="Dashboard" />

            {/* Toast */}
            {toast && (
                <div
                    role="status"
                    className={`fixed top-5 right-5 z-50 px-4 py-2 rounded-lg shadow-lg text-sm ${
                        toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
                    }`}
                    onAnimationEnd={() => setTimeout(() => setToast(null), 2500)}
                >
                    {toast.msg}
                </div>
            )}

            <div className="py-10 px-4 sm:px-4 lg:px-0 space-y-10">
                {/* Welcome + Quick Stats + Carousel */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Welcome Card */}
                    <div className="lg:col-span-2 bg-gradient-to-tl from-primary to-accent rounded-2xl p-6 lg:p-8 text-white flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 overflow-hidden relative">
                        <div className="space-y-2 lg:space-y-4 max-w-xl">
                            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Welcome back, {name} 👋</h1>
                            <p className="text-sm text-slate-100/90">
                                Explore a personalized experience to help you find the perfect lot. Track saved properties and manage your inquiries — all in one place.
                            </p>
                            <div className="flex items-center gap-3">
                                <Link href="/all-properties" className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-full text-sm font-semibold hover:scale-[1.02] active:scale-95 transition">
                                    <FontAwesomeIcon icon={faMagnifyingGlass} /> Discover Now
                                </Link>
                                <Link href="/inquiries" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 ring-1 ring-white/20 backdrop-blur rounded-full text-sm font-semibold hover:bg-white/20 transition">
                                    View Inquiries
                                </Link>
                            </div>
                        </div>
                        <img src={logo} alt="Lot Finder" className="w-64 h-52 hidden lg:block drop-shadow-xl" />

                        {/* Quick stats overlay for large screens */}
                        <div className="hidden lg:grid grid-cols-3 gap-3 absolute bottom-4 right-4">
                            {[
                                { label: "Saved", value: saveCount, icon: faHeart },
                                { label: "Inquiries", value: stats.totalInquiries, icon: faMagnifyingGlass },
                                { label: "Accepted", value: stats.accepted, icon: faCheckCircle },
                            ].map((s, i) => (
                                <div key={i} className="bg-white/15 rounded-xl px-3 py-2 text-white backdrop-blur ring-1 ring-white/20 flex items-center gap-2">
                                    <FontAwesomeIcon icon={s.icon} className="text-white" />
                                    <div>
                                        <div className="text-xs opacity-80">{s.label}</div>
                                        <div className="text-base font-semibold">{s.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Carousel */}
                    <div className="relative z-10">
                        <div className="relative rounded-2xl overflow-hidden shadow-xl">
                            <div className="relative z-10">
                                <CustomCarousel>
                                    {/* Slide 1 */}
                                    <div className="relative rounded-xl h-60 sm:h-72 md:h-80 flex flex-col justify-center items-center text-center p-4 text-white overflow-hidden bg-gradient-to-tl from-primary to-accent">
                                        <FontAwesomeIcon icon={faHouse} className="absolute text-white/30 text-8xl top-4 left-1/2 -translate-x-1/2" />
                                        <h2 className="text-2xl md:text-3xl font-bold mb-2">Find Your Dream Home</h2>
                                        <p className="text-sm md:text-base max-w-md">Browse hundreds of properties across the country.</p>
                                    </div>

                                    {/* Slide 2 */}
                                    <div className="relative rounded-xl h-60 sm:h-72 md:h-80 flex flex-col justify-center items-center text-center p-4 text-white overflow-hidden bg-gradient-to-tl from-primary to-accent">
                                        <FontAwesomeIcon icon={faCheckCircle} className="absolute text-white/30 text-8xl top-4 left-1/2 -translate-x-1/2" />
                                        <h2 className="text-2xl md:text-3xl font-bold mb-2">Verified Listings Only</h2>
                                        <p className="text-sm md:text-base max-w-md">We make sure every property is checked and trusted.</p>
                                    </div>

                                    {/* Slide 3 */}
                                    <div className="relative rounded-xl h-60 sm:h-72 md:h-80 flex flex-col justify-center items-center text-center p-4 text-white overflow-hidden bg-gradient-to-tl from-primary to-accent">
                                        <FontAwesomeIcon icon={faUserTie} className="absolute text-white/30 text-8xl top-4 left-1/2 -translate-x-1/2" />
                                        <h2 className="text-2xl md:text-3xl font-bold mb-2">Connect With Local Agents</h2>
                                        <p className="text-sm md:text-base max-w-md">Get expert advice directly from certified professionals.</p>
                                    </div>
                                </CustomCarousel>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured Properties */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-800">Featured Properties</h2>
                        <Link href="/buyer/properties" className="text-sm text-primary hover:underline">
                            View All
                        </Link>
                    </div>

                    {properties.length ? (
                        <div className="relative">
                            <div className="overflow-x-auto flex space-x-6 snap-x snap-mandatory scroll-smooth pb-2">
                                {properties.slice(0, 8).map((property) => (
                                    <div key={property.id} className="snap-center flex-shrink-0 w-80">
                                        <PropertyCard property={property} favoriteIds={favoriteIds} toggleFavorite={toggleFavorite} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed p-8 text-center text-gray-500">
                            No featured properties yet. <Link href="/all-properties" className="text-primary underline ml-1">Browse listings</Link>
                        </div>
                    )}
                </section>

                {/* Map View */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-semibold text-gray-800">Explore on Map</h2>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                            <FontAwesomeIcon icon={faMapLocationDot} />
                            Interactive map of your nearby and saved listings
                        </div>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                        <PropertiesMap properties={properties} />
                        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow text-xs text-gray-700">
                            Tip: Click pins to see price and quick actions
                        </div>
                    </div>
                </section>

                {/* Inquiries Section */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Inquiries Table */}
                    <div className="lg:col-span-2 border rounded-2xl bg-white shadow-sm">
                        <div className="flex items-center justify-between px-6 pt-4">
                            <h2 className="text-xl font-semibold text-gray-800">Recent Inquiries</h2>
                            <Link href="/buyer/inquiries" className="text-sm text-primary hover:underline">
                                View All
                            </Link>
                        </div>
                        <div className="overflow-x-auto mt-2 rounded-b-lg">
                            <table className="min-w-full text-sm text-left text-gray-700">
                                <thead className="bg-gray-100 text-xs text-gray-500 uppercase tracking-wide hidden md:table-header-group">
                                <tr>
                                    <th className="p-3">Property</th>
                                    <th className="p-3">Agent</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Date Inquired</th>
                                    <th className="p-3"/>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-dashed">
                                {inquiries.length > 0 ? (
                                    inquiries.slice(0, 8).map((inquiry) => (
                                        <tr key={inquiry.id} className="hover:bg-gray-50 transition-colors duration-150 flex flex-col md:table-row w-full">
                                            <td className="p-3 md:table-cell">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={`/storage/${inquiry.property?.image_url}`}
                                                        onError={(e) => {
                                                            e.currentTarget.src = "/placeholder.png";
                                                        }}
                                                        alt={inquiry.property?.title || "Property"}
                                                        className="w-14 h-14 object-cover rounded-md"
                                                    />
                                                    <div className="truncate">
                                                        <p className="font-semibold text-gray-800 truncate w-48 md:w-auto">
                                                            {inquiry.property?.title ?? "Unknown Property"}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {inquiry.property?.property_type} | {inquiry.property?.sub_type}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 md:table-cell">
                                                <Link href={`/agents/${inquiry.agent?.id || inquiry.broker?.id || "#"}`} className="text-primary hover:underline">
                                                    {inquiry.agent?.name ?? inquiry.broker?.name ?? "N/A"}
                                                </Link>
                                                <div className="text-xs text-gray-500">{inquiry.agent?.email || inquiry.broker?.email || "—"}</div>
                                            </td>
                                            <td className="p-3 md:table-cell">
                                                <StatusPill value={inquiry.status} />
                                            </td>
                                            <td className="p-3 md:table-cell">{dayjs(inquiry.created_at).format("MMM D, YYYY")}</td>
                                            <td className="p-3 md:table-cell text-right">
                                                <Link
                                                    href={`/buyer/inquiries/${inquiry.id}`}
                                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                                >
                                                    View <FontAwesomeIcon icon={faChevronRight} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <EmptyRow colSpan={5} text="No inquiries found." />
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Inquiry Progress Card */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">In Progress Inquiry</h2>
                        <div className="border border-gray-100 p-4 rounded-xl shadow-md bg-white transition hover:shadow-lg">
                            {progressInquiry ? (
                                <>
                                    <img
                                        src={`/storage/${progressInquiry.property.image_url}`}
                                        alt={progressInquiry.property.title}
                                        onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                                        className="rounded-xl h-48 w-full object-cover mb-2"
                                    />
                                    <p className="text-lg font-semibold mb-2 line-clamp-2">{progressInquiry.property.title}</p>
                                    <div className="mb-2 text-sm text-gray-500">
                                        Last update: {dayjs(progressInquiry.updated_at || progressInquiry.created_at).format("MMM D, YYYY h:mm A")}
                                    </div>
                                    <Progress inquiryStatus={progressInquiry.status} />
                                </>
                            ) : (
                                <ProfileProgress user={auth} />
                            )}
                        </div>
                    </div>
                </section>

                {/* Sticky CTASection on mobile */}
                <div className="lg:hidden fixed bottom-5 inset-x-0 flex justify-center pointer-events-none">
                    <Link
                        href="/buyer/properties"
                        className="pointer-events-auto inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-white shadow-lg hover:shadow-xl active:scale-95 transition"
                    >
                        <FontAwesomeIcon icon={faMagnifyingGlass} /> Explore more properties
                    </Link>
                </div>
            </div>
        </BuyerLayout>
    );
}
