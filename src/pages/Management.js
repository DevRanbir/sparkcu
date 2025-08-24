import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdminLoggedIn, getAdminSession, logoutAdmin, getAllTeams } from '../services/firebase';
import ScheduleAdmin from './ScheduleAdmin';
import './Management.css';

function Management() {
  const [adminData, setAdminData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teamsCount, setTeamsCount] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamDetails, setShowTeamDetails] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const adminSession = isAdminLoggedIn();
    if (!adminSession) {
      navigate('/admin');
      return;
    }
    setAdminData(adminSession);
    
    // Fetch teams data on component mount
    fetchTeamsData();
  }, [navigate]);

  const fetchTeamsData = async () => {
    setLoading(true);
    try {
      const result = await getAllTeams();
      if (result.success) {
        setTeams(result.teams);
        setTeamsCount(result.count);
      } else {
        console.error('Failed to fetch teams:', result.message);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    // Reload the page to ensure clean state
    window.location.href = '/home';
  };

  const handleViewTeamDetails = (team) => {
    setSelectedTeam(team);
    setShowTeamDetails(true);
  };

  const handleCloseTeamDetails = () => {
    setSelectedTeam(null);
    setShowTeamDetails(false);
  };

  if (!adminData) {
    return <div className="loading">Loading...</div>;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content">
            <h3>System Overview</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total Teams</h4>
                <p className="stat-number">{teamsCount}</p>
              </div>
              <div className="stat-card">
                <h4>Active Users</h4>
                <p className="stat-number">{teams.reduce((acc, team) => acc + (team.members ? team.members.length : 0), 0)}</p>
              </div>
              <div className="stat-card">
                <h4>Registrations Today</h4>
                <p className="stat-number">{teams.filter(team => {
                  if (!team.createdAt) return false;
                  const today = new Date();
                  const teamDate = team.createdAt.toDate ? team.createdAt.toDate() : new Date(team.createdAt);
                  return teamDate.toDateString() === today.toDateString();
                }).length}</p>
              </div>
              <div className="stat-card">
                <h4>System Status</h4>
                <p className="stat-status online">Online</p>
              </div>
            </div>
          </div>
        );
      case 'teams':
        return (
          <div className="tab-content">
            <div className="teams-header">
              <h3>Team Management</h3>
              <div className="teams-stats">
                <span className="teams-count">Total Teams: {teamsCount}</span>
                <button onClick={fetchTeamsData} className="refresh-btn" disabled={loading}>
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="loading-container">
                <p>Loading teams data...</p>
              </div>
            ) : teams.length > 0 ? (
              <div className="teams-table-container">
                <table className="teams-table">
                  <thead>
                    <tr>
                      <th>Team Name</th>
                      <th>Leader</th>
                      <th>Email</th>
                      <th>Academic Year</th>
                      <th>Members</th>
                      <th>Registration Date</th>
                      <th>Status</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team) => (
                      <tr key={team.id}>
                        <td className="team-name">{team.teamName}</td>
                        <td>{team.leaderName}</td>
                        <td>{team.leaderEmail}</td>
                        <td>{team.academicYear}</td>
                        <td>
                          <span className="members-count">
                            {team.members ? team.members.length : 0}
                          </span>
                        </td>
                        <td>
                          {team.createdAt ? 
                            (team.createdAt.toDate ? 
                              team.createdAt.toDate().toLocaleDateString() : 
                              new Date(team.createdAt).toLocaleDateString()
                            ) : 'N/A'
                          }
                        </td>
                        <td>
                          <span className={`status-badge ${team.emailVerified ? 'verified' : 'pending'}`}>
                            {team.emailVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="view-details-btn" 
                            onClick={() => handleViewTeamDetails(team)}
                            title="View Team Details"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-teams">
                <p>No teams registered yet.</p>
              </div>
            )}
          </div>
        );
      case 'schedule':
        return <ScheduleAdmin />;
      case 'settings':
        return (
          <div className="tab-content">
            <h3>System Settings</h3>
            <div className="management-section">
              <h4>Admin Information</h4>
              <div className="admin-info">
                <p><strong>Admin ID:</strong> {adminData.adminId}</p>
                <p><strong>Role:</strong> {adminData.role}</p>
                <p><strong>Login Time:</strong> {new Date(adminData.loginTime).toLocaleString()}</p>
              </div>
              
              <h4>Available Settings</h4>
              <p>System configuration settings will be implemented here.</p>
              <ul>
                <li>Registration settings</li>
                <li>Email templates</li>
                <li>Database backups</li>
                <li>Security settings</li>
                <li>Admin password management</li>
              </ul>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <div className="header-left">
          <h1>Management Panel</h1>
          <p>Welcome, {adminData.adminId}</p>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="management-content">
        <div className="sidebar-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="tab-icon">📊</span>
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            <span className="tab-icon">👥</span>
            Teams
          </button>
          <button 
            className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            <span className="tab-icon">�</span>
            Schedule
          </button>
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="tab-icon">⚙️</span>
            Settings
          </button>
        </div>

        <div className="main-content">
          {renderTabContent()}
        </div>
      </div>

      {/* Team Details Modal */}
      {showTeamDetails && selectedTeam && (
        <div className="team-details-modal-overlay">
          <div className="team-details-modal">
            <div className="modal-header">
              <h2>Team Details: {selectedTeam.teamName}</h2>
              <button className="close-btn" onClick={handleCloseTeamDetails}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="team-info-section">
                <h3>Team Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Team Name:</label>
                    <span>{selectedTeam.teamName}</span>
                  </div>
                  <div className="info-item">
                    <label>Academic Year:</label>
                    <span>{selectedTeam.academicYear}</span>
                  </div>
                  <div className="info-item">
                    <label>Registration Date:</label>
                    <span>
                      {selectedTeam.createdAt ? 
                        (selectedTeam.createdAt.toDate ? 
                          selectedTeam.createdAt.toDate().toLocaleString() : 
                          new Date(selectedTeam.createdAt).toLocaleString()
                        ) : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Email Verified:</label>
                    <span className={selectedTeam.emailVerified ? 'verified-text' : 'pending-text'}>
                      {selectedTeam.emailVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="members-section">
                <h3>Team Members ({selectedTeam.members ? selectedTeam.members.length : 0})</h3>
                {selectedTeam.members && selectedTeam.members.length > 0 ? (
                  <div className="members-table-container">
                    <table className="members-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Mobile</th>
                          <th>UID</th>
                          <th>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTeam.members.map((member, index) => (
                          <tr key={index}>
                            <td className="member-name">{member.name || 'N/A'}</td>
                            <td>{member.email || 'N/A'}</td>
                            <td>{member.mobile || 'N/A'}</td>
                            <td className="member-uid">{member.uid || member.firebaseUid || 'N/A'}</td>
                            <td>
                              <span className={`role-badge ${member.status}`}>
                                {member.status || 'member'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="no-members">No members found for this team.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Management;
