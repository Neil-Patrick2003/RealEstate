import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';

export default function BackButton({ className = '' }) {
    return (
        <button
            onClick={() => window.history.back()}
            className={`
                p-2 bg-white text-teal-600 border border-gray-300 rounded-full
                shadow-md hover:shadow-lg hover:bg-teal-50
                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
                transition duration-150 ease-in-out ${className}
            `}
            aria-label="Go Back" // Important for accessibility since text is omitted
        >
            <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
        </button>
    );
}
