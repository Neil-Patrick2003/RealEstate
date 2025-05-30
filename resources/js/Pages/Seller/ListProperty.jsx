import Modal from '@/Components/Modal';
import NavBar from '@/Components/NavBar'
import ListingRequirements from '@/Components/Stepper/ListingRequirements';
import { Link } from '@inertiajs/react';
import { CirclePlus } from 'lucide-react';
import React, { useState } from 'react'

const ListProperty = () => {
  
  const [isOpen, setIsOpen] = useState(true);

  const closeModal = () => {
    setIsOpen(false)
  }
  
  return (
    
    <div className='pt-20'>
        <NavBar/>
        <Modal show={isOpen} onClose={closeModal} maxWidth="2xl" closeable={false}>
            <div className="mx-auto max-w-xl">
              <ListingRequirements closeModal={closeModal}/>
            </div>
        </Modal>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 p-4'>
            <div className='hidden lg:block border '>
                <div className='flex-center-between'>
                    <span>Key Information</span>
                    <CirclePlus />
                </div>
            </div>
            <div className='col-span-2  border'>2</div>
        </div>
    </div>
        
    
    
  );
}

export default ListProperty