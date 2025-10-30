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
// Icons
import { CheckCircleIcon, MapPinIcon, BuildingOffice2Icon, CurrencyDollarIcon, EnvelopeIcon, UserGroupIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/solid";

/**
 * MJVI Realty — Landing Page
 */

/* ---------------- Dashboard Role Routing ---------------- */
const DASHBOARD_ROUTES = {
    agent: "/agents/dashboard",
    broker: "/broker/dashboard",
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
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const logoFade = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};
const logoStagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

/* ------------------------------ Small UI ----------------------------- */
const ValueCard = ({ title, description, icon }) => (
    <motion.div variants={fadeUp} className="group p-6 bg-white rounded-xl shadow-lg ring-1 ring-gray-100 transition hover:shadow-xl hover:-translate-y-0.5">
        <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 ring-4 ring-emerald-500/20">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-md text-gray-600">{description}</p>
    </motion.div>
);

const PropertyCard = ({ p }) => (
    <motion.div
        variants={fadeUp}
        className="rounded-xl overflow-hidden ring-1 ring-gray-100 bg-white shadow-lg hover:shadow-xl transition hover:-translate-y-0.5"
    >
        <div className="relative">
            <img
                src={`/storage/${p.image_url}`}
                alt={p.title}
                className="h-56 w-full object-cover"
                loading="lazy"
                decoding="async"
            />
            {p?.badge && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-emerald-700 ring-1 ring-emerald-200">
                    {p.badge}
                </span>
            )}
        </div>
        <div className="p-4 sm:p-5">
            <h4 className="text-lg font-bold text-gray-900 line-clamp-1">{p.title}</h4>
            <p className="text-sm text-gray-500 line-clamp-1 mt-1">{p.location}</p>
            <div className="mt-4 border-t border-gray-100 pt-3 flex items-center justify-between">
                <div className="text-2xl text-emerald-600 font-extrabold">{peso(p?.price)}</div>
                <div className="text-sm text-gray-500">
                    <span className="font-medium text-gray-700">{p?.lot_area ?? p?.floor_area} m²</span> • {p?.bedrooms} bd
                </div>
            </div>
        </div>
    </motion.div>
);

const DeveloperLogo = ({ src, alt }) => (
    <motion.div variants={logoFade} className="p-4 bg-white rounded-xl shadow-sm ring-1 ring-gray-100 flex items-center justify-center h-20 sm:h-24 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition duration-300">
        <img src={src} alt={alt} className="max-h-16 w-auto object-contain" />
    </motion.div>
);

// New Component: Agent Card (Placeholder)
const AgentCard = ({ name, role, imageUrl }) => (
    <motion.div variants={fadeUp} className="text-center p-6 bg-white rounded-xl shadow-lg ring-1 ring-gray-100 transition hover:shadow-xl hover:-translate-y-0.5">
        <img
            src={imageUrl}
            alt={name}
            className="w-24 h-24 object-cover rounded-full mx-auto mb-4 border-4 border-emerald-100"
            loading="lazy"
        />
        <h4 className="text-lg font-bold text-gray-900">{name}</h4>
        <p className="text-sm text-emerald-600 font-medium">{role}</p>
        <Link href={`/agents/${name.toLowerCase().replace(/\s/g, '-')}`} className="mt-3 inline-block text-sm font-medium text-gray-500 hover:text-emerald-600 transition">View Profile</Link>
    </motion.div>
);

// New Component: FAQ Accordion Item (Styling assumes a dedicated component structure)
const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-200 py-6">
            <button
                className="flex justify-between items-center w-full text-left"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <span className="text-lg font-semibold text-gray-900">{question}</span>
                <span className="text-emerald-500">
                    {isOpen ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    )}
                </span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 overflow-hidden"
                    >
                        <p className="text-gray-600 leading-relaxed">{answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};




/* ------------------------------ Component --------------------------- */
export default function LandingPage({ auth, properties = [], search = "", initialType = "All", favouriteIds = [], developers = [], projects = [] }) {
    const [searchTerm, setSearchTerm] = useState(search || "");
    const [selectedType, setSelectedType] = useState(initialType);
    const [menuOpen, setMenuOpen] = useState(false);

    // Dummy data for new sections
    const PARTNER_LOGOS = [
        { id: 1, src: "https://via.placeholder.com/150x50?text=Sta.+Lucia", alt: "Sta. Lucia" },
        { id: 2, src: "https://via.placeholder.com/150x50?text=AINA%27s+Home", alt: "AINA's Home" },
        { id: 3, src: "https://via.placeholder.com/150x50?text=Ayala+Land", alt: "Ayala Land" },
        { id: 4, src: "https://via.placeholder.com/150x50?text=SMDC", alt: "SMDC" },
    ];

    const TEAM_MEMBERS = [
        { id: 1, name: "Maria Inciong", role: "Founding Broker", imageUrl: "https://via.placeholder.com/100/34D399/FFFFFF?text=MI" },
        { id: 2, name: "Agent Chris", role: "Accredited Agent", imageUrl: "https://via.placeholder.com/100/10B981/FFFFFF?text=CA" },
        { id: 3, name: "Broker Riza", role: "Licensed Broker", imageUrl: "https://via.placeholder.com/100/059669/FFFFFF?text=RB" },
        { id: 4, name: "Agent Mark", role: "Accredited Agent", imageUrl: "https://via.placeholder.com/100/6EE7B7/FFFFFF?text=MA" },
    ];

    const FAQ_DATA = [
        { question: "What areas do you specialize in?", answer: "We primarily specialize in properties, lots, and developments in Nasugbu, Batangas, and the immediate surrounding areas. Our local expertise ensures you get the best market insights." },
        { question: "How do you ensure property legitimacy?", answer: "MJVI Realty conducts rigorous due diligence, verifying all titles, tax declarations, and ownership documents directly with the developers or local government units to prevent fraud." },
        { question: "Are your prices non-negotiable?", answer: "Our goal is fair and transparent pricing. Prices for developer-owned properties are set, but for secondary market listings, we facilitate negotiations fairly between the buyer and seller." },
        { question: "How can I become an agent for MJVI Realty?", answer: "We welcome licensed and aspiring agents! Please visit our 'Careers' page or contact our office directly to learn about accreditation and training requirements." },
    ];

    useEffect(() => {
        if (search) setSearchTerm(search);
    }, [search]);

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

    const toggleMenu = () => setMenuOpen((v) => !v);

    const transformProjectToProperty = (project) => {
        // We assume the first inventory_pool/house_type is representative for the listing
        const representativePool = project.inventory_pools[0];
        const houseType = representativePool?.house_type;

        // Fallback values
        const basePrice = houseType?.base_price ?? "0.00";
        const bedrooms = houseType?.bed_room ?? 0;
        const lotArea = houseType?.lot_area_sqm ?? "0.00";

        // Calculate total available units (simple sum for quick display)
        const availableUnits = project.inventory_pools.reduce((sum, pool) => sum + (pool.total - pool.sold - pool.reserved - pool.held), 0);

        return {
            id: `project-${project.id}`,
            title: project.name,
            location: project.address,
            // The display price is the base price from the house_type
            price: basePrice,
            bedrooms: bedrooms,
            // Using lot area as the main size display
            lot_area: lotArea,
            floor_area: houseType?.floor_area_sqm ?? "0.00",
            // Placeholder image - replace with logic to get a project-level image
            image_url: 'placeholder/default_project_image.jpg',
            badge: availableUnits > 0 ? `${availableUnits} Units Available` : 'Fully Reserved',
            project_data: project,
        };
    };

    const featuredProjects = useMemo(() => {
        return projects.map(transformProjectToProperty);
    }, [projects]);

    /* ------------------------------ Render ------------------------------ */
    return (
        <main className="min-h-screen bg-gray-50">
            <Head title="MJVI Realty — Find lots & homes fast" />

            {/* NAV */}
            <header className="sticky top-0 z-40 supports-[backdrop-filter]:bg-white/70 bg-white shadow-md backdrop-blur">
                <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2" aria-label="Go to home">
                        <img src={logo} alt="MJVI Realty" className="w-8 h-8 -ml-1.5 drop-shadow-md" />
                        <span className="font-extrabold tracking-tight text-gray-900">
                            MJVI<span className="text-emerald-600">Realty</span>
                        </span>
                    </Link>

                    {/* Desktop nav - Updated for new sections */}
                    <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600 font-medium" aria-label="Primary">
                        <a href="#explore" className="hover:text-emerald-600 transition">Explore</a>
                        <a href="#commitment" className="hover:text-emerald-600 transition">Why Choose Us</a>
                        <a href="#team" className="hover:text-emerald-600 transition">Our Team</a>
                        <a href="#partners" className="hover:text-emerald-600 transition">Developers</a>
                        <a href="#faq" className="hover:text-emerald-600 transition">FAQ</a>
                    </nav>

                    {/* Right CTAs */}
                    <div className="hidden md:flex items-center gap-3">
                        {auth?.user ? (
                            <Link
                                href={getDashboardPath(auth.user)}
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition">Sign in</Link>
                                <Link href="/register" className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md">Get Started</Link>
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

                {/* Mobile panel (simplified for brevity) */}
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
                                <a href="#explore" onClick={() => setMenuOpen(false)} className="py-2">Explore</a>
                                <a href="#commitment" onClick={() => setMenuOpen(false)} className="py-2">Why Choose Us</a>
                                <a href="#team" className="py-2" onClick={() => setMenuOpen(false)}>Our Team</a>
                                <a href="#partners" onClick={() => setMenuOpen(false)} className="py-2">Developers</a>
                                <a href="#faq" onClick={() => setMenuOpen(false)} className="py-2">FAQ</a>
                                <div className="pt-2 flex gap-2">
                                    {/* Auth links for mobile */}
                                </div>
                            </div>
                        </motion.nav>
                    )}
                </AnimatePresence>
            </header>

            <Chatbot />

            {/* 1. Hero Section */}
            <section
                className="relative w-full min-h-[80vh] flex items-center justify-center py-24 md:py-32 bg-cover bg-center"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            >
                <div className="absolute inset-0 bg-black/50 backdrop-brightness-75" aria-hidden="true"></div>
                <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center">
                    <Hero
                        searchTerm={searchTerm}
                        handleSearchTermChange={handleSearchTermChange}
                        selectedType={selectedType}
                        handleTypeChange={handleTypeChange}
                        onSearch={() => fetchProperties(searchTerm, selectedType)}
                    />
                </div>
            </section>

            {/* 2. Property List Section */}
            <section className="bg-gray-50 py-16 sm:py-24" id="explore">
                <PropertyList
                    properties={properties}
                    favouriteIds={favouriteIds}
                    PropertyCardComponent={PropertyCard}
                />
            </section>

            {featuredProjects.length > 0 && (
                <section className="bg-white py-20 sm:py-28" id="developer-projects">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-2">
                                New Opportunities
                            </h2>
                            <p className="mt-2 text-4xl md:text-5xl font-extrabold text-gray-900">
                                Featured Projects & Developments
                            </p>
                            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                                Explore brand-new condominium and subdivision offerings from our trusted developer partners.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            <motion.div
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, amount: 0.1 }}
                                variants={logoStagger}
                            >
                                {/* Re-use the elegant PropertyCard component for projects */}
                                {featuredProjects.map(p => (
                                    <PropertyCard key={p.id} p={p} />
                                ))}
                            </motion.div>
                        </div>

                        <div className="mt-12 text-center">
                            <Link
                                href="/explore/projects"
                                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 transition"
                            >
                                View All Projects
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* 3. Our Commitment Section (Why Choose Us) */}
            <section className="bg-white py-20 sm:py-28" id="commitment">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-2">
                            The MJVI Difference
                        </h2>
                        <p className="mt-2 text-4xl md:text-5xl font-extrabold text-gray-900">
                            Why Choose MJVI Realty?
                        </p>
                        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                            MJVI Realty ensures every transaction is built on **trust, legality, and fair pricing**. We are your professional real estate partners in Nasugbu, Batangas.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <ValueCard
                            title="Legitimate & Verified"
                            description="We are BIR registered with 20+ professional agents. All documents are meticulously verified to prevent fraud."
                            icon={<CheckCircleIcon className="h-6 w-6 text-emerald-600" />}
                        />
                        <ValueCard
                            title="Transparent Pricing"
                            description="Our core mission is to guarantee fair pricing with zero hidden charges or unexpected costs, ensuring peace of mind."
                            icon={<CurrencyDollarIcon className="h-6 w-6 text-emerald-600" />}
                        />
                        <ValueCard
                            title="Local Market Expertise"
                            description="Specialized focus on Nasugbu, Batangas, providing you with in-depth local knowledge and exclusive market insights."
                            icon={<MapPinIcon className="h-6 w-6 text-emerald-600" />}
                        />
                        <ValueCard
                            title="Major Developer Access"
                            description="Direct access to trusted developers including AINA's Home and Sta. Lucia Homes for prime listings."
                            icon={<BuildingOffice2Icon className="h-6 w-6 text-emerald-600" />}
                        />
                    </div>
                </div>
            </section>

            {/* 4. Meet Our Team (Broker/Agent List) */}
            <section className="bg-gray-50 py-20 sm:py-28" id="team">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <UserGroupIcon className="w-10 h-10 text-emerald-600 mx-auto mb-4" />
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
                            Meet Our Accredited Team
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Connect with our licensed brokers and dedicated accredited agents who will guide your real estate journey.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {TEAM_MEMBERS.map((member) => (
                            <AgentCard key={member.id} name={member.name} role={member.role} imageUrl={member.imageUrl} />
                        ))}
                    </div>
                    <div className="mt-12 text-center">
                        <Link
                            href="/team"
                            className="inline-flex items-center justify-center px-6 py-3 border border-emerald-600 text-base font-medium rounded-xl text-emerald-600 hover:bg-emerald-50 transition"
                        >
                            View All 20+ Agents
                        </Link>
                    </div>
                </div>
            </section>

            {/* 5. Featured Developers/Partners Section */}
            <section className="bg-white py-16 sm:py-24" id="partners">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-600 mb-6">
                        Trusted by the Biggest Names in Philippine Real Estate
                    </h2>

                    <motion.div
                        variants={logoStagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.1 }}
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
                    >
                        {PARTNER_LOGOS.map((logo) => (
                            <DeveloperLogo key={logo.id} src={logo.src} alt={logo.alt} />
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* 6. Frequently Asked Questions (FAQ) */}
            <section className="bg-gray-50 py-20 sm:py-28" id="faq">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <QuestionMarkCircleIcon className="w-10 h-10 text-emerald-600 mx-auto mb-4" />
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
                            Questions? We Have Answers.
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Find quick information about our services, properties, and the buying process.
                        </p>
                    </div>

                    <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
                        {FAQ_DATA.map((item, index) => (
                            <FAQItem
                                key={index}
                                question={item.question}
                                answer={item.answer}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. Final Call-to-Action Banner */}
            <section className="bg-emerald-600 py-20 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                        Ready to Find Your Dream Property?
                    </h2>
                    <p className="text-xl text-emerald-100 max-w-3xl mx-auto mb-8">
                        Our expert agents are here to guide you through every step of the process in Nasugbu, Batangas.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            href="/all-properties"
                            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-xl shadow-lg text-emerald-700 bg-white hover:bg-emerald-50 transition transform hover:scale-[1.02]"
                        >
                            Start Searching Now
                        </Link>
                        <Link
                            href="/contact-us"
                            className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-base font-semibold rounded-xl shadow-lg text-white hover:bg-white/10 transition transform hover:scale-[1.02]"
                        >
                            <EnvelopeIcon className="h-5 w-5 mr-2" />
                            Contact an Agent
                        </Link>
                    </div>
                </div>
            </section>


            {/* Footer Section (Final Element) */}
            <Footer id="footer" />

        </main>
    );
}
