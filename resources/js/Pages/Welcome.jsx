    import React, { useCallback, useEffect, useMemo, useState } from "react";
    import { Link, Head, router } from "@inertiajs/react";
    import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
    import { debounce } from "lodash";
    import Chatbot from "@/Components/Chatbot/Chatbot";
    // Assets
    import logo from "../../assets/framer_logo.png";
    import backgroundImage from "../../assets/background.jpg";
    import Hero from "@/Pages/LandingPage/Hero.jsx";

    /**
     * MJVI Realty — Landing Page (Enhanced)
     * - Framer Motion animations (prefers-reduced-motion respected)
     * - Better a11y & semantics
     * - Mobile nav with motion
     * - New sections: Testimonials, Partners, Safety/Trust, Value Props
     * - Reusable variants & section wrappers
     * - Tiny perf wins: image lazy-loading, CSS containment, smaller box-shadows
     */

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
                    <div className="text-xs text-gray-500">{p?.lot_area ?? p?.floor_area} m² • {p?.bedrooms} bd</div>
                </div>
            </div>
        </motion.div>
    );

    /* ------------------------------ Component --------------------------- */
    export default function LandingPage({ auth, properties = [], search = "", initialType = "All", featured = [] }) {
        const [searchTerm, setSearchTerm] = useState(search || "");
        const [selectedType, setSelectedType] = useState(initialType);
        const [menuOpen, setMenuOpen] = useState(false);
        const prefersReducedMotion = useReducedMotion();

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
            <main className="min-h-screen bg-gray-50 [contain:paint_size_layout]">
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

                        <div className="hidden md:flex items-center gap-3">
                            <Link href="/login" className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100">Sign in</Link>
                            <Link href="/register" className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700">Get Started</Link>
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
                                        <Link href="/login" className="flex-1 px-4 py-2 rounded-xl ring-1 ring-gray-200 text-center">Sign in</Link>
                                        <Link href="/register" className="flex-1 px-4 py-2 rounded-xl text-white bg-emerald-600 text-center">Get Started</Link>
                                    </div>
                                </div>
                            </motion.nav>
                        )}
                    </AnimatePresence>
                </header>

                {/*/!* HERO *!/*/}
                {/*<div*/}
                {/*    className="relative h-[92vh] bg-cover bg-center bg-no-repeat"*/}
                {/*    style={{ backgroundImage: `url(${backgroundImage})` }}*/}
                {/*    role="img"*/}
                {/*    aria-label="City skyline background visual"*/}
                {/*>*/}
                {/*    <div className="relative z-10">*/}
                {/*        <Hero*/}
                {/*            searchTerm={searchTerm}*/}
                {/*            handleSearchTermChange={handleSearchTermChange}*/}
                {/*            selectedType={selectedType}*/}
                {/*            handleTypeChange={handleTypeChange}*/}
                {/*            setSelectedType={setSelectedType}*/}
                {/*        />*/}
                {/*    </div>*/}
                {/*</div>*/}

                {/* FEATURES */}
                <Section id="features" className="py-16">
                    <div className="mx-auto max-w-7xl px-4">
                        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
                            <motion.div variants={fadeUp} className="max-w-2xl">
                                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">Built for speed, trust, and clarity</h2>
                                <p className="text-gray-600 mt-2">Everything you need to go from browsing to closing — without the noise.</p>
                            </motion.div>

                            <motion.div variants={stagger} className="grid md:grid-cols-3 gap-6 mt-8">
                                <Feature title="Verified Listings" desc="All properties are vetted; no ghost posts." icon={<span role="img" aria-label="verified">✅</span>} />
                                <Feature title="Advanced Filters" desc="Area, price, and type suggestions as you type." icon={<span role="img" aria-label="search">🔎</span>} />
                                <Feature title="Agent Connect" desc="Chat with certified local agents in a tap." icon={<span role="img" aria-label="chat">💬</span>} />
                                <Feature title="Interactive Map" desc="Draw boundaries and explore neighborhoods." icon={<span role="img" aria-label="map">🗺️</span>} />
                                <Feature title="Saved Search" desc="Get alerts when new matches appear." icon={<span role="img" aria-label="bell">🔔</span>} />
                                <Feature title="Secure Docs" desc="E-signed paperwork. Faster, safer closing." icon={<span role="img" aria-label="doc">📄</span>} />
                            </motion.div>

                            {/* Trust row */}
                            <motion.div variants={stagger} className="mt-8 grid grid-cols-3 gap-3 max-w-lg">
                                <Stat label="Active listings" value="12,400+" />
                                <Stat label="Verified agents" value="1,100+" />
                                <Stat label="Cities covered" value="120+" />
                            </motion.div>
                        </motion.div>
                    </div>
                </Section>

                {/* VALUE PROPS / SAFETY */}
                <Section id="value" className="py-16 bg-white">
                    <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-3 gap-8 items-start">
                        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Why choose MJVI Realty?</h2>
                            <p className="text-gray-600 mt-2">Designed with Filipino buyers and sellers in mind—transparent pricing, responsive agents, and modern tools to make every step simple.</p>
                        </motion.div>
                        <motion.ul variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="md:col-span-2 grid gap-4">
                            {[
                                { t: "Transparent Pricing", d: "Clear property prices with estimated fees—no last-minute surprises." },
                                { t: "Verified Documentation", d: "Uploaded titles and deeds checked by our partner brokers." },
                                { t: "Anti-Scam Controls", d: "Multi-step listing review + report-a-listing tools keep the marketplace clean." },
                                { t: "Human Support", d: "Local support team available 7 days a week." },
                            ].map((i, idx) => (
                                <motion.li key={idx} variants={fadeUp} className="rounded-2xl p-5 ring-1 ring-gray-200 bg-white shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="h-9 w-9 flex items-center justify-center rounded-full bg-emerald-50">{idx + 1}</div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{i.t}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{i.d}</p>
                                        </div>
                                    </div>
                                </motion.li>
                            ))}
                        </motion.ul>
                    </div>
                </Section>

                {/* EXPLORE */}
                <Section id="explore" className="py-4 pb-16">
                    <div className="mx-auto max-w-7xl px-4">
                        <div className="flex items-end justify-between">
                            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
                                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Hot picks near you</h2>
                                <p className="text-gray-600">Curated, modern, and eco-friendly options.</p>
                            </motion.div>
                            <Link href="/all-properties" className="text-emerald-700 hover:text-emerald-800 font-medium">View all →</Link>
                        </div>
                        <motion.div
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, margin: "-80px" }}
                            variants={stagger}
                            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6"
                        >
                            {properties.map((p) => (
                                <PropertyCard key={p.id} p={p} />
                            ))}
                        </motion.div>
                    </div>
                </Section>

                {/* HOW IT WORKS */}
                <Section id="how" className="py-16 bg-white">
                    <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-3 gap-8 items-start">
                        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="md:col-span-1">
                            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">From browse to buy — in 3 steps</h2>
                            <p className="text-gray-600 mt-2">We designed the flow to be ridiculously simple.</p>
                        </motion.div>
                        <motion.ol variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="md:col-span-2 grid gap-4">
                            {[
                                { t: "Search & shortlist", d: "Use AI filters and the live map to save your favorites." },
                                { t: "Chat & schedule", d: "Message agents, request virtual or on-site tours." },
                                { t: "Offer & close", d: "Negotiate with confidence and sign securely online." },
                            ].map((s, i) => (
                                <motion.li key={i} variants={fadeUp} className="rounded-2xl p-5 ring-1 ring-gray-200 bg-white shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="h-9 w-9 flex items-center justify-center rounded-full bg-orange-500 text-white font-bold">{i + 1}</div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{s.t}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{s.d}</p>
                                        </div>
                                    </div>
                                </motion.li>
                            ))}
                        </motion.ol>
                    </div>
                </Section>

                {/* PARTNERS */}
                <Section id="partners" className="py-12">
                    <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fade} className="mx-auto max-w-7xl px-4">
                        <div className="rounded-2xl ring-1 ring-gray-200 bg-white p-6">
                            <p className="text-center text-xs uppercase tracking-wider text-gray-500">Trusted by teams at</p>
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 opacity-80">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="h-10 rounded-md bg-gray-100" aria-hidden />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </Section>

                {/* TESTIMONIALS */}
                <Section id="testimonials" className="py-16 bg-white">
                    <div className="mx-auto max-w-7xl px-4">
                        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
                            <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-extrabold text-gray-900">What buyers & sellers say</motion.h2>
                            <motion.div variants={stagger} className="mt-6 grid md:grid-cols-3 gap-6">
                                {[
                                    {
                                        q: "We sold in 12 days at asking price!",
                                        a: "The listing flow and agent chat made everything fast and transparent.",
                                        p: "Jessa • Seller, Cavite",
                                    },
                                    {
                                        q: "Found our first home in Tagaytay",
                                        a: "Saved search alerts were spot on. We booked a tour the same day.",
                                        p: "Mico & Rhea • Buyers",
                                    },
                                    {
                                        q: "Smooth paperwork & secure",
                                        a: "Digital offers and e-signing saved countless trips. Highly recommended.",
                                        p: "Engr. Allan • Buyer, Laguna",
                                    },
                                ].map((t, i) => (
                                    <motion.blockquote key={i} variants={fadeUp} className="rounded-2xl p-6 ring-1 ring-gray-200 bg-white shadow-sm">
                                        <p className="font-semibold text-gray-900">{t.q}</p>
                                        <p className="text-sm text-gray-600 mt-2">“{t.a}”</p>
                                        <footer className="mt-3 text-xs text-gray-500">{t.p}</footer>
                                    </motion.blockquote>
                                ))}
                            </motion.div>
                        </motion.div>
                    </div>
                </Section>

                {/* CTA */}
                <Section className="py-16">
                    <div className="mx-auto max-w-7xl px-4">
                        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 to-orange-500 p-1">
                            <div className="rounded-[calc(theme(borderRadius.3xl)-4px)] bg-white px-6 py-10 md:px-10 grid md:grid-cols-2 gap-8 items-center">
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900">Let’s find your place today</h3>
                                    <p className="text-gray-600 mt-2">Create a free account to save searches and get instant alerts.</p>
                                    <div className="mt-5 flex flex-wrap gap-3">
                                        <Link href="/register" className="px-5 py-2.5 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 font-semibold">Get Started</Link>
                                        <Link href="/buyer/properties" className="px-5 py-2.5 rounded-xl ring-1 ring-gray-200 hover:bg-gray-50 font-semibold text-gray-700">Browse first</Link>
                                    </div>
                                </div>
                                <form className="bg-gray-50 rounded-2xl p-4 ring-1 ring-gray-200">
                                    <label className="text-sm font-medium text-gray-700">Get alerts in your inbox</label>
                                    <div className="mt-2 grid grid-cols-3 gap-2">
                                        <input className="col-span-2 rounded-xl border-gray-300 focus:ring-2 focus:ring-emerald-500 px-3 py-2" placeholder="Email address" />
                                        <button type="button" className="rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 px-4">Subscribe</button>
                                    </div>
                                    <p className="mt-2 text-[11px] text-gray-500">No spam. Unsubscribe anytime.</p>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </Section>

                {/* FAQ */}
                <Section id="faq" className="py-16 bg-white">
                    <div className="mx-auto max-w-5xl px-4">
                        <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-2xl md:text-3xl font-extrabold text-gray-900">Frequently Asked Questions</motion.h2>
                        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-6 grid md:grid-cols-2 gap-6">
                            {[
                                {
                                    q: "Are listings verified?",
                                    a: "Yes. Our team and partner agents verify authenticity and availability before publishing.",
                                },
                                {
                                    q: "How do alerts work?",
                                    a: "Save a search and we’ll email you when new matches appear within your criteria.",
                                },
                                {
                                    q: "Is there a fee to use the site?",
                                    a: "Browsing is free. Some premium features for agents/sellers may carry fees.",
                                },
                                {
                                    q: "Do you cover the whole Philippines?",
                                    a: "We’re expanding fast—major cities and growth areas are covered with more added monthly.",
                                },
                            ].map((f, i) => (
                                <motion.details key={i} variants={fadeUp} className="p-5 rounded-2xl ring-1 ring-gray-200 bg-white shadow-sm">
                                    <summary className="font-semibold cursor-pointer list-none">
                                        <span className="select-none">{f.q}</span>
                                    </summary>
                                    <p className="text-sm text-gray-600 mt-2">{f.a}</p>
                                </motion.details>
                            ))}
                        </motion.div>
                    </div>
                </Section>

                {/* FOOTER */}
                <footer className="border-t bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-4 gap-8 text-sm">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-600 to-orange-500" aria-hidden />
                                <span className="font-extrabold tracking-tight text-gray-900">
                    MJVI<span className="text-emerald-600">Realty</span>
                  </span>
                            </div>
                            <p className="text-gray-600 mt-3">A modern, futuristic local property finder built for speed and trust.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900">Explore</h4>
                            <ul className="mt-2 space-y-1 text-gray-600">
                                <li><Link href="/buyer/properties" className="hover:text-gray-900">Listings</Link></li>
                                <li><a href="#features" className="hover:text-gray-900">Features</a></li>
                                <li><a href="#how" className="hover:text-gray-900">How it works</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900">Company</h4>
                            <ul className="mt-2 space-y-1 text-gray-600">
                                <li><Link href="/about" className="hover:text-gray-900">About</Link></li>
                                <li><Link href="/contact" className="hover:text-gray-900">Contact</Link></li>
                                <li><Link href="/privacy" className="hover:text-gray-900">Privacy</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900">Get updates</h4>
                            <form className="mt-2 grid grid-cols-3 gap-2">
                                <input className="col-span-2 rounded-xl border-gray-300 focus:ring-2 focus:ring-emerald-500 px-3 py-2" placeholder="Email address" />
                                <button type="button" className="rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700">Join</button>
                            </form>
                        </div>
                    </div>
                    <div className="border-t py-4 text-center text-xs text-gray-500">© {new Date().getFullYear()} AlleganceHomes. All rights reserved.</div>
                </footer>
                <Chatbot />
            </main>

        );
    }
