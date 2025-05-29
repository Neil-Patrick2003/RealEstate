import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import AdminLayout from '@/Layouts/AdminLayout'
import { useForm } from '@inertiajs/react';
import React, { useState } from 'react'

const index = () => {
    //initialize form variables using form helper in inertia
    const { data, setData, post, processing, errors } = useForm({
        name: ''
    })

    // initialise button variable
    const [ isAddPropertyTypeOpen, setIsPropertyTypeOpen] = useState(false);


    //function to open modal to add property type
    const openAddProprtyType = () => {
        setIsPropertyTypeOpen(true);
    }

    //function to close modal to add property type
    const closeAddProprtyType = () => {
        setIsPropertyTypeOpen(false);
    }

    // function to submit form
    function submitAddPropertyType(e) {
        e.preventDefault()
        post('/')
    }


    



  return ( 
    <AdminLayout>
        <Modal show={isAddPropertyTypeOpen} onClose={closeAddProprtyType} maxWidth="lg">
            <div className="p-6">
                <form onSubmit={submitAddPropertyType} className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Add Property Type</h2>

                    <div>
                        <InputLabel htmlFor="name" value="Property Type" />

                        <TextInput
                            id="name"
                            type="text"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full"
                            autoComplete="name"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                        />

                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={closeAddProprtyType}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </Modal>

        <h1 className='font-bold text-lg md:text-xl lg:text-2xl '>Property type</h1>
        <div className='p-2 md:p-4 mt-2 lg:p-6 border rounded-xl bg-white'>
            <div className='flex-center-between'>
                <h3 className='font-semibold'>Property type</h3>
                <button onClick={openAddProprtyType}>add</button>
            </div>
            
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-2'>
                <div className='mt-2 p-2 border  rounded-lg'>
                    <p>Any</p>
                </div>
                <div className='mt-2 p-2 border rounded-lg'>
                    <p>Commercial</p>
                </div>
                <div className='mt-2 p-2 border rounded-lg'>
                    <p>Commercial</p>
                </div>
                <div className='mt-2 p-2 border rounded-lg'>
                    <p>Commercial</p>
                </div>
                <div className='mt-2 p-2 border rounded-lg'>
                    <p>Commercial</p>
                </div>
                <div className='mt-2 p-2 border rounded-lg'>
                    <p>Land</p>
                </div>
            </div>
        </div>
        <div className='p-2 md:p-4 mt-2 lg:p-6 border rounded-xl bg-white'>
            <h3 className='font-semibold'>Sub category</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-2'>
                <div className='mt-2 p-2 border  rounded-lg'>
                    <p>Any</p>
                </div>
                <div className='mt-2 p-2 border rounded-lg'>
                    <p>Commercial</p>
                </div>
                <div className='mt-2 p-2 border rounded-lg'>
                    <p>Commercial</p>
                </div>
                <div className='mt-2 p-2 border rounded-lg'>
                    <p>Commercial</p>
                </div>
                <div className='mt-2 p-2 border rounded-lg'>
                    <p>Commercial</p>
                </div>
                <div className='mt-2 p-2 border rounded-lg'>
                    <p>Land</p>
                </div>
            </div>
            
            
        </div>
    </AdminLayout>
  )
}

export default index