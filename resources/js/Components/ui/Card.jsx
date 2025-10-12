import React from "react";

export function Card({ className = "", children, ...props }) {
    return (
        <div className={`bg-white rounded-xl shadow-sm ring-1 ring-gray-200 ${className}`} {...props}>
            {children}
        </div>
    );
}

export function CardHeader({ className = "", children, ...props }) {
    return (
        <div className={`px-4 md:px-5 pt-4 md:pt-5 ${className}`} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({ className = "", children, ...props }) {
    return (
        <h2 className={`text-base md:text-lg font-semibold text-gray-900 ${className}`} {...props}>
            {children}
        </h2>
    );
}

export function CardContent({ className = "", children, ...props }) {
    return (
        <div className={`px-4 md:px-5 pb-4 md:pb-5 ${className}`} {...props}>
            {children}
        </div>
    );
}
