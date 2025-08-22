import React from 'react';
import './Navbar.css';

function Navbar({ currentPage, setCurrentPage }) {
  const navItems = [
    { id: 'homepage', label: 'Home' },
    { id: 'rules', label: 'Rules' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'dashboard', label: 'Dashboard' }
  ];

  const handleNavigation = (pageId) => {
    setCurrentPage(pageId);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <h2>SparkCU</h2>
          <span>Ideathon 2025-26</span>
        </div>
        
        <div className="navbar-links">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => handleNavigation(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        
        <div className="navbar-actions">
          <button 
            className="btn-register"
            onClick={() => handleNavigation('register')}
          >
            Register Now
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
