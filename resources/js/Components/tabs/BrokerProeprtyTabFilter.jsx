import { motion } from 'framer-motion';
import { useEffect, useRef, useLayoutEffect, useState } from 'react';
import { router } from '@inertiajs/react';

const tabs = [
    { name: 'All', color: 'black' },
    { name: 'Published', color: 'blue' },
    { name: 'Assigned', color: 'green' },
    { name: 'Unpublished', color: 'red' },
];

export default function BrokerPropertyTabFilter({
                                                          count = [],
                                                          selectedStatus,
                                                          setSelectedStatus,
                                                          page,
                                                          selectedItemsPerPage,
                                                          search = '',
                                                          propertyType = '',
                                                          subType = '',
                                                          location = '',
                                                      }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const tabsRef = useRef([]);
    const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

    useLayoutEffect(() => {
        const index = tabs.findIndex(tab => tab.name === selectedStatus);
        const safeIndex = index !== -1 ? index : 0;
        setSelectedIndex(safeIndex);

        const current = tabsRef.current[safeIndex];
        if (current) {
            const { offsetLeft, offsetWidth } = current;
            setUnderlineStyle({ left: offsetLeft, width: offsetWidth });
        }
    }, [selectedStatus]);

    const getBadgeClass = (name, isActive) => {
        const map = {
            All: isActive ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700',
            Published: isActive ? 'bg-secondary text-white' : 'bg-orange-100 text-secondary',
            Assigned: isActive ? 'bg-accent text-white' : 'bg-lightaccent text-green-800',
            Unpublished: isActive ? 'bg-primary text-white' : 'bg-lightaccent text-primary',
        };
        return map[name] || 'bg-gray-100 text-gray-800';
    };

    const selectTab = (idx, name) => {
        setSelectedIndex(idx);
        setSelectedStatus(name);

        router.get('/broker/properties', {
            page: 1,
            status: name,
            items_per_page: selectedItemsPerPage,
            search,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <div className="relative border-b overflow-x-auto border-gray-300 px-4 pt-4">
            <div className="relative flex justify-start space-x-1">
                {tabs.map((tab, idx) => {
                    const isActive = tab.name === selectedStatus || (!selectedStatus && tab.name === 'All');
                    return (
                        <button
                            key={tab.name}
                            ref={(el) => (tabsRef.current[idx] = el)}
                            onClick={() => selectTab(idx, tab.name)}
                            className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                                isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.name.replace('_', ' ')}
                            {count?.[idx] !== undefined && (
                                <span className={`text-xs font-semibold px-3 py-1 rounded-md ${getBadgeClass(tab.name, isActive)}`}>
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
