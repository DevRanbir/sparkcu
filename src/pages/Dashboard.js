import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = ({ userData }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeRemaining, setTimeRemaining] = useState({});

  // Use userData from props or fallback to default
  const userInfo = userData || {
    name: "John Doe",
    email: "john.doe@university.edu",
    university: "Example University",
    teamName: "Code Innovators",
    teamMembers: ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Wilson"]
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

  const quickLinks = [
    {
      title: "Event Schedule",
      description: "View the complete timeline of events",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
          <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
          <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
          <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      color: "#667eea"
    },
    {
      title: "Competition Rules",
      description: "Review guidelines and regulations",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
          <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
          <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
          <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
          <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      color: "#764ba2"
    },
    {
      title: "Resources",
      description: "Access tools and helpful materials",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="currentColor" strokeWidth="2"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      color: "#28a745"
    },
    {
      title: "Contact Support",
      description: "Get help from organizers",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      color: "#17a2b8"
    }
  ];

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
      title: "Mentor List Updated",
      message: "The list of available mentors has been updated. Check the resources section for details.",
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
        {/* Countdown Timer */}
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

        {/* Registration Status */}
        <div className="registration-status">
          <h2>Registration Status</h2>
          <div className="status-card confirmed">
            <div className="status-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="status-content">
              <h3>Registration Confirmed</h3>
              <p>You're all set for SparkCU Ideathon!</p>
            </div>
          </div>
        </div>

        {/* Team Information */}
        {userInfo.teamName && (
          <div className="team-info">
            <h2>Team Information</h2>
            <div className="team-card">
              <div className="team-header">
                <h3>{userInfo.teamName}</h3>
                <span className="team-size">{userInfo.teamMembers.length} members</span>
              </div>
              <div className="team-members">
                <h4>Team Members:</h4>
                <ul>
                  {userInfo.teamMembers.map((member, index) => (
                    <li key={index}>{member}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="quick-links">
          <h2>Quick Links</h2>
          <div className="links-grid">
            {quickLinks.map((link, index) => (
              <div key={index} className="link-card" style={{ borderLeftColor: link.color }}>
                <div className="link-icon" style={{ color: link.color }}>
                  {link.icon}
                </div>
                <div className="link-content">
                  <h3>{link.title}</h3>
                  <p>{link.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div className="announcements">
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

        {/* Event Details */}
        <div className="event-details">
          <h2>Event Details</h2>
          <div className="details-grid">
            <div className="detail-card">
              <h4>Date & Time</h4>
              <p>December 15, 2024</p>
              <p>9:00 AM - 11:00 PM</p>
            </div>
            <div className="detail-card">
              <h4>Venue</h4>
              <p>University Innovation Center</p>
              <p>123 Campus Drive</p>
            </div>
            <div className="detail-card">
              <h4>Contact</h4>
              <p>sparkcu@university.edu</p>
              <p>(555) 123-4567</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
