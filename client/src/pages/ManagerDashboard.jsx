import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiGrid, FiUsers, FiActivity, FiLogOut, FiCheckCircle, FiClock, FiAlertCircle, FiX, FiBriefcase } from "react-icons/fi";

const ManagerDashboard = () => {
  const [data, setData] = useState({ tickets: [], team: [], stats: {} });
  const [myWork, setMyWork] = useState([]); // Tickets assigned to logged-in employee
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [modal, setModal] = useState({ type: null, id: null }); // 'assign' or 'resolve'
  const [resolutionText, setResolutionText] = useState("");
  const navigate = useNavigate();

  // Check Role
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isManager = user.role === 'manager';

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    try {
      if (isManager) {
          // MANAGER FETCH
          const [ticketRes, analyticsRes] = await Promise.all([
             axios.get("http://localhost:5000/tickets/all", { headers: { token } }),
             axios.get("http://localhost:5000/tickets/analytics", { headers: { token } })
          ]);
          setData({ tickets: ticketRes.data, team: analyticsRes.data.team, stats: analyticsRes.data.stats });
      } else {
          // EMPLOYEE FETCH
          const workRes = await axios.get("http://localhost:5000/tickets/assigned", { headers: { token } });
          setMyWork(workRes.data);
          setActiveTab('my_work');
      }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [navigate]);

  const handleAction = async () => {
      const token = localStorage.getItem("token");
      try {
          if (modal.type === 'assign') {
              await axios.put(`http://localhost:5000/tickets/assign/${modal.id}`, { employee_id: modal.payload }, { headers: { token } });
          } else if (modal.type === 'resolve') {
              await axios.put(`http://localhost:5000/tickets/resolve/${modal.id}`, { resolution_notes: resolutionText }, { headers: { token } });
          }
          alert("Success!");
          setModal({ type: null, id: null });
          fetchData(); 
      } catch (err) { alert("Action Failed"); }
  };

  return (
    <div className="flex min-h-screen bg-[#f0f4f8] font-sans">
      <aside className="w-72 glass-dark text-white flex flex-col fixed h-full z-50">
        <div className="p-8">
           <h1 className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
               {isManager ? 'SUD ADMIN' : 'SUD STAFF'}
           </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {isManager ? (
              <>
                <NavItem icon={<FiGrid />} text="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                <NavItem icon={<FiUsers />} text="Team Overview" active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
                <NavItem icon={<FiActivity />} text="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
              </>
          ) : (
                <NavItem icon={<FiBriefcase />} text="My Assignments" active={activeTab === 'my_work'} onClick={() => setActiveTab('my_work')} />
          )}
        </nav>
        <div className="p-6">
           <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="flex items-center gap-3 text-red-300 hover:text-white transition-colors">
              <FiLogOut /> <span>Logout</span>
           </button>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-10">
        
        {/* EMPLOYEE VIEW: MY WORK */}
        {!isManager && (
            <div>
                <header className="mb-10 flex justify-between items-end">
                    <h1 className="text-4xl font-bold text-gray-800">My Assignments</h1>
                    <div className="bg-white px-5 py-2.5 rounded-full shadow-sm text-sm font-semibold text-sud-blue border border-blue-50">
                        {new Date().toDateString()}
                    </div>
                </header>
                {myWork.length === 0 ? <p className="text-gray-500">No active tickets assigned to you.</p> : (
                    <div className="grid gap-4">
                        {myWork.map(t => (
                            <div key={t.ticket_id} className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-sud-blue flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-xl">{t.title}</h3>
                                    <p className="text-gray-600 mt-1">{t.description}</p>
                                    <div className="flex gap-2 mt-3">
                                        <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${t.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{t.priority}</span>
                                        <span className="px-2 py-1 text-xs font-bold rounded bg-gray-100 text-gray-600">User: {t.created_by}</span>
                                    </div>
                                </div>
                                <button onClick={() => setModal({ type: 'resolve', id: t.ticket_id })} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition">
                                    Resolve
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* MANAGER VIEWS */}
        {isManager && activeTab === 'dashboard' && (
           <>
               <header className="flex justify-between items-end mb-10">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-4xl font-bold text-gray-800">Overview</h1>
                    <p className="text-gray-500 mt-1">Real-time support ticket analytics</p>
                  </motion.div>
                  {/* FIXED DATE UI */}
                  <div className="bg-white px-5 py-2.5 rounded-full shadow-sm text-sm font-semibold text-sud-blue border border-blue-50">
                    {new Date().toDateString()}
                  </div>
                </header>

                {/* STATS CARDS (Fixed 0 values) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                   <StatCard title="Total Tickets" count={data.stats?.total || 0} color="red" icon={<FiAlertCircle className="text-2xl"/>} />
                   <StatCard title="Pending" count={data.stats?.open || 0} color="yellow" icon={<FiClock className="text-2xl"/>} />
                   <StatCard title="Resolved" count={data.stats?.resolved || 0} color="green" icon={<FiCheckCircle className="text-2xl"/>} />
                </div>

               <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                   <div className="px-8 py-6 border-b bg-gray-50/50"><h2 className="font-bold text-gray-700 text-lg">Incoming Requests</h2></div>
                   <table className="w-full text-left">
                       <thead className="bg-gray-50 text-gray-400 text-xs uppercase"><tr><th className="px-8 py-4">Subject</th><th className="px-8 py-4">User</th><th className="px-8 py-4">Priority</th><th className="px-8 py-4">Assigned To</th><th className="px-8 py-4">Action</th></tr></thead>
                       <tbody>
                           {data.tickets.map(t => (
                               <tr key={t.ticket_id} className="hover:bg-blue-50/50 border-b border-gray-50 last:border-0">
                                   <td className="px-8 py-4 font-bold text-gray-800">{t.title}</td>
                                   <td className="px-8 py-4 text-gray-600">{t.created_by}</td>
                                   <td className="px-8 py-4"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${t.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{t.priority}</span></td>
                                   <td className="px-8 py-4 text-gray-500">{t.assigned_employee || 'Unassigned'}</td>
                                   <td className="px-8 py-4">
                                       {t.status === 'open' && <button onClick={() => setModal({ type: 'assign', id: t.ticket_id })} className="text-sud-blue font-bold hover:underline">Assign</button>}
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
           </>
        )}

        {isManager && activeTab === 'team' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.team.map(emp => (
                    <div key={emp.employee_id} className="bg-white p-6 rounded-xl shadow flex justify-between items-center">
                        <div><h3 className="font-bold text-lg">{emp.full_name}</h3><p className="text-sm text-gray-500 uppercase">{emp.role} • Lvl {emp.experience_level}</p></div>
                        <div className="bg-blue-50 p-3 rounded-lg text-center"><div className="text-xl font-bold text-sud-blue">{emp.active_tickets || 0}</div><div className="text-xs text-gray-500">Active</div></div>
                    </div>
                ))}
             </div>
        )}
      </main>

      {/* MODALS */}
      <AnimatePresence>
          {modal.type && (
             <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center backdrop-blur-sm">
                 <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white p-6 rounded-2xl w-96 shadow-2xl">
                     <div className="flex justify-between items-center mb-4">
                         <h3 className="font-bold text-lg capitalize">{modal.type} Ticket #{modal.id}</h3>
                         <button onClick={() => setModal({ type: null, id: null })}><FiX /></button>
                     </div>
                     
                     {modal.type === 'assign' && (
                         <div className="space-y-2 max-h-80 overflow-y-auto">
                             {data.team.map(emp => (
                                 <button key={emp.employee_id} onClick={() => { modal.payload = emp.employee_id; handleAction(); }} className="w-full flex justify-between p-3 hover:bg-gray-100 rounded-lg text-left transition">
                                     <span className="font-medium">{emp.full_name}</span>
                                     <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">{emp.active_tickets || 0} Jobs</span>
                                 </button>
                             ))}
                         </div>
                     )}

                     {modal.type === 'resolve' && (
                         <div className="space-y-4">
                             <textarea 
                                placeholder="Enter resolution details..." 
                                className="w-full p-3 border rounded-lg h-32"
                                onChange={(e) => setResolutionText(e.target.value)}
                             ></textarea>
                             <button onClick={handleAction} className="w-full bg-green-600 text-white py-2 rounded-lg font-bold">Submit Resolution</button>
                         </div>
                     )}
                 </motion.div>
             </div>
          )}
      </AnimatePresence>
    </div>
  );
};

const NavItem = ({ icon, text, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all ${active ? 'bg-white/10 text-white shadow-lg backdrop-blur-sm' : 'text-blue-200 hover:bg-white/5'}`}>
    <span className="text-xl">{icon}</span><span className="font-medium">{text}</span>
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

export default ManagerDashboard;