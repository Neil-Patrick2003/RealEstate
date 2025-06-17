import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import React from 'react'

const EditProperty = ({property}) => {
  return (
    <AuthenticatedLayout>
        {property.title}
    </AuthenticatedLayout>
  )
}

export default EditProperty