import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FiGrid, FiUsers, FiActivity, FiLogOut, FiCheckCircle, FiClock, FiAlertCircle, FiX } from "react-icons/fi";

const ManagerDashboard = () => {
  const [data, setData] = useState({ tickets: [], team: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'team' | 'analytics'
  const [assignModal, setAssignModal] = useState(null); // Stores Ticket ID to assign
  const navigate = useNavigate();

  // Fetch Logic
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    try {
      const [ticketRes, analyticsRes] = await Promise.all([
         axios.get("http://localhost:5000/tickets/all", { headers: { token } }),
         axios.get("http://localhost:5000/tickets/analytics", { headers: { token } })
      ]);
      setData({ 
          tickets: ticketRes.data, 
          team: analyticsRes.data.team, 
          stats: analyticsRes.data.stats 
      });
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    const loadData = async () => {
      try {
        const [ticketRes, analyticsRes] = await Promise.all([
           axios.get("http://localhost:5000/tickets/all", { headers: { token } }),
           axios.get("http://localhost:5000/tickets/analytics", { headers: { token } })
        ]);
        setData({ 
            tickets: ticketRes.data, 
            team: analyticsRes.data.team, 
            stats: analyticsRes.data.stats 
        });
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    loadData();
  }, [navigate]);

  const handleAssign = async (employeeId) => {
      try {
          const token = localStorage.getItem("token");
          await axios.put(`http://localhost:5000/tickets/assign/${assignModal}`, { employee_id: employeeId }, { headers: { token } });
          setAssignModal(null);
          fetchData(); // Refresh data
          alert("Ticket Assigned Successfully");
      } catch (err) { console.error(err); alert("Assignment Failed"); }
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

  return (
    <div className="flex min-h-screen bg-[#f0f4f8] font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-72 glass-dark text-white flex flex-col fixed h-full z-50">
        <div className="p-8">
           <h1 className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">SUD ADMIN</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<FiGrid />} text="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<FiUsers />} text="Team Overview" active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
          <NavItem icon={<FiActivity />} text="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
        </nav>
        <div className="p-6">
           <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="flex items-center gap-3 text-red-300 hover:text-white transition-colors">
              <FiLogOut /> <span>Logout</span>
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-72 p-10">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
            <>
                <header className="flex justify-between items-end mb-10">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-4xl font-bold text-gray-800">Overview</h1>
                    <p className="text-gray-500 mt-1">Real-time support ticket analytics</p>
                  </motion.div>
                </header>

                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                   <StatCard title="Total Tickets" count={data.stats?.total || 0} color="red" icon={<FiAlertCircle className="text-2xl"/>} />
                   <StatCard title="Pending" count={data.stats?.open || 0} color="yellow" icon={<FiClock className="text-2xl"/>} />
                   <StatCard title="Resolved" count={data.stats?.resolved || 0} color="green" icon={<FiCheckCircle className="text-2xl"/>} />
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                  <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50"><h2 className="font-bold text-gray-700 text-lg">Incoming Requests</h2></div>
                  {loading ? <div className="p-10 text-center text-gray-400">Loading...</div> : (
                    <motion.table variants={container} initial="hidden" animate="show" className="w-full text-left">
                      <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-8 py-4">Subject</th>
                          <th className="px-8 py-4">User</th>
                          <th className="px-8 py-4">Priority</th>
                          <th className="px-8 py-4">Assigned To</th>
                          <th className="px-8 py-4">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {data.tickets.map((ticket) => (
                          <motion.tr variants={item} key={ticket.ticket_id} className="hover:bg-blue-50/50 transition-colors">
                            <td className="px-8 py-5 font-semibold text-gray-800">{ticket.title}</td>
                            <td className="px-8 py-5 text-gray-600">{ticket.created_by}</td>
                            <td className="px-8 py-5"><PriorityBadge level={ticket.priority} /></td>
                            <td className="px-8 py-5 text-gray-500">{ticket.assigned_employee || 'Unassigned'}</td>
                            <td className="px-8 py-5">
                               {ticket.status === 'open' && (
                                   <button onClick={() => setAssignModal(ticket.ticket_id)} className="text-sud-blue hover:bg-sud-blue hover:text-white px-3 py-1 rounded transition">Assign</button>
                               )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </motion.table>
                  )}
                </div>
            </>
        )}

        {/* TEAM TAB */}
        {activeTab === 'team' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.team.map(emp => (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={emp.employee_id} className="bg-white p-6 rounded-xl shadow flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg">{emp.full_name}</h3>
                            <p className="text-sm text-gray-500 uppercase">{emp.role} • Lvl {emp.experience_level}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                            <div className="text-xl font-bold text-sud-blue">{emp.active_tickets || 0}</div>
                            <div className="text-xs text-gray-500">Active</div>
                        </div>
                    </motion.div>
                ))}
            </div>
        )}
      </main>

      {/* ASSIGN MODAL */}
      <AnimatePresence>
          {assignModal && (
             <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center backdrop-blur-sm">
                 <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white p-6 rounded-2xl w-96 shadow-2xl">
                     <div className="flex justify-between items-center mb-4">
                         <h3 className="font-bold text-lg">Assign Ticket #{assignModal}</h3>
                         <button onClick={() => setAssignModal(null)}><FiX /></button>
                     </div>
                     <div className="space-y-2 max-h-80 overflow-y-auto">
                         {data.team.map(emp => (
                             <button key={emp.employee_id} onClick={() => handleAssign(emp.employee_id)} className="w-full flex justify-between p-3 hover:bg-gray-100 rounded-lg text-left transition">
                                 <span className="font-medium">{emp.full_name}</span>
                                 <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">{emp.active_tickets || 0} Jobs</span>
                             </button>
                         ))}
                     </div>
                 </motion.div>
             </div>
          )}
      </AnimatePresence>
    </div>
  );
};

const NavItem = ({ icon, text, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all ${active ? 'bg-white/10 text-white shadow-lg backdrop-blur-sm' : 'text-blue-200 hover:bg-white/5'}`}>
    <span className="text-xl">{icon}</span>
    <span className="font-medium">{text}</span>
  </button>
);

const StatCard = ({ title, count, color, icon }) => {
   const colors = { red: 'bg-red-50 text-red-600', yellow: 'bg-yellow-50 text-yellow-600', green: 'bg-green-50 text-green-600' };
   return (
      <motion.div whileHover={{ y: -5 }} className={`p-6 rounded-2xl border border-transparent ${colors[color]} relative`}>
         <div className="flex justify-between"><div><p className="text-xs font-bold uppercase opacity-70">{title}</p><h3 className="text-3xl font-bold mt-1">{count}</h3></div><div className="text-3xl opacity-50">{icon}</div></div>
      </motion.div>
   );
};

const PriorityBadge = ({ level }) => {
  const styles = { urgent: "bg-red-100 text-red-700", high: "bg-orange-100 text-orange-700", medium: "bg-blue-100 text-blue-700", low: "bg-gray-100 text-gray-600" };
  return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles[level] || styles.low}`}>{level}</span>;
};

export default ManagerDashboard;