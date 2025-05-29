import AdminLayout from '@/Layouts/AdminLayout'
import React from 'react'

const index = () => {
  return ( 
    <AdminLayout>
        <h1 className='font-bold text-lg md:text-xl lg:text-2xl '>Property type</h1>
        <div className='p-2 md:p-4 mt-2 lg:p-6 border rounded-xl bg-white'>
            <h3 className='font-semibold'>Property type</h3>
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