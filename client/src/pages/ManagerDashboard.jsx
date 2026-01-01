import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Icons (react-icons must be installed)
import { FiGrid, FiUsers, FiActivity, FiLogOut, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";

const ManagerDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }
      try {
        const response = await axios.get("http://localhost:5000/tickets/all", { headers: { token } });
        setTickets(response.data);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchTickets();
  }, [navigate]);

  // Animation Variants
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex min-h-screen bg-[#f0f4f8] font-sans">
      
      {/* GLASS SIDEBAR */}
      <aside className="w-72 glass-dark text-white flex flex-col fixed h-full z-50">
        <div className="p-8">
           <h1 className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">SUD ADMIN</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<FiGrid />} text="Dashboard" active />
          <NavItem icon={<FiUsers />} text="Team Overview" />
          <NavItem icon={<FiActivity />} text="Analytics" />
        </nav>
        <div className="p-6">
           <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="flex items-center gap-3 text-red-300 hover:text-white transition-colors">
              <FiLogOut /> <span>Logout</span>
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-72 p-10">
        <header className="flex justify-between items-end mb-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-bold text-gray-800">Overview</h1>
            <p className="text-gray-500 mt-1">Real-time support ticket analytics</p>
          </motion.div>
          <div className="bg-white px-5 py-2.5 rounded-full shadow-sm text-sm font-semibold text-sud-blue border border-blue-50">
            {new Date().toDateString()}
          </div>
        </header>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           <StatCard title="Critical" count={tickets.filter(t => t.priority === 'urgent').length} color="red" icon={<FiAlertCircle className="text-2xl"/>} />
           <StatCard title="Pending" count={tickets.filter(t => t.status === 'open').length} color="yellow" icon={<FiClock className="text-2xl"/>} />
           <StatCard title="Resolved" count={0} color="green" icon={<FiCheckCircle className="text-2xl"/>} />
        </div>

        {/* TICKET TABLE */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-bold text-gray-700 text-lg">Incoming Requests</h2>
          </div>
          
          {loading ? (
             <div className="p-10 text-center text-gray-400">Syncing data...</div>
          ) : (
            <motion.table variants={container} initial="hidden" animate="show" className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-8 py-4 font-medium">ID</th>
                  <th className="px-8 py-4 font-medium">Subject</th>
                  <th className="px-8 py-4 font-medium">User</th>
                  <th className="px-8 py-4 font-medium">Priority</th>
                  <th className="px-8 py-4 font-medium">Status</th>
                  <th className="px-8 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <motion.tr variants={item} key={ticket.ticket_id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-8 py-5 text-gray-500 font-mono">#{ticket.ticket_id}</td>
                    <td className="px-8 py-5 font-semibold text-gray-800 group-hover:text-sud-blue transition-colors">{ticket.title}</td>
                    <td className="px-8 py-5 text-gray-600 flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                          {ticket.created_by.charAt(0)}
                       </div>
                       {ticket.created_by}
                    </td>
                    <td className="px-8 py-5">
                      <PriorityBadge level={ticket.priority} />
                    </td>
                    <td className="px-8 py-5">
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                         <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> {ticket.status}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                      <button className="text-sud-blue hover:text-white hover:bg-sud-blue px-3 py-1.5 rounded-md text-sm font-medium transition-all">
                        Assign
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </motion.table>
          )}
        </div>
      </main>
    </div>
  );
};

// Sub-components for cleaner code
const NavItem = ({ icon, text, active }) => (
  <a href="#" className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all ${active ? 'bg-white/10 text-white shadow-lg backdrop-blur-sm' : 'text-blue-200 hover:bg-white/5'}`}>
    <span className="text-xl">{icon}</span>
    <span className="font-medium">{text}</span>
  </a>
);

const StatCard = ({ title, count, color, icon }) => {
   const colors = {
      red: 'bg-red-50 text-red-600 border-red-100',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
      green: 'bg-green-50 text-green-600 border-green-100'
   };
   return (
      <motion.div whileHover={{ y: -5 }} className={`p-6 rounded-2xl border ${colors[color]} relative overflow-hidden`}>
         <div className="relative z-10 flex justify-between items-start">
            <div>
               <p className="text-sm font-medium opacity-80 uppercase tracking-wide">{title}</p>
               <h3 className="text-3xl font-bold mt-1">{count}</h3>
            </div>
            <div className="p-3 bg-white/50 rounded-xl backdrop-blur-sm">{icon}</div>
         </div>
      </motion.div>
   );
};

const PriorityBadge = ({ level }) => {
  const styles = {
    urgent: "bg-red-100 text-red-700",
    high: "bg-orange-100 text-orange-700",
    medium: "bg-blue-100 text-blue-700",
    low: "bg-gray-100 text-gray-600",
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles[level] || styles.low}`}>{level}</span>;
};

export default ManagerDashboard;