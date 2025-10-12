import React from 'react';

export default function DataTable({ columns = [], data = [], emptyMessage = 'No records found.', renderActions }) {
    return (
        <div className="overflow-x-auto bg-white border border-gray-100 rounded-b-xl shadow-sm">
            <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                    {columns.map((col, index) => (
                        <th key={index} className={`p-3 ${col.align || 'text-left'}`}>
                            {col.label}
                        </th>
                    ))}
                    {renderActions && <th className="p-3 text-right">Actions</th>}
                </tr>
                </thead>
                <tbody className="divide-y divide-dashed">
                {data.length > 0 ? (
                    data.map((row, rowIndex) => (
                        <tr key={row.id || rowIndex} className="hover:bg-gray-50">
                            {columns.map((col, colIndex) => (
                                <td key={colIndex} className={`p-3 ${col.align || ''}`}>
                                    {col.render ? col.render(row) : row[col.key]}
                                </td>
                            ))}
                            {renderActions && (
                                <td className="p-3 text-right">{renderActions(row)}</td>
                            )}
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={columns.length + 1} className="text-center py-6 text-gray-400">
                            {emptyMessage}
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}
