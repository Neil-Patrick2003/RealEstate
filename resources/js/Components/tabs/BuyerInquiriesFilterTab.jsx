import { motion } from 'framer-motion';
import { useEffect, useRef, useLayoutEffect, useState } from 'react';
import { router } from '@inertiajs/react';

const tabs = [
    { name: 'All', color: 'black' },
    { name: 'Pending', color: 'orange' },
    { name: 'Accepted', color: 'green' },
    { name: 'Cancelled', color: 'yello' },
    { name: 'Rejected', color: 'red' },

];

export default function BuyerInquiriesFilterTab({ count, selectedStatus, setSelectedStatus }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const tabsRef = useRef([]);
    const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

    useLayoutEffect(() => {
        const index = tabs.findIndex(tab => tab.name === selectedStatus);
        if (index !== -1) {
            setSelectedIndex(index);
            const current = tabsRef.current[index];
            if (current) {
                const { offsetLeft, offsetWidth } = current;
                setUnderlineStyle({ left: offsetLeft, width: offsetWidth });
            }
        }
    }, [selectedStatus]);

    const getBadgeClass = (name, isActive) => {
        const colorMap = {
            All: isActive ? 'bg-black text-white' : 'bg-black text-white',
            Pending: isActive ? 'bg-orange-400 text-white' : 'bg-orange-100 text-orange-800',
            Accepted: isActive ? 'bg-green-400 text-white' : 'bg-green-100 text-green-800',
            Cancelled: isActive ? 'bg-yellow-400 text-white' : 'bg-red-100 text-red-800',
            Rejected: isActive ? 'bg-red-400 text-white' : 'bg-red-100 text-red-800',


        };
        return colorMap[name] || 'bg-gray-100 text-gray-800';
    };

    const selectTab = (idx, name) => {
        setSelectedIndex(idx);
        setSelectedStatus(name);

        router.get('/inquiries', {

            status: name,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <div className="relative border-b border-gray-300 px-4 pt-4">
            <div className="relative flex justify-start space-x-1">
                {tabs.map((tab, idx) => {
                    const isActive = tab.name === selectedStatus;
                    return (
                        <button
                            key={tab.name}
                            ref={(el) => (tabsRef.current[idx] = el)}
                            onClick={() => selectTab(idx, tab.name)}
                            className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                                isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.name}
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
