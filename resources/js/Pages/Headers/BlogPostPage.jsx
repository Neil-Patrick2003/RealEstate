import NavBar from "@/Components/NavBar.jsx";

export default function BlogPostPage() {
    return (
        <div className="page-container">
            <NavBar/>
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Blog Header */}
                <header className="text-center mb-12 animate-fade-in">
                    <div className="badge-primary mb-4">Real Estate Insights</div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 text-balance">
                        The Ultimate Guide to Finding Your Dream Home in Today's Market
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-gray-500 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="avatar-sm bg-gray-100">
                                <span>JD</span>
                            </div>
                            <span>John Doe</span>
                        </div>
                        <span>•</span>
                        <span>Posted at March 15, 2024</span>
                        <span>•</span>
                        <span>5 min read</span>
                    </div>
                </header>

                {/* Featured Image */}
                <div className="mb-8 rounded-xl overflow-hidden">
                    <img
                        src="/api/placeholder/800/400"
                        alt="Modern luxury home exterior"
                        className="w-full h-64 md:h-80 object-cover property-card-image"
                    />
                </div>

                {/* Blog Content */}
                <article className="prose prose-lg max-w-none">
                    {/* Introduction */}
                    <section className="mb-8">
                        <p className="text-lg text-gray-600 leading-relaxed">
                            In today's competitive real estate market, finding the perfect property requires
                            more than just luck. With HomeFinder, our local property listing platform,
                            we're revolutionizing how buyers and sellers connect in your community.
                        </p>
                    </section>

                    {/* Key Features Section */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Why HomeFinder Stands Out</h2>

                        <div className="grid-features mb-8">
                            <div className="card-hover p-6">
                                <div className="feature-icon mb-4">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Search</h3>
                                <p className="text-gray-600 text-sm">
                                    Advanced filtering based on your specific needs - school districts, commute times,
                                    and neighborhood amenities.
                                </p>
                            </div>

                            <div className="card-hover p-6">
                                <div className="feature-icon mb-4">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Virtual Tours</h3>
                                <p className="text-gray-600 text-sm">
                                    360° virtual tours and high-quality photos that let you explore properties
                                    from the comfort of your home.
                                </p>
                            </div>

                            <div className="card-hover p-6">
                                <div className="feature-icon mb-4">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Market Insights</h3>
                                <p className="text-gray-600 text-sm">
                                    Real-time market data and price trends to help you make informed decisions
                                    about your property investment.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Property Stats */}
                    <section className="mb-12">
                        <div className="card p-8 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Local Market Overview</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <div className="text-3xl font-bold text-primary-600 mb-2">245+</div>
                                    <div className="text-sm text-gray-500">Active Listings</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary-600 mb-2">$485K</div>
                                    <div className="text-sm text-gray-500">Average Price</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary-600 mb-2">28</div>
                                    <div className="text-sm text-gray-500">Days on Market</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary-600 mb-2">96%</div>
                                    <div className="text-sm text-gray-500">Seller Satisfaction</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Tips Section */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Expert Tips for Home Buyers</h2>

                        <div className="space-y-6">
                            <div className="card p-6">
                                <h4 className="text-xl font-semibold text-gray-900 mb-3">1. Get Pre-Approved</h4>
                                <p className="text-gray-600">
                                    Before you start your search, get pre-approved for a mortgage. This shows sellers
                                    you're serious and helps you understand your budget constraints.
                                </p>
                            </div>

                            <div className="card p-6">
                                <h4 className="text-xl font-semibold text-gray-900 mb-3">2. Research Neighborhoods</h4>
                                <p className="text-gray-600">
                                    Use HomeFinder's neighborhood guides to explore local schools, amenities,
                                    and community features that match your lifestyle.
                                </p>
                            </div>

                            <div className="card p-6">
                                <h4 className="text-xl font-semibold text-gray-900 mb-3">3. Work with Local Experts</h4>
                                <p className="text-gray-600">
                                    Our platform connects you with verified local real estate agents who understand
                                    the specific dynamics of your target area.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="text-center py-12">
                        <div className="card p-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Find Your Dream Home?</h2>
                            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                                Join thousands of happy homeowners who found their perfect match through HomeFinder.
                                Start your search today and discover why we're the trusted choice for local property listings.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button className="btn-primary">
                                    Browse Properties
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                                <button className="btn-outline">
                                    Learn More
                                </button>
                            </div>
                        </div>
                    </section>
                </article>

                {/* Author Bio */}
                <footer className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex items-start gap-4">
                        <div className="avatar-md bg-primary-100 text-primary-600">
                            <span>JD</span>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900">John Doe</h4>
                            <p className="text-gray-500 text-sm mb-2">Real Estate Expert & HomeFinder Founder</p>
                            <p className="text-gray-600 text-sm">
                                With over 15 years of experience in the local real estate market, John is passionate
                                about helping families find their perfect homes through innovative technology and
                                personalized service.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
