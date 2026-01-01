import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiPlus, FiFileText, FiDollarSign, FiUser, FiInfo, FiX } from 'react-icons/fi';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Policy', priority: 'medium' });

  // Mock Fetch (Replace with real API later)
  useEffect(() => {
     if(!localStorage.getItem('token')) navigate('/login');
     // In a real app, fetch tickets here
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
       const token = localStorage.getItem('token');
       await axios.post('http://localhost:5000/tickets', formData, { headers: { token } });
       alert("Support Ticket Raised!");
       setShowModal(false);
    } catch(error) { alert("Failed", error.response?.data || error.message); }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-sud-red selection:text-white">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 px-8 py-4 flex justify-between items-center">
        <div className="font-bold text-2xl tracking-tighter text-sud-blue">SUD<span className="text-sud-red">.Life</span></div>
        <div className="flex gap-6 items-center">
           <span className="text-sm font-medium text-gray-500 hover:text-gray-900 cursor-pointer">Help Center</span>
           <button onClick={() => {localStorage.clear(); navigate('/login')}} className="px-4 py-2 text-sm font-semibold bg-gray-100 rounded-full hover:bg-gray-200 transition">Sign Out</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="pt-32 pb-20 px-4 text-center relative overflow-hidden">
        {/* Background Blob Animation */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-100 rounded-full blur-3xl opacity-30 -z-10 animate-pulse"></div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight"
        >
           How can we help you?
        </motion.h1>
        
        {/* Omni Search */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto relative group"
        >
           <input 
             type="text" 
             placeholder="Search 'Premium Receipt', 'Claim Status'..." 
             className="w-full py-5 px-8 pl-14 rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 focus:ring-4 focus:ring-blue-500/10 outline-none text-lg transition-all group-hover:shadow-2xl"
           />
           <FiSearch className="absolute left-5 top-6 text-gray-400 text-xl" />
        </motion.div>
      </div>

      {/* ACTION GRID (Bento Box) */}
      <div className="max-w-5xl mx-auto px-6 mb-20">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ActionCard title="My Policy" icon={<FiFileText />} delay={0.1} />
            <ActionCard title="Pay Premium" icon={<FiDollarSign />} delay={0.2} active />
            <ActionCard title="Update Profile" icon={<FiUser />} delay={0.3} />
            <ActionCard title="FAQs" icon={<FiInfo />} delay={0.4} />
         </div>
      </div>

      {/* TICKETS SECTION */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
         <div className="flex justify-between items-end mb-8">
            <div>
               <h2 className="text-2xl font-bold text-gray-800">Recent Tickets</h2>
               <p className="text-gray-500">Track the status of your requests</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-sud-blue text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-900/20 hover:bg-blue-800 transition"
            >
               <FiPlus /> New Ticket
            </motion.button>
         </div>

         {/* Empty State */}
         {tickets.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">📪</div>
               <h3 className="text-lg font-semibold text-gray-900">No tickets found</h3>
               <p className="text-gray-500">You haven't raised any support requests yet.</p>
            </motion.div>
         )}
      </div>

      {/* MODAL */}
      <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
           
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
             className="bg-white rounded-3xl p-8 w-full max-w-lg relative z-10 shadow-2xl"
           >
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition"><FiX /></button>
              
              <h2 className="text-2xl font-bold mb-6">Create Ticket</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                 <input 
                   placeholder="Subject" 
                   className="w-full p-4 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-sud-blue transition-all outline-none"
                   onChange={e => setFormData({...formData, title: e.target.value})} required
                 />
                 <div className="grid grid-cols-2 gap-4">
                    <select className="p-4 bg-gray-50 rounded-xl outline-none" onChange={e => setFormData({...formData, category: e.target.value})}>
                       <option>Policy</option>
                       <option>Technical</option>
                       <option>Billing</option>
                    </select>
                    <select className="p-4 bg-gray-50 rounded-xl outline-none" onChange={e => setFormData({...formData, priority: e.target.value})}>
                       <option value="medium">Medium Priority</option>
                       <option value="high">High Priority</option>
                       <option value="urgent">Urgent</option>
                    </select>
                 </div>
                 <textarea 
                   placeholder="Describe your issue..." 
                   className="w-full p-4 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-sud-blue transition-all outline-none h-32 resize-none"
                   onChange={e => setFormData({...formData, description: e.target.value})} required
                 ></textarea>
                 
                 <button className="w-full py-4 bg-sud-red text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-500/20">
                    Submit Request
                 </button>
              </form>
           </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
};

const ActionCard = ({ title, icon, delay, active }) => (
  <motion.div 
    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay }}
    whileHover={{ y: -5 }}
    className={`p-6 rounded-2xl cursor-pointer border transition-all ${active ? 'bg-sud-blue text-white shadow-xl shadow-blue-900/20 border-transparent' : 'bg-white text-gray-600 border-gray-100 hover:shadow-lg hover:border-blue-100'}`}
  >
     <div className="text-3xl mb-3">{icon}</div>
     <div className="font-semibold">{title}</div>
  </motion.div>
);

export default UserDashboard;