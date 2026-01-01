

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-sans">
      
      {/* Header Bar */}
      <div className="w-full bg-sud-blue p-6 text-white text-center shadow-md">
        <h1 className="text-3xl font-bold">SUD Life Insurance</h1>
        <p className="text-sm opacity-80">Support Portal Prototype</p>
      </div>

      {/* Main Card */}
      <div className="mt-10 bg-white p-8 rounded-xl shadow-lg border-t-4 border-sud-red max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">System Status</h2>
        <p className="text-gray-600 mb-6">
          Backend is ready. Frontend is using Tailwind CDN.
        </p>
        
        <button className="bg-sud-red hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition duration-300">
          Raise a Ticket
        </button>
      </div>

    </div>
  )
}

export default App