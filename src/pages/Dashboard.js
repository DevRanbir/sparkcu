import React, { useState, useEffect, useMemo } from 'react';
import './Dashboard.css';
import { useAuth } from '../contexts/AuthContext';
import { 
  getCountdownData, 
  getAnnouncements, 
  updateTeamSubmission, 
  getTeamSubmission 
} from '../services/firebase';

const Dashboard = () => {
  const { currentUser, userData, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRemaining, setTimeRemaining] = useState({});
  const [presentationLink, setPresentationLink] = useState('');
  const [countdownConfig, setCountdownConfig] = useState({
    targetDate: '2024-12-15T09:00:00',
    title: 'SparkCU Ideathon 2024',
    description: 'Event starts in'
  });
  const [additionalLinks, setAdditionalLinks] = useState([
    { type: 'youtube', url: '', label: 'YouTube Video' },
    { type: 'github', url: '', label: 'GitHub Repository' },
    { type: 'other', url: '', label: 'Other Link' }
  ]);
  const [announcements, setAnnouncements] = useState([]);
  const [isSubmissionLoading, setIsSubmissionLoading] = useState(false);
  const [submissionSaved, setSubmissionSaved] = useState(false);

  // Event date - using useMemo to prevent recreation on every render
  const eventDate = useMemo(() => {
    return countdownConfig.targetDate ? new Date(countdownConfig.targetDate) : new Date('2024-12-15T09:00:00');
  }, [countdownConfig.targetDate]);

  // Fetch countdown configuration from Firebase
  useEffect(() => {
    const fetchCountdownConfig = async () => {
      try {
        const result = await getCountdownData();
        if (result.success && result.data) {
          setCountdownConfig(result.data);
        }
      } catch (error) {
        console.error('Error fetching countdown config:', error);
      }
    };

    const fetchAnnouncementsData = async () => {
      try {
        const result = await getAnnouncements();
        if (result.success) {
          setAnnouncements(result.announcements);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };

    const fetchSubmissionData = async () => {
      if (currentUser?.uid) {
        try {
          const result = await getTeamSubmission(currentUser.uid);
          if (result.success && result.submissionLinks) {
            const submission = result.submissionLinks;
            setPresentationLink(submission.presentationLink || '');
            
            // Update additional links with saved data
            setAdditionalLinks([
              { type: 'youtube', url: submission.youtubeLink || '', label: 'YouTube Video' },
              { type: 'github', url: submission.githubLink || '', label: 'GitHub Repository' },
              { type: 'other', url: submission.otherLink || '', label: 'Other Link' }
            ]);
            setSubmissionSaved(true);
          }
        } catch (error) {
          console.error('Error fetching submission data:', error);
        }
      }
    };

    fetchCountdownConfig();
    fetchAnnouncementsData();
    fetchSubmissionData();
  }, [currentUser]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      
      const difference = eventDate.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeRemaining({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [eventDate]);

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Use userData from Firebase auth context or fallback to default
  const userInfo = userData || {
    leaderName: currentUser?.displayName || "Team Leader",
    teamName: "Your Team",
    academicYear: "2nd",
    members: [
      { name: currentUser?.displayName || "Team Leader", uid: "Not provided", mobile: "Not provided" }
    ]
  };

  // Get the leader's email from userData if available, otherwise from currentUser
  const leaderEmail = userData?.leaderEmail || currentUser?.email || "Not provided";

  const handleLinkChange = (index, value) => {
    const updatedLinks = [...additionalLinks];
    updatedLinks[index].url = value;
    setAdditionalLinks(updatedLinks);
  };

  const handleSaveLinks = async () => {
    if (!currentUser?.uid) {
      alert('User not authenticated');
      return;
    }

    if (!presentationLink.trim()) {
      alert('Presentation link is required');
      return;
    }

    setIsSubmissionLoading(true);

    try {
      const submissionData = {
        presentationLink: presentationLink.trim(),
        youtubeLink: additionalLinks[0].url.trim(),
        githubLink: additionalLinks[1].url.trim(),
        otherLink: additionalLinks[2].url.trim()
      };

      const result = await updateTeamSubmission(currentUser.uid, submissionData);
      
      if (result.success) {
        setSubmissionSaved(true);
        alert('Links saved successfully!');
      } else {
        alert(result.message || 'Error saving links');
      }
    } catch (error) {
      console.error('Error saving submission:', error);
      alert('Error saving links. Please try again.');
    } finally {
      setIsSubmissionLoading(false);
    }
  };

  const openLink = (url) => {
    if (url && url.trim()) {
      window.open(url, '_blank');
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 168) { // 7 days
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content">
            {/* Event Countdown */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">{countdownConfig.title}</h2>
                  <p className="card-subtitle">{countdownConfig.description}</p>
                </div>
              </div>
              <div className="countdown-timer">
                <div className="countdown-item">
                  <span className="countdown-number">{timeRemaining.days || 0}</span>
                  <span className="countdown-label">Days</span>
                </div>
                <div className="countdown-item">
                  <span className="countdown-number">{timeRemaining.hours || 0}</span>
                  <span className="countdown-label">Hours</span>
                </div>
                <div className="countdown-item">
                  <span className="countdown-number">{timeRemaining.minutes || 0}</span>
                  <span className="countdown-label">Minutes</span>
                </div>
                <div className="countdown-item">
                  <span className="countdown-number">{timeRemaining.seconds || 0}</span>
                  <span className="countdown-label">Seconds</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Quick Overview</h2>
              </div>
              <div className="team-overview">
                <div className="team-header">
                  <h3>{userInfo.teamName}</h3>
                  <span className="team-size-badge">{userInfo.members?.length || 0} Members</span>
                </div>
                <div className="member-details">
                  <div className="detail-item">
                    <span className="detail-label">Team Leader:</span>
                    <span className="detail-value">{userInfo.leaderName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{leaderEmail}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Academic Year:</span>
                    <span className="detail-value">{userInfo.academicYear}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="tab-content">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Team Information</h2>
                <p className="card-subtitle">Complete details about your team members</p>
              </div>
              <div className="team-overview">
                <div className="team-header">
                  <h3>{userInfo.teamName}</h3>
                  <span className="team-size-badge">{userInfo.members?.length || 0} Members</span>
                </div>
                
                <div className="team-members-grid">
                  {(userInfo.members || []).map((member, index) => (
                    <div key={index} className={`member-card ${index === 0 ? 'leader' : ''}`}>
                      <div className="member-info">
                        <div className="member-header">
                          <h4 className="member-name">{member.name}</h4>
                          <span className={`member-status ${index === 0 ? 'leader' : 'member'}`}>
                            {index === 0 ? '👑 Team Leader' : '👤 Member'}
                          </span>
                        </div>
                        
                        <div className="member-details">
                          <div className="detail-item">
                            <span className="detail-label">UID:</span>
                            <span className="detail-value">{member.uid || 'N/A'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Contact:</span>
                            <span className="detail-value">{member.mobile || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'submission':
        return (
          <div className="tab-content">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Project Submission</h2>
                {submissionSaved && (
                  <div className="submission-status">
                    <span className="status-badge saved">✓ Saved</span>
                  </div>
                )}
              </div>
              <div className="submission-form">
                <div className="form-group">
                  <label htmlFor="presentationLink">
                    <span className="required">*</span> Google Drive Presentation Link
                  </label>
                  <div className="input-with-button">
                    <input
                      type="url"
                      id="presentationLink"
                      value={presentationLink}
                      onChange={(e) => {
                        setPresentationLink(e.target.value);
                        if (submissionSaved && e.target.value !== presentationLink) {
                          setSubmissionSaved(false);
                        }
                      }}
                      placeholder="https://drive.google.com/file/d/your-presentation-id/view"
                      required
                    />
                    {presentationLink && (
                      <button 
                        type="button" 
                        className="preview-button"
                        onClick={() => openLink(presentationLink)}
                        title="Open link in new tab"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                          <polyline points="15,3 21,3 21,9"/>
                          <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                      </button>
                    )}
                  </div>
                  <small className="form-hint">
                    Make sure your presentation is set to "Anyone with the link can view"
                  </small>
                </div>

                <div className="additional-links">
                  <h3>Additional Resources (Optional)</h3>
                  {additionalLinks.map((link, index) => (
                    <div key={index} className="form-group">
                      <label htmlFor={`link-${index}`}>
                        {link.label}
                      </label>
                      <div className="input-with-button">
                        <input
                          type="url"
                          id={`link-${index}`}
                          value={link.url}
                          onChange={(e) => {
                            handleLinkChange(index, e.target.value);
                            if (submissionSaved) {
                              setSubmissionSaved(false);
                            }
                          }}
                          placeholder={`Enter your ${link.label.toLowerCase()} URL`}
                        />
                        {link.url && (
                          <button 
                            type="button" 
                            className="preview-button"
                            onClick={() => openLink(link.url)}
                            title="Open link in new tab"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                              <polyline points="15,3 21,3 21,9"/>
                              <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  className={`save-button ${isSubmissionLoading ? 'loading' : ''} ${submissionSaved ? 'saved' : ''}`} 
                  onClick={handleSaveLinks}
                  disabled={isSubmissionLoading}
                >
                  {isSubmissionLoading ? (
                    <>
                      Saving...
                    </>
                  ) : submissionSaved ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20,6 9,17 4,12"/>
                      </svg>
                      Already submitted 
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17,21 17,13 7,13 7,21"/>
                        <polyline points="7,3 7,8 15,8"/>
                      </svg>
                      Save Submission Links
                    </>
                  )}
                </button>
                <p className="card-subtitle">Click the above button to submit your project links and resources, <br /> if once submitted until deadline you can edit freely.</p>
              </div>
            </div>
          </div>
        );

      case 'announcements':
        return (
          <div className="tab-content">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Announcements</h2>
                <p className="card-subtitle">Latest updates and important information</p>
              </div>
              <div className="announcements-list">
                {announcements.length > 0 ? (
                  announcements.map((announcement) => (
                    <div key={announcement.id} className={`announcement-card ${announcement.type}`}>
                      <div className="announcement-header">
                        <h3>{announcement.title}</h3>
                        <span className="announcement-timestamp">
                          {formatTimestamp(announcement.createdAt)}
                        </span>
                      </div>
                      <p>{announcement.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="no-announcements">
                    <p>No announcements available at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome back, {userInfo.leaderName}!</h1>
        <p>Your SparkCU Ideathon Dashboard</p>
      </div>

      <div className="dashboard-content">
        {/* Tab Navigation */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="tab-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </span>
            Overview
          </button>
          
          <button 
            className={`tab-button ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            <span className="tab-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </span>
            Team
          </button>
          
          <button 
            className={`tab-button ${activeTab === 'submission' ? 'active' : ''}`}
            onClick={() => setActiveTab('submission')}
          >
            <span className="tab-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </span>
            Submission
          </button>
          
          <button 
            className={`tab-button ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => setActiveTab('announcements')}
          >
            <span className="tab-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
              </svg>
            </span>
            Announcements
          </button>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Dashboard;
