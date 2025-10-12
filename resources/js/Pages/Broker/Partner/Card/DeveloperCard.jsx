import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEllipsisV,
    faEye,
    faPen,
    faTrash
} from "@fortawesome/free-solid-svg-icons";
import {faFacebook, faInternetExplorer} from "@fortawesome/free-brands-svg-icons";

export default function DeveloperCard({ developer, onEdit, onDelete, onView }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden relative">
            {/* Top Cover */}
            <div className="h-32 bg-gray-300 relative">
                {/* 3-dot menu */}
                <div className="absolute top-3 right-3 z-10" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="text-gray-700 hover:text-gray-900 focus:outline-none"
                    >
                        <FontAwesomeIcon icon={faEllipsisV} />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    onView(developer);
                                }}
                                className="flex items-center px-4 py-2 w-full text-sm hover:bg-gray-100 text-gray-700"
                            >
                                <FontAwesomeIcon icon={faEye} className="mr-2" /> View
                            </button>
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    onEdit(developer);
                                }}
                                className="flex items-center px-4 py-2 w-full text-sm hover:bg-gray-100 text-gray-700"
                            >
                                <FontAwesomeIcon icon={faPen} className="mr-2" /> Edit
                            </button>
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    onDelete(developer.id);
                                }}
                                className="flex items-center px-4 py-2 w-full text-sm hover:bg-gray-100 text-red-600"
                            >
                                <FontAwesomeIcon icon={faTrash} className="mr-2" /> Delete
                            </button>
                        </div>
                    )}
                </div>

                <div className="absolute left-1/2 -bottom-8 transform -translate-x-1/2">
                    {developer.company_logo ? (
                        <img
                            src={`/storage/${developer.company_logo}`}
                            alt={developer.name}
                            className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-md"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-800 text-white flex items-center justify-center text-lg font-semibold border-4 border-white shadow-md">
                            {developer.name[0]}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="pt-12 pb-4 text-center px-4">
                <h2 className="text-lg font-semibold text-gray-900">{developer.name}</h2>
                <p className="text-sm text-gray-500 mb-4">{developer.trade_name}</p>

                {/* Social Media */}
                <div className="flex justify-center gap-4 text-lg mb-4">
                    {developer.facebook_url && (
                        <a
                            href={developer.facebook_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <FontAwesomeIcon icon={faFacebook} />
                        </a>
                    )}
                    {developer.website_url && (
                        <a
                            href={developer.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <FontAwesomeIcon icon={faInternetExplorer} />
                        </a>
                    )}
                </div>

                {/* Listing Count */}
                <div className="border-t pt-4 text-sm text-gray-600 font-medium">
                    {developer.listing_count ?? 0} Project{developer.listing_count === 1 ? '' : 's'}
                </div>
            </div>
        </div>
    );
}
