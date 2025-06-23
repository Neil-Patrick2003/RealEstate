import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import React from 'react'

const Index = () => {
  return (
    <AuthenticatedLayout>
        <h1 className='text-xl text-text font-bold'>
            My Sales
        </h1>
    </AuthenticatedLayout>
  )
}

export default Index