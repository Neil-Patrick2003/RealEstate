import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';

export default function BackButton({ className = '', color = 'teal' }) {
    // Map color to Tailwind classes
    const colorClasses = {
        teal: 'text-teal-600 hover:text-teal-700',
        gray: 'text-gray-600 hover:text-gray-700',
        red: 'text-red-600 hover:text-red-700',
        blue: 'text-blue-600 hover:text-blue-700',
        emerald: 'text-green-600 hover:text-emerald-700',
        indigo: 'text-indigo-600 hover:text-indigo-700',
        purple: 'text-purple-600 hover:text-purple-700',
        pink: 'text-pink-600 hover:text-pink-700',
        black: 'text-gray-900 hover:text-black',
        white: 'text-white hover:text-gray-200',
    };

    const selectedColor = colorClasses[color] || colorClasses.teal;

    return (
        <button
            onClick={() => window.history.back()}
            className={`
                ${selectedColor}
                transition-colors duration-150 ease-in-out
                ${className}
            `}
            aria-label="Go Back"
        >
            <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
        </button>
    );
}
