import React, { useState, useEffect } from 'react';
import './Login.css';
import { loginUser, resetPassword, onAuthStateChange, getUserData, resendEmailVerification } from '../services/firebase';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    emailOrTeam: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Prevent body scroll when modals are open
  useEffect(() => {
    if (showResetModal || showVerificationModal) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      // Prevent scroll on iOS Safari
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [showResetModal, showVerificationModal]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Check for persistent login on component mount
  useEffect(() => {
    // Set up Firebase auth state observer to check for existing session
    const unsubscribe = onAuthStateChange(async (user) => {
      if (!hasCheckedAuth) {
        setHasCheckedAuth(true);
        
        if (user && user.emailVerified) {
          // Check if remember me was enabled or if this is a valid session
          const isRemembered = localStorage.getItem('rememberLogin') === 'true';
          const loginSession = sessionStorage.getItem('loginSession');
          
          // Only auto-login if remember me was checked or there's an active session
          if (isRemembered || loginSession) {
            try {
              // Force refresh the user token to ensure email verification is current
              await user.reload();
              
              // Double-check email verification after reload
              if (user.emailVerified) {
                const result = await getUserData(user.uid);
                if (result.success && result.data) {
                  // Auto-login the user
                  onLogin(result.data);
                }
              } else {
                // User is no longer verified, clear any stored sessions
                localStorage.removeItem('rememberLogin');
                sessionStorage.removeItem('loginSession');
              }
            } catch (error) {
              console.error('Error getting user data:', error);
              // Clear sessions on error
              localStorage.removeItem('rememberLogin');
              sessionStorage.removeItem('loginSession');
            }
          }
        } else if (user && !user.emailVerified) {
          // User exists but not verified, clear any stored sessions
          localStorage.removeItem('rememberLogin');
          sessionStorage.removeItem('loginSession');
        }
        // If user is not verified, don't auto-login, let them see the login form
      }
    });

    return () => unsubscribe();
  }, [onLogin, hasCheckedAuth]);

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!resetEmail) {
      showToast('Please enter your email address');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(resetEmail)) {
      showToast('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await resetPassword(resetEmail);
      
      if (result.success) {
        showToast(result.message, 'success');
        setShowResetModal(false);
        setResetEmail('');
      } else {
        showToast(result.message);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      showToast('Failed to send password reset email. Please check your email address and try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationEmail || !formData.password) {
      showToast('Please enter your credentials to resend verification email');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await resendEmailVerification(verificationEmail, formData.password);
      
      if (result.success) {
        showToast(result.message, 'success');
        // Don't close the modal immediately, let user check email
      } else {
        showToast(result.message);
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      showToast('Failed to resend verification email. Please check your credentials and try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationModalClose = () => {
    setShowVerificationModal(false);
    setVerificationEmail('');
    // Reset form data when closing verification modal
    setFormData({
      emailOrTeam: '',
      password: '',
      rememberMe: false
    });
    // Clear any stored sessions that might cause auto-login issues
    sessionStorage.removeItem('loginSession');
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
      // Clear any previous sessions before attempting login
      sessionStorage.removeItem('loginSession');
      
      // Login with Firebase
      const result = await loginUser(formData.emailOrTeam, formData.password, formData.rememberMe);

      if (result.success) {
        // Handle remember me functionality
        if (formData.rememberMe) {
          localStorage.setItem('rememberLogin', 'true');
        } else {
          localStorage.removeItem('rememberLogin');
          // Set session timestamp for this login session
          sessionStorage.setItem('loginSession', Date.now().toString());
        }
        
        showToast(result.message, 'success');
        
        // Only navigate if there's no verification modal shown
        if (!showVerificationModal) {
          setTimeout(() => {
            onLogin(result.userData);
          }, 1000);
        }
      } else {
        // Check if it's an email verification error
        if (result.needsVerification) {
          setVerificationEmail(result.email);
          setShowVerificationModal(true);
        }
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Login error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      // Provide more specific error message based on error type
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.message && error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message && error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.code) {
        errorMessage = `Error (${error.code}): ${error.message}`;
      }
      
      showToast(errorMessage, 'error');
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
                  <p>Compete for exciting rewards, recognition and certicates</p>
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
                <label htmlFor="emailOrTeam">Email Address*</label>
                <input
                  type="text"
                  id="emailOrTeam"
                  name="emailOrTeam"
                  value={formData.emailOrTeam}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                />
                <small className="input-hint">You can only use your registered email.</small>
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
                <a 
                  href="#forgot" 
                  className="forgot-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowResetModal(true);
                  }}
                >
                  Forgot password?
                </a>
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
              <p>Don't have an account? <a href="/register">Register for SparkCU</a></p>
            </div>

          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reset Password</h3>
              <button 
                className="modal-close"
                onClick={() => setShowResetModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handlePasswordReset} className="reset-form">
              <div className="form-group">
                <label htmlFor="resetEmail">Email Address</label>
                <input
                  type="email"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                />
                <small className="input-hint">
                  We'll send you a link to reset your password
                </small>
              </div>
              
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowResetModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="nav-button submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Verification Modal */}
      {showVerificationModal && (
        <div 
          className="modal-overlay" 
          onClick={handleVerificationModalClose}
          onTouchStart={(e) => {
            // Prevent iOS Safari from bouncing when scrolling modal background
            if (e.target === e.currentTarget) {
              e.preventDefault();
            }
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Email Verification Required</h3>
              <button 
                className="modal-close"
                onClick={handleVerificationModalClose}
                onTouchStart={(e) => e.stopPropagation()}
              >
                ×
              </button>
            </div>
            
            <div className="verification-content">
              <div className="verification-icon">
                📧
              </div>
              <p>
                Your email address <strong>{verificationEmail}</strong> needs to be verified 
                before you can access your dashboard.
              </p>
              <p>
                Please check your inbox for the verification email and click the verification link.
              </p>
              <p>
                If you haven't received the email, you can request a new one below.
              </p>
              
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleVerificationModalClose}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="nav-button submit-button"
                  onClick={handleResendVerification}
                  onTouchStart={(e) => e.stopPropagation()}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
