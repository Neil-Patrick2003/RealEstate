// resources/js/Pages/Broker/Developers/ShowPartner.jsx
import React, { useMemo } from "react";
import { Head, Link } from "@inertiajs/react";
import {
    Building2,
    BadgeCheck,
    Globe,
    Facebook,
    MapPin,
    IdCard,
    Fingerprint,
    CalendarDays,
    Home,
    ShieldCheck,
    Link as LinkIcon,
    LayoutGrid,
    Image as ImageIcon,
} from "lucide-react";
import BrokerLayout from "@/Layouts/BrokerLayout.jsx";

/** Small helpers */
const cn = (...c) => c.filter(Boolean).join(" ");
const getHost = (url) => {
    try {
        return new URL(url).host.replace(/^www\./, "");
    } catch {
        return null;
    }
};

const Logo = ({ name = "Developer", src, className = "" }) => {
    if (src) {
        return (
            <img
                src={src}
                alt={`${name} logo`}
                className={cn("h-16 w-16 rounded-2xl object-cover ring-1 ring-black/5", className)}
            />
        );
    }
    const initials = (name || "D")
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    return (
        <div
            className={cn(
                "h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 grid place-items-center ring-1 ring-black/5",
                className
            )}
        >
            <span className="font-semibold text-emerald-900">{initials}</span>
        </div>
    );
};

const Stat = ({ icon: Icon, label, value }) => (
    <div className="p-4 rounded-xl border bg-white/60">
        <div className="flex items-center gap-2 text-sm text-gray-500">
            <Icon className="h-4 w-4" />
            <span>{label}</span>
        </div>
        <div className="mt-1 font-medium">{value || "—"}</div>
    </div>
);

const InfoRow = ({ icon: Icon, label, value, href }) => {
    const content = (
        <>
            <Icon className="h-4 w-4 shrink-0" />
            <span className="text-sm text-gray-600">{label}</span>
            <span className="ml-auto font-medium truncate max-w-[60%]">{value || "—"}</span>
        </>
    );
    if (href && value) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition"
            >
                {content}
            </a>
        );
    }
    return <div className="flex items-center gap-3 p-3 rounded-lg border bg-white/60">{content}</div>;
};

const StatusBadge = ({ status }) => {
    const s = (status || "").toLowerCase();
    const styles =
        s === "verified"
            ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
            : s === "pending"
                ? "bg-amber-50 text-amber-700 ring-amber-600/20"
                : "bg-gray-50 text-gray-600 ring-gray-500/20";
    const icon =
        s === "verified" ? <ShieldCheck className="h-3.5 w-3.5" /> : <BadgeCheck className="h-3.5 w-3.5" />;
    return (
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ring-1", styles)}>
      {icon}
            {status || "Unknown"}
    </span>
    );
};

const AmenityItem = ({ amenity }) => {
    const name = amenity?.name || amenity?.title || "Amenity";
    const iconUrl = amenity?.icon_url || amenity?.icon || null;
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl border bg-white hover:shadow-sm transition">
            {iconUrl ? (
                <img src={iconUrl} className="h-8 w-8 rounded-md object-cover" alt={name} />
            ) : (
                <LayoutGrid className="h-8 w-8 p-1.5 rounded-md border text-gray-500" />
            )}
            <div className="text-sm">
                <div className="font-medium">{name}</div>
                {!!amenity?.description && <div className="text-gray-500">{amenity.description}</div>}
            </div>
        </div>
    );
};

const PropertyCard = ({ p }) => {
    const title = p?.title || p?.name || "Untitled Listing";
    const price = p?.price || p?.min_price || null;
    const location = p?.location || p?.address || null;
    const image =
        p?.cover_image ||
        p?.main_image ||
        p?.images?.[0]?.url ||
        p?.photos?.[0] ||
        null;

    return (
        <div className="group rounded-2xl border overflow-hidden bg-white hover:shadow-md transition">
            <div className="aspect-[16/10] bg-gray-100 relative">
                {image ? (
                    <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                    <div className="absolute inset-0 grid place-items-center text-gray-400">
                        <ImageIcon className="h-8 w-8" />
                    </div>
                )}
            </div>
            <div className="p-4 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold leading-snug line-clamp-2">{title}</h4>
                    {price && <div className="text-emerald-700 font-semibold whitespace-nowrap">₱{Number(price).toLocaleString()}</div>}
                </div>
                {location && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{location}</span>
                    </div>
                )}
                {/* If you have a property show route, replace href accordingly */}
                {p?.id ? (
                    <Link
                        href={`/broker/properties/${p.id}`}
                        className="inline-flex items-center gap-1.5 text-sm mt-2 text-emerald-700 hover:underline"
                    >
                        View details <LinkIcon className="h-4 w-4" />
                    </Link>
                ) : null}
            </div>
        </div>
    );
};

export default function ShowPartner({ developer }) {
    const d = developer || {};
    const createdDate = useMemo(() => {
        try {
            return new Date(d.created_at).toLocaleDateString("en-PH", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return "—";
        }
    }, [d.created_at]);

    return (
        <BrokerLayout>
            <Head title={`${d.name || "Developer"} · Partner`} />

            {/* Page Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Logo name={d.name} src={d.company_logo} />
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl sm:text-2xl font-semibold">{d.name || "Developer"}</h1>
                            <StatusBadge status={d.status} />
                        </div>
                        <div className="mt-1 text-sm text-gray-600 flex items-center gap-2 flex-wrap">
                            <Building2 className="h-4 w-4" />
                            <span>{d.trade_name || "—"}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Adjust Link target to your actual Post Property route */}
                    <Link
                        href={`/broker/properties/create?developer_id=${d.id ?? ""}`}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
                    >
                        Post Property
                    </Link>
                </div>
            </div>

            {/* Top Stats */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Stat icon={Home} label="Total Properties" value={Array.isArray(d.properties) ? d.properties.length : 0} />
                <Stat icon={IdCard} label="License No." value={d.license_number} />
                <Stat icon={Fingerprint} label="Registration No." value={d.registration_number} />
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <section className="rounded-2xl border bg-white p-5">
                        <h2 className="font-semibold text-lg mb-2">About</h2>
                        <p className="text-gray-700 whitespace-pre-line">
                            {d.description?.trim() || "No description provided."}
                        </p>
                    </section>

                    {/* Amenities */}
                    <section className="rounded-2xl border bg-white p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold text-lg">Amenities</h2>
                            <span className="text-sm text-gray-500">
                {Array.isArray(d.amenities) ? d.amenities.length : 0} total
              </span>
                        </div>
                        {Array.isArray(d.amenities) && d.amenities.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {d.amenities.map((a, i) => (
                                    <AmenityItem key={a?.id ?? i} amenity={a} />
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 rounded-xl border border-dashed text-center text-gray-500">
                                No amenities listed yet.
                            </div>
                        )}
                    </section>

                    {/* Properties */}
                    <section className="rounded-2xl border bg-white p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold text-lg">Properties</h2>
                            {Array.isArray(d.properties) && d.properties.length > 0 && (
                                <Link
                                    href={`/broker/developers/${d.id}/properties`}
                                    className="text-sm text-emerald-700 hover:underline"
                                >
                                    View all
                                </Link>
                            )}
                        </div>

                        {Array.isArray(d.properties) && d.properties.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {d.properties.map((p) => (
                                    <PropertyCard key={p?.id ?? Math.random()} p={p} />
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 rounded-xl border border-dashed grid place-items-center text-center">
                                <div className="mx-auto max-w-md space-y-2">
                                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                        <Home className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <h3 className="font-semibold">No properties yet</h3>
                                    <p className="text-sm text-gray-600">
                                        Start by posting a property for <span className="font-medium">{d.name || "this developer"}</span>.
                                    </p>
                                    <div className="pt-2">
                                        <Link
                                            href={`/broker/properties/create?developer_id=${d.id ?? ""}`}
                                            className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition"
                                        >
                                            <Home className="h-4 w-4" />
                                            Post Property
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar */}
                <aside className="space-y-6">
                    <section className="rounded-2xl border bg-white p-5">
                        <h3 className="font-semibold mb-3">Company Info</h3>
                        <div className="space-y-2">
                            <InfoRow icon={Building2} label="Trade Name" value={d.trade_name} />
                            <InfoRow icon={MapPin} label="Head Office" value={d.head_office_address} />
                            <InfoRow
                                icon={Globe}
                                label="Website"
                                value={getHost(d.website_url)}
                                href={d.website_url}
                            />
                            <InfoRow
                                icon={Facebook}
                                label="Facebook"
                                value={getHost(d.facebook_url)}
                                href={d.facebook_url}
                            />
                            <InfoRow icon={CalendarDays} label="Partner Since" value={createdDate} />
                        </div>
                    </section>

                    <section className="rounded-2xl border bg-white p-5">
                        <h3 className="font-semibold mb-3">Contact</h3>
                        <div className="space-y-2">
                            <InfoRow icon={IdCard} label="Developer ID" value={d.id} />
                            <InfoRow icon={LinkIcon} label="Email" value={d.email} href={`mailto:${d.email}`} />
                            {/* If you track broker ownership */}
                            <InfoRow icon={BadgeCheck} label="Broker Owner" value={d.broker_id ? `#${d.broker_id}` : "—"} />
                        </div>
                    </section>
                </aside>
            </div>
        </BrokerLayout>
    );
}
