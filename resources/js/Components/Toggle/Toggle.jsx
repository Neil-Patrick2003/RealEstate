'use client';

import {useEffect, useId} from 'react';

export default function Toggle({
                                   name,
                                   checked = false,
                                   onChange,
                                   ariaLabel = 'Toggle setting',
                               }) {
    const id = useId();



    return (
        <label
            htmlFor={id}
            className={`group relative inline-flex w-11 shrink-0 cursor-pointer rounded-full bg-gray-200 p-0.5 transition-colors duration-200 ease-in-out
                ${checked ? 'bg-indigo-600 dark:bg-indigo-500' : 'dark:bg-white/5'}
            `}
        >
            <span
                className={`size-5 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out
                    ${checked ? 'translate-x-5' : ''}
                `}
            />
            <input
                id={id}
                name={name}
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                aria-label={ariaLabel}
                className="sr-only"
            />
        </label>
    );
}
