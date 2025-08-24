import React, { useState, useEffect } from 'react';
import { getScheduleData } from '../services/firebase';
import './Schedule.css';

const Schedule = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fallback data if Firebase data can't be fetched
  const fallbackData = [
    {
      time: "12:00 PM",
      event: "Opening Notification",
      description: "Event Updating soon...",
      location: "Spark Website",
      type: "registration"
    }
  ];

  useEffect(() => {
    loadScheduleData();
    
    // Set up automatic refresh every 30 seconds to sync with admin updates
    const refreshInterval = setInterval(() => {
      loadScheduleData();
    }, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const loadScheduleData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getScheduleData();
      
      if (result.success && result.data && result.data.length > 0) {
        setScheduleData(result.data);
        setLastUpdated(new Date());
      } else {
        // Use fallback data if no data is available
        setScheduleData(fallbackData);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
      setError('Failed to load schedule data');
      // Use fallback data on error
      setScheduleData(fallbackData);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'registration':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'ceremony':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'networking':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M13 7a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'work':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'break':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'mentoring':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'presentation':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'judging':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <h1>Event Schedule</h1>
        <p>Complete timeline for SparkCU Ideathon - December 15, 2024</p>
        {error && (
          <div className="error-message">
            <p style={{color: '#e74c3c', fontSize: '14px', marginTop: '8px'}}>
              {error} - Showing default schedule
            </p>
          </div>
        )}
        <button 
          onClick={loadScheduleData} 
          disabled={loading}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh Schedule'}
        </button>
        {lastUpdated && (
          <p style={{
            fontSize: '12px',
            color: '#666',
            marginTop: '8px',
            fontStyle: 'italic'
          }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
      
      <div className="schedule-container">
        {loading ? (
          <div className="loading-spinner" style={{
            textAlign: 'center',
            padding: '10px',
            fontSize: '16px',
            color: '#666'
          }}>
          </div>
        ) : (
          <div className="timeline">
          {scheduleData.map((item, index) => (
            <div key={index} className={`timeline-item ${item.type}`}>
              <div className="timeline-marker">
                <div className="timeline-icon">
                  {getEventIcon(item.type)}
                </div>
              </div>
              <div className="timeline-content">
                <div className="timeline-time">{item.time}</div>
                <h3 className="timeline-event">{item.event}</h3>
                <p className="timeline-description">{item.description}</p>
                <div className="timeline-location">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  {item.location}
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
      
      <div className="schedule-footer">
        <div className="schedule-notes">
          <h3>Important Notes</h3>
          <ul>
            <li>Please arrive 15 minutes early for each session</li>
            <li>Meals and refreshments will not be provided by us</li>
            <li>All times are in local timezone (EST)</li>
            <li>Schedule may be subject to minor adjustments</li>
          </ul>
        </div>
        
      </div>
    </div>
  );
};

export default Schedule;
