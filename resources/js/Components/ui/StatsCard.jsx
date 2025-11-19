import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";

export default function StatsCard({ title, value, trend, icon, color = "primary" }) {
    const colorClasses = {
        primary: "bg-primary-50 text-primary-600",
        accent: "bg-emerald-50 text-emerald-600",
        warning: "bg-amber-50 text-amber-600",
        secondary: "bg-gray-50 text-gray-600"
    };

    return (
        <div className="card-hover p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    {trend && (
                        <p className={`text-xs font-medium mt-1 ${
                            trend.direction === 'up' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                            {trend.value} {trend.direction === 'up' ? '↗' : '↘'}
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <FontAwesomeIcon icon={icon} className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
}

