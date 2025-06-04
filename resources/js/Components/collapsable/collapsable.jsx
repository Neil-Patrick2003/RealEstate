import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Collapsable({ title = "Click to toggle", children, description }) {
  const [open, setOpen] = useState(true);
  const contentRef = useRef(null);

  useEffect(() => {
    if (open) {
      contentRef.current.style.maxHeight = contentRef.current.scrollHeight + 'px';
    } else {
      contentRef.current.style.maxHeight = '0px';
    }
  }, [open]);

  return (
    <div className="rounded-2xl border border-gray-200 shadow-sm transition-all duration-300 bg-white overflow-hidden">
      {/* Header */}
      <div
        onClick={() => setOpen(!open)}
        className="cursor-pointer px-6 py-5 sm:px-7 lg:px-8 flex justify-between items-start sm:items-center hover:bg-gray-50 transition-colors"
      >
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800">{title}</h1>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
        <ChevronDown
          className={`mt-1 w-6 h-6 text-gray-500 transform rounded-full hover:bg-gray-200 transition-transform duration-300 ${
            open ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: '0px' }}
      >
        <div className="px-6 py-3 md:py-4 lg:py-5 sm:px-7 lg:px-8 bg-white border-t border-gray-200 text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
}
