import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        
        {/* Placeholders for next phases */}
        <Route path="/my-tickets" element={<div className="text-center mt-10"><h1>User Dashboard Coming Soon...</h1></div>} />
        <Route path="/dashboard" element={<div className="text-center mt-10"><h1>Manager Dashboard Coming Soon...</h1></div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;