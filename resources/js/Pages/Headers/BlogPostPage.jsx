import NavBar from "@/Components/NavBar.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faCalendar, faClock, faEye, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { Link, usePage } from '@inertiajs/react';
import React, { useState } from "react";

export default function BlogPostPage({ blog }) {
    const { props } = usePage();
    const blogs = props.blogs || [];
    const [expandedBlogs, setExpandedBlogs] = useState({});

    const toggleExpand = (blogId) => {
        setExpandedBlogs(prev => ({
            ...prev,
            [blogId]: !prev[blogId]
        }));
    };

    // If viewing a single blog post
    if (blog) {
        return (
            <div className="page-container">
                <NavBar />
                <div className="">
                    {/* Blog Header */}
                    <section className="relative py-20 lg:py-28 bg-gradient-to-br from-gray-900 via-emerald-900 to-green-800 text-white overflow-hidden">
                        <div className="absolute inset-0 bg-black/40"></div>
                        <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
                        <div className="relative max-w-6xl mx-auto px-4">
                            <div className="badge bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium inline-block mb-4">
                                Real Estate Insights
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 text-balance">
                                {blog.title}
                            </h1>
                            <div className="flex items-center justify-center gap-4 text-gray-300 text-sm flex-wrap">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                        <FontAwesomeIcon icon={faUsers} className="w-4 h-4" />
                                    </div>
                                    <span>Admin</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <FontAwesomeIcon icon={faCalendar} className="w-3 h-3" />
                                    <span>Posted at {new Date(blog.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                                <span>•</span>

                            </div>
                        </div>
                    </section>

                    {/* Main Content Container */}
                    <div className="max-w-4xl mx-auto px-4 py-8">
                        {/* Featured Image */}
                        {blog.img_url && (
                            <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
                                <img
                                    src={`/storage/${blog.img_url}`}
                                    alt={blog.title}
                                    className="w-full h-64 md:h-80 object-cover"
                                />
                            </div>
                        )}

                        {/* Blog Content */}
                        <article className="prose prose-lg max-w-none">
                            <div
                                className="blog-content"
                                dangerouslySetInnerHTML={{ __html: blog.content }}
                            />
                        </article>

                        {/* Author Bio */}
                        <footer className="mt-12 pt-8 border-t border-gray-200">
                            <div className="flex items-start gap-4">
                                <div className="avatar-md bg-emerald-100 text-emerald-600 w-12 h-12 rounded-full flex items-center justify-center font-semibold">
                                    <span>RS</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">RealSync Team</h4>
                                    <p className="text-gray-500 text-sm mb-2">Real Estate Experts</p>
                                    <p className="text-gray-600 text-sm">
                                        Our team of real estate professionals is dedicated to helping you find
                                        your dream home through innovative technology and personalized service.
                                    </p>
                                </div>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        );
    }

    // If viewing blog listings
    return (
        <div className="page-container">
            <NavBar />

            {/* Blog Listings Header */}
            <section className="relative py-20 lg:py-28 bg-gradient-to-br from-gray-900 via-emerald-900 to-green-800 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
                <div className="relative max-w-6xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                        Real Estate Blog
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Discover expert insights, market trends, and tips for buying and selling properties in today's market.
                    </p>
                </div>
            </section>

            {/* Blog Listings */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                {blogs.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No blog posts yet</h3>
                        <p className="text-gray-500">Check back later for new real estate insights and tips.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {blogs.map((blog) => {
                            const plainContent = blog.content.replace(/<[^>]*>/g, '');
                            const isExpanded = expandedBlogs[blog.id];
                            const displayContent = isExpanded ? plainContent : plainContent.substring(0, 300);
                            const shouldTruncate = plainContent.length > 300;

                            return (
                                <article key={blog.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                    <div className="p-8">
                                        <div className="flex flex-col lg:flex-row gap-8">
                                            {/* Blog Image */}
                                            {blog.img_url && (
                                                <div className="lg:w-1/3">
                                                    <div className="relative overflow-hidden rounded-lg">
                                                        <img
                                                            src={`/storage/${blog.img_url}`}
                                                            alt={blog.title}
                                                            className="w-full h-64 lg:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                        <div className="absolute top-4 left-4">
                                                            <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                                                                Real Estate
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Blog Content */}
                                            <div className={`${blog.img_url ? 'lg:w-2/3' : 'w-full'}`}>
                                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                                    <div className="flex items-center gap-1">
                                                        <FontAwesomeIcon icon={faCalendar} className="w-3 h-3" />
                                                        <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                                                    </div>
                                                </div>

                                                <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors">
                                                    {blog.title}
                                                </h2>

                                                <div className="prose prose-gray max-w-none mb-4">
                                                    <div className={`text-gray-600 leading-relaxed ${!isExpanded && shouldTruncate ? 'line-clamp-4' : ''}`}>
                                                        {displayContent}
                                                        {!isExpanded && shouldTruncate && '...'}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                                    <div className="flex gap-3">
                                                        {shouldTruncate && (
                                                            <button
                                                                onClick={() => toggleExpand(blog.id)}
                                                                className="inline-flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700 transition-colors group/btn"
                                                            >
                                                                {isExpanded ? (
                                                                    <>
                                                                        Read Less
                                                                        <FontAwesomeIcon icon={faChevronUp} className="w-3 h-3 group-hover/btn:-translate-y-0.5 transition-transform" />
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        Read More
                                                                        <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3 group-hover/btn:translate-y-0.5 transition-transform" />
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {/* CTA Section */}
                <section className="text-center py-16 mt-12">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay Updated with Market Trends</h2>
                        <p className="text-gray-600 mb-6">
                            Get the latest real estate insights and tips delivered to your inbox.
                            Stay ahead in today's competitive market.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href='/all-properties'
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg inline-flex items-center gap-2"
                            >
                                Browse Properties
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>
                            <button className="border border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white px-8 py-3 rounded-lg font-medium transition-all duration-300">
                                Subscribe to Newsletter
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
