import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHome,
    faUsers,
    faMapMarkerAlt,
    faHandshake,
    faChartLine,
    faAward,
    faShield,
    // faTarget,
    faRocket,
    faHeart
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "@inertiajs/react";
import Footer from "@/Components/Footer.jsx";
import NavBar from "@/Components/NavBar.jsx";

export default function AboutPage() {
    const teamValues = [
        {
            icon: faHandshake,
            title: "Fair Pricing Commitment",
            description: "Transparent and competitive pricing strategies that benefit both property owners and buyers"
        },
        {
            icon: faHandshake,
            title: "Trusted Partnerships",
            description: "Building long-term relationships based on integrity and mutual success"
        },
        {
            icon: faChartLine,
            title: "Market Expertise",
            description: "Deep understanding of Nasugbu's real estate market dynamics and trends"
        },
        {
            icon: faShield,
            title: "Professional Integrity",
            description: "Ethical practices and honest representation in all transactions"
        }
    ];

    const serviceAreas = [
        {
            area: "Nasugbu Proper",
            description: "Town center and surrounding residential communities"
        },
        {
            area: "Coastal Areas",
            description: "Beachfront properties and coastal developments"
        },
        {
            area: "Highland Communities",
            description: "Mountain view properties and elevated residential areas"
        },
        {
            area: "Agricultural Lands",
            description: "Raw land and development-ready properties"
        }
    ];

    const achievements = [
        {
            number: "50+",
            label: "Agent Network"
        },
        {
            number: "200+",
            label: "Properties Listed"
        },
        {
            number: "15+",
            label: "Developments"
        },
        {
            number: "98%",
            label: "Client Satisfaction"
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <NavBar/>

            {/* Hero Section */}
            <section className="relative py-20 lg:py-28 bg-gradient-to-br from-gray-900 via-primary-900 to-emerald-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute top-0 left-0 w-72 h-72 bg-primary-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>

                <div className="relative max-w-6xl mx-auto px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
                        <FontAwesomeIcon icon={faUsers} className="h-4 w-4 text-emerald-300" />
                        <span className="text-sm font-medium text-blue-100 tracking-wide">NASUGBU'S PREMIER AGENT NETWORK</span>
                    </div>

                    <h1 className="text-4xl lg:text-6xl font-bold mb-8 leading-tight tracking-tight">
                        About
                        <span className="block bg-gradient-to-r from-primary-400 to-emerald-400 bg-clip-text text-transparent">
                            MJVI Realty
                        </span>
                    </h1>

                    <p className="text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed mb-12 tracking-wide">
                        Nasugbu's trusted collective of real estate professionals committed to fair pricing,
                        transparent transactions, and community-focused property services.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                                Our Mission
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-6 tracking-wide">
                                To provide fair and transparent real estate services that benefit both property owners
                                and buyers through our extensive network of professional agents in Nasugbu, Batangas.
                            </p>
                            <p className="text-lg text-gray-600 leading-relaxed tracking-wide">
                                We believe in fair pricing strategies that ensure property owners receive competitive
                                market value while making properties accessible to qualified buyers.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-primary-50 to-emerald-50 rounded-2xl p-8">
                            <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                                Our Vision
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed tracking-wide">
                                To be Nasugbu's most trusted real estate agent network, known for our integrity,
                                market expertise, and commitment to fair and ethical property transactions that
                                contribute to the community's growth and development.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Achievements */}
            <section className="py-20 bg-gradient-to-br from-gray-50 to-primary-50/30">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                            Our Network in Numbers
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {achievements.map((achievement, index) => (
                            <div
                                key={index}
                                className="text-center bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl transition-all duration-500"
                            >
                                <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-3">
                                    {achievement.number}
                                </div>
                                <div className="text-gray-600 font-medium tracking-wide">
                                    {achievement.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                            Our Core Values
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed tracking-wide">
                            The principles that guide our agent network and define our approach to real estate.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {teamValues.map((value, index) => (
                            <div
                                key={index}
                                className="flex items-start space-x-6 p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-500"
                            >
                                <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <FontAwesomeIcon icon={value.icon} className="h-6 w-6 text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">{value.title}</h3>
                                    <p className="text-gray-600 leading-relaxed tracking-wide">{value.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Service Areas */}
            <section className="py-20 bg-gradient-to-br from-primary-50 to-emerald-50/30">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                            Serving Nasugbu, Batangas
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed tracking-wide">
                            Our agent network covers all key areas of Nasugbu, providing comprehensive
                            real estate services throughout the municipality.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {serviceAreas.map((area, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-lg transition-all duration-500"
                            >
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="h-8 w-8 text-primary-600 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 mb-3 tracking-tight">{area.area}</h3>
                                <p className="text-gray-600 text-sm tracking-wide">{area.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose MJVI */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                            Why Choose MJVI Realty?
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="text-center p-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <FontAwesomeIcon icon={faUsers} className="h-8 w-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">Agent Collective</h3>
                            <p className="text-gray-600 leading-relaxed tracking-wide">
                                Access to Nasugbu's largest network of professional real estate agents
                                with local market expertise and community connections.
                            </p>
                        </div>

                        <div className="text-center p-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <FontAwesomeIcon icon={faHandshake} className="h-8 w-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">Fair Pricing</h3>
                            <p className="text-gray-600 leading-relaxed tracking-wide">
                                Transparent pricing strategies that ensure fair market value for sellers
                                while maintaining affordability for qualified buyers.
                            </p>
                        </div>

                        <div className="text-center p-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <FontAwesomeIcon icon={faHeart} className="h-8 w-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">Community Focus</h3>
                            <p className="text-gray-600 leading-relaxed tracking-wide">
                                Deeply rooted in Nasugbu's community, understanding local dynamics and
                                committed to the area's sustainable development.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary-600 to-emerald-600 text-white">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-8 tracking-tight">
                        Join Our Agent Network
                    </h2>
                    <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed tracking-wide">
                        Become part of Nasugbu's most trusted real estate collective and provide
                        fair, transparent services to property owners and buyers.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link
                            href="/contact"
                            className="bg-white text-primary-600 px-12 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 tracking-wide"
                        >
                            Join Our Team
                        </Link>
                        <Link
                            href="/all-properties"
                            className="border-2 border-white text-white px-12 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-primary-600 transition-all duration-300 tracking-wide"
                        >
                            View Properties
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
