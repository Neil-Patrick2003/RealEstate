import AgentLayout from "@/Layouts/AgentLayout.jsx";

import DataTable from '@/Components/Table/DataTable';
import { EllipsisVertical } from 'lucide-react';
import Dropdown from '@/Components/Dropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand, faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';


const columns = [
    {
        key: 'checkbox',
        label: '',
        align: 'text-center',
        render: (row) => (
            <input type="checkbox" id={row.id} className="rounded border-gray-400" />
        ),
    },
    {
        key: 'title',
        label: 'Title',
        render: (row) => (
            <div className="flex items-center gap-3">
                <img
                    src={`/storage/${row.image_url}`}
                    alt={row.title}
                    className="w-14 h-14 object-cover rounded-md"
                />
                <div>
                    <p className="font-semibold text-gray-800">{row.title}</p>
                    <p className="text-xs text-gray-500">{row.address}</p>
                </div>
            </div>
        ),
    },
    {
        key: 'property_type',
        label: 'Type',
        render: (row) => `${row.property_type}, ${row.sub_type}`,
    },
    { key: 'price', label: 'Price' },
    {
        key: 'status',
        label: 'Status',
        render: (row) => (
            <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs ring-1 ring-orange-200">
        {row.status}
      </span>
        ),
    },
    {
        key: 'area',
        label: 'Size (sqm)',
        render: (row) => `${row.floor_area ?? 0} / ${row.lot_area ?? 0}`,
    },
];

export default  function Inquiries(){


    return (
        <AgentLayout>
            Inquiries

        </AgentLayout>
    )
}
