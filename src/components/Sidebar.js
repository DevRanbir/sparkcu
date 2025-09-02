import React, { useState, useEffect, useRef } from 'react';
import './Sidebar.css';

function Sidebar({ currentPath, onNavigate, isLoggedIn, isAdminLoggedIn, onLogout, pageVisibilitySettings = {} }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMobileDropdown(false);
      }
    };

    if (showMobileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileDropdown]);

  const baseSidebarItems = [
    { 
      id: 'home', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ), 
      title: 'Home' 
    },
    { 
      id: 'rules', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ), 
      title: 'Rules' 
    },
    { 
      id: 'schedule', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
          <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ), 
      title: 'Schedule' 
    },
    { 
      id: 'prizes', 
      icon: (
        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7.171 12.906-2.153 6.411 2.672-.89 1.568 2.34 1.825-5.183m5.73-2.678 2.154 6.411-2.673-.89-1.568 2.34-1.825-5.183M9.165 4.3c.58.068 1.153-.17 1.515-.628a1.681 1.681 0 0 1 2.64 0 1.68 1.68 0 0 0 1.515.628 1.681 1.681 0 0 1 1.866 1.866c-.068.58.17 1.154.628 1.516a1.681 1.681 0 0 1 0 2.639 1.682 1.682 0 0 0-.628 1.515 1.681 1.681 0 0 1-1.866 1.866 1.681 1.681 0 0 0-1.516.628 1.681 1.681 0 0 1-2.639 0 1.681 1.681 0 0 0-1.515-.628 1.681 1.681 0 0 1-1.867-1.866 1.681 1.681 0 0 0-.627-1.515 1.681 1.681 0 0 1 0-2.64c.458-.361.696-.935.627-1.515A1.681 1.681 0 0 1 9.165 4.3ZM14 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/>
        </svg>

      ), 
      title: 'Prizes' 
    },
    { 
      id: 'about', 
      icon: (
        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
        </svg>
      ), 
      title: 'About' 
    },
    { 
      id: 'keymaps', 
      icon: (
        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 8v8m0-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 0a4 4 0 0 1-4 4h-1a3 3 0 0 0-3 3"/>
        </svg>

      ), 
      title: 'Key Maps' 
    },
    { 
      id: 'gallery', 
      icon: (
        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m3 16 5-7 6 6.5m6.5 2.5L16 13l-4.286 6M14 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>
        </svg>
      ), 
      title: 'Gallery' 
    },
    { 
      id: 'result', 
      icon: (
        <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11 9a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"/>
          <path fill-rule="evenodd" d="M9.896 3.051a2.681 2.681 0 0 1 4.208 0c.147.186.38.282.615.255a2.681 2.681 0 0 1 2.976 2.975.681.681 0 0 0 .254.615 2.681 2.681 0 0 1 0 4.208.682.682 0 0 0-.254.615 2.681 2.681 0 0 1-2.976 2.976.681.681 0 0 0-.615.254 2.682 2.682 0 0 1-4.208 0 .681.681 0 0 0-.614-.255 2.681 2.681 0 0 1-2.976-2.975.681.681 0 0 0-.255-.615 2.681 2.681 0 0 1 0-4.208.681.681 0 0 0 .255-.615 2.681 2.681 0 0 1 2.976-2.975.681.681 0 0 0 .614-.255ZM12 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" clip-rule="evenodd"/>
          <path d="M5.395 15.055 4.07 19a1 1 0 0 0 1.264 1.267l1.95-.65 1.144 1.707A1 1 0 0 0 10.2 21.1l1.12-3.18a4.641 4.641 0 0 1-2.515-1.208 4.667 4.667 0 0 1-3.411-1.656Zm7.269 2.867 1.12 3.177a1 1 0 0 0 1.773.224l1.144-1.707 1.95.65A1 1 0 0 0 19.915 19l-1.32-3.93a4.667 4.667 0 0 1-3.4 1.642 4.643 4.643 0 0 1-2.53 1.21Z"/>
        </svg>
      ), 
      title: 'Result' 
    }
  ];

  // Authentication-dependent items
  const authItems = isAdminLoggedIn ? 
    [{
      id: 'management', 
      icon: (
        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M20 6H10m0 0a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0m0 0H4m16 6h-2m0 0a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0m0 0H4m16 6H10m0 0a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0m0 0H4"/>
        </svg>
      ), 
      title: 'Management' 
    }] :
    isLoggedIn ? 
    [{
      id: 'dashboard', 
      icon: (
        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9h3m-3 3h3m-3 3h3m-6 1c-.306-.613-.933-1-1.618-1H7.618c-.685 0-1.312.387-1.618 1M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm7 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/>
        </svg>
      ), 
      title: 'Dashboard' 
    }] :
    [{
      id: 'register', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="17" y1="11" x2="23" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ), 
      title: 'Register' 
    },
    {
      id: 'login', 
      icon: (
        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 13 16h-2a3.987 3.987 0 0 0-3.951 3.512A8.948 8.948 0 0 0 12 21Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
        </svg>

      ),
      title: 'Login' 
    }];

  // Filter base sidebar items based on page visibility settings (admins see all pages)
  const filteredBaseSidebarItems = baseSidebarItems.filter(item => 
    isAdminLoggedIn || pageVisibilitySettings[item.id] !== false
  );

  // Filter auth items based on page visibility settings (admins see all pages)
  const filteredAuthItems = authItems.filter(item => 
    isAdminLoggedIn || pageVisibilitySettings[item.id] !== false
  );

  const sidebarItems = [...filteredBaseSidebarItems, ...filteredAuthItems];

  // Add logout item if logged in (either regular user or admin)
  if (isLoggedIn || isAdminLoggedIn) {
    sidebarItems.push({
      id: 'logout',
      icon: (
        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12h4M4 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
        </svg>
      ),
      title: 'Logout'
    });
  }

  const handleItemClick = (itemId) => {
    if (itemId === 'logout') {
      setShowLogoutConfirm(true);
    } else if (itemId === 'more') {
      setShowMobileDropdown(!showMobileDropdown);
    } else {
      onNavigate(itemId);
      setShowMobileDropdown(false); // Close dropdown when navigating
    }
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  // Get current page from path
  const getCurrentPage = () => {
    const pathParts = currentPath.split('/');
    return pathParts[pathParts.length - 1] || 'home';
  };

  const currentPage = getCurrentPage();

  // Split items for mobile view - use the same logic as desktop
  const allItems = [...sidebarItems];

  const mobileVisibleItems = allItems.slice(0, 4);
  const mobileHiddenItems = allItems.slice(4);
  
  // Create more button if there are hidden items
  const moreButton = mobileHiddenItems.length > 0 ? {
    id: 'more',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'More'
  } : null;

  const mobileDisplayItems = moreButton ? [...mobileVisibleItems, moreButton] : mobileVisibleItems;

  return (
    <div className="sidebar-container">
      <div className="sidebar">
        <div className="sidebar-content">
          {/* Desktop: Show all items */}
          <div className="desktop-items">
            {allItems.map((item) => (
              <div
                key={item.id}
                className={`sidebar-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => handleItemClick(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                
                {/* Custom Tooltip */}
                {hoveredItem === item.id && (
                  <div className="sidebar-tooltip">
                    {item.title}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile: Show limited items with dropdown */}
          <div className="mobile-items">
            {mobileDisplayItems.map((item) => (
              <div
                key={item.id}
                className={`sidebar-item ${currentPage === item.id ? 'active' : ''} ${item.id === 'more' ? 'more-button' : ''}`}
                onClick={() => handleItemClick(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                
                {/* Custom Tooltip */}
                {hoveredItem === item.id && (
                  <div className="sidebar-tooltip">
                    {item.title}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {showMobileDropdown && mobileHiddenItems.length > 0 && (
          <div className="mobile-dropdown" ref={dropdownRef}>
            <div className="mobile-dropdown-content">
              {mobileHiddenItems.map((item) => (
                <div
                  key={item.id}
                  className={`mobile-dropdown-item ${currentPage === item.id ? 'active' : ''}`}
                  onClick={() => handleItemClick(item.id)}
                >
                  <span className="dropdown-icon">{item.icon}</span>
                  <span className="dropdown-title">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <div className="logout-modal-header">
              <h3>Confirm Logout</h3>
            </div>
            <div className="logout-modal-content">
              <p>Are you sure you want to logout?</p>
              {isAdminLoggedIn && (
                <p className="admin-logout-note">Admin session will be cleared and page will refresh.</p>
              )}
            </div>
            <div className="logout-modal-actions">
              <button 
                className="logout-cancel-btn" 
                onClick={handleLogoutCancel}
              >
                Cancel
              </button>
              <button 
                className="logout-confirm-btn" 
                onClick={handleLogoutConfirm}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
