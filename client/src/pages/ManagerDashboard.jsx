import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ManagerDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Fetch Data on Load
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
           navigate("/login"); 
           return;
        }

        const response = await axios.get("http://localhost:5000/tickets/all", {
          headers: { token: token } // Send the token!
        });
        
        setTickets(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching tickets", err.response?.data || err.message);
        setLoading(false);
      }
    };

    fetchTickets();
  }, [navigate]);

  const handleLogout = () => {
      localStorage.removeItem("token");
      navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-sud-blue text-white flex flex-col">
        <div className="p-6 text-2xl font-bold tracking-wide">SUD Support</div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <a href="#" className="block py-2.5 px-4 rounded bg-white/10 font-medium">Dashboard</a>
          <a href="#" className="block py-2.5 px-4 rounded hover:bg-white/5 opacity-70">Employees</a>
          <a href="#" className="block py-2.5 px-4 rounded hover:bg-white/5 opacity-70">Reports</a>
        </nav>
        <button onClick={handleLogout} className="p-4 bg-red-600 hover:bg-red-700 transition">Logout</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">IT Overview</h1>
            <p className="text-gray-500">Welcome back, Manager</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
            <span className="text-sm font-bold text-sud-blue">{tickets.length} Active Tickets</span>
          </div>
        </header>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="bg-white p-6 rounded-xl shadow border-l-4 border-red-500">
              <h3 className="text-gray-500 text-sm font-medium uppercase">Critical Priority</h3>
              <p className="text-2xl font-bold mt-2 text-gray-800">
                {tickets.filter(t => t.priority === 'urgent').length}
              </p>
           </div>
           <div className="bg-white p-6 rounded-xl shadow border-l-4 border-yellow-400">
              <h3 className="text-gray-500 text-sm font-medium uppercase">Pending Assignment</h3>
              <p className="text-2xl font-bold mt-2 text-gray-800">
                 {tickets.filter(t => t.status === 'open').length}
              </p>
           </div>
           <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
              <h3 className="text-gray-500 text-sm font-medium uppercase">Resolved Today</h3>
              <p className="text-2xl font-bold mt-2 text-gray-800">0</p>
           </div>
        </div>

        {/* TICKET TABLE */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-700">Recent Tickets</h2>
            <button className="text-sm text-sud-blue hover:underline">View All</button>
          </div>
          
          {loading ? (
             <div className="p-8 text-center text-gray-500">Loading tickets...</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm uppercase">
                  <th className="px-6 py-3 font-medium">Ticket ID</th>
                  <th className="px-6 py-3 font-medium">Subject</th>
                  <th className="px-6 py-3 font-medium">Raised By</th>
                  <th className="px-6 py-3 font-medium">Priority</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <tr key={ticket.ticket_id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-600">#{ticket.ticket_id}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{ticket.title}</td>
                    <td className="px-6 py-4 text-gray-500">{ticket.created_by}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        ticket.priority === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{ticket.status}</td>
                    <td className="px-6 py-4">
                      <button className="text-sud-blue hover:text-blue-800 text-sm font-medium">Assign</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;