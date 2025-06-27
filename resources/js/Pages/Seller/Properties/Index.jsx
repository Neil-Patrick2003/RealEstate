// Import necessary components and libraries
import Dropdown from '@/Components/Dropdown';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { EllipsisVertical, Search,  } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import { Link, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import SellerPropertiesFilterTab from '@/Components/tabs/SellerPropetiesFilterTab';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPenToSquare, faExpand, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import ConfirmDialog from '@/Components/modal/ConfirmDialog';
// Main component
const Index = ({ properties, search = '', page = 1, itemsPerPage = 10, status='', all, approved, rejected, pending }) => {
  // Property types

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
    [page, selectedItemsPerPage, selectedStatus]
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



  const imageUrl = '/storage/'; // Base path for property images
  const [openDeleteDiaglog, setOpenDeleteDialog] = useState(false);
  const [ deletingId, setDeletingId] = useState(false);

  const handleOpenDeleteDialog = (id) => {
    setOpenDeleteDialog(true);
    setDeletingId(id);
  }

  const handleDelete = () => {
      if (!deletingId) return;

      router.delete(`/properties/${deletingId}`, {
        onSuccess: () => {
          setDeletingId(null);
        },
      });
    };


  return (
    <AuthenticatedLayout>
      <ConfirmDialog
        open={openDeleteDiaglog}
        setOpen={setOpenDeleteDialog}
        title="Delete Image"
        description="Are you sure you want to delete this image?"
        confirmText="Delete"
        cancelText="Cancel"x
        onConfirm={handleDelete}
        loading={false}
      />

          <div className="max-w-7xl mx-auto min-h-screen px-4 py-6 space-y-6">
        {/* Page Heading */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Properties</h1>
            <p className="text-sm text-gray-500">Manage your properties here.</p>
          </div>
          <Link href='/post-property'>
            <button className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-accent shadow-sm">
              <FontAwesomeIcon icon={faPlus} />
              Add Property
            </button>
          </Link>

        </div>

        {/* Filters & Search */}
        <div className='flex min-h-[50vh] flex-col bg-white rounded-b-xl shadow-sm'>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-gray-100 rounded-t-xl shadow-sm">
            <div className="w-full md:w-auto overflow-x-auto">
              <SellerPropertiesFilterTab
                count={[all, pending, approved, rejected]}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                searchTerm={searchTerm}
                page={page}
                selectedItemsPerPage={selectedItemsPerPage}
              />
            </div>
            <div className="relative w-full md:w-96">
              <input
                type="search"
                value={searchTerm}
                name='searchProperty'
                onChange={(e) => handleSearchTermChange(e.target.value)}
                placeholder="Search properties..."
                className="w-full h-10 pl-10 pr-4 rounded-md border border-gray-300 text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-green-200 focus:outline-none"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            </div>
          </div>

          {/* Properties Table */}
          <div className="bg-white border border-gray-100 ">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100 sticky top-0 z-10 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="p-3 text-center">
                    <input type="checkbox" id='deleteAll' className="rounded border-gray-400" />
                  </th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Size (sqm)</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed">
                {properties.data.length > 0 ? (
                  properties.data.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="p-3 text-center">
                        <input type="checkbox" id={property.id} className="rounded border-gray-400" />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={`${imageUrl}${property.image_url}`}
                            alt={property.title}
                            className="w-14 h-14 object-cover rounded-md"
                          />
                          <div>
                            <p className="font-semibold text-gray-800">{property.title}</p>
                            <p className="text-xs text-gray-500">{property.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">{property.property_type}, {property.sub_type}</td>
                      <td className="p-3 whitespace-nowrap">{property.price}</td>
                      <td className="p-3">
                        <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs ring-1 ring-orange-200">
                          {property.status}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">{property.floor_area ?? 0} / {property.lot_area ?? 0}</td>
                      <td className="p-3 text-right">
                        <Dropdown>
                          <Dropdown.Trigger>
                            <div className="p-2 w-9 rounded-full hover:bg-gray-200 cursor-pointer">
                              <EllipsisVertical size={20} className="text-gray-600" />
                            </div>
                          </Dropdown.Trigger>
                          <Dropdown.Content className="absolute right-0 top-10 w-36 bg-white shadow-md rounded-md z-50 text-sm">
                            <ul className="divide-y divide-gray-100">
                              <Link href={`/properties/${property.id}`}>
                                <li className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                  <FontAwesomeIcon icon={faExpand} /> View
                                </li>
                              </Link>
                              <Link href={`/properties/${property.id}/edit`}>
                                <li className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                  <FontAwesomeIcon icon={faPenToSquare} /> Edit
                                </li>
                              </Link>
                              <li
                                onClick={() => handleOpenDeleteDialog(property.id)}
                                className="flex items-center     gap-2 px-4 py-2 text-red-600 hover:bg-red-100 cursor-pointer"
                              >
                                <FontAwesomeIcon icon={faTrashCan} /> Delete
                              </li>
                            </ul>
                          </Dropdown.Content>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-gray-400">
                      No properties found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>


        {/* Pagination & Items per page */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
          <div className="flex items-center gap-2">
            <label htmlFor="selectedItemsPerPage" className="text-sm text-gray-600">Items per page:</label>
            <select
              id="selectedItemsPerPage"
              value={selectedItemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border-gray-300 rounded-md text-sm"
            >
              {[5, 10, 15, 20].map((val) => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 flex-wrap justify-end">
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
                  className={`px-4 py-2 text-sm rounded-md border transition ${
                    link.active ? 'bg-primary text-white font-semibold' : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ) : (
                <span
                  key={i}
                  className="px-4 py-2 text-sm text-slate-400 bg-white border rounded-md cursor-not-allowed"
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>

  );
};

export default Index;
