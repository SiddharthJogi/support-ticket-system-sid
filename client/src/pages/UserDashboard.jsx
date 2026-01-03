import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiPlus, FiFileText, FiDollarSign, FiUser, FiInfo, FiX, FiClock, FiCheckCircle } from 'react-icons/fi';

// eslint-disable-next-line no-unused-vars
import { ToastContainer, toast } from 'react-toastify'; // Optional: Use a library or simple alert
import 'react-toastify/dist/ReactToastify.css'; // If you use toastify

import { socket } from "../socket";



const UserDashboard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Policy', priority: 'medium' });

    // Listen for Resolution
    

  const fetchTickets = async () => {
      const token = localStorage.getItem('token');
      if(!token) { navigate('/login'); return; }
      try {
          const res = await axios.get('http://localhost:5000/tickets/my-tickets', { headers: { token } });
          setTickets(res.data);
      } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchTickets(); }, [navigate]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));

    socket.on("ticket_resolved", (data) => {
        // Check if the resolved ticket belongs to THIS user
        if (user && data.user_id === user.id) {
            alert(`🎉 Good News! Your ticket #${data.ticket_id} has been resolved!`);
            fetchTickets(); // Refresh the list to show the green checkmark
        }
    });

    return () => socket.off("ticket_resolved");
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
       const token = localStorage.getItem('token');
       await axios.post('http://localhost:5000/tickets', formData, { headers: { token } });
       alert("Support Ticket Raised!");
       setActiveModal(null);
       fetchTickets(); 
    } catch(error) { alert("Failed: " + (error.response?.data?.error || error.message)); }
  };

  const handleTicketClick = (ticket) => {
      setSelectedTicket(ticket);
      setActiveModal('ticket_details');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-sud-red selection:text-white">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 px-8 py-4 flex justify-between items-center">
        <div className="font-bold text-2xl tracking-tighter text-sud-blue">SUD<span className="text-sud-red">.Life</span></div>
        <div className="flex gap-6 items-center">
           <span className="text-sm font-medium text-gray-500 hover:text-gray-900 cursor-pointer" onClick={() => setActiveModal('faq')}>Help Center</span>
           <button onClick={() => {localStorage.clear(); navigate('/login')}} className="px-4 py-2 text-sm font-semibold bg-gray-100 rounded-full hover:bg-gray-200 transition">Sign Out</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="pt-32 pb-20 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-100 rounded-full blur-3xl opacity-30 -z-10 animate-pulse"></div>
        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">How can we help you?</motion.h1>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="max-w-2xl mx-auto relative group">
           <input type="text" placeholder="Search 'Premium Receipt', 'Claim Status'..." className="w-full py-5 px-8 pl-14 rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 focus:ring-4 focus:ring-blue-500/10 outline-none text-lg transition-all group-hover:shadow-2xl" />
           <FiSearch className="absolute left-5 top-6 text-gray-400 text-xl" />
        </motion.div>
      </div>

      {/* ACTION GRID - UPDATED ANIMATION */}
      <div className="max-w-5xl mx-auto px-6 mb-20">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ActionCard title="My Policy" icon={<FiFileText />} delay={0.1} onClick={() => setActiveModal('policy')} />
            <ActionCard title="Pay Premium" icon={<FiDollarSign />} delay={0.2} active />
            <ActionCard title="Update Profile" icon={<FiUser />} delay={0.3} />
            <ActionCard title="FAQs" icon={<FiInfo />} delay={0.4} onClick={() => setActiveModal('faq')} />
         </div>
      </div>

      {/* TICKETS SECTION */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
         <div className="flex justify-between items-end mb-8">
            <div><h2 className="text-2xl font-bold text-gray-800">Recent Tickets</h2><p className="text-gray-500">Track the status of your requests</p></div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveModal('create')} className="flex items-center gap-2 bg-sud-blue text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-900/20 hover:bg-blue-800 transition"><FiPlus /> New Ticket</motion.button>
         </div>

         {tickets.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">📪</div>
               <h3 className="text-lg font-semibold text-gray-900">No tickets found</h3>
               <p className="text-gray-500">You haven't raised any support requests yet.</p>
            </motion.div>
         ) : (
            <div className="grid gap-4">
                {tickets.map((t, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} 
                        key={t.ticket_id} onClick={() => handleTicketClick(t)}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition cursor-pointer group"
                    >
                        <div>
                            <h3 className="font-bold text-lg text-gray-800 group-hover:text-sud-blue transition">{t.title}</h3>
                            <p className="text-sm text-gray-500">{t.category} • {new Date(t.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 capitalize ${t.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {t.status === 'resolved' ? <FiCheckCircle /> : <FiClock />} {t.status.replace('_', ' ')}
                        </div>
                    </motion.div>
                ))}
            </div>
         )}
      </div>

      {/* UNIVERSAL MODAL MANAGER - FIXED OVERLAP */}
      <AnimatePresence>
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
           
           <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl p-8 w-full max-w-lg relative z-10 shadow-2xl overflow-hidden">
              
              {/* FIXED CLOSE BUTTON: Moved to absolute top-right corner with z-index */}
              <button 
                onClick={() => setActiveModal(null)} 
                className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition z-50 text-gray-500"
              >
                <FiX size={20} />
              </button>

              {/* 1. CREATE TICKET MODAL */}
              {activeModal === 'create' && (
                  <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                     <h2 className="text-2xl font-bold mb-4">Create Ticket</h2>
                     <input placeholder="Subject" className="w-full p-4 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-sud-blue transition-all outline-none" onChange={e => setFormData({...formData, title: e.target.value})} required />
                     <div className="grid grid-cols-2 gap-4">
                        <select className="p-4 bg-gray-50 rounded-xl outline-none" onChange={e => setFormData({...formData, category: e.target.value})}><option>Policy</option><option>Technical</option><option>Billing</option></select>
                        <select className="p-4 bg-gray-50 rounded-xl outline-none" onChange={e => setFormData({...formData, priority: e.target.value})}><option value="medium">Medium Priority</option><option value="high">High Priority</option><option value="urgent">Urgent</option></select>
                     </div>
                     <textarea placeholder="Describe your issue..." className="w-full p-4 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-sud-blue transition-all outline-none h-32 resize-none" onChange={e => setFormData({...formData, description: e.target.value})} required></textarea>
                     <button className="w-full py-4 bg-sud-red text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-500/20">Submit Request</button>
                  </form>
              )}

              {/* 2. TICKET DETAILS MODAL */}
              {activeModal === 'ticket_details' && selectedTicket && (
                  <div className="space-y-5 pt-2">
                      <div className="flex justify-between items-start pr-8"> {/* Added pr-8 for close btn space */}
                          <h2 className="text-2xl font-bold text-gray-800 leading-tight">{selectedTicket.title}</h2>
                      </div>
                      <div className="flex gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedTicket.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{selectedTicket.priority}</span>
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-gray-100 text-gray-600">{selectedTicket.category}</span>
                      </div>
                      
                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase font-bold mb-2 tracking-wider">Your Description</p>
                          <p className="text-gray-700 leading-relaxed text-sm">{selectedTicket.description}</p>
                      </div>

                      {selectedTicket.resolution_notes ? (
                          <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
                              <p className="text-xs text-green-700 uppercase font-bold mb-2 flex items-center gap-1"><FiCheckCircle /> Official Resolution</p>
                              <p className="text-gray-800 text-sm">{selectedTicket.resolution_notes}</p>
                              <p className="text-xs text-green-600 mt-2 font-medium">Resolved by {selectedTicket.assigned_employee || 'Support Team'}</p>
                          </div>
                      ) : (
                          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-yellow-800 text-sm flex items-center gap-3">
                              <div className="p-2 bg-yellow-100 rounded-full"><FiClock /></div>
                              <div>
                                <p className="font-bold">In Progress</p>
                                <p className="text-xs opacity-80">Our team is working on a resolution.</p>
                              </div>
                          </div>
                      )}
                      
                      <div className="text-xs text-gray-300 text-center pt-2">Ticket Ref: #{selectedTicket.ticket_id}</div>
                  </div>
              )}

              {/* 3. POLICY MODAL */}
              {activeModal === 'policy' && (
                  <div className="pt-2">
                      <h2 className="text-2xl font-bold mb-6">My Policy Details</h2>
                      <div className="bg-gradient-to-br from-sud-blue to-blue-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
                          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                          <p className="text-blue-200 text-sm mb-1 tracking-wider uppercase">Life Insurance</p>
                          <h3 className="text-2xl font-bold tracking-widest mb-8 font-mono">SUD-8821-9920</h3>
                          <div className="flex justify-between items-end">
                              <div>
                                  <p className="text-xs text-blue-300 uppercase">Plan Name</p>
                                  <p className="font-medium text-lg">Century Star Plus</p>
                              </div>
                              <div className="text-right">
                                  <p className="text-xs text-blue-300 uppercase">Next Premium</p>
                                  <p className="font-bold text-white">₹ 12,400</p>
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* 4. FAQ MODAL */}
              {activeModal === 'faq' && (
                  <div className="max-h-[60vh] overflow-y-auto pr-2 pt-2 custom-scrollbar">
                      <h2 className="text-2xl font-bold mb-4">Help Center</h2>
                      <div className="space-y-4">
                          <FAQItem q="How do I download my premium receipt?" a="Log in to your portal, go to 'My Policy', and select 'Premium Receipts'. You can download statements for the last 3 years." />
                          <FAQItem q="What is the claim settlement ratio?" a="SUD Life has a claim settlement ratio of 98.5% for FY 2023-24, ensuring your family's future is secure." />
                          <FAQItem q="How can I update my nominee?" a="Submit a request via the 'Update Profile' section or visit your nearest SUD Life branch with the nominee's KYC documents." />
                          <FAQItem q="Is there a grace period for payments?" a="Yes, a grace period of 15 days for monthly mode and 30 days for other modes is available from the due date." />
                      </div>
                  </div>
              )}

           </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
};

// UPDATED: Subtler Hover Animation
const ActionCard = ({ title, icon, delay, active, onClick }) => (
  <motion.div 
    initial={{ y: 20, opacity: 0 }} 
    animate={{ y: 0, opacity: 1 }} 
    transition={{ delay }} 
    whileHover={{ scale: 1.02 }} // Subtler than y: -5
    onClick={onClick} 
    className={`p-6 rounded-2xl cursor-pointer border transition-all ${active ? 'bg-sud-blue text-white shadow-xl shadow-blue-900/20 border-transparent' : 'bg-white text-gray-600 border-gray-100 hover:shadow-lg hover:border-blue-100'}`}
  >
     <div className="text-3xl mb-3">{icon}</div><div className="font-semibold">{title}</div>
  </motion.div>
);

const FAQItem = ({ q, a }) => (
    <div className="border-b border-gray-100 pb-3 last:border-0">
        <h4 className="font-bold text-gray-800 mb-1">{q}</h4>
        <p className="text-sm text-gray-600">{a}</p>
    </div>
);

export default UserDashboard;