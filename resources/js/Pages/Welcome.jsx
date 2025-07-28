import React, { useCallback, useEffect, useState } from 'react';
import Hero from './LandingPage/Hero';
import NavBar from '@/Components/NavBar';
import PropertyList from './LandingPage/PropertyList';
import Footer from './LandingPage/Footer';
import backgroundImage from "../../assets/background.jpg";
import { router } from "@inertiajs/react";
import { debounce } from "lodash";
import ToastHandler from "@/Components/ToastHandler.jsx";
import process from '../../assets/process.png';
import { Link } from '@inertiajs/react';

const Welcome = ({ auth, properties, search = '', initialType = "All", featured }) => {

    const [searchTerm, setSearchTerm] = useState(search || '');
    const [selectedType, setSelectedType] = useState(initialType);

    useEffect(() => {
        if (search) setSearchTerm(search);
    }, [search]);

    const fetchProperties = (searchValue = searchTerm, typeValue = selectedType) => {
        router.get(
            '/',
            { search: searchValue, type: typeValue },
            { preserveState: true, replace: true }
        );
    };

    const debouncedSearch = useCallback(
        debounce((value) => {
            fetchProperties(value, selectedType);
        }, 500),
        [selectedType]
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    const handleSearchTermChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleTypeChange = (type) => {
        setSelectedType(type);
        fetchProperties(searchTerm, type);
    };

    return (
        <div className="relative overflow-x-hidden bg-white ">
            <ToastHandler />

            {/* Hero Section */}
            <div
                className="relative h-[100vh] bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            >
                <div className="relative z-10">
                    <NavBar />
                    <Hero
                        searchTerm={searchTerm}
                        handleSearchTermChange={handleSearchTermChange}
                        selectedType={selectedType}
                        handleTypeChange={handleTypeChange}
                        setSelectedType={setSelectedType}
                    />
                </div>
            </div>

            {/* Filters and PropertyList */}
            {/*<div className="h-screen">*/}
            {/*    <PropertyList properties={properties} />*/}
            {/*</div>*/}

            <div>
                <section id="properties" className="section bg-gray-50 py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-800 mb-4">Featured <span
                                className="text-primary">Properties</span></h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Explore our curated selection of
                                premium
                                land listings in top locations nationwide.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {featured.map((feature) => (
                                <div key={feature.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition">
                                    <div className="relative">
                                        <img src={`/storage/${feature.image_url}`}/>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                        <p className="text-gray-600 mb-4">{feature.address}</p>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-2xl font-bold text-primary">
                                                {Number(feature?.price).toLocaleString('en-PH', {
                                                    style: 'currency',
                                                    currency: 'PHP',
                                                })}
                                            </span>
                                            <span className="text-gray-500">
                                                {feature?.property_type === 'Land' ? (
                                                    <>{feature.lot_area} m²</>
                                                ): (
                                                    <>{feature.floor_area} m²</>
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {feature.features.slice(0, 4).map((ft) => (
                                                <span  key={ft.id} className="bg-green-100 text-primary px-3 py-1 rounded-full text-xs hover:-translate-y-1 hover:shadow-md">{ft.name}</span>
                                            ))}
                                        </div>
                                        <button
                                            className="w-full py-2 bg-secondary text-white rounded-lg hover:bg-orange-300 transition">View
                                            Details
                                        </button>
                                    </div>
                                </div>
                            ))}

                        </div>
                        <div className="text-center mt-12">
                            <Link href='/all-properties'
                                className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-green-700 transition font-semibold">View
                                All Properties {properties.length > 0 && `(${properties.length})`}
                            </Link>
                        </div>
                    </div>
                </section>
            </div>


            <div>
                <section id="features" className="section bg-green-50 py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose <span
                                className="text-primary">MJVI Realty</span></h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Our platform offers unparalleled
                                tools and resources to help you find and secure the perfect land for your needs.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-10">
                            {/* 1. Advanced Search Filters */}
                            <div className="bg-white p-8 rounded-xl hover:shadow-lg transition group">
                                <div
                                    className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-6 transition-colors group-hover:bg-primary">
                                    <svg
                                        className="w-8 h-8 text-primary transition-colors group-hover:text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-3">Advanced Search Filters</h3>
                                <p className="text-gray-600">Easily narrow down listings by type, location, price, and
                                    more.</p>
                            </div>


                            {/* 2. Verified Listings */}
                            <div className="bg-white p-8 rounded-xl hover:shadow-lg transition group">
                                <div
                                    className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center mb-6 transition-colors group-hover:bg-secondary">
                                    <svg className="w-8 h-8 text-secondary group-hover:text-white" fill="none"
                                         stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-3">Verified Listings</h3>
                                <p className="text-gray-600">All properties undergo strict verification to ensure
                                    accurate pricing and transparent ownership.</p>
                            </div>

                            {/* 3. Interactive Maps */}
                            <div className="bg-white p-8 rounded-xl hover:shadow-lg transition group">
                                <div
                                    className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-6 transition-colors group-hover:bg-primary">
                                    <svg className="w-8 h-8 text-primary group-hover:text-white" fill="none"
                                         stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-3">Interactive Map Boundaries</h3>
                                <p className="text-gray-600">View exact property boundaries with our built-in map
                                    tool.</p>
                            </div>

                            {/* 4. Local Market Expertise */}
                            <div className="bg-white p-8 rounded-xl hover:shadow-lg transition group">
                                <div
                                    className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center mb-6 transition-colors group-hover:bg-secondary">
                                    <svg className="w-8 h-8 text-secondary group-hover:text-white" fill="none"
                                         stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M3 4a1 1 0 011-1h4l2 3h7a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"/>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-3">Local Market Expertise</h3>
                                <p className="text-gray-600">Our team understands land values, zoning laws, and local
                                    trends.</p>
                            </div>

                            {/* 5. Trusted Customer Support */}
                            <div className="bg-white p-8 rounded-xl hover:shadow-lg transition group">
                                <div
                                    className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-6 transition-colors group-hover:bg-primary">
                                    <svg className="w-8 h-8 text-primary group-hover:text-white" fill="none"
                                         stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M18 10c0-3.866-3.582-7-8-7S2 6.134 2 10c0 3.204 2.052 5.918 5 6.708V21l4-2 4 2v-4.292c2.948-.79 5-3.504 5-6.708z"/>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-3">Talk to Real Agents</h3>
                                <p className="text-gray-600">Use our built-in chat to connect instantly with agents who know land — no bots, just real help.</p>
                            </div>

                            {/* 6. Up-to-Date Listings */}
                            <div className="bg-white p-8 rounded-xl hover:shadow-lg transition group">
                                <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center mb-6 transition-colors group-hover:bg-secondary">
                                    <svg className="w-8 h-8 text-secondary group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-3">Up-to-Date Listings</h3>
                                <p className="text-gray-600">We regularly update listings to ensure you're seeing what's actually available.</p>
                            </div>
                        </div>

                    </div>
                </section>
            </div>
            <div>
                <section id="process" className="section bg-white py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Simple <span
                                className="text-primary">Process</span></h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">From discovery to closing, we make
                                finding and acquiring land simple and stress-free.</p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="md:w-1/2 bg-orange-50">
                                <img className="w-full h-full object-cover" src={process} alt='Process'/>
                            </div>
                            <div className="md:w-1/2 space-y-10">
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0">
                                        <div
                                            className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">1
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Define Your Criteria</h3>
                                        <p className="text-gray-600">
                                            Start by exploring listings using powerful search tools. Filter by location, acreage, zoning, price, and more to find land that fits your needs.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0">
                                        <div
                                            className="w-14 h-14 rounded-full bg-secondary text-white flex items-center justify-center text-2xl font-bold">2
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Virtual Exploration</h3>
                                        <p className="text-gray-600">Send inquiries and use our built-in chat to speak directly with a land agent. Ask questions, get quick insights, and learn more about any property you're interested in..</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0">
                                        <div
                                            className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">3
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">. Schedule a Visit</h3>
                                        <p className="text-gray-600">See the land in person. We'll help you schedule a site visit so you can walk the property, check access, and get a feel for the area.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0">
                                        <div className="w-14 h-14 rounded-full bg-secondary text-white flex items-center justify-center text-2xl font-bold">4</div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Make an Offer & Close</h3>
                                        <p className="text-gray-600">If you’re not satisfied with the listed price, submit an offer through the platform. The agent will review it and negotiate on your behalf to reach a fair deal.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div>
                <section id="agents" className="section bg-gray-50 py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-800 mb-4">Meet Our <span
                                className="text-primary">Land Specialists</span></h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Our network of experienced land
                                professionals can guide you through every step of the process.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-10">
                            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition">
                                <img className="w-full h-64 object-cover" src="https://placehold.co/600x400"
                                     alt="Jennifer Martinez portrait - senior land specialist"/>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-1">Jennifer Martinez</h3>
                                    <p className="text-secondary font-semibold mb-4">Professional Broker</p>
                                    <p className="text-gray-600 mb-4">15 years experience focusing on rural acreage and
                                        agricultural properties. Certified land consultant with deep understanding of
                                        soil analysis and water rights.</p>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                        </svg>
                                        (555) 123-4567
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition">
                                <img className="w-full h-64 object-cover" src="https://placehold.co/600x400"
                                     alt="Robert Johnson portrait - commercial land expert"/>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-1">Robert Johnson</h3>
                                    <p className="text-secondary font-semibold mb-4">Professional Broker</p>
                                    <p className="text-gray-600 mb-4">Specializing in high-value commercial and
                                        development parcels. Former city planner with insider knowledge of zoning
                                        changes and upcoming infrastructure projects.</p>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                        </svg>
                                        (555) 234-5678
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>


                </section>
            </div>


            {/* Footer */}
            <Footer/>
        </div>
    );
};
export default Welcome;
