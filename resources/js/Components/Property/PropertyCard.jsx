// components/PropertyCard.jsx
import React, { useMemo, useState } from "react";
import {
    MapPin,
    Share2,
    Send,
    Ruler,
    Home,
    Building2,
    LandPlot,
    Star,
    Eye,
} from "lucide-react";

const cn = (...c) => c.filter(Boolean).join(" ");
const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 2 });
const truncate = (s, n = 70) => (s?.length > n ? s.slice(0, n - 1) + "…" : s || "—");

function TypeBadge({ type }) {
    const t = (type || "").toLowerCase();
    const map = {
        house: { icon: Home, cls: "bg-blue-50 text-blue-700 border-blue-200" },
        condo: { icon: Building2, cls: "bg-violet-50 text-violet-700 border-violet-200" },
        land:  { icon: LandPlot, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
        default:{ icon: Star, cls: "bg-gray-50 text-gray-700 border-gray-200" },
    };
    const Item = map[t] || map.default;
    const Icon = Item.icon;
    return (
        <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md border", Item.cls)}>
      <Icon className="w-3.5 h-3.5" />
            {type || "Property"}
    </span>
    );
}

function PresellRibbon({ isPresell }) {
    return (
        <div className="absolute top-3 right-3">
      <span
          className={cn(
              "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md shadow-sm",
              isPresell ? "bg-orange-500 text-white" : "bg-green-600 text-white"
          )}
      >
        {isPresell ? "Preselling" : "Available"}
      </span>
        </div>
    );
}

function AreaChip({ property }) {
    const area = property?.property_type?.toLowerCase() === "land" ? property?.lot_area : property?.floor_area;
    return (
        <span className="inline-flex items-center gap-1 text-xs text-gray-700">
      <Ruler className="w-3.5 h-3.5" />
            {area ? `${area} sqm` : "N/A"}
    </span>
    );
}

export default function PropertyCard({
                                         property = {},
                                         onView,        // () => void
                                         onInquiry,     // () => void
                                         onShare,       // () => void
                                     }) {
    const [imgErr, setImgErr] = useState(false);
    const imgSrc = !imgErr && property?.image_url ? `/storage/${property.image_url}` : "/placeholder.png";

    const features = useMemo(() => {
        const list = property?.features ?? [];
        return { show: list.slice(0, 2), extra: Math.max(0, list.length - 2) };
    }, [property?.features]);

    // Optional specs if you have them (falls back gracefully)
    const specs = [
        property?.bedrooms ? { label: `${property.bedrooms} BR` } : null,
        property?.bathrooms ? { label: `${property.bathrooms} BA` } : null,
    ].filter(Boolean);

    return (
        <article
            className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col focus-within:ring-2 focus-within:ring-gray-300"
            tabIndex={-1}
        >
            {/* Image */}
            <div className="relative">
                <img
                    src={imgSrc}
                    alt={property?.title || "Property image"}
                    onError={() => setImgErr(true)}
                    className="w-full aspect-[16/10] object-cover bg-gray-100"
                    loading="lazy"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                    <TypeBadge type={property?.property_type} />
                </div>
                <PresellRibbon isPresell={!!(typeof property.isPresell === "boolean" ? property.isPresell : Number(property.isPresell))} />
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col gap-3 flex-1">
                <h3
                    className="text-[15px] font-semibold text-gray-900 leading-tight"
                    title={property?.title}
                >
                    {truncate(property?.title, 72)}
                </h3>

                <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                    <span className="line-clamp-2" title={property?.address}>
            {property?.address || "—"}
          </span>
                </div>

                {/* Price + specs/area */}
                <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-emerald-600">
                        {currency.format(Number(property?.price ?? 0))}
                    </p>
                    <div className="flex items-center gap-3">
                        {specs.map((s, i) => (
                            <span key={i} className="text-xs text-gray-700">{s.label}</span>
                        ))}
                        <AreaChip property={property} />
                    </div>
                </div>

                {/* Features (chips) */}
                {!!features.show.length && (
                    <div className="flex gap-2 overflow-hidden">
                        {features.show.map((f, i) => (
                            <span
                                key={i}
                                className="bg-emerald-50 text-emerald-700 text-[11px] px-2 py-1 rounded-md border border-emerald-200 truncate max-w-[120px]"
                                title={f?.name}
                            >
                {f?.name}
              </span>
                        ))}
                        {features.extra > 0 && (
                            <span className="bg-gray-100 text-gray-700 text-[11px] px-2 py-1 rounded-md border border-gray-200 shrink-0">
                +{features.extra} more
              </span>
                        )}
                    </div>
                )}

                {/* Bottom actions (for keyboard users / non-hover) */}
                <div className="mt-auto pt-1 flex items-center gap-2">
                    <button
                        onClick={onView}
                        className="flex-1 text-center py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-black focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        View Details
                    </button>
                    <button
                        onClick={onInquiry}
                        className="px-3 py-2 rounded-md text-sm border border-primary text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        aria-label="Send inquiry"
                        title="Send inquiry"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onShare}
                        className="px-3 py-2 rounded-md text-sm border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        aria-label="Share"
                        title="Share"
                    >
                        <Share2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </article>
    );
}
