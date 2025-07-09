import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function InquiriesCollapsable({ header, children }) {
    const [open, setOpen] = useState(false);
    const contentRef = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (!contentRef.current || !wrapperRef.current) return;

        if (open) {
            const scrollHeight = wrapperRef.current.scrollHeight;
            contentRef.current.style.height = scrollHeight + "px";

            const timeout = setTimeout(() => {
                contentRef.current.style.height = "auto"; // allow flexible height
            }, 300);

            return () => clearTimeout(timeout);
        } else {
            const currentHeight = wrapperRef.current.offsetHeight;
            contentRef.current.style.height = currentHeight + "px";
            requestAnimationFrame(() => {
                contentRef.current.style.height = "0px";
            });
        }
    }, [open]);

    return (
        <div className="rounded-lg border transition-all duration-300 bg-white overflow-hidden">
            {/* Header */}
            <div
                onClick={() => setOpen(!open)}
                className="cursor-pointer px-6 py-5 sm:px-7 lg:px-8 flex justify-between items-start sm:items-center hover:bg-gray-50 transition-colors"
            >
                <div className='w-full'>{header}</div>
                <ChevronDown
                    className={`mt-1 w-6 h-6 text-gray-500 transform transition-transform duration-300 ${
                        open ? 'rotate-180' : ''
                    }`}
                />
            </div>

            {/* Animated Content */}
            <div
                ref={contentRef}
                className="transition-all duration-300 ease-in-out overflow-hidden"
                style={{ height: open ? 'auto' : '0px' }}
            >
                <div
                    ref={wrapperRef}
                    className="bg-white border-t border-gray-200 text-gray-700"
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
