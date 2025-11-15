import React from 'react';
import { Head } from '@inertiajs/react';

// The project data is passed as a prop from your Laravel controller
const ProjectShow = ({ project }) => {

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <Head title={project.name} />

            <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-8">

                {/* --- Project Header --- */}
                <header className="mb-10 border-b pb-4">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-1">
                        {project.name}
                    </h1>

                    {/* Display Developer Name */}
                    {project.developer && (
                        <p className="text-lg text-emerald-600 font-semibold">
                            Developed by: {project.developer.name}
                        </p>
                    )}
                    <p className="text-gray-500 mt-2">{project.address} &bull; Type: {project.type}</p>
                </header>

                {/* --- Inventory Pools Section --- */}
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                    Available Inventory Pools ({project.inventory_pools.length})
                </h2>

                <div className="space-y-6">
                    {project.inventory_pools.map((pool) => (
                        <div
                            key={pool.id}
                            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition duration-300"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                {/* Block Information */}
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                        Location
                                    </p>
                                    <p className="text-2xl font-semibold text-emerald-700 mt-1">
                                        {pool.block.block_code}
                                    </p>
                                </div>

                                {/* House Type Information */}
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                        House Model
                                    </p>
                                    <p className="text-2xl font-semibold text-gray-900 mt-1">
                                        {pool.house_type.name} ({pool.house_type.code})
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Floor Area: {parseFloat(pool.house_type.floor_area_sqm).toFixed(2)} sqm
                                    </p>
                                </div>

                                    {/* Inventory Status */}
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                        Base Price
                                    </p>
                                    <p className="text-2xl font-bold text-red-600 mt-1">
                                        {/* Simple formatting for currency. Use a proper library for production. */}
                                        ₱ {parseFloat(pool.house_type.base_price).toLocaleString('en-US')}
                                    </p>

                                    <p className="text-sm mt-3">
                                        <span className="font-bold text-green-600">{pool.total - (pool.held + pool.reserved + pool.sold)}</span> available out of <span className="font-bold">{pool.total}</span> total units
                                    </p>
                                </div>
                            </div>

                            {/* Detailed Inventory Breakdown (Optional) */}
                            <div className="mt-4 pt-4 border-t text-sm flex justify-between">
                                <span className="text-gray-600">Total Units: <span className="font-bold">{pool.total}</span></span>
                                <span className="text-yellow-600">Held/Reserved: <span className="font-bold">{pool.held + pool.reserved}</span></span>
                                <span className="text-blue-600">Sold: <span className="font-bold">{pool.sold}</span></span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProjectShow;
