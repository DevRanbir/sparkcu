import React, { useState } from 'react';
import './Registration.css';

const Registration = () => {
  const [formData, setFormData] = useState({
    email: '',
    leaderName: '',
    teamName: '',
    academicYear: '',
    teamMembers: [
      { name: '', uid: '', mobile: '' },
      { name: '', uid: '', mobile: '' },
      { name: '', uid: '', mobile: '' }
    ]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTeamMemberChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitMessage('Registration submitted successfully! Check your email for confirmation.');
    }, 2000);
  };

  const isFormValid = () => {
    const requiredFields = formData.email && formData.leaderName && formData.teamName && formData.academicYear;
    const validMembers = formData.teamMembers.slice(0, 3).every(member => 
      member.name.trim() && member.uid.trim() && member.mobile.trim()
    );
    return requiredFields && validMembers;
  };

  return (
    <div className="registration-page">
      <div className="registration-header">
        <h1>SparkCU Ideathon Registration</h1>
        <p>Quick registration for teams of 4 members (1 leader + 3 members)</p>
      </div>

      <div className="registration-container">
        <form onSubmit={handleSubmit} className="registration-form">
          
          {/* Team Leader Information */}
          <div className="form-section">
            <h2>👤 Team Leader Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="leader@example.com"
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
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
          </div>

          {/* Team Information */}
          <div className="form-section">
            <h2>👥 Team Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="teamName">Team Name *</label>
                <input
                  type="text"
                  id="teamName"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleInputChange}
                  placeholder="Your Creative Team Name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="academicYear">Academic Year *</label>
                <select
                  id="academicYear"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Year</option>
                  <option value="2nd">2nd Year</option>
                  <option value="3rd">3rd Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="form-section">
            <h2>🎯 Team Members (3 Required)</h2>
            <div className="members-grid">
              {formData.teamMembers.map((member, index) => (
                <div key={index} className="member-card">
                  <h3>Member {index + 1}</h3>
                  <div className="member-fields">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                        placeholder="Member name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>University ID *</label>
                      <input
                        type="text"
                        value={member.uid}
                        onChange={(e) => handleTeamMemberChange(index, 'uid', e.target.value)}
                        placeholder="Student ID"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Mobile Number *</label>
                      <input
                        type="tel"
                        value={member.mobile}
                        onChange={(e) => handleTeamMemberChange(index, 'mobile', e.target.value)}
                        placeholder="1234567890"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-submit">
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting || !isFormValid()}
            >
              {isSubmitting ? 'Registering Team...' : 'Register Team'}
            </button>
          </div>
          
          {submitMessage && (
            <div className="submit-message">
              ✅ {submitMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Registration;
