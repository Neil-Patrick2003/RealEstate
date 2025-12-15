'use client';

import { Switch } from '@headlessui/react';

function cn(...parts) {
    return parts.filter(Boolean).join(' ');
}

const SIZES = {
    sm: { track: 'h-5 w-9',  thumb: 'h-3 w-3', on: 'translate-x-5', off: 'translate-x-1' },
    md: { track: 'h-6 w-11', thumb: 'h-4 w-4', on: 'translate-x-6', off: 'translate-x-1' },
    lg: { track: 'h-7 w-14', thumb: 'h-5 w-5', on: 'translate-x-8', off: 'translate-x-1' },
};

export default function Toggle({
                                   checked,
                                   onChange,
                                   disabled = false,
                                   size = 'md',
                                   onClass = 'bg-accent',
                                   offClass = 'bg-gray-300',
                                   className,
                                   thumbClassName,
                                   srLabel = 'Toggle',
                               }) {
    const isOn = Boolean(checked);
    const s = SIZES[size] ?? SIZES.md;

    return (
        <Switch
            checked={isOn}
            onChange={onChange}
            disabled={disabled}
            className={cn(
                'relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none',
                'focus-visible:ring-2 focus-visible:ring-offset-2',
                s.track,
                isOn ? onClass : offClass,
                disabled && 'cursor-not-allowed opacity-60',
                className
            )}
        >
            <span className="sr-only">{srLabel}</span>

            <span
                className={cn(
                    'inline-block transform rounded-full bg-white transition-transform duration-200',
                    s.thumb,
                    isOn ? s.on : s.off,
                    thumbClassName
                )}
            />
        </Switch>
    );
}
