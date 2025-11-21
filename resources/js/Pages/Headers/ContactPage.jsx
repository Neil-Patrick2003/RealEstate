import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faCheckCircle,
    faExclamationTriangle,
    faPhone,
    faEnvelope,
    faMapMarkerAlt,
    faHome,
    faSearch,
    faHandshake,
    faChartLine,
    faUserTie
} from "@fortawesome/free-solid-svg-icons";
import { Link, useForm } from "@inertiajs/react";
import Footer from "@/Components/Footer.jsx";

export default function ContactPage() {
    const { data, setData, post, processing, errors, recentlySuccessful, reset } = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post('/contact', {
            onSuccess: () => {
                reset();
            }
        });
    };

    const conversationStarters = [
        {
            icon: faSearch,
            title: "Find Your Dream Property",
            description: "See our available listings and schedule a personalized property viewing tour."
        },
        {
            icon: faChartLine,
            title: "Real Estate Investment",
            description: "Get expert advice on property investment opportunities and market insights."
        },
        {
            icon: faHandshake,
            title: "Sell Your Property",
            description: "Learn how we can help you get the best value for your property with our marketing expertise."
        },
        {
            icon: faUserTie,
            title: "Professional Consultation",
            description: "Schedule a one-on-one consultation with our real estate experts."
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Simple Background */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50/30 via-white to-emerald-50/30" />

            {/* Header */}
            <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <FontAwesomeIcon icon={faHome} className="h-8 w-8 text-primary-600 mr-3" />
                            <span className="text-2xl font-bold text-gray-900">MJVI REALTY</span>
                        </div>

                        <nav className="hidden md:flex items-center space-x-8">
                            {['Properties', 'Services', 'About', 'Blog', 'Contact'].map((item) => (
                                <a
                                    key={item}
                                    href="#"
                                    className="text-gray-700 hover:text-primary-600 font-medium"
                                >
                                    {item}
                                </a>
                            ))}
                            <button className="btn-primary">
                                Get Started
                            </button>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="relative bg-gray-900">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
                    style={{
                        backgroundImage: 'url("https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80")'
                    }}
                />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Contact Us
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Your trusted partner in real estate. Let's find your perfect property together.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Column */}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">
                            Let's Start a Conversation
                        </h2>

                        <div className="space-y-6 mb-8">
                            {conversationStarters.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg bg-white"
                                >
                                    <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FontAwesomeIcon icon={item.icon} className="h-6 w-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">
                                            {item.title}
                                        </h4>
                                        <p className="text-gray-600 text-sm">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Direct Contact</h3>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <FontAwesomeIcon icon={faPhone} className="h-4 w-4 text-primary-600" />
                                    <span>+1 (555) 123-4567</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4 text-primary-600" />
                                    <span>info@mjvirealty.com</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="h-4 w-4 text-primary-600" />
                                    <span>Nasugbu, Batangas, Philippines</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Form */}
                    <div>
                        <div className="bg-white border border-gray-200 rounded-lg p-8">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Get In Touch</h3>
                                <p className="text-gray-600">Please note: all fields are required.</p>
                            </div>

                            {recentlySuccessful && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-center space-x-3">
                                        <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-emerald-600" />
                                        <div>
                                            <p className="font-semibold text-emerald-900">Thank you for your message!</p>
                                            <p className="text-emerald-700 text-sm">We'll get back to you within 24 hours.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-6">
                                {/* Single Name Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                                            errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter your full name"
                                        disabled={processing}
                                    />
                                    {errors.name && (
                                        <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                                            <FontAwesomeIcon icon={faExclamationTriangle} className="h-3 w-3" />
                                            <span>{errors.name}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                                            errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter your email address"
                                        disabled={processing}
                                    />
                                    {errors.email && (
                                        <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                                            <FontAwesomeIcon icon={faExclamationTriangle} className="h-3 w-3" />
                                            <span>{errors.email}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Subject *
                                    </label>
                                    <select
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                                            errors.subject ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={processing}
                                    >
                                        <option value="">Select a topic</option>
                                        <option value="property-viewing">Schedule Property Viewing</option>
                                        <option value="property-valuation">Property Valuation Request</option>
                                        <option value="investment-consultation">Investment Consultation</option>
                                        <option value="general-inquiry">General Inquiry</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {errors.subject && (
                                        <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                                            <FontAwesomeIcon icon={faExclamationTriangle} className="h-3 w-3" />
                                            <span>{errors.subject}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        rows={6}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                                            errors.message ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Tell us about your real estate needs..."
                                        disabled={processing}
                                    />
                                    {errors.message && (
                                        <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                                            <FontAwesomeIcon icon={faExclamationTriangle} className="h-3 w-3" />
                                            <span>{errors.message}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Submitting...</span>
                                        </div>
                                    ) : (
                                        "Send Message"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
