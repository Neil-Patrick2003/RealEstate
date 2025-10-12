import { motion } from 'framer-motion';
import { useLayoutEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';

const tabs = [
    { name: 'all', color: 'black' },
    { name: 'my', color: 'green' },
    { name: 'buyer', color: 'orange' },
];

export default function     AgentInquiriesFilterTab({
                                                    count = [],
                                                    selectedStatus,
                                                    selectedType,
                                                    setSelectedType,
                                                    page,
                                                    selectedItemsPerPage,
                                                }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const tabsRef = useRef([]);
    const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

    useLayoutEffect(() => {
        const index = tabs.findIndex((tab) => tab.name === selectedType);
        if (index !== -1) {
            setSelectedIndex(index);
            const current = tabsRef.current[index];
            if (current) {
                const { offsetLeft, offsetWidth } = current;
                setUnderlineStyle({ left: offsetLeft, width: offsetWidth });
            }
        }
    }, [selectedType]);

    // Simple badge color - you can customize further if needed
    const getBadgeClass = (name, isActive) => {
        const normalized = name.toLowerCase();
        const map = {
            all: isActive ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700',
            my: isActive ? 'bg-primary text-white' : 'bg-lightaccent text-green-800',
            buyer: isActive ? 'bg-secondary text-white' : 'bg-orange-100 text-secondary',
        };
        return map[normalized] || 'bg-gray-100 text-gray-800';
    };


    const selectTab = (idx, name) => {
        setSelectedIndex(idx);
        setSelectedType(name);

        router.get(
            '/agents/inquiries',
            {
                items_per_page: selectedItemsPerPage,
                page: 1,
                status: selectedStatus,
                type: name,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    return (
        <div className="relative border-b border-gray-300 px-4 pt-4">
            <div className="relative flex justify-start space-x-1">
                {tabs.map((tab, idx) => {
                    const isActive = tab.name === selectedType;
                    return (
                        <button
                            key={tab.name}
                            ref={(el) => (tabsRef.current[idx] = el)}
                            onClick={() => selectTab(idx, tab.name)}
                            className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                                isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {/* Capitalize label */}
                            {tab.name.charAt(0).toUpperCase() + tab.name.slice(1)}
                            {count[idx] !== undefined && (
                                <span
                                    className={`text-xs font-semibold px-3 py-1 rounded-md ${getBadgeClass(tab.name, isActive)}`}
                                >
                    {count[idx]}
                </span>
                            )}
                        </button>
                    );
                })}


                <motion.div
                    className="absolute bottom-0 h-0.5 bg-indigo-600"
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    style={underlineStyle}
                />
            </div>
        </div>
    );
}
