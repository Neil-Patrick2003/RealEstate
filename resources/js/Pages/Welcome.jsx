// Sand & Sun — Stunning Landing Page
// Tech: React + Tailwind (no external libs required)
// Aesthetic: warm sand + terracotta + ocean teal accents
// Accessibility: semantic landmarks, skip link, focus-visible rings
// Performance: responsive images (srcSet/sizes), lazy + async decoding

import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Menu, X, Compass, Sun, Droplets, Leaf, MapPin, ArrowRight, Home, CheckCircle2, PhoneCall, Mail } from 'lucide-react';

/* --------------------------------- Theme --------------------------------- */
// Tailwind suggestion (optional):
// colors: { sand: '#F5EEE6', dune: '#E8DFD6', terracotta: '#D97742', teal: '#1E7A78', ink: '#1F2937' }

const Section = ({ id, children, className = '', divider = true }) => (
    <section id={id} className={`relative w-full ${className}`}>
        {children}
        {divider && <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-200/50 to-transparent hidden md:block" />}
    </section>
);

const Container = ({ className = '', children }) => (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);

/* -------------------------------- Navbar -------------------------------- */
const Navbar = () => {
    const [open, setOpen] = useState(false);
    const toggle = () => setOpen(v => !v);
    const close = () => setOpen(false);

    return (
        <header className="fixed top-0 inset-x-0 z-50 border-b border-amber-200/50 bg-white/90 backdrop-blur-xl">
            <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:m-4 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:shadow">Skip to content</a>
            <Container className="h-16 md:h-20 flex items-center justify-between">
                <a href="#top" className="flex items-center gap-3" onClick={close}>
                    <div className="h-10 w-10 rounded-xl bg-amber-200/50 ring-1 ring-amber-300/60 flex items-center justify-center">
                        <Home className="h-5 w-5 text-amber-700" />
                    </div>
                    <span className="text-xl md:text-2xl font-black tracking-tight text-slate-900">Sand & Sun</span>
                </a>

                {/* Desktop nav */}
                <nav aria-label="Primary" className="hidden md:flex items-center gap-8 text-slate-700 font-medium">
                    <a href="#features" className="hover:text-amber-700">Features</a>
                    <a href="#collections" className="hover:text-amber-700">Collections</a>
                    <a href="#amenities" className="hover:text-amber-700">Amenities</a>
                    <a href="#contact" className="hover:text-amber-700">Contact</a>

                    <a href="/login" className="inline-flex items-center rounded-xl border-2 border-amber-300 bg-white px-4 py-2 font-semibold text-amber-800 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/40">
                        Log in
                    </a>
                    <a href="#book" className="inline-flex items-center rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-5 py-2 text-white font-semibold shadow-md hover:from-amber-700 hover:to-amber-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60">
                        Book a Viewing <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                </nav>

                {/* Mobile */}
                <button aria-label="Toggle menu" aria-expanded={open} onClick={toggle} className="md:hidden rounded-lg p-2 hover:bg-amber-100">
                    {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </Container>
            <div className={`md:hidden overflow-hidden transition-[max-height] duration-300 ${open ? 'max-h-96' : 'max-h-0'}`}>
                <Container className="pb-4">
                    <nav aria-label="Mobile" className="flex flex-col gap-2 text-slate-700 font-medium">
                        {[
                            ['#features','Features'],['#collections','Collections'],['#amenities','Amenities'],['#contact','Contact']
                        ].map(([href,label]) => (
                            <a key={href} href={href} onClick={close} className="rounded-lg px-3 py-2 hover:bg-amber-100">{label}</a>
                        ))}
                        <a href="/login" onClick={close} className="rounded-xl border-2 border-amber-300 bg-white px-4 py-2 font-semibold text-amber-800 hover:bg-amber-50">Log in</a>
                        <a href="#book" onClick={close} className="rounded-xl bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700">Book a Viewing</a>
                    </nav>
                </Container>
            </div>
        </header>
    );
};

/* ---------------------------------- Hero ---------------------------------- */
const Hero = () => (
    <div
        className="relative min-h-[92vh] pt-24 md:pt-28 text-white"
        style={{
            backgroundImage:
                "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1920&auto=format&fit=crop')",
            backgroundSize: 'cover',
            backgroundPosition: 'center 55%'
        }}
    >
        {/* Warm sand wash + vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-amber-900/20 to-black/60" aria-hidden />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 70% at 50% 20%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.12) 65%, rgba(0,0,0,0.35) 100%)' }} aria-hidden />

        <Container className="relative z-10">
            <div className="max-w-3xl">
                <h1 className="text-4xl md:text-6xl font-black leading-tight">Desert Luxury, Coastal Calm</h1>
                <p className="mt-4 text-lg md:text-xl text-amber-50/90">A modern oasis of villas and retreats inspired by dunes, sun, and sea—crafted for slow mornings and golden hours.</p>
                <div className="mt-8 flex flex-wrap gap-4">
                    <a href="#collections" className="inline-flex items-center rounded-xl bg-amber-600 px-6 py-3 text-white font-semibold shadow-md hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60">
                        Explore Homes <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                    <a href="#book" className="inline-flex items-center rounded-xl border-2 border-amber-200 bg-white/10 px-6 py-3 font-semibold text-amber-50 backdrop-blur hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-100/40">
                        Book a Viewing
                    </a>
                </div>
            </div>

            {/* Stat bar */}
            <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl">
                {[['Residences','120+'],['Beachfront','2km'],['Avg. Lot','450㎡'],['Occupancy','90%']].map(([label,value]) => (
                    <div key={label} className="rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-4 text-center">
                        <div className="text-2xl md:text-3xl font-extrabold">{value}</div>
                        <div className="text-xs md:text-sm text-amber-50/90">{label}</div>
                    </div>
                ))}
            </div>
        </Container>
    </div>
);

/* ------------------------------ Feature Card ------------------------------ */
const Feature = ({ icon: Icon, title, desc }) => (
    <div className="group rounded-3xl border border-amber-200/50 bg-white/80 backdrop-blur-sm p-8 shadow-xl shadow-amber-900/5 transition hover:bg-white hover:shadow-amber-500/10">
        <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 ring-1 ring-amber-200">
            <Icon className="h-7 w-7 text-amber-700" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{desc}</p>
    </div>
);

/* ----------------------------- Gallery Card ----------------------------- */
const Card = ({ image, title, meta }) => (
    <article className="group overflow-hidden rounded-3xl border border-amber-200/50 bg-white/80 backdrop-blur-sm shadow-xl shadow-amber-900/5">
        <div className="relative aspect-[4/3]">
            <img
                src={`${image}&auto=format&fit=crop`}
                srcSet={`${image}&w=640 640w, ${image}&w=960 960w, ${image}&w=1280 1280w, ${image}&w=1600 1600w`}
                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                alt={title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="p-6">
            <h4 className="text-lg font-extrabold text-slate-900">{title}</h4>
            <p className="text-sm text-slate-600 mt-1">{meta}</p>
        </div>
    </article>
);

/* --------------------------------- Page --------------------------------- */
export default function SandSunLanding() {
    return (
        <>
            <Head title="Sand & Sun — Desert Luxury Retreats">
                <meta name="description" content="A stunning coastal-desert community. Explore villas inspired by dunes and sea, with sustainable amenities and golden-hour living." />
                <link rel="preconnect" href="https://images.unsplash.com" />
            </Head>

            <div id="top" className="bg-gradient-to-b from-amber-50 via-amber-50 to-white text-slate-900">
                <Navbar />
                <main id="main" role="main">
                    {/* Hero */}
                    <Hero />

                    {/* Features */}
                    <Section id="features" className="py-20 md:py-28 bg-white/80 backdrop-blur-sm">
                        <Container>
                            <div className="mx-auto max-w-3xl text-center">
                                <p className="text-xs font-bold tracking-[0.2em] text-amber-700 uppercase">Why you'll love it</p>
                                <h2 className="mt-2 text-4xl md:text-5xl font-black">Soft, warm, and sustainable by design</h2>
                                <p className="mt-3 text-lg text-slate-600">Crafted for calm living with natural palettes, breathable spaces, and earth-friendly amenities.</p>
                            </div>

                            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                <Feature icon={Sun} title="Golden Hours" desc="Wide terraces and west-facing lounges to soak in sunsets every day." />
                                <Feature icon={Droplets} title="Cooling Pools" desc="Lagoon-style pools and shaded cabanas to balance the desert warmth." />
                                <Feature icon={Leaf} title="Eco Materials" desc="Clay, limewash, and reclaimed wood—beautiful and sustainable." />
                                <Feature icon={Compass} title="Smart Masterplan" desc="Wind corridors, native plants, and walkable paths designed for comfort." />
                            </div>
                        </Container>
                    </Section>

                    {/* Collections */}
                    <Section id="collections" className="py-20 md:py-28 bg-white">
                        <Container>
                            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                                <div>
                                    <h2 className="text-4xl md:text-5xl font-black">Signature Collections</h2>
                                    <p className="mt-2 text-lg text-slate-600">Handpicked villas and lots with curated views and privacy.</p>
                                </div>
                                <a href="#book" className="inline-flex items-center rounded-xl bg-amber-600 px-5 py-3 text-white font-semibold shadow-md hover:bg-amber-700">
                                    View availability <ArrowRight className="ml-2 h-4 w-4" />
                                </a>
                            </div>

                            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <Card image="https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80" title="Dune Villas" meta="3–5BR · Courtyard · Sea glimpse" />
                                <Card image="https://images.unsplash.com/photo-1501644898242-cfea317dcd2a?q=80" title="Adobe Homes" meta="2–3BR · Rooftop deck · Patio" />
                                <Card image="https://images.unsplash.com/photo-1533941637-47c01e64c7f6?q=80" title="Palm Residences" meta="2–4BR · Pool access · Garden" />
                            </div>
                        </Container>
                    </Section>

                    {/* Amenities */}
                    <Section id="amenities" className="py-20 md:py-28 bg-gradient-to-b from-white to-amber-50">
                        <Container>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                                <div>
                                    <h2 className="text-4xl md:text-5xl font-black">Everything you need, within dunes</h2>
                                    <p className="mt-3 text-lg text-slate-600">A walkable spine connects your home to cafes, yoga decks, co-work nooks, and artisan markets—shaded by palms and pergolas.</p>
                                    <ul className="mt-6 space-y-3 text-slate-700">
                                        {["Sunset boardwalk","Clubhouse & spa","Co-working lounge","Garden kitchens","Kids' playscape"].map(item => (
                                            <li key={item} className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-amber-600 mt-0.5" /> {item}</li>
                                        ))}
                                    </ul>
                                    <div className="mt-8 flex flex-wrap gap-3">
                                        <a href="#book" className="inline-flex items-center rounded-xl bg-amber-600 px-5 py-3 text-white font-semibold shadow-md hover:bg-amber-700">Book a tour</a>
                                        <a href="#contact" className="inline-flex items-center rounded-xl border-2 border-amber-300 px-5 py-3 font-semibold text-amber-800 hover:bg-amber-50">Ask an agent</a>
                                    </div>
                                </div>
                                <div className="relative overflow-hidden rounded-3xl border border-amber-200/60 shadow-xl">
                                    <img
                                        src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1600&auto=format&fit=crop"
                                        srcSet="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800 800w, https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200 1200w, https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1600 1600w"
                                        sizes="(min-width:1024px) 50vw, 100vw"
                                        alt="Shaded pergola and pool with terracotta textures"
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-amber-900/10 to-transparent" />
                                </div>
                            </div>
                        </Container>
                    </Section>

                    {/* CTA */}
                    <Section id="book" className="py-20 md:py-28">
                        <Container>
                            <div className="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50 via-white to-amber-50 p-10 md:p-14 shadow-xl">
                                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" aria-hidden />
                                <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-amber-200/20 blur-3xl" aria-hidden />

                                <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                                    <div className="lg:col-span-2">
                                        <h3 className="text-3xl md:text-4xl font-black">Ready for golden-hour living?</h3>
                                        <p className="mt-2 text-lg text-slate-600">Tell us what you’re looking for—our team will curate options and schedule a private tour.</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-end">
                                        <a href="#contact" className="inline-flex items-center rounded-xl bg-amber-600 px-6 py-3 text-white font-semibold shadow-md hover:bg-amber-700">Talk to an expert</a>
                                        <a href="/login" className="inline-flex items-center rounded-xl border-2 border-amber-300 px-6 py-3 font-semibold text-amber-800 hover:bg-amber-50">Log in</a>
                                    </div>
                                </div>
                            </div>
                        </Container>
                    </Section>

                    {/* Contact / Footer */}
                    <Section id="contact" className="py-16 md:py-20 bg-gradient-to-b from-white to-amber-100/40" divider={false}>
                        <Container>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-amber-200/60 ring-1 ring-amber-300 flex items-center justify-center">
                                            <Home className="h-5 w-5 text-amber-800" />
                                        </div>
                                        <span className="text-xl font-black">Sand & Sun</span>
                                    </div>
                                    <p className="mt-3 text-slate-600 max-w-sm">A coastal-desert community that blends natural textures with modern comforts—made for slow days and starry nights.</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold tracking-[0.2em] text-amber-700 uppercase">Contact</h4>
                                    <ul className="mt-3 space-y-2 text-slate-700">
                                        <li className="flex items-center gap-2"><PhoneCall className="h-4 w-4" /> +63 900 000 0000</li>
                                        <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@sandandsun.ph</li>
                                        <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> San Vicente, Palawan</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold tracking-[0.2em] text-amber-700 uppercase">Explore</h4>
                                    <ul className="mt-3 space-y-2 text-slate-700">
                                        <li><a href="#features" className="hover:text-amber-700">Features</a></li>
                                        <li><a href="#collections" className="hover:text-amber-700">Collections</a></li>
                                        <li><a href="#amenities" className="hover:text-amber-700">Amenities</a></li>
                                        <li><a href="#book" className="hover:text-amber-700">Book a Viewing</a></li>
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-10 border-t border-amber-200/60 pt-6 text-center text-sm text-slate-500">
                                © {new Date().getFullYear()} Sand & Sun. All rights reserved.
                            </div>
                        </Container>
                    </Section>
                </main>
            </div>
        </>
    );
}
