import React from "react";

export default function  PageHeader({ title, subtitle, action }) {
    return (
        <div className="page-header">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="section-title">{title}</h1>
                    {subtitle && (
                        <p className="section-description">{subtitle}</p>
                    )}
                </div>
                {action && (
                    <div className="flex items-center gap-3">
                        {action}
                    </div>
                )}
            </div>
        </div>
    );
}
