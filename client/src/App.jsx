import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import ManagerDashboard from './pages/ManagerDashboard'; 
import UserDashboard from './pages/UserDashboard'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Login Page */}
        <Route path="/login" element={<Login />} />
        
        {/* Manager Dashboard */}
        <Route path="/dashboard" element={<ManagerDashboard />} /> 
        
        {/* User Dashboard Placeholder */}
        <Route path="/my-tickets" element={
            <UserDashboard />
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App;