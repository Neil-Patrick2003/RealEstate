import React from 'react';
import { Home, Mail, Phone, MapPin } from 'lucide-react';
import logo from '../../assets/framer_logo.png';

function Footer() {
    return (
        <footer className="bg-neutral-900 text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <img src={logo} alt='Logo' className='h-10 w-10'/>
                            <span className="text-xl font-bold">RealSync</span>
                        </div>
                        <p className="text-neutral-400 text-sm">
                            Your trusted partner in finding the perfect local property.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-neutral-400 text-sm">
                            <li><a href="#" className="hover:text-primary-500 transition-colors">Buy Property</a></li>
                            <li><a href="#" className="hover:text-primary-500 transition-colors">Rent Property</a></li>
                            <li><a href="#" className="hover:text-primary-500 transition-colors">Sell Property</a></li>
                            <li><a href="#" className="hover:text-primary-500 transition-colors">About Us</a></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-semibold mb-4">Resources</h4>
                        <ul className="space-y-2 text-neutral-400 text-sm">
                            <li><a href="#" className="hover:text-primary-500 transition-colors">Market Trends</a></li>
                            <li><a href="#" className="hover:text-primary-500 transition-colors">Buying Guide</a></li>
                            <li><a href="#" className="hover:text-primary-500 transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-primary-500 transition-colors">FAQ</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-4">Contact</h4>
                        <ul className="space-y-3 text-neutral-400 text-sm">
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                info@realsync.com
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                +1 (555) 123-4567
                            </li>
                            <li className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                123 Main St, City
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright Bar */}
                <div className="pt-8 border-t border-neutral-800">
                    <div className="text-center text-sm text-neutral-500">
                        All rights reserved. &copy; {new Date().getFullYear()} RealSync.
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
