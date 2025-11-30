import React, { useState } from "react";
import { Smartphone, Monitor, Loader } from "lucide-react";

export default function DataTable({
                                      columns,
                                      data,
                                      actions,
                                      getRowId,
                                      isLoading = false,
                                      emptyMessage = "No records found.",
                                  }) {
    const [isMobile, setIsMobile] = useState(false);

    const resolveRowId = (row, index) => {
        if (typeof getRowId === "function") return getRowId(row, index);
        return row.id ?? index;
    };

    // Check mobile on mount and resize
    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const renderActions = (row, isCardView = false) => {
        if (!actions) return null;

        const actionList = typeof actions === "function" ? actions(row) : actions;
        if (!actionList || actionList.length === 0) return null;

        return (
            <div className={`flex gap-2 ${isCardView ? 'flex-wrap justify-stretch' : 'justify-end flex-wrap'}`}>
                {actionList.map((action, idx) => {
                    const base =
                        "inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

                    const variants = {
                        primary:
                            "bg-primary text-white hover:bg-primary/90 focus:ring-primary shadow-sm",
                        secondary:
                            "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500 shadow-xs",
                        danger:
                            "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
                        ghost:
                            "text-gray-600 hover:text-gray-800 hover:bg-gray-50 focus:ring-gray-500 border border-transparent hover:border-gray-300",
                    };

                    const variantClass = variants[action.variant || "secondary"];

                    return (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => action.onClick(row)}
                            disabled={action.disabled}
                            className={`${base} ${variantClass} ${
                                isCardView ? "flex-1 min-w-[100px] justify-center" : ""
                            } ${action.className || ""}`}    // ⬅️ allow per-action override
                        >
                            {action.icon && (
                                <action.icon className="h-3 w-3 mr-1.5" />
                            )}
                            {action.label}
                        </button>
                    );
                })}
            </div>
        );
    };


    const renderCardView = () => {
        return (
            <div className="p-4 sm:p-6 space-y-4">
                {data.map((row, index) => (
                    <div
                        key={resolveRowId(row, index)}
                        className="group bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-xs hover:shadow-md hover:border-gray-300 transition-all duration-300"
                    >
                        <div className="space-y-4">
                            {columns.map((col) => {
                                const content = col.render
                                    ? col.render(row)
                                    : col.field
                                        ? row[col.field]
                                        : null;

                                return (
                                    <div key={col.key} className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                                            {col.header}
                                        </span>
                                        <div className={`text-gray-900 ${col.className || ""}`}>
                                            {content}
                                        </div>
                                    </div>
                                );
                            })}

                            {actions && (
                                <div className="pt-4 border border-t border-gray-100">
                                    {renderActions(row, true)}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderTableView = () => {
        return (
            <div className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-75">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    scope="col"
                                    className="px-4 py-4 sm:px-6 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                        {col.header}
                                    </div>
                                </th>
                            ))}
                            {actions && (
                                <th className="px-4 py-4 sm:px-6 sm:py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                    <div className="flex items-center gap-2 justify-end">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                        Actions
                                    </div>
                                </th>
                            )}
                        </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-100">
                        {data.map((row, index) => (
                            <tr
                                key={resolveRowId(row, index)}
                                className="group hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-75 transition-all duration-200"
                            >
                                {columns.map((col) => {
                                    const content = col.render
                                        ? col.render(row)
                                        : col.field
                                            ? row[col.field]
                                            : null;

                                    return (
                                        <td
                                            key={col.key}
                                            className={`px-4 py-4 sm:px-6 sm:py-4 text-sm text-gray-900 whitespace-nowrap ${
                                                col.className || ""
                                            }`}
                                        >
                                            {content}
                                        </td>
                                    );
                                })}

                                {actions && (
                                    <td className="px-4 py-4 sm:px-6 sm:py-4 whitespace-nowrap">
                                        {renderActions(row)}
                                    </td>
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-sm transition-shadow duration-300">
            {/* Loading State */}
            {isLoading ? (
                <div className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="relative">
                            <Loader className="h-8 w-8 text-blue-600 animate-spin" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-gray-900 font-medium">Loading data</p>
                            <p className="text-sm text-gray-500">Please wait while we fetch your records</p>
                        </div>
                    </div>
                </div>
            ) : data.length === 0 ? (
                // Empty State
                <div className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                            <div className="text-2xl">📊</div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-900">No records found</h3>
                            <p className="text-gray-500 max-w-sm mx-auto text-sm leading-relaxed">
                                {emptyMessage}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                // Data Display
                <>
                    {/* Mobile Card View */}
                    <div className="lg:hidden">
                        {renderCardView()}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden lg:block">
                        {renderTableView()}
                    </div>
                </>
            )}

            {/* Footer */}
            {data.length > 0 && !isLoading && (
                <div className="px-4 py-4 sm:px-6 bg-gradient-to-r from-gray-50 to-gray-75 border-t border-gray-200 rounded-b-2xl">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-semibold text-gray-900">{data.length}</span> {data.length === 1 ? 'record' : 'records'}
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <Smartphone className="h-4 w-4" />
                                    <span className="lg:hidden">Mobile view</span>
                                </div>
                                <div className="w-px h-4 bg-gray-300"></div>
                                <div className="flex items-center gap-1.5">
                                    <Monitor className="h-4 w-4" />
                                    <span className="hidden lg:inline">Table view</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
