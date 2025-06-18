import Collapsable from '@/Components/collapsable/collapsable'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import React, { useState } from 'react'
import InputWithLabel from '@/Components/InputWithLabel'
import InputError from '@/Components/InputError'

const EditProperty = ({ property }) => {
  const [title, setTitle] = useState(property.title || '');
  const [hasError, setHasError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (title.trim() === '') {
      setHasError(true); // Show error + focus handled inside InputWithLabel
    } else {
      setHasError(false);
      alert('Form is submitted with title: ' + title);
    }
  };

  return (
    <AuthenticatedLayout>
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-4">Edit Property</h1>

        <Collapsable>
          <div className="">
            <InputWithLabel
              value="Property Title"
              className="mb-1"
              id="property-title"
              hasError={hasError}
              type="text"
              name="property-title"
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter property title"
              inputValue={title}
            />
            {hasError && <InputError message="This field is required" className="mt-1 text-red-600" />}
          </div>
        </Collapsable>

        <button
          type="submit"
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Save Property
        </button>
      </form>
    </AuthenticatedLayout>
  );
};

export default EditProperty;
