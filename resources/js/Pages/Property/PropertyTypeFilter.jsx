import React from 'react';

const PropertyTypeFilter = ({ types, selectedTypes, onChange }) => {
    const handleCheckboxChange = (event) => {
        const { value, checked } = event.target;
        onChange(value, checked);
    };

    return (
        <div className="space-y-2">
            <h3 className="font-semibold text-lg">Filter by Property Type</h3>
            <div className="space-y-1">
                {types.map((type) => (
                    <label key={type} className="inline-flex items-center space-x-2">
                        <input
                            type="checkbox"
                            value={type}
                            checked={selectedTypes.includes(type)}
                            onChange={handleCheckboxChange}
                            className="form-checkbox"
                        />
                        <span>{type}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default PropertyTypeFilter;
