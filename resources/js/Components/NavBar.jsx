import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Menu, X, Search, User, ChevronDown, Loader } from 'lucide-react';
import { Link, usePage, router } from '@inertiajs/react';

import logo from '../../assets/framer_logo.png';

function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // ⬇️ Get auth user from Inertia (make sure you're sharing this from Laravel)
    const { props } = usePage();
    const user = props.auth?.user || null;

    // Helper: decide where to send user based on role
    const getDashboardPath = (user) => {
        if (!user) return '/login';

        const role = (user.role || '').toLowerCase();

        if (role === 'buyer') return '/dashboard';
        if (role === 'seller') return '/seller/dashboard';
        if (role === 'agent') return '/agents/dashboard';
        if (role === 'broker') return '/broker/dashboard';
        return '/';
    };

    const dashboardHref = getDashboardPath(user);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Search functionality
    const handleSearch = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);

        try {
            // Make API call to your Laravel backend for search
            const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            setSearchResults(data.results || []);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch(searchQuery);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.visit(`/search?q=${encodeURIComponent(searchQuery)}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    const handleQuickSearch = (query) => {
        router.visit(`/search?q=${encodeURIComponent(query)}`);
        setIsSearchOpen(false);
        setSearchQuery('');
    };

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Properties', href: '/properties' },
        { name: 'About', href: '/about' },
        { name: 'Blogs', href: '/blogs' },
        { name: 'Contact', href: '/contact' },
        { name: 'Map', href: '/maps' },
    ];

    // Quick search suggestions
    const quickSearchSuggestions = [
        'Apartments',
        'Houses',
        'Luxury Villas',
        'Commercial',
        'Land'
    ];

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    isScrolled
                        ? 'bg-white/80 backdrop-blur-lg shadow-lg'
                        : 'bg-transparent'
                }`}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <motion.a
                            href="/"
                            className="flex items-center gap-2 group"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center group-hover:shadow-lg transition-shadow">
                                <img src={logo} alt="Logo" className="w-8 h-8" />
                            </div>
                            <span
                                className={`text-xl font-bold transition-colors ${
                                    isScrolled ? 'text-neutral-900' : 'text-white'
                                }`}
                            >
                                RealSync
                            </span>
                        </motion.a>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link, index) => (
                                <motion.a
                                    key={link.name}
                                    href={link.href}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    className={`relative font-medium transition-colors group ${
                                        isScrolled
                                            ? 'text-neutral-700 hover:text-primary-600'
                                            : 'text-white hover:text-primary-400'
                                    }`}
                                >
                                    {link.name}
                                    <motion.span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 group-hover:w-full transition-all duration-300" />
                                </motion.a>
                            ))}
                        </div>

                        {/* Desktop CTA Buttons */}
                        <div className="hidden md:flex items-center gap-4">
                            {/* Search Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsSearchOpen(true)}
                                className={`p-2 rounded-lg transition-colors ${
                                    isScrolled
                                        ? 'text-neutral-700 hover:bg-neutral-100'
                                        : 'text-white hover:bg-white/10'
                                }`}
                            >
                                <Search className="w-5 h-5" />
                            </motion.button>

                            {/* ⬇️ If authenticated: Dashboard, else: Sign In */}
                            <Link
                                href={dashboardHref}
                                className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                            >
                                {user ? 'Dashboard' : 'Sign In'}
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={`md:hidden p-2 rounded-lg transition-colors ${
                                isScrolled
                                    ? 'text-neutral-900 hover:bg-neutral-100'
                                    : 'text-white hover:bg-white/10'
                            }`}
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </motion.button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="md:hidden bg-white/95 backdrop-blur-lg shadow-lg overflow-hidden"
                        >
                            <div className="px-6 py-6 space-y-4">
                                {/* Mobile Search */}
                                <div className="relative mb-4">
                                    <form onSubmit={handleSearchSubmit} className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search properties..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        {isSearching && (
                                            <Loader className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />
                                        )}
                                    </form>
                                </div>

                                {navLinks.map((link, index) => (
                                    <motion.a
                                        key={link.name}
                                        href={link.href}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block text-neutral-700 font-medium hover:text-primary-600 transition-colors py-2 border-b border-neutral-100 last:border-0"
                                    >
                                        {link.name}
                                    </motion.a>
                                ))}

                                {/* ⬇️ Mobile: Same logic — Dashboard vs Sign In */}
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.3 }}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg font-semibold shadow-lg"
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        router.visit(dashboardHref);
                                    }}
                                >
                                    {user ? 'Dashboard' : 'Sign In'}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* Search Overlay */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4"
                        onClick={() => setIsSearchOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Search Input */}
                            <div className="p-6 border-b border-gray-100">
                                <form onSubmit={handleSearchSubmit} className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search properties, locations, amenities..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-6 py-4 pl-12 text-lg border-0 focus:ring-0 focus:outline-none placeholder-gray-400"
                                        autoFocus
                                    />
                                    <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    {isSearching && (
                                        <Loader className="w-5 h-5 absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />
                                    )}
                                </form>
                            </div>

                            {/* Quick Search Suggestions */}
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                    Quick Search
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {quickSearchSuggestions.map((suggestion, index) => (
                                        <motion.button
                                            key={suggestion}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => handleQuickSearch(suggestion)}
                                            className="px-4 py-2 bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-700 rounded-full text-sm font-medium transition-all duration-200"
                                        >
                                            {suggestion}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Search Results */}
                            <div className="max-h-96 overflow-y-auto">
                                {searchResults.length > 0 ? (
                                    <div className="p-4">
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                            Search Results
                                        </h3>
                                        <div className="space-y-2">
                                            {searchResults.map((result, index) => (
                                                <motion.a
                                                    key={result.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    href={result.url}
                                                    onClick={() => setIsSearchOpen(false)}
                                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                                >
                                                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                                        <Home className="w-4 h-4 text-primary-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{result.title}</h4>
                                                        <p className="text-sm text-gray-500">{result.type} • {result.location}</p>
                                                    </div>
                                                </motion.a>
                                            ))}
                                        </div>
                                    </div>
                                ) : searchQuery && !isSearching ? (
                                    <div className="p-8 text-center">
                                        <p className="text-gray-500">No results found for "{searchQuery}"</p>
                                    </div>
                                ) : null}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default Navbar;
