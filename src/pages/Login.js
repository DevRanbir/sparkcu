import React, { useState, useEffect } from 'react';
import './Login.css';
import { loginUser } from '../services/firebase';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    emailOrTeam: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setToast({ show: false, message: '', type: '' });

    // Validate form
    if (!formData.emailOrTeam || !formData.password) {
      showToast('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    // Check if input is email (Firebase Auth requires email)
    const isEmail = formData.emailOrTeam.includes('@');
    if (!isEmail) {
      showToast('Please enter your email address to login');
      setIsLoading(false);
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.emailOrTeam)) {
      showToast('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      // Login with Firebase
      const result = await loginUser(formData.emailOrTeam, formData.password);

      if (result.success) {
        // Save to localStorage for persistence if remember me is checked
        if (formData.rememberMe) {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userData', JSON.stringify(result.userData));
        }
        
        showToast(result.message, 'success');
        
        setTimeout(() => {
          onLogin(result.userData);
        }, 1000);
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {toast.type === 'success' ? '✓' : '⚠'}
            </span>
            <span className="toast-message">{toast.message}</span>
            <button 
              className="toast-close"
              onClick={() => setToast({ show: false, message: '', type: '' })}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="login-container">
        {/* Left Side - Welcome Section */}
        <div className="login-welcome-section">
          <div className="welcome-content">
            <h1>Welcome Back to SparkCU</h1>
            <p className="welcome-subtitle">Ready to ignite your coding potential?</p>
            
            <div className="welcome-features">
              <div className="feature-item">
                <div className="feature-icon">🚀</div>
                <div className="feature-text">
                  <h4>Challenge Yourself</h4>
                  <p>Take on exciting coding challenges and push your limits</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">👥</div>
                <div className="feature-text">
                  <h4>Team Collaboration</h4>
                  <p>Work together with your team to solve complex problems</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">🏆</div>
                <div className="feature-text">
                  <h4>Win Amazing Prizes</h4>
                  <p>Compete for exciting rewards and recognition</p>
                </div>
              </div>
            </div>
            
            <div className="welcome-stats">
              <div className="stat-item">
                <h3>500+</h3>
                <p>Participants</p>
              </div>
              <div className="stat-item">
                <h3>50+</h3>
                <p>Teams</p>
              </div>
              <div className="stat-item">
                <h3>₹50K</h3>
                <p>Prize Pool</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-section">
          <div className="form-container">
            <div className="form-header">
              <h2>Sign In</h2>
              <p>Enter your credentials to access your dashboard</p>
            </div>
            
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="emailOrTeam">Email Address or Team Name *</label>
                <input
                  type="text"
                  id="emailOrTeam"
                  name="emailOrTeam"
                  value={formData.emailOrTeam}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email or team name"
                />
                <small className="input-hint">You can use either your registered email or team name</small>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your password"
                />
              </div>

              <div className="form-options">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                  />
                  Remember me
                </label>
                <a href="#forgot" className="forgot-link">Forgot password?</a>
              </div>

              <button
                type="submit"
                className="nav-button submit-button"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
            
            <div className="login-footer">
              <p>Don't have an account? <a href="#register">Register for SparkCU</a></p>
            </div>

            <div className="demo-credentials">
              <h4>Demo Credentials:</h4>
              <p><strong>Email:</strong> demo@sparkcu.edu</p>
              <p><strong>Team:</strong> TeamSpark</p>
              <p><strong>Password:</strong> demo123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
