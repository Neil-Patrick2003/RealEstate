// MJVI Realty — Luxe Green & Gold Landing (Refined v2)
// - Accessibility: semantic landmarks, skip link, aria labels
// - Mobile nav: accessible toggle, focus states
// - Performance: responsive images, preconnect, decoding, lazy; reduced DOM depth
// - Consistency: unified spacing, shadows, gradients; polished hover states
// - DX: fewer magic values; clear section components
// - SEO: basic meta + JSON-LD org markup

import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    Home,
    Building2,
    Landmark,
    ShieldCheck,
    CheckCircle2,
    PhoneCall,
    Timer,
    Star,
    Quote,
    MapPin,
    ArrowRight,
    Users,
    Award,
    Search,
    Mail, // fix: lucide uses Mail (not MailIcon)
    Menu,
    X,
} from 'lucide-react';

import Hero from '@/Pages/LandingPage/Hero.jsx';
import Chatbot from "@/Components/Chatbot/Chatbot.jsx";

/* ------------------------------ Theme & Layout Helpers ------------------------------ */
const PAGE_BG = 'bg-gradient-to-br from-gray-50 via-white to-gray-50';

const Section = ({ id, className = '', children, divider = true }) => (
    <section id={id} className={`relative w-full ${className}`}>
        {children}
        {divider && (
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent hidden lg:block" />
        )}
    </section>
);

const Container = ({ children, className = '' }) => (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);

/* ------------------------------ Navbar ------------------------------ */
const Navbar = () => {
    const [open, setOpen] = useState(false);
    const toggle = () => setOpen(v => !v);
    const close = () => setOpen(false);

    return (
        <header className="fixed inset-x-0 top-0 z-50 bg-white/98 backdrop-blur-xl border-b border-gray-100/50 shadow-lg shadow-emerald-500/10">
            <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:inset-x-0 focus:top-0 focus:m-4 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:shadow">
                Skip to content
            </a>
            <Container className="h-20 flex items-center justify-between">
                <a href="#top" className="flex items-center gap-3 text-emerald-900" onClick={close}>
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 ring-2 ring-emerald-200/50 flex items-center justify-center transition-all duration-200">
                        <Home className="h-6 w-6 text-emerald-700" strokeWidth={2.5} />
                    </div>
                    <span className="text-2xl font-black tracking-tight">MJVI Realty</span>
                </a>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-10 text-base font-semibold text-gray-700" aria-label="Primary">
                    {[
                        ['#features', 'Features'],
                        ['#how', 'Process'],
                        ['#listings', 'Listings'],
                        ['#testimonials', 'Reviews'],
                        ['#contact', 'Contact'],
                    ].map(([href, label]) => (
                        <a key={href} href={href} className="relative hover:text-emerald-700 transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-emerald-600 after:scale-x-0 after:origin-left after:transition-transform after:duration-200 hover:after:scale-x-100">
                            {label}
                        </a>
                    ))}
                    <a
                        href="#search"
                        className="inline-flex items-center rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 font-bold text-white hover:from-emerald-700 hover:to-emerald-800 shadow-xl shadow-emerald-500/25 transition-all duration-200 hover:shadow-emerald-600/40 hover:scale-105"
                    >
                        <MapPin className="mr-2 h-4 w-4" aria-hidden /> Find Properties
                    </a>
                </nav>

                {/* Mobile toggle */}
                <button
                    onClick={toggle}
                    className="md:hidden inline-flex items-center justify-center rounded-xl p-2 text-gray-700 hover:bg-gray-100"
                    aria-label="Toggle menu"
                    aria-expanded={open}
                >
                    {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </Container>

            {/* Mobile Drawer */}
            <div className={`md:hidden overflow-hidden transition-[max-height] duration-300 ${open ? 'max-h-96' : 'max-h-0'}`} aria-hidden={!open}>
                <Container className="pb-4">
                    <nav className="flex flex-col gap-2 text-base font-medium text-gray-700" aria-label="Mobile">
                        {[
                            ['#features', 'Features'],
                            ['#how', 'Process'],
                            ['#listings', 'Listings'],
                            ['#testimonials', 'Reviews'],
                            ['#contact', 'Contact'],
                        ].map(([href, label]) => (
                            <a key={href} href={href} onClick={close} className="rounded-lg px-3 py-2 hover:bg-gray-100">{label}</a>
                        ))}
                        <a
                            href="#search"
                            onClick={close}
                            className="mt-2 inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-700 shadow"
                        >
                            <MapPin className="mr-2 h-4 w-4" aria-hidden /> Find Properties
                        </a>
                    </nav>
                </Container>
            </div>
        </header>
    );
};

/* ------------------------------ Feature Card ------------------------------ */
const FeatureCard = ({ icon: Icon, title, desc }) => (
    <div className="group rounded-3xl border border-gray-100/50 bg-white/80 backdrop-blur-sm p-8 shadow-2xl shadow-gray-900/5 transition-all duration-300 hover:border-emerald-200/50 hover:bg-white hover:shadow-emerald-500/10 hover:scale-[1.02]">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 ring-2 ring-emerald-200/30 group-hover:from-emerald-100 group-hover:to-emerald-200 transition-colors duration-200">
            <Icon className="h-8 w-8 text-emerald-700" strokeWidth={2.5} aria-hidden />
        </div>
        <h3 className="mb-3 text-2xl font-black text-gray-900 group-hover:text-emerald-900 transition-colors duration-200">{title}</h3>
        <p className="text-base text-gray-600 leading-relaxed">{desc}</p>
    </div>
);

/* ------------------------------ Property Card ------------------------------ */
const PropertyCard = ({ image, title, tag, price, meta }) => (
    <article className="group overflow-hidden rounded-3xl border border-gray-100/50 bg-white/80 backdrop-blur-sm shadow-2xl shadow-gray-900/10 transition-all duration-300 hover:border-emerald-200/50 hover:shadow-emerald-500/20 hover:scale-[1.02]">
        <div className="relative aspect-[4/3] overflow-hidden">
            <img
                src={`${image}&auto=format&fit=crop`}
                srcSet={`${image}&w=640 640w, ${image}&w=960 960w, ${image}&w=1280 1280w, ${image}&w=1600 1600w`}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                alt={title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                decoding="async"
            />
            {tag && (
                <span className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xl shadow-emerald-500/40 backdrop-blur-sm">
          {tag}
        </span>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-6">
            <h4 className="line-clamp-2 text-xl font-black text-gray-900 mb-2 group-hover:text-emerald-900 transition-colors duration-200">{title}</h4>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">{meta}</p>
            <div className="flex items-center justify-between border-t border-gray-100/50 pt-4">
                <span className="text-2xl font-black text-emerald-700 tracking-tight">{price}</span>
                <a href="#contact" className="inline-flex items-center text-sm font-bold text-amber-600 hover:text-amber-700 transition-all duration-200 group-hover:translate-x-1">
                    Inquire <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
                </a>
            </div>
        </div>
    </article>
);

/* ------------------------------ Testimonial ------------------------------ */
const Testimonial = ({ quote, name, role, rating = 5 }) => (
    <figure className="group rounded-3xl border border-gray-100/50 bg-white/80 backdrop-blur-sm p-8 shadow-2xl shadow-gray-900/5 transition-all duration-300 hover:border-amber-200/50 hover:shadow-amber-500/10 hover:scale-[1.02]">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 ring-2 ring-amber-200/30 group-hover:from-amber-100 group-hover:to-amber-200 transition-colors duration-200">
            <Quote className="h-7 w-7 text-amber-700" strokeWidth={2} aria-hidden />
        </div>
        <blockquote className="text-xl italic text-gray-700 leading-relaxed mb-6">“{quote}”</blockquote>
        <figcaption>
            <div className="flex items-center gap-1 mb-4 text-amber-500" aria-label={`Rating: ${rating} out of 5`}>
                {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 stroke-amber-600" aria-hidden />
                ))}
            </div>
            <div className="text-base">
                <span className="font-black text-gray-900 group-hover:text-amber-900 transition-colors duration-200">{name}</span>
                <span className="text-gray-500"> · {role}</span>
            </div>
        </figcaption>
    </figure>
);

/* ------------------------------ Page ------------------------------ */
export default function LandingPage() {
    return (
        <>
            <Head title="Find Homes & Properties | MJVI Realty">
                <meta name="description" content="Search verified PH property listings with boundary-aware maps. Book trippings, compare details, and close confidently with licensed agents." />
                <link rel="preconnect" href="https://images.unsplash.com" />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Organization',
                        name: 'MJVI Realty',
                        url: 'https://mjvirealty.ph',
                        address: {
                            '@type': 'PostalAddress',
                            addressLocality: 'Metro Manila',
                            addressCountry: 'PH'
                        },
                        contactPoint: [{ '@type': 'ContactPoint', telephone: '+639000000000', contactType: 'customer support' }]
                    }) }} />
            </Head>

            <div id="top" className={`${PAGE_BG} text-gray-900`}>
                <Navbar />

                {/* ------------------------------ HERO ------------------------------ */}
                <div
                    className="relative min-h-screen bg-cover bg-center pt-20"
                    style={{
                        backgroundImage: "url('https://www.shutterstock.com/image-photo/aerial-drone-bird-eye-view-260nw-2453933885.jpg')", // lush green aerial
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/70 via-emerald-800/60 to-black/80" aria-hidden />
                    $1
                    {/* Subtle boundary grid overlay to suggest lots/parcels */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.10] mix-blend-overlay"
                        style={{
                            backgroundImage:
                                'linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)',
                            backgroundSize: '56px 56px',
                        }}
                        aria-hidden
                    />

                    <Hero
                        onSearch={() => {
                            document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        selectedType="All"
                        handleTypeChange={() => {}}
                        searchTerm=""
                        handleSearchTermChange={() => {}}
                    />
                </div>

                {/* ------------------------------ FEATURES ------------------------------ */}
                <Section id="features" className="py-28 bg-white/80 backdrop-blur-sm">
                    <Container>
                        <div className="mx-auto max-w-4xl text-center">
                            <p className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-2">Why Choose MJVI</p>
                            <h2 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-6">Simple, Transparent, Trusted.</h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">Verified listings with boundary-aware maps and licensed guidance for seamless, confident purchases.</p>
                        </div>

                        <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                            <FeatureCard icon={Building2} title="Verified Listings" desc="Vetted for accuracy and availability with developers and brokers." />
                            <FeatureCard icon={Landmark} title="Boundary Mapping" desc="Village, subdivision, and barangay limits visible for context." />
                            <FeatureCard icon={ShieldCheck} title="Transparent Details" desc="Specs, fees, and requirements disclosed upfront—no surprises." />
                            <FeatureCard icon={Users} title="Licensed Support" desc="Agents assist trippings, offers, and closing with expertise." />
                        </div>
                    </Container>
                </Section>

                {/* ------------------------------ HOW IT WORKS ------------------------------ */}
                <Section id="how" className={`py-28 ${PAGE_BG}`}>
                    <Container>
                        <div className="mx-auto max-w-3xl text-center">
                            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">Your Seamless Journey</h2>
                            <p className="text-xl text-gray-600">From search to keys in hand—effortless and efficient.</p>
                        </div>

                        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
                            <div className="relative rounded-3xl border border-gray-100/50 bg-white/80 backdrop-blur-sm p-10 shadow-2xl shadow-gray-900/5 transition-all duration-300 hover:shadow-emerald-500/15 hover:scale-[1.02]">
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 h-12 w-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-black text-xl shadow-xl shadow-emerald-500/30">1</div>
                                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 ring-2 ring-emerald-200/30">
                                    <Search className="h-8 w-8 text-emerald-700" strokeWidth={2.5} aria-hidden />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-3">Search & Shortlist</h3>
                                <p className="text-base text-gray-600 leading-relaxed">Filter by location, type, budget, and amenities to find the right match.</p>
                            </div>

                            <div className="relative rounded-3xl border border-gray-100/50 bg-white/80 backdrop-blur-sm p-10 shadow-2xl shadow-gray-900/5 transition-all duration-300 hover:shadow-amber-500/15 hover:scale-[1.02]">
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 h-12 w-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 text-white font-black text-xl shadow-xl shadow-amber-500/30">2</div>
                                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 ring-2 ring-amber-200/30">
                                    <Timer className="h-8 w-8 text-amber-700" strokeWidth={2.5} aria-hidden />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-3">Schedule Viewing</h3>
                                <p className="text-base text-gray-600 leading-relaxed">Book site visits with maps, reminders, and a personalized checklist.</p>
                            </div>

                            <div className="relative rounded-3xl border border-gray-100/50 bg-white/80 backdrop-blur-sm p-10 shadow-2xl shadow-gray-900/5 transition-all duration-300 hover:shadow-emerald-500/15 hover:scale-[1.02]">
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 h-12 w-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-black text-xl shadow-xl shadow-emerald-500/30">3</div>
                                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 ring-2 ring-emerald-200/30">
                                    <Award className="h-8 w-8 text-emerald-700" strokeWidth={2.5} aria-hidden />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-3">Close Securely</h3>
                                <p className="text-base text-gray-600 leading-relaxed">Navigate offers, finances, and legalities with licensed support.</p>
                            </div>
                        </div>
                    </Container>
                </Section>

                {/* ------------------------------ FEATURED LISTINGS ------------------------------ */}
                <Section id="listings" className="py-28 bg-white/80 backdrop-blur-sm">
                    <Container>
                        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end mb-12">
                            <div className="max-w-2xl">
                                <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">Curated Properties</h2>
                                <p className="text-xl text-gray-600">Premium selections across NCR and CALABARZON—tailored for you.</p>
                            </div>
                            <a href="#top" className="inline-flex items-center rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-lg font-bold text-white hover:from-amber-600 hover:to-amber-700 shadow-xl shadow-amber-500/25 transition-all duration-200">
                                Explore All <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
                            </a>
                        </div>

                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            <PropertyCard image="https://images.unsplash.com/photo-1502005229762-cf1b2da7c8e2?q=80" title="Modern 2BR Condo in BGC" tag="Condo" price="₱12.5M" meta="2 Bed · 2 Bath · 68 sqm · BGC, Taguig" />
                            <PropertyCard image="https://images.unsplash.com/photo-1494526585095-c41746248156?q=80" title="Family House with Garden" tag="House & Lot" price="₱9.8M" meta="3 Bed · 2 Bath · 180 sqm lot · Imus, Cavite" />
                            <PropertyCard image="https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80" title="New Townhome Near EDSA" tag="Townhouse" price="₱6.2M" meta="3 Bed · 2.5 Bath · 95 sqm · Quezon City" />
                        </div>
                    </Container>
                </Section>

                {/* ------------------------------ TESTIMONIALS ------------------------------ */}
                <Section id="testimonials" className={`py-28 ${PAGE_BG}`}>
                    <Container>
                        <div className="mx-auto max-w-3xl text-center">
                            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">What Our Clients Say</h2>
                            <p className="text-xl text-gray-600">Real experiences from satisfied buyers and investors.</p>
                        </div>

                        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
                            <Testimonial quote="The entire process was seamless—from initial search to closing. Transparent fees and exceptional agent support made all the difference." name="Angela D." role="Homeowner, Cavite" />
                            <Testimonial quote="Boundary mapping feature was a game-changer for evaluating investment opportunities. Quick decisions, great results." name="Mark R." role="Investor, Quezon City" />
                            <Testimonial quote="As a first-time buyer, I felt supported every step. Easy bookings and clear documentation—highly recommend!" name="Jessa P." role="Buyer, Taguig" />
                        </div>
                    </Container>
                </Section>

                {/* ------------------------------ CTA ------------------------------ */}
                <Section id="search" className="py-28 bg-gradient-to-br from-emerald-50 via-amber-50 to-white" divider={false}>
                    <Container>
                        <div className="relative overflow-hidden rounded-3xl border border-gray-100/50 bg-white/80 backdrop-blur-sm p-12 md:p-20 shadow-2xl shadow-emerald-900/10">
                            <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-gradient-to-br from-amber-300/20 to-emerald-300/20 blur-3xl" aria-hidden />
                            <div className="absolute -left-32 -bottom-32 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-300/20 to-amber-300/20 blur-3xl" aria-hidden />

                            <div className="relative max-w-4xl mx-auto text-center">
                                <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Ready to Discover Your Dream Property?</h3>
                                <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">Begin your search by location or type, and connect with an expert for personalized guidance.</p>
                                <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                                    <a href="#top" className="inline-flex items-center rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-4 text-lg font-bold text-white hover:from-emerald-700 hover:to-emerald-800 shadow-xl shadow-emerald-500/25 transition-all duration-200">
                                        <MapPin className="mr-2 h-5 w-5" aria-hidden /> Search Now
                                    </a>
                                    <a href="#contact" className="inline-flex items-center rounded-2xl border-2 border-emerald-300 bg-white px-8 py-4 text-lg font-bold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-800 transition-all duration-200">
                                        Speak to an Agent
                                    </a>
                                </div>
                            </div>
                        </div>
                    </Container>
                </Section>

                {/* ------------------------------ CONTACT / FOOTER ------------------------------ */}
                <Section id="contact" className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100" divider={false}>
                    <Container>
                        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-20">
                            <div className="md:col-span-2">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 ring-2 ring-emerald-400/30 flex items-center justify-center">
                                        <Home className="h-6 w-6 text-emerald-300" strokeWidth={2.5} aria-hidden />
                                    </div>
                                    <span className="text-2xl font-black tracking-tight text-emerald-100">MJVI Realty</span>
                                </div>
                                <p className="text-gray-300 text-base leading-relaxed max-w-md">Elevating Philippine real estate with innovative tools, verified listings, and licensed expertise for your peace of mind.</p>
                            </div>

                            <div>
                                <h4 className="text-lg font-bold tracking-wider text-emerald-100 uppercase mb-4">Get in Touch</h4>
                                <ul className="space-y-3 text-gray-300">
                                    <li className="flex items-center gap-3 hover:text-emerald-300 transition-colors duration-200"><PhoneCall className="h-4 w-4" aria-hidden /> +63 900 000 0000</li>
                                    <li className="flex items-center gap-3 hover:text-emerald-300 transition-colors duration-200"><Mail className="h-4 w-4" aria-hidden /> support@mjvirealty.ph</li>
                                    <li className="flex items-center gap-3 hover:text-emerald-300 transition-colors duration-200"><MapPin className="h-4 w-4" aria-hidden /> Metro Manila, Philippines</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-lg font-bold tracking-wider text-emerald-100 uppercase mb-4">Quick Links</h4>
                                <ul className="space-y-3 text-gray-300">
                                    <li><a href="#features" className="hover:text-emerald-300 transition-colors duration-200">Features</a></li>
                                    <li><a href="#how" className="hover:text-emerald-300 transition-colors duration-200">Process</a></li>
                                    <li><a href="#listings" className="hover:text-emerald-300 transition-colors duration-200">Listings</a></li>
                                    <li><a href="#testimonials" className="hover:text-emerald-300 transition-colors duration-200">Reviews</a></li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-16 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">© {new Date().getFullYear()} MJVI Realty. All rights reserved. Licensed Real Estate Broker in the Philippines.</div>
                    </Container>
                </Section>
            </div>
            <Chatbot/>
        </>
    );
}
