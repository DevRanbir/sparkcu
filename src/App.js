import React, { useState, useEffect } from 'react';
import './App.css';
import Homepage from './Homepage';
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

function App() {
  const [currentPage, setCurrentPage] = useState('homepage');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

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
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    setCurrentPage('homepage');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'homepage':
        return <Homepage />;
      case 'rules':
        return <Rules />;
      case 'schedule':
        return <Schedule />;
      case 'about':
        return <About />;
      case 'keymaps':
        return <KeyMaps />;
      case 'prizes':
        return <Prizes />;
      case 'dashboard':
        return isLoggedIn ? <Dashboard userData={userData} /> : <Login onLogin={handleLogin} />;
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'register':
        return <Register />;
      default:
        return <Homepage />;
    }
  };

  return (
    <div className="App">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />
      <div className="main-content">
        {renderCurrentPage()}
      </div>
      <Footer />
    </div>
  );
}

export default App;
