import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Search, Home, User, MapPin, DollarSign } from 'lucide-react';

export default function SearchIndex({ query, results, totalResults }) {
    return (
        <>
            <Head title={`Search: ${query}`} />

            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Search Results
                    </h1>
                    <p className="text-amber-600 dark:text-amber-400">
                        Found {totalResults} results for "{query}"
                    </p>
                </motion.div>

                {/* Properties Results */}
                {results.properties.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <Home className="w-6 h-6 text-amber-500" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Properties ({results.properties.length})
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.properties.map(property => (
                                <Link
                                    key={property.id}
                                    href={`/properties/${property.id}`}
                                    className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-amber-100 dark:border-amber-900 hover:shadow-md transition-all duration-200 overflow-hidden"
                                >
                                    {property.images?.[0] && (
                                        <img
                                            src={`/storage/${property.images[0].path}`}
                                            alt={property.title}
                                            className="w-full h-48 object-cover"
                                        />
                                    )}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                                            {property.title}
                                        </h3>
                                        <div className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400 mb-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{property.city}, {property.state}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-lg font-bold text-gray-900 dark:text-white">
                                            <DollarSign className="w-4 h-4" />
                                            <span>{property.price?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Agents Results */}
                {results.agents.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <User className="w-6 h-6 text-amber-500" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Agents & Brokers ({results.agents.length})
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {results.agents.map(agent => (
                                <Link
                                    key={agent.id}
                                    href={`/agents/${agent.id}`}
                                    className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-amber-100 dark:border-amber-900 hover:shadow-md transition-all duration-200 p-4 text-center"
                                >
                                    {agent.photo_url ? (
                                        <img
                                            src={`/storage/${agent.photo_url}`}
                                            alt={agent.name}
                                            className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
                                            {agent.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                        {agent.name}
                                    </h3>
                                    <p className="text-sm text-amber-600 dark:text-amber-400 capitalize">
                                        {agent.role}
                                    </p>
                                    {agent.company_name && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {agent.company_name}
                                        </p>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* No Results */}
                {totalResults === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-16"
                    >
                        <Search className="w-16 h-16 text-amber-300 dark:text-amber-700 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No results found
                        </h3>
                        <p className="text-amber-600 dark:text-amber-400 max-w-md mx-auto">
                            We couldn't find any properties, agents, or content matching "{query}". Try different keywords or browse our categories.
                        </p>
                    </motion.div>
                )}
            </div>
        </>
    );
}
