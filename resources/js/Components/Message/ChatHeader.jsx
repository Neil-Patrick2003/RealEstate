export default function ChatHeader({ selectedName }) {
    return (
        <header className="p-4 border-b bg-white shadow-sm">
            <h2 className="text-lg font-medium">
                {selectedName ? (
                    <>
                        Chat with: <span className="text-primary">{selectedName}</span>
                    </>
                ) : (
                    <span className="text-gray-400">Select a user</span>
                )}
            </h2>
        </header>
    );
}
