import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Default to User
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/auth/login', {
        email,
        password,
        role
      });
      
      // Save Token
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user',JSON.stringify(res.data.user));
      
      alert(`Welcome ${res.data.user.name}!`);
      // Redirect based on role (we will build these pages next)
      navigate(role === 'employee' ? '/dashboard' : '/my-tickets');

    } catch (err) {
      setError(err.response?.data?.error || "Login Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sud-light">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 border-t-4 border-sud-red">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-sud-blue">SUD Life Login</h2>
          <p className="text-sm text-gray-500">Support Ticket System</p>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-sm">{error}</div>}

        <div className="flex justify-center mb-6 bg-gray-100 p-1 rounded-lg">
          <button 
            className={`flex-1 py-1 rounded-md text-sm font-medium transition-all ${role === 'user' ? 'bg-white shadow text-sud-blue' : 'text-gray-500'}`}
            onClick={() => setRole('user')}
          >
            Policy Holder
          </button>
          <button 
            className={`flex-1 py-1 rounded-md text-sm font-medium transition-all ${role === 'employee' ? 'bg-white shadow text-sud-blue' : 'text-gray-500'}`}
            onClick={() => setRole('employee')}
          >
            Employee
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input 
              type="email" 
              className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-sud-red focus:border-sud-red outline-none"
              placeholder={role === 'user' ? "amit@gmail.com" : "admin@sudlife.in"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-sud-red focus:border-sud-red outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="w-full bg-sud-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;