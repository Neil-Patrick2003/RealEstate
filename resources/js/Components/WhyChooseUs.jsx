import Featured from "@/Components/Featured.jsx";
import React from "react";

export default function WhyChooseUs() {
    return (
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
    );
}
