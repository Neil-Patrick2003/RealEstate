// Import necessary components and libraries
import Dropdown from '@/Components/Dropdown';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { EllipsisVertical, Eye, Pencil, Search, Trash } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import { Link, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import SellerPropertiesFilterTab from '@/Components/tabs/SellerPropetiesFilterTab';

// Main component
const Index = ({ properties, search = '', page = 1, itemsPerPage = 10, status='', all, approved, rejected, pending }) => {
  // Property types
  const types = ["Apartment", "Commercial", "Condominium", "House", "Land"];

  // Local state for search and pagination
  const [searchTerm, setSearchTerm] = useState(search || '');
  const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(itemsPerPage);
  const [selectedStatus, setSelectedStatus] = useState(status || 'All');


  // Sync initial searchTerm when `search` prop changes
  useEffect(() => {
    if (search) setSearchTerm(search);
  }, [search]);

  // Sync initial searchTerm when `search` prop changes
  useEffect(() => {
    if (status) setSelectedStatus(status);
  }, [status]);


  // Debounced search handler to reduce frequent API calls
  const debouncedSearch = useCallback(
    debounce((value) => {
      router.get('/properties', { page, search: value, items_per_page: selectedItemsPerPage, status: selectedStatus}, {
        preserveState: true,
        replace: true,
      });
    }, 500),
    [page, selectedItemsPerPage]
  );

  // Cleanup debounce on component unmount
  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  // Handle typing in the search input
  const handleSearchTermChange = (value) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Handle changing the number of items displayed per page
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = e.target.value;
    setSelectedItemsPerPage(newItemsPerPage);
    router.get('/properties', { page: 1, search: searchTerm, items_per_page: newItemsPerPage, status: selectedStatus  }, { preserveState: true, replace: true });
  };

  // const handleStatusFilter = (e) => {
  //   const 
  // }

  // Actions for each property (view/edit/delete)
  const handleView = (title) => alert(`Viewing ${title}`);
  const handleEdit = (title) => alert(`Editing ${title}`);
  const handleDelete = (title) => {
    if (confirm(`Are you sure you want to delete ${title}?`)) {
      alert(`Deleted ${title}`);
    }
  };

  const imageUrl = '/storage/'; // Base path for property images

  console.log



  return (
    <AuthenticatedLayout>
      <div className="md:p-6 min-h-screen">
        <div className="bg-white shadow-sm h-full rounded-2xl overflow-x-auto">
          
          
          {/* Filter tab for property status counts and search */}
          <div className='flex flex-row justify-between border-b'>
            <SellerPropertiesFilterTab
              count={[all, pending, approved, rejected]}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              searchTerm={searchTerm}
              page={page}
              selectedItemsPerPage={selectedItemsPerPage}
            />
            <div className="relative pt-4 pr-6 w-full md:max-w-md">
              <input
                value={searchTerm}
                onChange={(e) => handleSearchTermChange(e.target.value)}
                type="search"
                name="search"
                placeholder="Search properties..."
                className="border border-gray-300 rounded-md h-10 px-4 pl-10 text-sm text-gray-600 w-full shadow-sm "
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div> 
          </div>

          {/* Property listing table */}
          <div className="h-full">
            <table className="min-w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="p-2 font-medium">
                    <center><input type="checkbox" id='all' className='border border-gray-700 p-2 rounded'/></center>
                  </th>
                  <th className="py-4 px-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Size (sqm)</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Loop through each property item */}
                {properties.data.length > 0 ? (
                  properties.data.map((property) => (
                    <tr key={property.id} className="p-2hover:bg-gray-50 transition-colors">
                      <td>
                        <center>
                          <input type="checkbox" id={property.id} className='border border-gray-700 p-2 rounded'/>
                        </center>
                      </td>

                      {/* Property title with image */}
                      <td className="py-4 px-3 flex items-center gap-4 whitespace-nowrap">
                        <img
                          src={`${imageUrl}${property.image_url}`}
                          alt={property.title}
                          className="h-16 w-16 object-cover rounded-md"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">{property.title}</div>
                          <div className="text-xs text-gray-500">{property.address}</div>
                        </div>
                      </td>

                      {/* Property details */}
                      <td className="p-4 whitespace-nowrap">{property.property_type}, {property.sub_type}</td>
                      <td className="p-4 whitespace-nowrap">{property.price}</td>
                      <td className="p-4">

                       
                        
                        <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700 ring-1 ring-inset ring-green-300">
                          {property.status}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">{property?.floor_area} {property?.lot_area} sqm</td>

                      {/* Dropdown menu for actions */}
                      <td className="flex justify-end whitespace-nowrap relative p-4">
                        <Dropdown>
                          <Dropdown.Trigger>
                            <div className="hover:bg-gray-200 p-2 rounded-full cursor-pointer">
                              <EllipsisVertical size={20} className="text-gray-600" />
                            </div>
                          </Dropdown.Trigger>
                          <Dropdown.Content className="absolute right-0 top-10 origin-top-right rounded-md bg-white shadow-md ring-1 ring-black ring-opacity-5 z-[9999] py-1 text-sm text-gray-700 w-36">
                            <ul role="menu" className="divide-y divide-gray-100">
                              <li role="menuitem" onClick={() => handleView(property.title)} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                <Eye size={16} className="text-gray-500" /> View
                              </li>
                              <li role="menuitem" onClick={() => handleEdit(property.title)} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                <Pencil size={16} className="text-blue-500" /> Edit
                              </li>
                              <li role="menuitem" onClick={() => handleDelete(property.title)} className="flex items-center gap-2 px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer">
                                <Trash size={16} className="text-red-500" /> Delete
                              </li>
                            </ul>
                          </Dropdown.Content>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
                ) : (
                  // Display message if no properties are available
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-gray-500">
                      No properties found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {/* pagination settings */}
          <div className=" flex border justify-between flex-col gap-4 md:flex-row md:items-center md:justify-between">
            
            {/* Dropdown: Items per page */}
            <select
              value={selectedItemsPerPage}
              onChange={handleItemsPerPageChange}
              className="w-20 border-gray-300 rounded-md text-sm mt-4 ml-4"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
            <div className="flex justify-end items-end gap-2 p-2 mr-3 mt-4">
              {properties.links.map((link, i) => {
                const query = new URLSearchParams({
                  search: searchTerm || '',
                  status: selectedStatus || '',
                  items_per_page: selectedItemsPerPage,
                });

                const urlWithParams = link.url ? `${link.url}&${query.toString()}` : null;

                return link.url ? (
                  <Link
                    key={i}
                    href={urlWithParams}
                    className={`px-4 py-2 text-sm font-medium rounded-md border border-gray-200 transition-all ${
                      link.active ? 'bg-green-500 text-white font-bold' : 'bg-white text-gray-700 hover:bg-green-100'
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ) : (
                  <span
                    key={i}
                    className="px-4 py-2 text-sm font-medium text-slate-400 bg-white border border-gray-200 rounded-md cursor-not-allowed"
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                );
              })}
            </div>
          </div>     
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Index;
