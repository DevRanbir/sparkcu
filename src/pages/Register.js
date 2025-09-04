import React, { useState, useEffect } from 'react';
import './Register.css';
import { registerUser, checkTeamNameExists, checkUniversityIdExists } from '../services/firebase';

const Register = () => {
  const [currentStep, setCurrentStep] = useState(0);
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
  const [isNavigating, setIsNavigating] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    // Format UID input
    if (field === 'uid') {
      value = value.toUpperCase().replace(/[^0-9BCS]/g, '');
      // Don't auto-format while typing, just filter characters
    }
    
    // Format mobile input - only digits, max 10
    if (field === 'mobile') {
      value = value.replace(/\D/g, '').substring(0, 10);
    }

    setFormData(prev => ({
      ...prev,
      members: prev.members.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const handleMemberUidBlur = async (index, value) => {
    // Auto-format UID when user stops typing (on blur)
    let finalValue = value;
    if (value.length >= 2 && !value.includes('BCS')) {
      if (/^\d{2}/.test(value)) {
        finalValue = value.substring(0, 2) + 'BCS' + value.substring(2);
        setFormData(prev => ({
          ...prev,
          members: prev.members.map((member, i) => 
            i === index ? { ...member, uid: finalValue } : member
          )
        }));
      }
    }
    
    // Validate UID for duplicates and existing registrations
    if (finalValue && finalValue.length >= 5) {
      await validateMemberUID(finalValue, index);
    }
  };

  const handleLeaderUidChange = (value) => {
    // Format UID input
    value = value.toUpperCase().replace(/[^0-9BCS]/g, '');
    // Don't auto-format while typing, just filter characters
    
    setFormData(prev => ({
      ...prev,
      leaderUid: value
    }));
  };

  const handleLeaderUidBlur = async (value) => {
    // Auto-format UID when user stops typing (on blur)
    let finalValue = value;
    if (value.length >= 2 && !value.includes('BCS')) {
      if (/^\d{2}/.test(value)) {
        finalValue = value.substring(0, 2) + 'BCS' + value.substring(2);
        setFormData(prev => ({
          ...prev,
          leaderUid: finalValue
        }));
      }
    }
    
    // Validate UID for existing registrations
    if (finalValue && finalValue.length >= 5) {
      await validateLeaderUID(finalValue);
    }
  };

  const handleLeaderMobileChange = (value) => {
    // Only digits, max 10
    value = value.replace(/\D/g, '').substring(0, 10);
    setFormData(prev => ({
      ...prev,
      leaderMobile: value
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
        // Validate UID format (XXBCSXXXX... where X is any digit)
        const uidPattern = /^\d{2}BCS\d+$/;
        if (!uidPattern.test(formData.leaderUid)) {
          showToast('University ID must be in format: XXBCSXXXX (e.g., 24BCS12345)');
          return false;
        }
        // Validate mobile number (10-digit format)
        if (!/^\d{10}$/.test(formData.leaderMobile)) {
          showToast('Please enter a valid 10-digit mobile number.');
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
          // Validate UID format
          const uidPattern = /^\d{2}BCS\d+$/;
          if (!uidPattern.test(member.uid)) {
            showToast('All University IDs must be in format: XXBCSXXXX (e.g., 24BCS12345)');
            return false;
          }
          // Validate mobile number
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
        
        // Enhanced password validation
        if (formData.password.length < 8) {
          showToast('Password must be at least 8 characters long.');
          return false;
        }
        
        if (!/[A-Z]/.test(formData.password)) {
          showToast('Password must contain at least one uppercase letter.');
          return false;
        }
        
        if (!/[a-z]/.test(formData.password)) {
          showToast('Password must contain at least one lowercase letter.');
          return false;
        }
        
        if (!/\d/.test(formData.password)) {
          showToast('Password must contain at least one number.');
          return false;
        }
        
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
          showToast('Password must contain at least one special character.');
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
    
    // Validate UIDs for leader (step 1) and members (step 3)
    if (step === 1) {
      const uidCheck = await checkUniversityIdExists(formData.leaderUid);
      if (uidCheck.exists) {
        showToast(`University ID ${formData.leaderUid} is already registered in team "${uidCheck.teamName}" as ${uidCheck.role}.`);
        return false;
      }
    }
    
    if (step === 3) {
      // Check for duplicate UIDs within the current team
      const filledMembers = formData.members.filter(member => 
        member.name.trim() && member.uid.trim() && member.mobile.trim()
      );
      
      const allUIDs = [formData.leaderUid, ...filledMembers.map(m => m.uid)];
      const duplicateUIDs = allUIDs.filter((uid, index) => allUIDs.indexOf(uid) !== index);
      
      if (duplicateUIDs.length > 0) {
        showToast(`Duplicate University ID found within team: ${duplicateUIDs[0]}`);
        return false;
      }
      
      // Check if any member UID already exists in other teams
      for (const member of filledMembers) {
        const uidCheck = await checkUniversityIdExists(member.uid);
        if (uidCheck.exists) {
          showToast(`University ID ${member.uid} is already registered in team "${uidCheck.teamName}" as ${uidCheck.role}.`);
          return false;
        }
      }
    }
    
    return true;
  };

  // Individual UID validation for real-time checking
  const validateLeaderUID = async (uid) => {
    if (!uid || uid.length < 5) return; // Don't validate incomplete UIDs
    
    try {
      const uidCheck = await checkUniversityIdExists(uid);
      if (uidCheck.exists) {
        showToast(`University ID ${uid} is already registered in team "${uidCheck.teamName}" as ${uidCheck.role}.`);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error validating leader UID:', error);
      return true; // Don't block if validation fails
    }
  };

  const validateMemberUID = async (uid, memberIndex) => {
    if (!uid || uid.length < 5) return; // Don't validate incomplete UIDs
    
    try {
      // Check within current team for duplicates
      const allCurrentUIDs = [
        formData.leaderUid,
        ...formData.members.map((m, i) => i === memberIndex ? uid : m.uid)
      ].filter(id => id && id.trim());
      
      const duplicates = allCurrentUIDs.filter((id, index) => 
        allCurrentUIDs.indexOf(id) !== index && id === uid
      );
      
      if (duplicates.length > 0) {
        showToast(`University ID ${uid} is already used in this team.`);
        return false;
      }
      
      // Check in existing teams
      const uidCheck = await checkUniversityIdExists(uid);
      if (uidCheck.exists) {
        showToast(`University ID ${uid} is already registered in team "${uidCheck.teamName}" as ${uidCheck.role}.`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating member UID:', error);
      return true; // Don't block if validation fails
    }
  };

  const nextStep = async () => {
    if (isNavigating) return; // Prevent multiple rapid clicks
    
    setIsNavigating(true);
    
    try {
      // Step 0 doesn't need validation, just move to step 1
      if (currentStep === 0) {
        setCurrentStep(1);
      } else if (validateStep(currentStep)) {
        const asyncValid = await validateStepAsync(currentStep);
        if (asyncValid) {
          setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        }
      }
    } finally {
      // Add a small delay to prevent rapid clicking
      setTimeout(() => {
        setIsNavigating(false);
      }, 300);
    }
  };

  const prevStep = () => {
    if (isNavigating) return; // Prevent multiple rapid clicks
    
    setIsNavigating(true);
    setToast({ show: false, message: '', type: '' });
    setCurrentStep(prev => Math.max(prev - 1, 0));
    
    // Add a small delay to prevent rapid clicking
    setTimeout(() => {
      setIsNavigating(false);
    }, 300);
  };

  const goToStep = (step) => {
    if (isNavigating) return; // Prevent multiple rapid clicks
    
    setIsNavigating(true);
    setToast({ show: false, message: '', type: '' });
    setCurrentStep(step);
    
    // Add a small delay to prevent rapid clicking
    setTimeout(() => {
      setIsNavigating(false);
    }, 300);
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

    // Final UID validation before submission
    const filledMembers = formData.members.filter(member => member.name.trim() !== '');
    const allUIDs = [formData.leaderUid, ...filledMembers.map(m => m.uid)];
    
    // Check for internal duplicates
    const duplicateUIDs = allUIDs.filter((uid, index) => allUIDs.indexOf(uid) !== index);
    if (duplicateUIDs.length > 0) {
      showToast(`Duplicate University ID found: ${duplicateUIDs[0]}. Please check your team members.`, 'error');
      return;
    }
    
    // Check for existing UIDs in database
    for (const uid of allUIDs) {
      const uidCheck = await checkUniversityIdExists(uid);
      if (uidCheck.exists) {
        showToast(`University ID ${uid} is already registered in team "${uidCheck.teamName}". Please check your entries.`, 'error');
        return;
      }
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
    setCurrentStep(0);
    setToast({ show: false, message: '', type: '' });
  };

  const renderStep0 = () => (
    <div className="step-content welcome-step">
      <div className="welcome-content">
        <h1 className="welcome-title">Welcome to SparkCU!</h1>
        <p className="welcome-description">
          Join the ultimate coding competition and showcase your programming skills. 
          Register your team and compete with the best developers from around the university.
          <br /> <strong>Enter carefully, saved details can not be changed later.</strong>
        </p>
        
        <div className="welcome-actions">
          <button
            type="button"
            className="start-button"
            onClick={nextStep}
            disabled={isNavigating}
          >
            {isNavigating ? 'Starting...' : 'Start Registration →'}
          </button>
          
          <div className="login-option">
            <span>Already have an account?</span>
            <a href="/login" className="login-link-small">
              Login here
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="step-content">
      <div className="register-form">
        <div className="form-row">
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
            <label htmlFor="leaderName">Full Name *</label>
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
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="leaderUid">University ID *</label>
            <input
              type="text"
              id="leaderUid"
              name="leaderUid"
              value={formData.leaderUid}
              onChange={(e) => handleLeaderUidChange(e.target.value)}
              onBlur={(e) => handleLeaderUidBlur(e.target.value)}
              placeholder="e.g., 24BCS12345"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="leaderMobile">Mobile Number *</label>
            <div className="mobile-input-container">
              <div className="country-code">+91</div>
              <input
                type="tel"
                id="leaderMobile"
                name="leaderMobile"
                value={formData.leaderMobile}
                onChange={(e) => handleLeaderMobileChange(e.target.value)}
                placeholder="9876543210"
                required
                className="mobile-input"
                maxLength="10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-content">
      <div className="register-form">
        <div className="form-row">
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
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="academicYear">Academic Year of Leader *</label>
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
          <div className="form-group">
            {/* Empty for layout balance */}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-content">
      <div className="members-section">
        <div className="members-grid">
          {formData.members.slice(0, 3).map((member, index) => (
            <div key={index} className="member-card">
              <h4>Member {index + 1}</h4>
              
              <div className="form-row">
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
                    onBlur={(e) => handleMemberUidBlur(index, e.target.value)}
                    placeholder="e.g., 24BCS12345"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mobile Number</label>
                  <div className="mobile-input-container">
                    <div className="country-code">+91</div>
                    <input
                      type="tel"
                      value={member.mobile}
                      onChange={(e) => handleMemberChange(index, 'mobile', e.target.value)}
                      placeholder="9876543210"
                      maxLength="10"
                      className="mobile-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  {/* Empty for layout balance */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="step-content">
      <div className="register-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter a secure password (min 8 characters)"
                required
                minLength="8"
                className="password-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Re-enter your password"
                required
                minLength="8"
                className="password-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="password-requirements">
          <h4>Password Requirements:</h4>
          <ul>
            <li className={formData.password.length >= 8 ? 'valid' : ''}>
              At least 8 characters long
            </li>
            <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
              Contains uppercase letter (A-Z)
            </li>
            <li className={/[a-z]/.test(formData.password) ? 'valid' : ''}>
              Contains lowercase letter (a-z)
            </li>
            <li className={/\d/.test(formData.password) ? 'valid' : ''}>
              Contains numeric character (0-9)
            </li>
            <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'valid' : ''}>
              Contains special character (!@#$%^&*)
            </li>
            <li className={formData.password === formData.confirmPassword && formData.password ? 'valid' : ''}>
              Passwords match
            </li>
          </ul>
        </div>
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

  // Step info content for left panel
  const getStepInfo = () => {
    switch (currentStep) {
      case 0:
        return {
          indicator: "Getting Started",
          title: "Join SparkCU Competition",
          description: "Ready to showcase your coding skills? Register your team for the ultimate programming competition and compete with the best developers.",
          features: [
            "Team-based coding challenges",
            "Real-world problem solving",
            "Exciting prizes and recognition",
            "Networking opportunities",
          ]
        };
      case 1:
        return {
          indicator: "Step 1 of 4",
          title: "Team Leader Information",
          description: "Start by providing your details as the team leader. This information will be used for all communications.",
          features: [
            "Secure email verification",
            "Team leader identification",
            "Contact information setup"
          ]
        };
      case 2:
        return {
          indicator: "Step 2 of 4",
          title: "Team Details",
          description: "Choose a unique team name and define your project topic. These will represent your team throughout the competition.",
          features: [
            "Unique team identity",
            "Project topic selection",
            "Academic year classification"
          ]
        };
      case 3:
        return {
          indicator: "Step 3 of 4",
          title: "Team Members",
          description: "Add your team members (2-3 total). Each member will be part of your competitive team.",
          features: [
            "Minimum 2 members required",
            "Maximum 3 members allowed",
            "Complete member verification"
          ]
        };
      case 4:
        return {
          indicator: "Step 4 of 4",
          title: "Account Security",
          description: "Create a secure password for your team account. This will be used to access your dashboard.",
          features: [
            "Secure password creation",
            "Account protection",
            "Team login credentials"
          ]
        };
      case 5:
        return {
          indicator: "Registration Complete",
          title: "Welcome to SparkCU!",
          description: "Your registration is complete! Check your email for verification and next steps.",
          features: [
            "Email verification sent",
            "Team successfully registered",
            "Ready to compete"
          ]
        };
      default:
        return {
          indicator: "Getting Started",
          title: "Join SparkCU",
          description: "Register your team for the ultimate coding competition.",
          features: []
        };
    }
  };

  const stepInfo = getStepInfo();

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
        {/* Left Panel - Step Info */}
        <div className="step-info-panel">
          <div className="step-info-content">
            <div className="current-step-indicator">{stepInfo.indicator}</div>
            <h2 className="step-title">{stepInfo.title}</h2>
            <p className="step-description">{stepInfo.description}</p>
            {stepInfo.features.length > 0 && (
              <ul className="step-features">
                {stepInfo.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="form-panel">
          <div className="register-header">
            <h1>Register for SparkCU</h1>
            <p>Join the ultimate coding competition</p>
          </div>

          {/* Step Progress */}
          {currentStep > 0 && (
            <div className="step-progress">
              <div className="progress-line"></div>
              <div 
                className="progress-line-active" 
                style={{ width: `${(Math.min(currentStep - 1, 3) / 3) * 100}%` }}
              ></div>
              <div className="step-dots">
                {[
                  { num: 1, label: 'Leader' },
                  { num: 2, label: 'Team' },
                  { num: 3, label: 'Members' },
                  { num: 4, label: 'Security' }
                ].map((step) => (
                  <div
                    key={step.num}
                    className={`step-dot ${currentStep >= step.num ? 'active' : ''} ${currentStep > step.num ? 'completed' : ''}`}
                    onClick={() => step.num < currentStep && goToStep(step.num)}
                    data-label={step.label}
                  >
                    {currentStep > step.num ? '✓' : step.num}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-container">
            {currentStep === 0 && renderStep0()}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}

            {currentStep > 0 && currentStep < 5 && (
              <div className="form-navigation">
                {currentStep > 1 && (
                  <button
                    type="button"
                    className="nav-button prev-button"
                    onClick={prevStep}
                    disabled={isNavigating || isLoading}
                  >
                    ← Previous
                  </button>
                )}
                
                {currentStep < 4 && (
                  <button
                    type="button"
                    className="nav-button next-button"
                    onClick={nextStep}
                    disabled={isNavigating || isLoading}
                  >
                    {isNavigating ? 'Please wait...' : 'Next →'}
                  </button>
                )}
                
                {currentStep === 4 && (
                  <button
                    type="button"
                    className="nav-button submit-button"
                    onClick={handleSubmit}
                    disabled={isLoading || isNavigating}
                  >
                    {isLoading ? 'Registering...' : 'Complete Registration'}
                  </button>
                )}
              </div>
            )}

            {currentStep === 5 && (
              <div className="final-actions">
                <a href="/login" className="login-link">
                  Go to Login
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
