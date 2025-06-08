import Dropdown from '@/Components/Dropdown';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { EllipsisVertical, Eye, Pencil, Search, Trash } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { debounce } from 'lodash';

const Index = ({ properties, search = '', page = 1 }) => {
  const types = ["Apartment", "Commercial", "Condominium", "House", "Land"];
  const [searchTerm, setSearchTerm] = useState(search || '');

  useEffect(() => {
    if (search) setSearchTerm(search);
  }, [search]);

  // Define debounce once using useCallback
  const debouncedSearch = useCallback(
    debounce((value) => {
      router.get('/properties', { page, search: value }, {
        preserveState: true,
        replace: true,
      });
    }, 500),
    [page]
  );

  useEffect(() => {
    return () => debouncedSearch.cancel(); // Cleanup on unmount
  }, [debouncedSearch]);

  const handleSearchTermChange = (value) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleView = (title) => alert(`Viewing ${title}`);
  const handleEdit = (title) => alert(`Editing ${title}`);
  const handleDelete = (title) => {
    if (confirm(`Are you sure you want to delete ${title}?`)) {
      alert(`Deleted ${title}`);
    }
  };

      const imageUrl = '/storage/';


  return (
    <AuthenticatedLayout>
      <div className="p-1 md:p-6 min-h-screen bg-gray-50">
        <div className=" bg-white h-full shadow rounded-2xl overflow-x-auto">
          <div className="p-4 border flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <select name="type" id="type" className="border border-gray-300 rounded-md px-3 py-2">
              {types.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div className="relative w-full md:max-w-md">
              <input
                value={searchTerm}
                onChange={(e) => handleSearchTermChange(e.target.value)}
                type="search"
                name="search"
                placeholder="Search properties..."
                className="border border-gray-300 rounded-md h-10 px-4 pl-10 text-sm text-gray-800 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" />
            </div>
          </div>
          <div className=" h-full">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="border px-4 py-3 font-medium">
                    <input type="checkbox" />
                  </th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Size (sqm)</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {properties.data.length > 0 ? (
                  properties.data.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 border">
                        <input type="checkbox" name={property.title} id={property.id} />
                      </td>
                      <td className="px-4 py-4 flex items-center gap-4 whitespace-nowrap">

                        <img
                          src={`${imageUrl}${property.image_url}`}
                          alt={property.title}
                          className=" h-20 w-20  object-cover"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">{property.title}</div>
                          <div className="text-xs text-gray-500">{property.address}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>{property.property_type}, {property.sub_type}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>{property.price}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-300">
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>{property?.floor_area} {property?.lot_area} sqm</div>
                      </td>
                      <td className="flex justify-end whitespace-nowrap relative px-4 py-4">
                        <Dropdown>
                          <Dropdown.Trigger>
                            <div
                              className="hover:bg-gray-200 p-2 rounded-full transition duration-150 cursor-pointer"
                              aria-haspopup="true"
                              aria-expanded="false"
                            >
                              <EllipsisVertical size={20} className="text-gray-600" />
                            </div>
                          </Dropdown.Trigger>
                          <Dropdown.Content className="absolute right-0 top-10 origin-top-right rounded-md bg-white shadow-md ring-1 ring-black ring-opacity-5 z-[9999] py-1 text-sm text-gray-700 w-36">
                            <ul role="menu" className="divide-y divide-gray-100">
                              <li
                                role="menuitem"
                                onClick={() => handleView(property.title)}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              >
                                <Eye size={16} className="text-gray-500" />
                                View
                              </li>
                              <li
                                role="menuitem"
                                onClick={() => handleEdit(property.title)}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              >
                                <Pencil size={16} className="text-blue-500" />
                                Edit
                              </li>
                              <li
                                role="menuitem"
                                onClick={() => handleDelete(property.title)}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer"
                              >
                                <Trash size={16} className="text-red-500" />
                                Delete
                              </li>
                            </ul>
                          </Dropdown.Content>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-gray-500">
                      No properties found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Index;
