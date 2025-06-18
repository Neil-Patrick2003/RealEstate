import Collapsable from '@/Components/collapsable/collapsable'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import React from 'react'

const EditProperty = ({property}) => {
  return (
    <AuthenticatedLayout>
        <Collapsable></Collapsable>
        {property.title}

    </AuthenticatedLayout>
  )
}

export default EditProperty