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
import Admin from './pages/Admin';
import Management from './pages/Management';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { logoutUser, logoutAdmin } from './services/firebase';

// Component to handle the main app content with routing
function AppContent() {
  const { currentUser, adminSession } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Update login state based on Firebase auth state
  useEffect(() => {
    setIsLoggedIn(!!currentUser);
  }, [currentUser]);

  // Update admin login state
  useEffect(() => {
    setIsAdminLoggedIn(!!adminSession);
  }, [adminSession]);

  // Check for existing login on app load (for backward compatibility)
  useEffect(() => {
    if (!currentUser) {
      const savedLoginState = localStorage.getItem('isLoggedIn');
      const savedUserData = localStorage.getItem('userData');
      
      if (savedLoginState === 'true' && savedUserData) {
        // Clear old localStorage data since we're using Firebase now
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
      }
    }
  }, [currentUser]);

  const handleLogin = (user) => {
    // Firebase handles the auth state, just navigate to dashboard
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    try {
      if (isAdminLoggedIn) {
        // Admin logout
        logoutAdmin();
        setIsAdminLoggedIn(false);
        // Reload the page to ensure clean state
        window.location.href = '/home';
      } else {
        // Regular user logout
        const result = await logoutUser();
        if (result.success) {
          // Force update the logged in state
          setIsLoggedIn(false);
          // Navigate to home
          navigate('/home');
        } else {
          console.error('Logout failed:', result.message);
          // Force logout anyway
          setIsLoggedIn(false);
          navigate('/home');
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback logout - force clean state
      setIsLoggedIn(false);
      setIsAdminLoggedIn(false);
      localStorage.removeItem('rememberLogin');
      navigate('/home');
    }
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
        isAdminLoggedIn={isAdminLoggedIn}
        onLogout={handleLogout}
      />
      <div className="main-content">
        <Routes>
          <Route path="/home" element={<Homepage />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/about" element={<About />} />
          <Route path="/keymaps" element={<KeyMaps />} />
          <Route path="/prizes" element={<Prizes />} />
          <Route 
            path="/dashboard" 
            element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/management" 
            element={isAdminLoggedIn ? <Management /> : <Navigate to="/admin" />} 
          />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
