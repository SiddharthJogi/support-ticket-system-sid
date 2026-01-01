import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Assets
import logo from '../assets/company-logo.png';
import banner from '../assets/company-banner.svg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/auth/login', { email, password, role });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate(role === 'employee' ? '/dashboard' : '/my-tickets');
    } catch (err) {
      alert(err.response?.data?.error || "Login Failed");
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
               src={logo} 
               alt="SUD Life" 
               className="h-16 mx-auto mb-6 drop-shadow-lg"
               initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}
             />
             <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
             <p className="text-gray-500 mt-2">Please enter your details to sign in.</p>
          </div>

          {/* Role Switcher */}
          <div className="bg-gray-100 p-1.5 rounded-xl flex relative">
            <motion.div 
              className="absolute bg-white shadow-md rounded-lg h-[calc(100%-12px)] top-1.5 bottom-1.5"
              layoutId="activeRole"
              style={{ width: '48%', left: role === 'user' ? '4px' : '50%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button 
              onClick={() => setRole('user')}
              className={`flex-1 relative z-10 py-2.5 text-sm font-semibold rounded-lg transition-colors ${role === 'user' ? 'text-sud-blue' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Policy Holder
            </button>
            <button 
              onClick={() => setRole('employee')}
              className={`flex-1 relative z-10 py-2.5 text-sm font-semibold rounded-lg transition-colors ${role === 'employee' ? 'text-sud-blue' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Employee
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
               <div className="relative group">
                 <input 
                    type="email" required 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sud-red focus:border-transparent outline-none transition-all group-hover:bg-white"
                    placeholder="Email Address"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                 />
               </div>
               <div className="relative group">
                 <input 
                    type="password" required 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sud-red focus:border-transparent outline-none transition-all group-hover:bg-white"
                    placeholder="Password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                 />
               </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-sud-red to-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all disabled:opacity-70"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-400">
            Protected by SUD Life Enterprise Security
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
         {/* Background Pattern */}
         <div className="absolute inset-0 bg-gradient-to-br from-sud-blue to-[#001f3f] opacity-90 z-10"></div>
         
         {/* The SVG Banner */}
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

export default Login;