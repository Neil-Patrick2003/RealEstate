import { Transition } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import { createContext, useContext, useRef, useState, useEffect } from 'react';

const DropDownContext = createContext();

const Dropdown = ({ children }) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef();

    const toggleOpen = () => setOpen((prev) => !prev);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div className="relative" ref={dropdownRef}>
                {children}
            </div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({ children }) => {
    const { toggleOpen } = useContext(DropDownContext);

    return (
        <div onClick={toggleOpen} className="cursor-pointer">
            {children}
        </div>
    );
};

const Content = ({
                     align = 'right',
                     width = 'auto',
                     contentClasses = 'py-1 bg-white dark:bg-gray-700',
                     children,
                 }) => {
    const { open } = useContext(DropDownContext);

    const alignmentClasses = {
        left: 'ltr:origin-top-left rtl:origin-top-right left-0',
        right: 'ltr:origin-top-right rtl:origin-top-left right-0',
        center: 'left-1/2 -translate-x-1/2 origin-top',
    }[align] || 'right-0';

    const widthClass = {
        auto: 'w-auto',
        full: 'w-full',
        48: 'w-48',
        64: 'w-64',
        80: 'w-80',
    }[width] || 'w-auto';

    return (
        <Transition
            show={open}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
        >
            <div
                className={`absolute z-50 mt-2 rounded-md shadow-lg ${alignmentClasses} ${widthClass}`}
            >
                <div
                    className={`rounded-md ring-1 ring-black ring-opacity-5 ${contentClasses}`}
                >
                    {children}
                </div>
            </div>
        </Transition>
    );
};

const DropdownLink = ({ className = '', children, ...props }) => {
    return (
        <Link
            {...props}
            className={
                'block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:bg-gray-800 ' +
                className
            }
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
