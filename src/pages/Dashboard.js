import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = ({ userData }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeRemaining, setTimeRemaining] = useState({});
  const [presentationLink, setPresentationLink] = useState('');
  const [additionalLinks, setAdditionalLinks] = useState([
    { type: 'youtube', url: '', label: 'YouTube Video' },
    { type: 'github', url: '', label: 'GitHub Repository' },
    { type: 'other', url: '', label: 'Other Link' }
  ]);

  // Use userData from props or fallback to default
  const userInfo = userData || {
    name: "John Doe",
    email: "john.doe@university.edu",
    uid: "2021CS001",
    mobile: "+91 9876543210",
    university: "Example University",
    teamName: "Code Innovators",
    teamLeader: "John Doe",
    teamMembers: [
      { name: "John Doe", uid: "2021CS001", mobile: "+91 9876543210", role: "Team Leader" },
      { name: "Jane Smith", uid: "2021CS002", mobile: "+91 9876543211", role: "Member" },
      { name: "Mike Johnson", uid: "2021CS003", mobile: "+91 9876543212", role: "Member" },
      { name: "Sarah Wilson", uid: "2021CS004", mobile: "+91 9876543213", role: "Member" }
    ]
  };

  // Event date
  const eventDate = new Date('2024-12-15T09:00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
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

  const handleLinkChange = (index, value) => {
    const updatedLinks = [...additionalLinks];
    updatedLinks[index].url = value;
    setAdditionalLinks(updatedLinks);
  };

  const handleSaveLinks = () => {
    // Here you would typically save to backend
    console.log('Presentation Link:', presentationLink);
    console.log('Additional Links:', additionalLinks);
    alert('Links saved successfully!');
  };

  const announcements = [
    {
      id: 1,
      title: "Welcome to SparkCU Ideathon!",
      message: "We're excited to have you participate in this year's ideathon. Check your email for important updates.",
      timestamp: "2 hours ago",
      type: "info"
    },
    {
      id: 2,
      title: "Pre-event Webinar",
      message: "Join us for a pre-event webinar on December 10th at 7 PM to learn about the competition format.",
      timestamp: "1 day ago",
      type: "event"
    },
    {
      id: 3,
      title: "Submission Guidelines Updated",
      message: "Please ensure your presentation links are submitted through the dashboard before the deadline.",
      timestamp: "3 days ago",
      type: "update"
    }
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome back, {userInfo.name}!</h1>
        <p>Your SparkCU Ideathon Dashboard</p>
      </div>

      <div className="dashboard-content">
        {/* Event Countdown */}
        <div className="countdown-section">
          <h2>Event Countdown</h2>
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

        {/* Team Information */}
        <div className="team-section">
          <h2>Team Information</h2>
          <div className="team-overview">
            <div className="team-header">
              <h3>{userInfo.teamName}</h3>
              <span className="team-size-badge">{userInfo.teamMembers.length} Members</span>
            </div>
            
            <div className="team-members-grid">
              {userInfo.teamMembers.map((member, index) => (
                <div key={index} className={`member-card ${member.role === 'Team Leader' ? 'leader' : ''}`}>
                  <div className="member-info">
                    <div className="member-header">
                      <h4 className="member-name">{member.name}</h4>
                      <span className={`member-status ${member.role === 'Team Leader' ? 'leader' : 'member'}`}>
                        {member.role === 'Team Leader' ? '👑 Team Leader' : '👤 Member'}
                      </span>
                    </div>
                    
                    <div className="member-details">
                      <div className="detail-item">
                        <span className="detail-label">UID:</span>
                        <span className="detail-value">{member.uid}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Contact:</span>
                        <span className="detail-value">{member.mobile}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submission Links */}
        <div className="submission-section">
          <h2>Project Submission</h2>
          <div className="submission-form">
            <div className="form-group">
              <label htmlFor="presentationLink">
                <span className="required">*</span> Google Drive Presentation Link
              </label>
              <input
                type="url"
                id="presentationLink"
                value={presentationLink}
                onChange={(e) => setPresentationLink(e.target.value)}
                placeholder="https://drive.google.com/file/d/your-presentation-id/view"
                required
              />
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
                  <input
                    type="url"
                    id={`link-${index}`}
                    value={link.url}
                    onChange={(e) => handleLinkChange(index, e.target.value)}
                    placeholder={`Enter your ${link.label.toLowerCase()} URL`}
                  />
                </div>
              ))}
            </div>

            <button className="save-button" onClick={handleSaveLinks}>
              Save Submission Links
            </button>
          </div>
        </div>

        {/* Announcements */}
        <div className="announcements-section">
          <h2>Announcements</h2>
          <div className="announcements-list">
            {announcements.map((announcement) => (
              <div key={announcement.id} className={`announcement-card ${announcement.type}`}>
                <div className="announcement-header">
                  <h3>{announcement.title}</h3>
                  <span className="announcement-timestamp">{announcement.timestamp}</span>
                </div>
                <p>{announcement.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
