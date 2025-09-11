import { motion } from 'framer-motion';
import { useLayoutEffect, useRef, useState } from 'react';

export default function FilterTabs({
                                       tabs = [],
                                       counts = [],
                                       selectedTab,
                                       setSelectedTab,
                                       onTabChange = () => {},
                                       getBadgeClass = () => '',
                                   }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const tabsRef = useRef([]);
    const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

    useLayoutEffect(() => {
        const index = tabs.findIndex((tab) => tab.name === selectedTab);
        if (index !== -1) {
            setSelectedIndex(index);
            const current = tabsRef.current[index];
            if (current) {
                const { offsetLeft, offsetWidth } = current;
                setUnderlineStyle({ left: offsetLeft, width: offsetWidth });
            }
        }
    }, [selectedTab, tabs]);

    const selectTab = (idx, name) => {
        setSelectedIndex(idx);
        setSelectedTab(name);     // update selected tab state
        onTabChange(name);        // use fresh name, not outdated state
    };

    return (
        <div className="relative border-b border-gray-300 px-4 pt-4">
            <div className="relative flex justify-start space-x-1">
                {tabs.map((tab, idx) => {
                    const isActive = tab.name === selectedTab;
                    return (
                        <button
                            key={tab.name}
                            ref={(el) => (tabsRef.current[idx] = el)}
                            onClick={() => selectTab(idx, tab.name)}
                            className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                                isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label || (tab.name.charAt(0).toUpperCase() + tab.name.slice(1))}
                            {counts[idx] !== undefined && (
                                <span
                                    className={`text-xs font-semibold px-3 py-1 rounded-md ${getBadgeClass(tab.name, isActive)}`}
                                >
                                    {counts[idx]}
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
