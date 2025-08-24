import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdminLoggedIn, getAdminSession, logoutAdmin, getAllTeams, getCountdownData, updateCountdownData, getScheduleData } from '../services/firebase';
import ScheduleAdmin from './ScheduleAdmin';
import * as XLSX from 'xlsx';
import './Management.css';

function Management() {
  const [adminData, setAdminData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teamsCount, setTeamsCount] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamDetails, setShowTeamDetails] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [countdownData, setCountdownData] = useState({
    targetDate: '',
    title: 'SparkCU Ideathon',
    description: 'Event starts in'
  });
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
    fetchCountdownData();

    // Handle window resize for responsive design
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterDropdown && !event.target.closest('.filter-dropdown-container')) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterDropdown]);

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

  const fetchCountdownData = async () => {
    try {
      const result = await getCountdownData();
      if (result.success && result.data) {
        setCountdownData(result.data);
      }
    } catch (error) {
      console.error('Error fetching countdown data:', error);
    }
  };

  const handleCountdownUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await updateCountdownData(countdownData);
      if (result.success) {
        alert('Countdown updated successfully!');
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating countdown:', error);
      alert('Error updating countdown');
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filter) => {
    setSearchFilter(filter);
    setShowFilterDropdown(false);
  };

  const toggleFilterDropdown = () => {
    setShowFilterDropdown(!showFilterDropdown);
  };

  // Filter teams based on search term and filter type
  const filteredTeams = teams.filter(team => {
    // Apply search term filter
    const matchesSearch = searchTerm === '' || 
      team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.leaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.leaderEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.academicYear.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply filter type
    let matchesFilter = true;
    switch (searchFilter) {
      case 'verified':
        matchesFilter = team.emailVerified === true;
        break;
      case 'pending':
        matchesFilter = team.emailVerified === false;
        break;
      case 'today':
        if (team.createdAt) {
          const today = new Date();
          const teamDate = team.createdAt.toDate ? team.createdAt.toDate() : new Date(team.createdAt);
          matchesFilter = teamDate.toDateString() === today.toDateString();
        } else {
          matchesFilter = false;
        }
        break;
      case 'this-week':
        if (team.createdAt) {
          const now = new Date();
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const teamDate = team.createdAt.toDate ? team.createdAt.toDate() : new Date(team.createdAt);
          matchesFilter = teamDate >= weekAgo && teamDate <= now;
        } else {
          matchesFilter = false;
        }
        break;
      case 'all':
      default:
        matchesFilter = true;
        break;
    }

    return matchesSearch && matchesFilter;
  });

  const getFilterDisplayName = (filter) => {
    switch (filter) {
      case 'all': return 'All Teams';
      case 'verified': return 'Verified Only';
      case 'pending': return 'Pending Only';
      case 'today': return 'Registered Today';
      case 'this-week': return 'This Week';
      default: return 'All Teams';
    }
  };

  const downloadExcelReport = async () => {
    setLoading(true);
    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Prepare teams data
      const teamsData = teams.map(team => {
        const membersData = team.members || [];
        const memberDetails = membersData.map(member => ({
          Name: member.name || 'N/A',
          Email: member.email || 'N/A',
          Mobile: member.mobile || 'N/A',
          UID: member.uid || member.firebaseUid || 'N/A'
        }));

        return {
          'Team Name': team.teamName,
          'Leader': team.leaderName,
          'Email': team.leaderEmail,
          'Academic Year': team.academicYear,
          'Members Count': membersData.length,
          'Registration Date': team.createdAt ? 
            (team.createdAt.toDate ? 
              team.createdAt.toDate().toLocaleDateString() : 
              new Date(team.createdAt).toLocaleDateString()
            ) : 'N/A',
          'Status': team.emailVerified ? 'Verified' : 'Pending',
          'Member Details': memberDetails.map(m => 
            `${m.Name} (${m.Email}) - ${m.Mobile} - UID: ${m.UID}`
          ).join(' | ')
        };
      });

      // Create teams worksheet
      const teamsWorksheet = XLSX.utils.json_to_sheet(teamsData);
      XLSX.utils.book_append_sheet(workbook, teamsWorksheet, 'Teams');

      // Get schedule data
      const scheduleResult = await getScheduleData();
      let scheduleData = [];
      
      if (scheduleResult.success && scheduleResult.data) {
        scheduleData = scheduleResult.data.map(item => ({
          'Time': item.time,
          'Event': item.event,
          'Description': item.description,
          'Location': item.location,
          'Type': item.type,
          'Order': item.timeOrder
        }));
      }

      // Create schedule worksheet
      const scheduleWorksheet = XLSX.utils.json_to_sheet(scheduleData);
      XLSX.utils.book_append_sheet(workbook, scheduleWorksheet, 'Schedule');

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `SparkCU_Report_${currentDate}.xlsx`;

      // Download the file
      XLSX.writeFile(workbook, filename);
      
      alert('Excel report downloaded successfully!');
    } catch (error) {
      console.error('Error generating Excel report:', error);
      alert('Error generating Excel report. Please try again.');
    } finally {
      setLoading(false);
    }
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
                <h4>Total Users</h4>
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
                <span className="teams-count">
                  Showing {filteredTeams.length} of {teamsCount} teams
                </span>
                <button onClick={fetchTeamsData} className="refresh-btn" disabled={loading}>
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="search-filter-section">
              <div className="search-container">
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    placeholder="Search teams, leaders, or emails..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                  <div className="filter-dropdown-container">
                    <button 
                      className="filter-btn"
                      onClick={toggleFilterDropdown}
                      title="Filter options"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" 
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="filter-text">{getFilterDisplayName(searchFilter)}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="dropdown-arrow">
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    
                    {showFilterDropdown && (
                      <div className="filter-dropdown">
                        <button 
                          className={`filter-option ${searchFilter === 'all' ? 'active' : ''}`}
                          onClick={() => handleFilterChange('all')}
                        >
                          <span className="filter-icon">📋</span>
                          All Teams
                        </button>
                        <button 
                          className={`filter-option ${searchFilter === 'verified' ? 'active' : ''}`}
                          onClick={() => handleFilterChange('verified')}
                        >
                          <span className="filter-icon">✅</span>
                          Verified Only
                        </button>
                        <button 
                          className={`filter-option ${searchFilter === 'pending' ? 'active' : ''}`}
                          onClick={() => handleFilterChange('pending')}
                        >
                          <span className="filter-icon">⏳</span>
                          Pending Only
                        </button>
                        <button 
                          className={`filter-option ${searchFilter === 'today' ? 'active' : ''}`}
                          onClick={() => handleFilterChange('today')}
                        >
                          <span className="filter-icon">📅</span>
                          Registered Today
                        </button>
                        <button 
                          className={`filter-option ${searchFilter === 'this-week' ? 'active' : ''}`}
                          onClick={() => handleFilterChange('this-week')}
                        >
                          <span className="filter-icon">📆</span>
                          This Week
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {(searchTerm || searchFilter !== 'all') && (
                  <button 
                    className="clear-filters-btn"
                    onClick={() => {
                      setSearchTerm('');
                      setSearchFilter('all');
                    }}
                    title="Clear all filters"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            
            {loading ? (
              <div className="loading-container">
                <p>Loading teams data...</p>
              </div>
            ) : filteredTeams.length > 0 ? (
              isMobile ? (
                // Mobile Card Layout
                <div className="teams-cards-container">
                  {filteredTeams.map((team) => (
                    <div key={team.id} className="team-card">
                      <div className="team-card-header">
                        <h4 className="team-card-name">{team.teamName}</h4>
                        <span className={`status-badge ${team.emailVerified ? 'verified' : 'pending'}`}>
                          {team.emailVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      <div className="team-card-info">
                        <div className="team-card-row">
                          <span className="label">Leader:</span>
                          <span className="value">{team.leaderName}</span>
                        </div>
                        <div className="team-card-row">
                          <span className="label">Email:</span>
                          <span className="value">{team.leaderEmail}</span>
                        </div>
                        <div className="team-card-row">
                          <span className="label">Academic Year:</span>
                          <span className="value">{team.academicYear}</span>
                        </div>
                        <div className="team-card-row">
                          <span className="label">Members:</span>
                          <span className="members-count">
                            {team.members ? team.members.length : 0}
                          </span>
                        </div>
                        <div className="team-card-row">
                          <span className="label">Registered:</span>
                          <span className="value">
                            {team.createdAt ? 
                              (team.createdAt.toDate ? 
                                team.createdAt.toDate().toLocaleDateString() : 
                                new Date(team.createdAt).toLocaleDateString()
                              ) : 'N/A'
                            }
                          </span>
                        </div>
                      </div>
                      <div className="team-card-actions">
                        <button 
                          className="view-details-btn-mobile" 
                          onClick={() => handleViewTeamDetails(team)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Desktop Table Layout
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
                      {filteredTeams.map((team) => (
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
              )
            ) : (
              <div className="no-teams">
                {teams.length === 0 ? (
                  <p>No teams registered yet.</p>
                ) : (
                  <p>No teams match your current search and filter criteria.</p>
                )}
              </div>
            )}
          </div>
        );
      case 'countdown':
        return (
          <div className="tab-content">
            <h3>Countdown Settings</h3>
            <div className="countdown-section">
              <form onSubmit={handleCountdownUpdate} className="countdown-form">
                <div className="form-group">
                  <label htmlFor="countdown-title">Event Title:</label>
                  <input
                    type="text"
                    id="countdown-title"
                    value={countdownData.title}
                    onChange={(e) => setCountdownData({...countdownData, title: e.target.value})}
                    placeholder="Event title"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="countdown-description">Description:</label>
                  <input
                    type="text"
                    id="countdown-description"
                    value={countdownData.description}
                    onChange={(e) => setCountdownData({...countdownData, description: e.target.value})}
                    placeholder="e.g., Event starts in"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="countdown-date">Target Date & Time:</label>
                  <input
                    type="datetime-local"
                    id="countdown-date"
                    value={countdownData.targetDate}
                    onChange={(e) => setCountdownData({...countdownData, targetDate: e.target.value})}
                    required
                  />
                </div>
                
                <button type="submit" className="update-countdown-btn" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Countdown'}
                </button>
              </form>
              
              <div className="countdown-preview">
                <h4>Preview:</h4>
                <div className="preview-card">
                  <h5>{countdownData.title}</h5>
                  <p>{countdownData.description}</p>
                  {countdownData.targetDate && (
                    <p className="preview-date">
                      Target: {new Date(countdownData.targetDate).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
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
              
              <h4>Data Export</h4>
              <div className="export-section">
                <p>Download comprehensive reports in Excel format</p>
                <button 
                  onClick={downloadExcelReport} 
                  className="download-excel-btn"
                  disabled={loading}
                >
                  {loading ? 'Generating...' : '📊 Download Excel Report'}
                </button>
                <small className="export-description">
                  Includes: Teams data with member details and current schedule information
                </small>
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
            <span className="tab-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </span>
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            <span className="tab-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </span>
            Teams
          </button>
          <button 
            className={`tab-btn ${activeTab === 'countdown' ? 'active' : ''}`}
            onClick={() => setActiveTab('countdown')}
          >
            <span className="tab-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </span>
            Countdown
          </button>
          <button 
            className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            <span className="tab-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </span>
            Schedule
          </button>
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="tab-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </span>
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
