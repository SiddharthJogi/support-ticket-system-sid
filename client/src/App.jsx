/* client/src/App.jsx */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import ManagerDashboard from './pages/ManagerDashboard'; // <--- NEW IMPORT
import UserDashboard from './pages/UserDashboard'; // <--- NEW IMPORT

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Login Page */}
        <Route path="/login" element={<Login />} />
        
        {/* Manager Dashboard (Connected to the file you created) */}
        <Route path="/dashboard" element={<ManagerDashboard />} /> 
        
        {/* User Dashboard Placeholder (We build this next) */}
        <Route path="/my-tickets" element={
            <UserDashboard />
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App;