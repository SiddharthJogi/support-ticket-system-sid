import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import {motion, AnimatePresence } from 'framer-motion';

// Assets
import logo from '../assets/company-logo.png'; // Ensure extension matches your file
import banner from '../assets/company-banner.svg';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ 
    email: '', password: '', role: 'user', full_name: '', policy_number: '' 
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isRegistering ? '/auth/register' : '/auth/login';
    
    try {
      // Force role to 'user' if registering (Employees are usually internal/seeded)
      const payload = isRegistering ? { ...formData, role: 'user' } : formData;
      
      const res = await axios.post(`http://localhost:5000${endpoint}`, payload);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      const userRole = res.data.user.role || formData.role;
      navigate(userRole === 'employee' ? '/dashboard' : '/my-tickets');
    } catch (err) {
      alert(err.response?.data?.error || "Action Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full overflow-hidden bg-white">
      
      {/* LEFT SIDE - FORM */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 relative z-10"
      >
        <div className="w-full max-w-md space-y-8">
          
          {/* Header */}
          <div className="text-center">
             <motion.img 
               src={logo} alt="SUD Life" className="h-16 mx-auto mb-6 drop-shadow-lg"
               initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}
             />
             <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                {isRegistering ? 'Create Account' : 'Welcome Back'}
             </h2>
             <p className="text-gray-500 mt-2">
                {isRegistering ? 'Join the SUD Life family today.' : 'Please enter your details to sign in.'}
             </p>
          </div>

          {/* Role Switcher (Hidden during registration for simplicity) */}
          {!isRegistering && (
            <div className="bg-gray-100 p-1.5 rounded-xl flex relative">
                <motion.div 
                  className="absolute bg-white shadow-md rounded-lg h-[calc(100%-12px)] top-1.5 bottom-1.5"
                  layoutId="activeRole"
                  style={{ width: '48%', left: formData.role === 'user' ? '4px' : '50%' }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                {['user', 'employee'].map((r) => (
                    <button 
                      key={r}
                      onClick={() => setFormData({...formData, role: r})}
                      className={`flex-1 relative z-10 py-2.5 text-sm font-semibold rounded-lg capitalize transition-colors ${formData.role === r ? 'text-sud-blue' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {r === 'user' ? 'Policy Holder' : 'Employee'}
                    </button>
                ))}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
               {isRegistering && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                       <InputGroup name="full_name" placeholder="Full Name" value={formData.full_name} onChange={handleChange} />
                       <InputGroup name="policy_number" placeholder="Policy Number" value={formData.policy_number} onChange={handleChange} />
                   </motion.div>
               )}
               <InputGroup type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
               <InputGroup type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-sud-red to-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all disabled:opacity-70"
            >
              {loading ? 'Processing...' : (isRegistering ? 'Sign Up' : 'Sign In')}
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-500">
             {isRegistering ? "Already have an account? " : "New to SUD Life? "}
             <button onClick={() => setIsRegistering(!isRegistering)} className="text-sud-red font-bold hover:underline">
                 {isRegistering ? "Login" : "Create Account"}
             </button>
          </p>
        </div>
      </motion.div>

      {/* RIGHT SIDE - BANNER */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex w-1/2 bg-sud-blue relative items-center justify-center overflow-hidden"
      >
         <div className="absolute inset-0 bg-gradient-to-br from-sud-blue to-[#001f3f] opacity-90 z-10"></div>
         <img src={banner} className="absolute w-[120%] opacity-40 mix-blend-overlay" />
         <div className="relative z-20 text-white text-center px-12">
            <h1 className="text-5xl font-bold mb-6 leading-tight">Trust Your Future <br/> With Us</h1>
            <p className="text-lg text-blue-100 max-w-md mx-auto">
              Seamless support for over 10 million policyholders. Login to manage your claims and queries instantly.
            </p>
         </div>
      </motion.div>
    </div>
  );
};

// Helper for cleaner inputs
const InputGroup = ({ type = "text", ...props }) => (
    <div className="relative group">
        <input 
          type={type} required 
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sud-red focus:border-transparent outline-none transition-all group-hover:bg-white"
          {...props}
        />
    </div>
);

export default Login;