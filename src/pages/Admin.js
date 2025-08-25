import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin, isAdminLoggedIn } from '../services/firebase';
import './Admin.css';

function Admin() {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  // Check admin login status on component mount only
  useEffect(() => {
    const checkAdminAuth = () => {
      const adminSession = isAdminLoggedIn();
      if (adminSession) {
        navigate('/management', { replace: true });
      } else {
        setCheckingAuth(false);
      }
    };

    // Only check once on mount
    checkAdminAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!adminId.trim() || !password.trim()) {
      setError('Please enter both Admin ID and Password');
      setLoading(false);
      return;
    }

    try {
      const result = await loginAdmin(adminId.trim(), password);
      
      if (result.success) {
        // Keep loading state active during navigation
        // Add a small delay to ensure login state is properly set
        setTimeout(() => {
          navigate('/management', { replace: true });
          // Don't set loading to false here, let the navigation handle it
        }, 200);
      } else {
        setError(result.message);
        setLoading(false);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="admin-container">
        <div className="admin-card">
          <div className="admin-header">
            <h2>Checking Authentication...</h2>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-card">
        <div className="admin-header">
          <h2>Admin Access</h2>
          <p>Enter your credentials to access the management panel</p>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="adminId">Admin ID</label>
            <input
              type="text"
              id="adminId"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              placeholder="Enter your admin ID"
              disabled={loading}
              autoComplete="username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
          
          <button 
            type="submit" 
            className={`admin-submit-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
          

        </form>
        
        <div className="admin-footer">
          <p>Access restricted to authorized personnel only</p>
        </div>
      </div>
    </div>
  );
}

export default Admin;
