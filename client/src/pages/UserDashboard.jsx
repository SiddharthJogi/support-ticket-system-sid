import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  
  // Modal State for "New Ticket"
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
     title: '', description: '', category: 'Policy', priority: 'medium'
  });

  // 1. Fetch User's Tickets
  useEffect(() => {
     // For now, we just check auth. We will add the "fetch my tickets" API later.
     const token = localStorage.getItem('token');
     if(!token) navigate('/login');
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/tickets', formData, {
         headers: { token: token }
      });
      alert("Ticket Created!");
      setShowModal(false);
      // Reload tickets (we will add this logic next)
    } catch (error) {
      console.error("Error creating ticket", error.response?.data || error.message);
      alert("Failed to create ticket");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <div className="font-bold text-sud-blue text-xl flex items-center gap-2">
           <span>🍏</span> Support
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="text-sm text-gray-500 hover:text-red-500">
           Sign Out
        </button>
      </nav>

      {/* Hero Section */}
      <div className="text-center py-16 px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">How can we help you?</h1>
        <div className="max-w-2xl mx-auto relative">
           <input 
             type="text" 
             placeholder="Search for topics (e.g. 'Premium', 'Claim')..." 
             className="w-full p-4 rounded-xl shadow-lg border-none focus:ring-2 focus:ring-sud-blue outline-none pl-12"
           />
           <span className="absolute left-4 top-4 text-xl">🔍</span>
        </div>
      </div>

      {/* Quick Actions (The "Apple" Grid) */}
      <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
         {['Policy Details', 'Pay Premium', 'Update Nominee', 'Tax Info'].map((item) => (
           <div key={item} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer text-center border border-gray-100">
              <div className="text-3xl mb-2">📄</div>
              <div className="text-sm font-medium text-gray-700">{item}</div>
           </div>
         ))}
      </div>

      {/* Ticket Section */}
      <div className="max-w-4xl mx-auto px-4">
         <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Recent Activity</h2>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-sud-blue text-white px-4 py-2 rounded-lg hover:opacity-90 transition shadow-lg"
            >
               + Create Support Ticket
            </button>
         </div>

         {/* Empty State */}
         {tickets.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center text-gray-400 border border-dashed border-gray-300">
               <p>No active support tickets.</p>
            </div>
         ) : (
            <div>{/* List will go here */}</div>
         )}
      </div>

      {/* CREATE TICKET MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
           <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
              <h3 className="text-xl font-bold mb-4">New Support Request</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                 <input 
                   className="w-full p-3 border rounded-lg bg-gray-50" 
                   placeholder="Subject (e.g. Payment Failed)"
                   onChange={e => setFormData({...formData, title: e.target.value})}
                   required
                 />
                 <select 
                   className="w-full p-3 border rounded-lg bg-gray-50"
                   onChange={e => setFormData({...formData, category: e.target.value})}
                 >
                    <option>Policy</option>
                    <option>Payment</option>
                    <option>Technical</option>
                 </select>
                 <textarea 
                   className="w-full p-3 border rounded-lg bg-gray-50 h-32" 
                   placeholder="Describe your issue..."
                   onChange={e => setFormData({...formData, description: e.target.value})}
                   required
                 ></textarea>
                 
                 <div className="flex justify-end gap-3 mt-4">
                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-sud-red text-white font-bold rounded-lg hover:bg-red-700">Submit Ticket</button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;