import React, { useState } from "react";
import { Link, Head } from "@inertiajs/react";
import framer_logo from "../../assets/framer_logo.png";
import map from "../../assets/map.png";

// Primary: green, Secondary: orange
// Uses Tailwind utility classes; swap to your project's theme tokens if you already have .text-primary/.bg-secondary.

const Section = ({ id, children, className = "" }) => (
    <section id={id} className={`relative w-full ${className}`}>{children}</section>
);

const Stat = ({ label, value }) => (
    <div className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-white/50 shadow-sm p-4 text-center">
        <div className="text-3xl font-extrabold text-emerald-600">{value}</div>
        <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">{label}</div>
    </div>
);

const Feature = ({ title, desc, icon }) => (
    <div className="group rounded-2xl p-6 ring-1 ring-gray-200 bg-white shadow-sm hover:shadow-md transition hover:-translate-y-0.5">
        <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100">
            {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{desc}</p>
    </div>
);

const PropertyCard = ({ p }) => (
    <div className="rounded-2xl overflow-hidden ring-1 ring-gray-200 bg-white shadow-sm hover:shadow-md transition hover:-translate-y-0.5">
        <div className="relative">
            <img src={p.image} alt={p.title} className="h-52 w-full object-cover" />
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-emerald-700 ring-1 ring-emerald-200">{p.badge}</span>
        </div>
        <div className="p-4">
            <h4 className="font-semibold text-gray-900 line-clamp-1">{p.title}</h4>
            <p className="text-sm text-gray-500 line-clamp-1">{p.location}</p>
            <div className="mt-3 flex items-center justify-between">
                <div className="text-emerald-600 font-bold">₱{p.price.toLocaleString()}</div>
                <div className="text-xs text-gray-500">{p.size} m² • {p.beds} bd</div>
            </div>
        </div>
    </div>
);

export default function LandingPage() {
    const [q, setQ] = useState({ where: "", type: "Any", min: "", max: "" });
    const properties = [
        { id: 1, title: "Modern Eco Home", location: "Tagaytay, Cavite", price: 5200000, size: 180, beds: 3, badge: "Featured", image: "/images/sample/prop1.jpg" },
        { id: 2, title: "Smart Condo Loft", location: "BGC, Taguig", price: 7800000, size: 65, beds: 2, badge: "Near MRT", image: "/images/sample/prop2.jpg" },
        { id: 3, title: "Suburban Haven", location: "Santa Rosa, Laguna", price: 3900000, size: 150, beds: 3, badge: "Hot", image: "/images/sample/prop3.jpg" },
        { id: 4, title: "Beachside Lot", location: "Nasugbu, Batangas", price: 2500000, size: 220, beds: 0, badge: "Lot", image: "/images/sample/prop4.jpg" },
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        // Replace with your Inertia route when backend is ready
        // router.get(route('properties.index'), q)
        alert(`Searching: ${q.where || 'Anywhere'} • ${q.type} • ₱${q.min || '0'} - ₱${q.max || 'Any'}`);
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <Head title="Local Property Finder — Find lots & homes fast" />

            {/* NAV */}
            <header className="sticky top-0 z-40 supports-[backdrop-filter]:bg-white/70 bg-white shadow/[0_1px_0_#e5e7eb] backdrop-blur">
                <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <img src={framer_logo} alt="logo" className="w-8 h-8 -ml-1.5 drop-shadow-md" />
                        <span className="font-extrabold tracking-tight text-gray-900">MJVI<span className="text-emerald-600">Realty</span></span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
                        <a href="#features" className="hover:text-gray-900">Features</a>
                        <a href="#explore" className="hover:text-gray-900">Explore</a>
                        <a href="#how" className="hover:text-gray-900">How it works</a>
                        <a href="#faq" className="hover:text-gray-900">FAQ</a>
                    </nav>
                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/login" className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100">Sign in</Link>
                        <Link href="/register" className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700">Get Started</Link>
                    </div>
                    <button className="md:hidden p-2 rounded-lg ring-1 ring-gray-200">☰</button>
                </div>
            </header>

            {/* HERO */}
            <Section id="hero" className="bg-gradient-to-br from-emerald-600 via-primary to-orange-500 text-white">
                <div className="mx-auto max-w-7xl px-4 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/30 px-3 py-1 text-xs mb-4">
                            <span className="h-2 w-2 rounded-full bg-orange-300"></span>
                            Modern • Futuristic • Local Listings
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight">
                            Find local lots & homes
                            <span className="block text-white/90">faster with <span className="text-white">AI-guided search</span>.</span>
                        </h1>
                        <p className="mt-4 text-white/90 max-w-xl">A sleek, modern property finder for the Philippines. Real-time listings, verified agents, and a lightning-fast search experience.</p>

                        {/* Search card */}
                        <form onSubmit={handleSearch} className="mt-8 rounded-2xl bg-white/95 backdrop-blur ring-1 ring-emerald-100 shadow-xl p-4">
                            <div className="grid md:grid-cols-4 gap-3">
                                <input
                                    className="col-span-2 rounded-xl border-gray-300 focus:ring-2 focus:ring-primary px-3 py-2"
                                    placeholder="Where to? (city, barangay)"
                                    value={q.where}
                                    onChange={(e)=>setQ({ ...q, where: e.target.value })}
                                />
                                <select
                                    className="rounded-xl border-gray-300 focus:ring-2 focus:ring-primary px-3 py-2"
                                    value={q.type}
                                    onChange={(e)=>setQ({ ...q, type: e.target.value })}
                                >
                                    <option>Any</option>
                                    <option>Lot</option>
                                    <option>House & Lot</option>
                                    <option>Condo</option>
                                </select>
                                <div className="grid grid-cols-2 gap-2">
                                    <input className="rounded-xl border-gray-300 focus:ring-2 focus:ring-primary px-3 py-2" placeholder="Min ₱" inputMode="numeric" value={q.min} onChange={(e)=>setQ({ ...q, min: e.target.value })}/>
                                    <input className="rounded-xl border-gray-300 focus:ring-2 focus:ring-primary px-3 py-2" placeholder="Max ₱" inputMode="numeric" value={q.max} onChange={(e)=>setQ({ ...q, max: e.target.value })}/>
                                </div>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700">
                                    🔎 Search
                                </button>
                                <span className="text-xs text-gray-600">Tip: Try “Nasugbu”, “BGC”, or “Santa Rosa”.</span>
                            </div>
                        </form>

                        {/* Trust row */}
                        <div className="mt-6 grid grid-cols-3 gap-3 max-w-lg">
                            <Stat label="Active listings" value="12,400+" />
                            <Stat label="Verified agents" value="1,100+" />
                            <Stat label="Cities covered" value="120+" />
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-6 bg-white/10 rounded-[2rem] blur-2xl"/>
                        <img src={map} alt="Map preview" className="relative rounded-3xl ring-1 ring-white/40 shadow-2xl" />
                    </div>
                </div>
            </Section>

            {/* FEATURES */}
            <Section id="features" className="py-16">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="max-w-2xl">
                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">Built for speed, trust, and clarity</h2>
                        <p className="text-gray-600 mt-2">Everything you need to go from browsing to closing — without the noise.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6 mt-8">
                        <Feature title="Verified Listings" desc="All properties are vetted; no ghost posts." icon={<span>✅</span>} />
                        <Feature
                            title="Advance Filters"
                            desc="Suggests areas, prices, and property types for you."
                            icon={<span>🔎</span>}
                        />
                        <Feature title="Agent Connect" desc="Chat with certified local agents in a tap." icon={<span>💬</span>} />
                        <Feature title="Interactive Map" desc="Explore property with an draw bounderies." icon={<span>🗺️</span>} />
                        <Feature title="Saved Search" desc="Get alerts when new matches appear in your feed." icon={<span>🔔</span>} />
                        <Feature title="Secure Docs" desc="Handle offers digitally with e-signed paperwork." icon={<span>📄</span>} />
                    </div>
                </div>
            </Section>

            {/* EXPLORE */}
            <Section id="explore" className="py-4 pb-16">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="flex items-end justify-between">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Hot picks near you</h2>
                            <p className="text-gray-600">Curated, modern, and eco-friendly options.</p>
                        </div>
                        <Link href="/all-properties" className="text-emerald-700 hover:text-emerald-800 font-medium">View all →</Link>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                        {properties.map((p) => <PropertyCard key={p.id} p={p} />)}
                    </div>
                </div>
            </Section>

            {/* HOW IT WORKS */}
            <Section id="how" className="py-16 bg-white">
                <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-1">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">From browse to buy — in 3 steps</h2>
                        <p className="text-gray-600 mt-2">We designed the flow to be ridiculously simple.</p>
                    </div>
                    <ol className="md:col-span-2 grid gap-4">
                        {[
                            { t: "Search & shortlist", d: "Use AI filters and the live map to save your favorites." },
                            { t: "Chat & schedule", d: "Message agents, request virtual or on-site tours." },
                            { t: "Offer & close", d: "Negotiate with confidence and sign securely online." },
                        ].map((s, i) => (
                            <li key={i} className="rounded-2xl p-5 ring-1 ring-gray-200 bg-white shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="h-9 w-9 flex items-center justify-center rounded-full bg-secondary text-white font-bold">{i+1}</div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{s.t}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{s.d}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </Section>

            {/* CTA */}
            <Section className="py-16">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 to-secondary p-1">
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
                                    <input className="col-span-2 rounded-xl border-gray-300 focus:ring-2 focus:ring-primary px-3 py-2" placeholder="Email address"/>
                                    <button className="rounded-xl bg-secondary text-white font-semibold hover:bg-orange-600">Subscribe</button>
                                </div>
                                <p className="mt-2 text-[11px] text-gray-500">No spam. Unsubscribe anytime.</p>
                            </form>
                        </div>
                    </div>
                </div>
            </Section>

            {/* FAQ */}
            <Section id="faq" className="py-16 bg-white">
                <div className="mx-auto max-w-5xl px-4">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Frequently Asked Questions</h2>
                    <div className="mt-6 grid md:grid-cols-2 gap-6">
                        {[{
                            q: "Are listings verified?",
                            a: "Yes. Our team and partner agents verify authenticity and availability before publishing."
                        },{
                            q: "How do alerts work?",
                            a: "Save a search and we’ll email you when new matches appear within your criteria."
                        },{
                            q: "Is there a fee to use the site?",
                            a: "Browsing is free. Some premium features for agents/sellers may carry fees."
                        },{
                            q: "Do you cover the whole Philippines?",
                            a: "We’re expanding fast—major cities and growth areas are covered with more added monthly."
                        }].map((f,i)=> (
                            <details key={i} className="p-5 rounded-2xl ring-1 ring-gray-200 bg-white shadow-sm">
                                <summary className="font-semibold cursor-pointer list-none">
                                    <span className="select-none">{f.q}</span>
                                </summary>
                                <p className="text-sm text-gray-600 mt-2">{f.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </Section>

            {/* FOOTER */}
            <footer className="border-t bg-white">
                <div className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-4 gap-8 text-sm">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary"></div>
                            <span className="font-extrabold tracking-tight text-gray-900">Allegance<span className="text-emerald-600">Homes</span></span>
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
                            <input className="col-span-2 rounded-xl border-gray-300 focus:ring-2 focus:ring-primary px-3 py-2" placeholder="Email address"/>
                            <button className="rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700">Join</button>
                        </form>
                    </div>
                </div>
                <div className="border-t py-4 text-center text-xs text-gray-500">© {new Date().getFullYear()} AlleganceHomes. All rights reserved.</div>
            </footer>
        </main>
    );
}
