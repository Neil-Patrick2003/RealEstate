import Featured from "@/Components/Featured.jsx";
import React from "react";

export default function OurBroker() {
    return (
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
                            <img className="w-full h-64 object-cover" src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwEIuRP5nY11YtRpcIb5a30PBD069OjLNBAg&s'
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
                            <img className="w-full h-64 object-cover" src='https://img.freepik.com/premium-photo/real-estate-agent-office_255667-55168.jpg'
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
    );
}
