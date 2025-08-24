import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin, isAdminLoggedIn, createDefaultAdmin } from '../services/firebase';
import './Admin.css';

function Admin() {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const [setupMessage, setSetupMessage] = useState('');
  const navigate = useNavigate();

  // Redirect if already logged in as admin
  useEffect(() => {
    const adminSession = isAdminLoggedIn();
    if (adminSession) {
      navigate('/management');
    }
  }, [navigate]);

  const handleSetupAdmin = async () => {
    setLoading(true);
    setSetupMessage('');
    
    try {
      const result = await createDefaultAdmin();
      
      if (result.success) {
        setSetupMessage(`Admin created successfully! Admin ID: ${result.credentials.adminId}, Password: ${result.credentials.password}`);
        setAdminId(result.credentials.adminId);
        setPassword(result.credentials.password);
      } else {
        setSetupMessage(result.message);
      }
    } catch (error) {
      setSetupMessage('Error setting up admin. Please try again.');
    }
    
    setLoading(false);
  };

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
        navigate('/management');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="admin-container">
      <div className="admin-card">
        <div className="admin-header">
          <h2>Admin Access</h2>
          <p>Enter your credentials to access the management panel</p>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-form">
          {error && <div className="error-message">{error}</div>}
          {setupMessage && <div className="success-message">{setupMessage}</div>}
          
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
          
          <div className="setup-section">
            <button 
              type="button"
              onClick={() => setSetupMode(!setupMode)}
              className="setup-toggle-btn"
              disabled={loading}
            >
              {setupMode ? 'Hide Setup' : 'First Time Setup'}
            </button>
            
            {setupMode && (
              <div className="setup-content">
                <p>If this is your first time, click below to create the default admin account:</p>
                <button 
                  type="button"
                  onClick={handleSetupAdmin}
                  className="setup-btn"
                  disabled={loading}
                >
                  {loading ? 'Creating Admin...' : 'Create Default Admin'}
                </button>
              </div>
            )}
          </div>
        </form>
        
        <div className="admin-footer">
          <p>Access restricted to authorized personnel only</p>
        </div>
      </div>
    </div>
  );
}

export default Admin;
