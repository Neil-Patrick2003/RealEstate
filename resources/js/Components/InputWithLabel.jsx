import { useEffect, useId, useRef } from 'react';

export default function InputLabel({
    value,
    className = '',
    children,
    id,
    hasError = false, // 👈 new prop
    ...props
}) {
    const generatedId = useId();
    const inputId = id || generatedId;
    const inputRef = useRef(null);

    // Focus input when hasError becomes true
    useEffect(() => {
        if (hasError && inputRef.current) {
            inputRef.current.focus();
        }
    }, [hasError]);

    return (
        <div className={`relative w-full ${className}`}>
            <input
                ref={inputRef}
                id={inputId}
                type="text"
                required
                placeholder=" "
                className={`peer w-full border ${
                    hasError ? 'border-red-500 ring-1 ring-red-300' : 'border-gray-300'
                } rounded-md px-4 py-4 text-base text-green-500 placeholder-transparent focus:outline-none  focus:ring-0 focus:border-green-500`}
                {...props}
            />
            <label
                htmlFor={inputId}
                className="absolute left-3  top-2 px-1 bg-white text-gray-600 uppercase tracking-wide transition-all duration-200 pointer-events-none 
                    peer-placeholder-shown:top-4 peer-placeholder-shown:text-base 
                    peer-focus:text-xs peer-focus:top-[-10px] peer-focus:text-green-600 
                    peer-valid:text-xs peer-valid:top-[-10px]"
            >
                {value ? value : children}
            </label>
        </div>
    );
}
