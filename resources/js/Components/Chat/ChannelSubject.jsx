const ChannelSubject = ({ property }) => {
    return <div className="bg-gray-50 px-5 py-5 rounded-xl w-80">
        <img src={`/storage/${property.image_url}`} alt={property.title} className='h-40 w-full object-cover rounded-xl mb-2'/>
        <p className='text-gray-500 text-sm '>{property.title}</p>
        {/*<div>{property.description}</div>*/}
    </div>
}

export default ChannelSubject
