import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Head, router } from "@inertiajs/react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { debounce } from "lodash";
import Chatbot from "@/Components/Chatbot/Chatbot";
// Assets
import logo from "../../assets/framer_logo.png";
import backgroundImage from "../../assets/background.jpg";
// Landing Page Components
import Hero from "@/Pages/LandingPage/Hero.jsx";
import PropertyList from "@/Pages/LandingPage/PropertyList.jsx";
import Footer from "@/Pages/LandingPage/Footer.jsx";

/**
 * MJVI Realty — Landing Page
 * Keep layout as-is; only navbar shows role-based Dashboard when logged in.
 */

/* ---------------- Dashboard Role Routing ---------------- */
const DASHBOARD_ROUTES = {
    agent: "/agents/dashboard",
    broker: "/broker/dashboard", // change to /brokers/dashboard if that's your route
    buyer: "/dashboard",
    seller: "/sellers/dashboard",
};
const getDashboardPath = (user) => {
    if (!user) return null;
    const role = String(user.role || "").toLowerCase();
    return DASHBOARD_ROUTES[role] || "/dashboard";
};

/* ------------------------------ Helpers ------------------------------ */
const Section = ({ id, className = "", children }) => (
    <section id={id} className={`relative w-full ${className}`}>{children}</section>
);

const peso = (v, fractionDigits = 0) => {
    const n = typeof v === "string" ? Number(v.replace(/,/g, "")) : Number(v);
    if (!Number.isFinite(n)) return "₱0";
    return (
        "₱" +
        n.toLocaleString("en-PH", {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
        })
    );
};

/* ------------------------------ Variants ----------------------------- */
const fade = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

/* ------------------------------ Small UI ----------------------------- */
const Chip = ({ children }) => (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/30 px-3 py-1 text-xs">
    {children}
  </span>
);

const Stat = ({ label, value }) => (
    <motion.div variants={fadeUp} className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-white/50 shadow-sm p-4 text-center">
        <div className="text-3xl font-extrabold text-emerald-600">{value}</div>
        <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">{label}</div>
    </motion.div>
);

const Feature = ({ title, desc, icon }) => (
    <motion.div variants={fadeUp} className="group rounded-2xl p-6 ring-1 ring-gray-200 bg-white shadow-sm hover:shadow-md transition hover:-translate-y-0.5">
        <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100">
            {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{desc}</p>
    </motion.div>
);

const PropertyCard = ({ p }) => (
    <motion.div
        variants={fadeUp}
        className="rounded-2xl overflow-hidden ring-1 ring-gray-200 bg-white shadow-sm hover:shadow-md transition hover:-translate-y-0.5"
    >
        <div className="relative">
            <img
                src={`/storage/${p.image_url}`}
                alt={p.title}
                className="h-52 w-full object-cover"
                loading="lazy"
                decoding="async"
            />
            {p?.badge && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-emerald-700 ring-1 ring-emerald-200">
          {p.badge}
        </span>
            )}
        </div>
        <div className="p-4">
            <h4 className="font-semibold text-gray-900 line-clamp-1">{p.title}</h4>
            <p className="text-sm text-gray-500 line-clamp-1">{p.location}</p>
            <div className="mt-3 flex items-center justify-between">
                <div className="text-emerald-600 font-bold">{peso(p?.price)}</div>
                <div className="text-xs text-gray-500">
                    {p?.lot_area ?? p?.floor_area} m² • {p?.bedrooms} bd
                </div>
            </div>
        </div>
    </motion.div>
);

/* ------------------------------ Component --------------------------- */
export default function LandingPage({ auth, properties = [], search = "", initialType = "All", featured = [], favouriteIds = [] }) {
    const [searchTerm, setSearchTerm] = useState(search || "");
    const [selectedType, setSelectedType] = useState(initialType);
    const [menuOpen, setMenuOpen] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    // Debug: Log properties data
    console.log('Properties received in Welcome.jsx:', properties);
    console.log('Properties count:', properties?.length || 0);

    useEffect(() => {
        if (search) setSearchTerm(search);
    }, [search]);

    // Remote filter call (Inertia router)
    const fetchProperties = (searchValue = searchTerm, typeValue = selectedType) => {
        router.get(
            "/",
            { search: searchValue, type: typeValue },
            { preserveState: true, replace: true }
        );
    };

    const debouncedSearch = useCallback(
        debounce((value) => fetchProperties(value, selectedType), 500),
        [selectedType]
    );

    useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

    const handleSearchTermChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleTypeChange = (type) => {
        setSelectedType(type);
        fetchProperties(searchTerm, type);
    };

    // Mobile nav keyboard support
    const toggleMenu = () => setMenuOpen((v) => !v);

    /* ------------------------------ Render ------------------------------ */
    return (
        <main className="min-h-screen bg-gray-50">
            <Head title="MJVI Realty — Find lots & homes fast" />

            {/* NAV */}
            <header className="sticky top-0 z-40 supports-[backdrop-filter]:bg-white/70 bg-white shadow/[0_1px_0_#e5e7eb] backdrop-blur">
                <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2" aria-label="Go to home">
                        <img src={logo} alt="MJVI Realty" className="w-8 h-8 -ml-1.5 drop-shadow-md" />
                        <span className="font-extrabold tracking-tight text-gray-900">
              MJVI<span className="text-emerald-600">Realty</span>
            </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600" aria-label="Primary">
                        <a href="#features" className="hover:text-gray-900">Features</a>
                        <a href="/all-properties" className="hover:text-gray-900">Explore</a>
                        <a href="#how" className="hover:text-gray-900">How it works</a>
                        <a href="#testimonials" className="hover:text-gray-900">Stories</a>
                        <a href="#faq" className="hover:text-gray-900">FAQ</a>
                    </nav>

                    {/* Right CTAs (changed) */}
                    <div className="hidden md:flex items-center gap-3">
                        {auth?.user ? (
                            <Link
                                href={getDashboardPath(auth.user)}
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100">Sign in</Link>
                                <Link href="/register" className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700">Get Started</Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden p-2 rounded-lg ring-1 ring-gray-200"
                        aria-label="Open menu"
                        aria-expanded={menuOpen}
                    >
                        ☰
                    </button>
                </div>

                {/* Mobile panel */}
                <AnimatePresence initial={false}>
                    {menuOpen && (
                        <motion.nav
                            key="mobile-nav"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="md:hidden border-t bg-white"
                            aria-label="Mobile"
                        >
                            <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-2 text-sm text-gray-700">
                                <a href="#features" onClick={() => setMenuOpen(false)} className="py-2">Features</a>
                                <a href="#explore" onClick={() => setMenuOpen(false)} className="py-2">Explore</a>
                                <a href="#how" onClick={() => setMenuOpen(false)} className="py-2">How it works</a>
                                <a href="#testimonials" onClick={() => setMenuOpen(false)} className="py-2">Stories</a>
                                <a href="#faq" onClick={() => setMenuOpen(false)} className="py-2">FAQ</a>
                                <div className="pt-2 flex gap-2">
                                    {auth?.user ? (
                                        <Link
                                            href={getDashboardPath(auth.user)}
                                            className="flex-1 px-4 py-2 rounded-xl text-white bg-emerald-600 text-center"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link href="/login" className="flex-1 px-4 py-2 rounded-xl ring-1 ring-gray-200 text-center" onClick={() => setMenuOpen(false)}>
                                                Sign in
                                            </Link>
                                            <Link href="/register" className="flex-1 px-4 py-2 rounded-xl text-white bg-emerald-600 text-center" onClick={() => setMenuOpen(false)}>
                                                Get Started
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.nav>
                    )}
                </AnimatePresence>
            </header>

            <Chatbot />

            {/* Hero Section with Background */}
            <section
                className="relative w-full h-screen bg-cover bg-center"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            >
                <Hero
                    searchTerm={searchTerm}
                    handleSearchTermChange={handleSearchTermChange}
                    selectedType={selectedType}
                    handleTypeChange={handleTypeChange}
                    onSearch={() => fetchProperties(searchTerm, selectedType)}
                />
            </section>

            {/* About Us MJVI Section - Minimalist */}
            <section className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            About MJVI Realty
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            MJVI Realty is a professional real estate agency and brokerage founded by Ms. Maria Jasmin V. Inciong. Our mission is to ensure fair pricing and legitimacy in real estate transactions, working with some of the largest and most well-known developments in Nasugbu, Batangas.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <div className="text-center">
                            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-emerald-500 text-white mx-auto mb-4">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Fraud Prevention</h3>
                            <p className="text-gray-600">
                                We protect you from real estate scams, fraudulent documents, and hidden charges through rigorous verification.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-emerald-500 text-white mx-auto mb-4">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">BIR Registered</h3>
                            <p className="text-gray-600">
                                We hold complete BIR registration, ensuring our business operates legally and transparently.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-emerald-500 text-white mx-auto mb-4">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Trusted Partnerships</h3>
                            <p className="text-gray-600">
                                We work with major developers including AINA's Home, Sta. Lucia Homes, and handle smaller properties.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose MJVI Realty & Our Services */}
            <section className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Why Choose MJVI Realty?
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Founded by Ms. Maria Jasmin V. Inciong, we provide professional real estate services with fair pricing and legitimacy in every transaction.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Item 1 */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-emerald-500 flex items-center justify-center">
                                    <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Legitimate & BIR Registered</h3>
                                    <p className="text-gray-600">
                                        We operate legally with complete BIR registration and 20+ registered agents, ensuring secure transactions.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Item 2 */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-emerald-500 flex items-center justify-center">
                                    <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Clean Documents Guaranteed</h3>
                                    <p className="text-gray-600">
                                        We verify all property documents to prevent fraud, hidden charges, and ownership disputes.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Item 3 */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-emerald-500 flex items-center justify-center">
                                    <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Major Development Partners</h3>
                                    <p className="text-gray-600">
                                        Direct access to AINA's Home, Sta. Lucia Homes, and trusted developers in Nasugbu, Batangas.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Item 4 */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-emerald-500 flex items-center justify-center">
                                    <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Fair & Transparent Pricing</h3>
                                    <p className="text-gray-600">
                                        Our core mission is to ensure fair pricing with no hidden costs or surprises.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Item 5 */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-emerald-500 flex items-center justify-center">
                                    <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Property Listings</h3>
                                    <p className="text-gray-600">
                                        Verified listings from major developments and smaller properties with complete details.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Item 6 */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-emerald-500 flex items-center justify-center">
                                    <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Due Diligence Process</h3>
                                    <p className="text-gray-600">
                                        Complete investigation and precautions between buyers and sellers before finalizing.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Item 7 */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-emerald-500 flex items-center justify-center">
                                    <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Agent Support</h3>
                                    <p className="text-gray-600">
                                        Connect with our 20+ registered agents for expert guidance throughout your journey.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Item 8 */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-emerald-500 flex items-center justify-center">
                                    <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Nasugbu, Batangas Focus</h3>
                                    <p className="text-gray-600">
                                        Local expertise in Nasugbu, Batangas real estate market and surrounding areas.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Property List Section */}
            <section className="bg-gray-50 py-8">
                <PropertyList
                    properties={properties}
                    favouriteIds={favouriteIds}
                />
            </section>

            {/* Footer Section */}
            <Footer />

        </main>
    );
}
