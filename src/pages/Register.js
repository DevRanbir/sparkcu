import React, { useState, useEffect } from 'react';
import './Register.css';
import { registerUser, checkTeamNameExists } from '../services/firebase';

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    leaderName: '',
    leaderUid: '',
    leaderMobile: '',
    teamName: '',
    topicName: '',
    academicYear: '2nd',
    members: [
      { name: '', uid: '', mobile: '' }, // Member 1
      { name: '', uid: '', mobile: '' }, // Member 2
      { name: '', uid: '', mobile: '' }  // Member 3
    ],
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const totalSteps = 5;

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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMemberChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const validateStep = (step) => {
    
    switch (step) {
      case 1:
        if (!formData.email || !formData.leaderName || !formData.leaderUid || !formData.leaderMobile) {
          showToast('Please fill in all required fields.');
          return false;
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(formData.email)) {
          showToast('Please enter a valid email address.');
          return false;
        }
        // Validate mobile number (assuming 10-digit format)
        if (!/^\+?[\d\s-]{10,15}$/.test(formData.leaderMobile.replace(/\s/g, ''))) {
          showToast('Please enter a valid mobile number.');
          return false;
        }
        return true;
      
      case 2:
        if (!formData.teamName || !formData.topicName) {
          showToast('Please enter both team name and topic name.');
          return false;
        }
        return true;
      
      case 3:
        const filledMembers = formData.members.filter(member => 
          member.name.trim() && member.uid.trim() && member.mobile.trim()
        );
        
        if (filledMembers.length < 2) {
          showToast('Please fill details for at least 2 team members.');
          return false;
        }
        
        for (let member of filledMembers) {
          if (member.mobile.length !== 10 || !/^\d+$/.test(member.mobile)) {
            showToast('Please enter valid 10-digit mobile numbers.');
            return false;
          }
        }
        return true;
      
      case 4:
        if (!formData.password || !formData.confirmPassword) {
          showToast('Please fill in all password fields.');
          return false;
        }
        
        if (formData.password.length < 6) {
          showToast('Password must be at least 6 characters long.');
          return false;
        }
        
        if (formData.password !== formData.confirmPassword) {
          showToast('Passwords do not match.');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const validateStepAsync = async (step) => {
    if (step === 2) {
      const teamExists = await checkTeamNameExists(formData.teamName);
      if (teamExists) {
        showToast('Team name already exists. Please choose a different name.');
        return false;
      }
    }
    return true;
  };

  const nextStep = async () => {
    if (validateStep(currentStep)) {
      const asyncValid = await validateStepAsync(currentStep);
      if (asyncValid) {
        setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      }
    }
  };

  const prevStep = () => {
    setToast({ show: false, message: '', type: '' });
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const goToStep = (step) => {
    setToast({ show: false, message: '', type: '' });
    setCurrentStep(step);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(4)) {
      return;
    }

    // Also check team name uniqueness before final submission
    const teamExists = await checkTeamNameExists(formData.teamName);
    if (teamExists) {
      showToast('Team name already exists. Please go back and choose a different name.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare user data for Firebase
      const userData = {
        leaderName: formData.leaderName,
        leaderUid: formData.leaderUid,
        leaderMobile: formData.leaderMobile,
        teamName: formData.teamName,
        topicName: formData.topicName,
        academicYear: formData.academicYear,
        members: formData.members.filter(member => member.name.trim() !== '') // Only include members with names
      };

      // Register user with Firebase
      const result = await registerUser(formData.email, formData.password, userData);

      if (result.success) {
        showToast(result.message, 'success');
        setCurrentStep(5);
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showToast('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      leaderName: '',
      leaderUid: '',
      leaderMobile: '',
      teamName: '',
      topicName: '',
      academicYear: '2nd',
      members: [
        { name: '', uid: '', mobile: '' },
        { name: '', uid: '', mobile: '' },
        { name: '', uid: '', mobile: '' }
      ],
      password: '',
      confirmPassword: ''
    });
    setCurrentStep(1);
    setToast({ show: false, message: '', type: '' });
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3, 4, 5].map((step) => (
        <div
          key={step}
          className={`step ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}
          onClick={() => step < currentStep && goToStep(step)}
        >
          <div className="step-number">{step}</div>
          <div className="step-label">
            {step === 1 && 'Leader Info'}
            {step === 2 && 'Team Details'}
            {step === 3 && 'Members'}
            {step === 4 && 'Password'}
            {step === 5 && 'Complete'}
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="step-content">
      <h3>Team Leader Information</h3>
      <p className="step-description">Enter your details as the team leader</p>
      
      <div className="form-group">
        <label htmlFor="email">Email Address *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="leader@university.edu"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="leaderName">Leader Full Name *</label>
        <input
          type="text"
          id="leaderName"
          name="leaderName"
          value={formData.leaderName}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="leaderUid">Leader University ID *</label>
        <input
          type="text"
          id="leaderUid"
          name="leaderUid"
          value={formData.leaderUid}
          onChange={handleInputChange}
          placeholder="e.g., 24BCS00000"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="leaderMobile">Leader Mobile Number *</label>
        <input
          type="tel"
          id="leaderMobile"
          name="leaderMobile"
          value={formData.leaderMobile}
          onChange={handleInputChange}
          placeholder="+91 9876543210"
          required
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-content">
      <h3>Team Details</h3>
      <p className="step-description">Choose your team name, topic, and academic year</p>
      
      <div className="form-group">
        <label htmlFor="teamName">Team Name *</label>
        <input
          type="text"
          id="teamName"
          name="teamName"
          value={formData.teamName}
          onChange={handleInputChange}
          placeholder="Enter your team name"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="topicName">Topic Name *</label>
        <input
          type="text"
          id="topicName"
          name="topicName"
          value={formData.topicName}
          onChange={handleInputChange}
          placeholder="Enter your topic name"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="academicYear">Academic Year of leader*</label>
        <select
          id="academicYear"
          name="academicYear"
          value={formData.academicYear}
          onChange={handleInputChange}
          required
        >
          <option value="1st">1st Year</option>
          <option value="2nd">2nd Year</option>
        </select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-content">
      <h3>Team Members</h3>
      <p className="step-description">Add 2-3 team members (minimum 2 required)</p>
      
      <div className="members-grid">
        {formData.members.slice(0, 3).map((member, index) => (
          <div key={index} className="member-card">
            <h4>Member {index + 1}</h4>
            
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={member.name}
                onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                placeholder="Enter member's full name"
              />
            </div>

            <div className="form-group">
              <label>University ID</label>
              <input
                type="text"
                value={member.uid}
                onChange={(e) => handleMemberChange(index, 'uid', e.target.value)}
                placeholder="Enter university ID"
              />
            </div>

            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="tel"
                value={member.mobile}
                onChange={(e) => handleMemberChange(index, 'mobile', e.target.value)}
                placeholder="10-digit mobile number"
                maxLength="10"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="step-content">
      <h3>Create Password</h3>
      <p className="step-description">Set up a secure password for your team login</p>
      
      <div className="form-group">
        <label htmlFor="password">Password *</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Enter a secure password (min 6 characters)"
          required
          minLength="6"
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password *</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Re-enter your password"
          required
          minLength="6"
        />
      </div>

      <div className="password-requirements">
        <h4>Password Requirements:</h4>
        <ul>
          <li className={formData.password.length >= 6 ? 'valid' : ''}>
            At least 6 characters long
          </li>
          <li className={formData.password === formData.confirmPassword && formData.password ? 'valid' : ''}>
            Passwords match
          </li>
        </ul>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="step-content success-step">
      <div className="success-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#28a745" strokeWidth="2"/>
          <path d="M8 12l2 2 4-4" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h3>Registration Complete!</h3>
      <p className="success-description">
        Your team "{formData.teamName}" has been successfully registered for SparkCU.
        Please check your email at {formData.email} for further instructions.<br />Check Junk Folder if not received else contact support.
      </p>
      
      <div className="team-summary">
        <h4>Team Summary:</h4>
        <p><strong>Leader:</strong> {formData.leaderName}</p>
        <p><strong>Academic Year:</strong> {formData.academicYear}</p>
        <p><strong>Members:</strong> {formData.members.filter(m => m.name.trim()).length} registered</p>
      </div>
    </div>
  );

  return (
    <div className="register-page">
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

      <div className="register-container">
        <div className="register-header">
          <h1>Register for SparkCU</h1>
          <p>Join the ultimate coding competition</p>
        </div>

        {renderStepIndicator()}

        <div className="form-container">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}

          {currentStep < 5 && (
            <div className="form-navigation">
              {currentStep > 1 && (
                <button
                  type="button"
                  className="nav-button prev-button"
                  onClick={prevStep}
                >
                  ← Previous
                </button>
              )}
              
              {currentStep < 4 && (
                <button
                  type="button"
                  className="nav-button next-button"
                  onClick={nextStep}
                >
                  Next →
                </button>
              )}
              
              {currentStep === 4 && (
                <button
                  type="button"
                  className="nav-button submit-button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? 'Registering...' : 'Complete Registration'}
                </button>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div className="final-actions">
              <button
                type="button"
                className="nav-button"
                onClick={resetForm}
              >
                Register Another Team
              </button>
              <a href="/login" className="login-link">
                Go to Login
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
