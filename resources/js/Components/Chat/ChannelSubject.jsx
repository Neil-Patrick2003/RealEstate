const ChannelSubject = ({ property }) => {
    return <div className="bg-gray-50 px-5 py-5 rounded-xl">
        <div>{property.title}</div>
        <div>{property.description}</div>
    </div>
}

export default ChannelSubject
