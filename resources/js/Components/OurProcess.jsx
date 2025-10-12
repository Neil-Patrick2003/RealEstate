import Featured from "@/Components/Featured.jsx";
import React from "react";
import process from '../../assets/process.png';

export default function OurProcess() {
    return (
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

    );
}
