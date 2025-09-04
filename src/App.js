import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import Homepage from './pages/Homepage';
import Rules from './pages/Rules';
import Schedule from './pages/Schedule';
import About from './pages/About';
import KeyMaps from './pages/KeyMaps';
import Prizes from './pages/Prizes';
import Gallery from './pages/Gallery';
import Result from './pages/Result';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Management from './pages/Management';
import FAQ from './pages/FAQ';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { logoutUser, logoutAdmin, getPageVisibilitySettings, migrateFAQPageVisibility } from './services/firebase';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// Component to handle the main app content with routing
function AppContent() {
  const { currentUser, adminSession } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [pageVisibilityLoading, setPageVisibilityLoading] = useState(true);
  const [pageVisibilitySettings, setPageVisibilitySettings] = useState({
    home: true,
    rules: true,
    schedule: true,
    about: true,
    keymaps: true,
    prizes: true,
    gallery: true,
    result: true,
    dashboard: true,
    login: true,
    register: true,
    faq: true
  });
  const location = useLocation();
  const navigate = useNavigate();

  // Auto scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Update login state based on Firebase auth state
  useEffect(() => {
    setIsLoggedIn(!!currentUser);
  }, [currentUser]);

  // Update admin login state
  useEffect(() => {
    setIsAdminLoggedIn(!!adminSession);
  }, [adminSession]);

  // Fetch page visibility settings
  useEffect(() => {
    const fetchPageVisibility = async () => {
      try {
        setPageVisibilityLoading(true);
        
        // First, run the migration to ensure FAQ is included
        await migrateFAQPageVisibility();
        
        // Then fetch the page visibility settings
        const result = await getPageVisibilitySettings();
        if (result.success) {
          setPageVisibilitySettings(result.data);
        }
      } catch (error) {
        console.error('Error fetching page visibility settings:', error);
      } finally {
        setPageVisibilityLoading(false);
      }
    };
    
    fetchPageVisibility();
  }, []);

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

  // Find the first available page as fallback
  const getFirstAvailablePage = () => {
    // Admins can always access home
    if (isAdminLoggedIn) {
      return 'home';
    }
    
    const availablePages = ['home', 'rules', 'schedule', 'about', 'keymaps', 'prizes', 'gallery', 'result', 'faq'];
    for (const page of availablePages) {
      if (pageVisibilitySettings[page]) {
        return page;
      }
    }
    return 'home'; // Ultimate fallback
  };

  const fallbackPage = getFirstAvailablePage();

  // Show loading screen while page visibility settings are being fetched
  if (pageVisibilityLoading) {
    return (
      <div className="App">
        <DotLottieReact
          src="https://lottie.host/b01dcfb7-54c1-4dfb-9e00-3313fc676651/yjqVt2gkbr.lottie"
          loop
          autoplay
        />
      </div>
    );
  }

  return (
    <div className="App">
      <Sidebar 
        currentPath={location.pathname}
        onNavigate={handleNavigation}
        isLoggedIn={isLoggedIn}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogout={handleLogout}
        pageVisibilitySettings={pageVisibilitySettings}
      />
      <div className="main-content">
        <Routes>
          <Route path="/home" element={(pageVisibilitySettings.home || isAdminLoggedIn) ? <Homepage /> : <Navigate to={`/${fallbackPage}`} replace />} />
          <Route path="/rules" element={(pageVisibilitySettings.rules || isAdminLoggedIn) ? <Rules /> : <Navigate to={`/${fallbackPage}`} replace />} />
          <Route path="/schedule" element={(pageVisibilitySettings.schedule || isAdminLoggedIn) ? <Schedule /> : <Navigate to={`/${fallbackPage}`} replace />} />
          <Route path="/about" element={(pageVisibilitySettings.about || isAdminLoggedIn) ? <About /> : <Navigate to={`/${fallbackPage}`} replace />} />
          <Route path="/keymaps" element={(pageVisibilitySettings.keymaps || isAdminLoggedIn) ? <KeyMaps /> : <Navigate to={`/${fallbackPage}`} replace />} />
          <Route path="/prizes" element={(pageVisibilitySettings.prizes || isAdminLoggedIn) ? <Prizes /> : <Navigate to={`/${fallbackPage}`} replace />} />
          <Route path="/gallery" element={(pageVisibilitySettings.gallery || isAdminLoggedIn) ? <Gallery /> : <Navigate to={`/${fallbackPage}`} replace />} />
          <Route path="/result" element={(pageVisibilitySettings.result || isAdminLoggedIn) ? <Result /> : <Navigate to={`/${fallbackPage}`} replace />} />
          <Route path="/faq" element={(pageVisibilitySettings.faq !== false || isAdminLoggedIn) ? <FAQ /> : <Navigate to={`/${fallbackPage}`} replace />} />
          <Route 
            path="/dashboard" 
            element={(isLoggedIn && (pageVisibilitySettings.dashboard || isAdminLoggedIn)) ? <Dashboard /> : <Navigate to={pageVisibilitySettings.login ? "/login" : `/${fallbackPage}`} replace />} 
          />
          <Route 
            path="/management" 
            element={isAdminLoggedIn ? <Management /> : <Navigate to="/admin" replace />} 
          />
          <Route path="/login" element={(pageVisibilitySettings.login || isAdminLoggedIn) ? <Login onLogin={handleLogin} /> : <Navigate to={`/${fallbackPage}`} replace />} />
          <Route path="/register" element={(pageVisibilitySettings.register || isAdminLoggedIn) ? <Register /> : <Navigate to={`/${fallbackPage}`} replace />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/" element={<Navigate to={`/${fallbackPage}`} replace />} />
          <Route path="*" element={<Navigate to={`/${fallbackPage}`} replace />} />
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
