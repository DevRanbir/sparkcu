import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import Homepage from './pages/Homepage';
import Rules from './pages/Rules';
import Schedule from './pages/Schedule';
import About from './pages/About';
import KeyMaps from './pages/KeyMaps';
import Prizes from './pages/Prizes';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

// Component to handle the main app content with routing
function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Check for existing login on app load
  useEffect(() => {
    const savedLoginState = localStorage.getItem('isLoggedIn');
    const savedUserData = localStorage.getItem('userData');
    
    if (savedLoginState === 'true' && savedUserData) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(savedUserData));
    }
  }, []);

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setUserData(user);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(user));
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    navigate('/homepage');
  };

  const handleNavigation = (page) => {
    navigate(`/${page}`);
  };

  return (
    <div className="App">
      <Sidebar 
        currentPath={location.pathname}
        onNavigate={handleNavigation}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />
      <div className="main-content">
        <Routes>
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/about" element={<About />} />
          <Route path="/keymaps" element={<KeyMaps />} />
          <Route path="/prizes" element={<Prizes />} />
          <Route 
            path="/dashboard" 
            element={isLoggedIn ? <Dashboard userData={userData} /> : <Navigate to="/login" />} 
          />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/homepage" />} />
          <Route path="*" element={<Navigate to="/homepage" />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router basename="/cuSpark">
      <AppContent />
    </Router>
  );
}

export default App;
