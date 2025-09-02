import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  isAdminLoggedIn, 
  logoutAdmin, 
  getAllTeams, 
  getCountdownData, 
  updateCountdownData, 
  getScheduleData,
  getAnnouncements,
  addAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getGalleryData,
  updateGalleryData,
  getDomeGalleryImages,
  updateDomeGalleryImages,
  uploadDomeGalleryImage,
  getStoredDomeGalleryImages,
  deleteStoredDomeGalleryImage
} from '../services/firebase';
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
  
  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    type: 'info' // info, event, update, warning
  });
  
  // Gallery state
  const [galleryData, setGalleryData] = useState({
    driveLink: '',
    linkTitle: 'View More Photos',
    linkDescription: 'Access our complete photo collection on Google Drive',
    linkEnabled: true
  });
  
  // Dome Gallery state
  const [domeImages, setDomeImages] = useState([]);
  const [storedImages, setStoredImages] = useState([]);
  const [showStoredImages, setShowStoredImages] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [imageSourceMode, setImageSourceMode] = useState('firebase'); // 'firebase' or 'manual'
  
  // Submissions state
  const [submissionsData, setSubmissionsData] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showSubmissionDetails, setShowSubmissionDetails] = useState(false);
  const [submissionSearchTerm, setSubmissionSearchTerm] = useState('');
  const [submissionFilter, setSubmissionFilter] = useState('all');
  const [scheduleData, setScheduleData] = useState([]);
  
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
    fetchAnnouncements();
    fetchSubmissionsData();
    fetchScheduleData();
    fetchGalleryData();
    fetchDomeGalleryImages();
    fetchStoredImages();

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

  const fetchSubmissionsData = async () => {
    try {
      const result = await getAllTeams();
      if (result.success) {
        // Filter teams that have submission links
        const teamsWithSubmissions = result.teams.filter(team => 
          team.submissionLinks && team.submissionLinks.presentationLink
        );
        setSubmissionsData(teamsWithSubmissions);
      } else {
        console.error('Failed to fetch submissions:', result.message);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const fetchScheduleData = async () => {
    try {
      const result = await getScheduleData();
      if (result.success && result.data) {
        setScheduleData(result.data);
      }
    } catch (error) {
      console.error('Error fetching schedule data:', error);
    }
  };

  const fetchGalleryData = async () => {
    try {
      const result = await getGalleryData();
      if (result.success && result.data) {
        setGalleryData(result.data);
      }
    } catch (error) {
      console.error('Error fetching gallery data:', error);
    }
  };

  const fetchDomeGalleryImages = async () => {
    try {
      const result = await getDomeGalleryImages();
      if (result.success && result.data && result.data.images) {
        setDomeImages(result.data.images);
      } else {
        // If no images configured, set empty array
        setDomeImages([]);
      }
    } catch (error) {
      console.error('Error fetching dome gallery images:', error);
      setDomeImages([]);
    }
  };

  const fetchStoredImages = async () => {
    try {
      const result = await getStoredDomeGalleryImages();
      if (result.success) {
        setStoredImages(result.images);
      }
    } catch (error) {
      console.error('Error fetching stored images:', error);
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

  const handleGalleryUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await updateGalleryData(galleryData);
      if (result.success) {
        alert('Gallery settings updated successfully!');
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating gallery settings:', error);
      alert('Error updating gallery settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDomeImagesUpdate = async () => {
    setLoading(true);
    try {
      const result = await updateDomeGalleryImages(domeImages);
      if (result.success) {
        alert('Dome gallery images updated successfully!');
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating dome gallery images:', error);
      alert('Error updating dome gallery images');
    } finally {
      setLoading(false);
    }
  };

  const addDomeImage = () => {
    if (domeImages.length < 30) {
      setDomeImages([...domeImages, { src: '', alt: '' }]);
    } else {
      alert('Maximum 30 images allowed!');
    }
  };

  const removeDomeImage = (index) => {
    const newImages = domeImages.filter((_, i) => i !== index);
    setDomeImages(newImages);
  };

  const addDefaultImages = () => {
    const defaultImages = [
      { src: 'logo192.png', alt: 'Abstract art' },
      { src: 'culogo.png', alt: 'Abstract art' },
      { src: 'cs.jpg', alt: 'Abstract art' }
    ];
    setDomeImages(defaultImages);
  };

  const updateDomeImage = (index, field, value) => {
    const newImages = [...domeImages];
    newImages[index][field] = value;
    setDomeImages(newImages);
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploadingFile(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        return await uploadDomeGalleryImage(file, fileName);
      });

      const results = await Promise.all(uploadPromises);
      const successCount = results.filter(r => r.success).length;
      
      if (successCount > 0) {
        alert(`Successfully uploaded ${successCount} image(s)!`);
        await fetchStoredImages(); // Refresh stored images list
      }
      
      const failureCount = results.length - successCount;
      if (failureCount > 0) {
        alert(`Failed to upload ${failureCount} image(s). Please try again.`);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files. Please try again.');
    } finally {
      setUploadingFile(false);
      // Clear the file input
      event.target.value = '';
    }
  };

  const addStoredImageToDome = (storedImage) => {
    if (domeImages.length >= 30) {
      alert('Maximum 30 images allowed!');
      return;
    }
    
    const newImage = {
      src: storedImage.src,
      alt: storedImage.alt
    };
    setDomeImages([...domeImages, newImage]);
  };

  const deleteStoredImage = async (fileName) => {
    if (window.confirm('Are you sure you want to delete this image from storage?')) {
      setLoading(true);
      try {
        const result = await deleteStoredDomeGalleryImage(fileName);
        if (result.success) {
          alert('Image deleted successfully!');
          await fetchStoredImages();
        } else {
          alert('Error: ' + result.message);
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        alert('Error deleting image');
      } finally {
        setLoading(false);
      }
    }
  };

  const loadStoredImagesIntoDome = () => {
    if (storedImages.length === 0) {
      alert('No stored images available!');
      return;
    }

    const imagesToAdd = storedImages.slice(0, 30); // Limit to 30 images
    setDomeImages(imagesToAdd.map(img => ({
      src: img.src,
      alt: img.alt
    })));
    alert(`Loaded ${imagesToAdd.length} images from storage into dome gallery!`);
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
      team.academicYear.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (team.topicName && team.topicName.toLowerCase().includes(searchTerm.toLowerCase()));

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

  // ========== SUBMISSION FUNCTIONS ==========
  
  const handleViewSubmissionDetails = (team) => {
    setSelectedSubmission(team);
    setShowSubmissionDetails(true);
  };

  const handleCloseSubmissionDetails = () => {
    setSelectedSubmission(null);
    setShowSubmissionDetails(false);
  };

  const handleSubmissionSearchChange = (e) => {
    setSubmissionSearchTerm(e.target.value);
  };

  const handleSubmissionFilterChange = (filter) => {
    setSubmissionFilter(filter);
  };

  // Filter submissions based on search term and filter type
  const filteredSubmissions = submissionsData.filter(team => {
    // Apply search term filter
    const matchesSearch = submissionSearchTerm === '' || 
      team.teamName.toLowerCase().includes(submissionSearchTerm.toLowerCase()) ||
      team.leaderName.toLowerCase().includes(submissionSearchTerm.toLowerCase()) ||
      team.academicYear.toLowerCase().includes(submissionSearchTerm.toLowerCase()) ||
      (team.topicName && team.topicName.toLowerCase().includes(submissionSearchTerm.toLowerCase()));

    // Apply filter type
    let matchesFilter = true;
    switch (submissionFilter) {
      case 'today':
        if (team.submissionLinks && team.submissionLinks.lastUpdated) {
          const today = new Date();
          const submissionDate = team.submissionLinks.lastUpdated.toDate ? 
            team.submissionLinks.lastUpdated.toDate() : new Date(team.submissionLinks.lastUpdated);
          matchesFilter = submissionDate.toDateString() === today.toDateString();
        } else {
          matchesFilter = false;
        }
        break;
      case 'this-week':
        if (team.submissionLinks && team.submissionLinks.lastUpdated) {
          const now = new Date();
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const submissionDate = team.submissionLinks.lastUpdated.toDate ? 
            team.submissionLinks.lastUpdated.toDate() : new Date(team.submissionLinks.lastUpdated);
          matchesFilter = submissionDate >= weekAgo && submissionDate <= now;
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

  const formatSubmissionDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const getNextScheduledTask = () => {
    if (!scheduleData || scheduleData.length === 0) {
      return { event: 'No tasks scheduled', time: 'N/A' };
    }

    const now = new Date();
    
    // Find events for today that haven't passed yet
    const todayEvents = scheduleData.filter(item => {
      try {
        // Parse time (assuming format like "09:00 AM" or "14:30")
        const [time, period] = item.time.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        
        if (period && period.toUpperCase() === 'PM' && hours !== 12) {
          hours += 12;
        } else if (period && period.toUpperCase() === 'AM' && hours === 12) {
          hours = 0;
        }
        
        const eventTime = new Date();
        eventTime.setHours(hours, minutes || 0, 0, 0);
        
        return eventTime > now;
      } catch (error) {
        return false;
      }
    }).sort((a, b) => {
      // Sort by timeOrder if available, otherwise by time
      if (a.timeOrder && b.timeOrder) {
        return a.timeOrder - b.timeOrder;
      }
      return a.time.localeCompare(b.time);
    });
    
    if (todayEvents.length > 0) {
      return {
        event: todayEvents[0].event || 'Upcoming task',
        time: todayEvents[0].time || 'TBD'
      };
    }
    
    // If no events today, return the first scheduled event
    const sortedEvents = [...scheduleData].sort((a, b) => {
      if (a.timeOrder && b.timeOrder) {
        return a.timeOrder - b.timeOrder;
      }
      return a.time.localeCompare(b.time);
    });
    
    return {
      event: sortedEvents[0]?.event || 'Next scheduled task',
      time: sortedEvents[0]?.time || 'TBD'
    };
  };

  // ========== ANNOUNCEMENTS FUNCTIONS ==========
  
  const fetchAnnouncements = async () => {
    try {
      const result = await getAnnouncements();
      if (result.success) {
        setAnnouncements(result.announcements);
      } else {
        console.error('Failed to fetch announcements:', result.message);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let result;
      if (editingAnnouncement) {
        result = await updateAnnouncement(editingAnnouncement.id, announcementForm);
      } else {
        result = await addAnnouncement(announcementForm);
      }
      
      if (result.success) {
        alert(editingAnnouncement ? 'Announcement updated successfully!' : 'Announcement created successfully!');
        fetchAnnouncements();
        resetAnnouncementForm();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Error saving announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementForm({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type
    });
    setShowAnnouncementForm(true);
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      setLoading(true);
      try {
        const result = await deleteAnnouncement(id);
        if (result.success) {
          alert('Announcement deleted successfully!');
          fetchAnnouncements();
        } else {
          alert('Error: ' + result.message);
        }
      } catch (error) {
        console.error('Error deleting announcement:', error);
        alert('Error deleting announcement');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetAnnouncementForm = () => {
    setAnnouncementForm({
      title: '',
      message: '',
      type: 'info'
    });
    setEditingAnnouncement(null);
    setShowAnnouncementForm(false);
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

  const downloadExcelReport = async () => {
    setLoading(true);
    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Prepare teams data
      const teamsData = teams.map(team => {
        const membersData = team.members || [];
        const memberDetails = membersData.map(member => 
          `${member.name || 'N/A'} (${member.email || 'N/A'}) - ${member.mobile || 'N/A'} - UID: ${member.uid || member.firebaseUid || 'N/A'}`
        );

        return {
          'Team Name': team.teamName,
          'Topic Name': team.topicName || 'Not specified',
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
          'Has Submission': team.submissionLinks ? 'Yes' : 'No',
          'Member Details': memberDetails.join('\n')
        };
      });

      // Create teams worksheet
      const teamsWorksheet = XLSX.utils.json_to_sheet(teamsData);
      XLSX.utils.book_append_sheet(workbook, teamsWorksheet, 'Teams');

      // Prepare submissions data
      const submissionsExportData = submissionsData.map(team => {
        return {
          'Team Name': team.teamName,
          'Topic Name': team.topicName || 'Not specified',
          'Leader Name': team.leaderName,
          'Leader Email': team.leaderEmail,
          'Academic Year': team.academicYear,
          'Submission Date': team.submissionLinks?.lastUpdated ? 
            formatSubmissionDate(team.submissionLinks.lastUpdated) : 'N/A',
          'Presentation Link': team.submissionLinks?.presentationLink || 'Not provided',
          'YouTube Link': team.submissionLinks?.youtubeLink || 'Not provided',
          'GitHub Link': team.submissionLinks?.githubLink || 'Not provided',
          'Other Link': team.submissionLinks?.otherLink || 'Not provided',
          'Members Count': team.members ? team.members.length : 0,
          'Registration Date': team.createdAt ? 
            (team.createdAt.toDate ? 
              team.createdAt.toDate().toLocaleDateString() : 
              new Date(team.createdAt).toLocaleDateString()
            ) : 'N/A'
        };
      });

      // Create submissions worksheet
      const submissionsWorksheet = XLSX.utils.json_to_sheet(submissionsExportData);
      XLSX.utils.book_append_sheet(workbook, submissionsWorksheet, 'Submissions');

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

      // Prepare announcements data
      const announcementsExportData = announcements.map(announcement => ({
        'Title': announcement.title,
        'Message': announcement.message,
        'Type': announcement.type,
        'Created Date': announcement.createdAt ? 
          formatTimestamp(announcement.createdAt) : 'N/A',
        'Last Updated': announcement.updatedAt ? 
          formatTimestamp(announcement.updatedAt) : 'N/A'
      }));

      // Create announcements worksheet
      const announcementsWorksheet = XLSX.utils.json_to_sheet(announcementsExportData);
      XLSX.utils.book_append_sheet(workbook, announcementsWorksheet, 'Announcements');

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
                <h4>Total Submissions</h4>
                <p className="stat-number">{submissionsData.length}</p>
                <small className="stat-subtitle">Projects submitted</small>
              </div>
              <div className="stat-card">
                <h4>Event Countdown</h4>
                <p className="stat-text">{countdownData.title}</p>
                <small className="stat-subtitle">
                  {countdownData.targetDate ? 
                    new Date(countdownData.targetDate).toLocaleDateString() : 
                    'Not set'
                  }
                </small>
              </div>
              <div className="stat-card">
                <h4>Next Scheduled Task</h4>
                <p className="stat-text">{getNextScheduledTask().event}</p>
                <small className="stat-subtitle">{getNextScheduledTask().time}</small>
              </div>
              <div className="stat-card">
                <h4>Last Announcement</h4>
                <p className="stat-text">
                  {announcements.length > 0 ? 
                    announcements[0].title : 
                    'No announcements'
                  }
                </p>
                <small className="stat-subtitle">
                  {announcements.length > 0 ? 
                    formatTimestamp(announcements[0].createdAt) : 
                    'None sent'
                  }
                </small>
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
                    placeholder="Search teams, topics, leaders, or emails..."
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
                          <span className="label">Topic:</span>
                          <span className="value">{team.topicName || 'Not specified'}</span>
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
                  <label htmlFor="countdown-title">Event Title</label>
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
                  <label htmlFor="countdown-description">Description</label>
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
                  <label htmlFor="countdown-date">Target Date & Time</label>
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
      case 'submissions':
        return (
          <div className="tab-content">
            <div className="submissions-header">
              <h3>Team Submissions</h3>
              <div className="submissions-stats">
                <span className="submissions-count">
                  Showing {filteredSubmissions.length} of {submissionsData.length} submissions
                </span>
                <button onClick={fetchSubmissionsData} className="refresh-btn" disabled={loading}>
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
                    placeholder="Search teams, topics, academic year..."
                    value={submissionSearchTerm}
                    onChange={handleSubmissionSearchChange}
                    className="search-input"
                  />
                  <div className="filter-dropdown-container">
                    <select 
                      className="filter-select"
                      value={submissionFilter}
                      onChange={(e) => handleSubmissionFilterChange(e.target.value)}
                    >
                      <option value="all">All Submissions</option>
                      <option value="today">Submitted Today</option>
                      <option value="this-week">This Week</option>
                    </select>
                  </div>
                </div>
                {(submissionSearchTerm || submissionFilter !== 'all') && (
                  <button 
                    className="clear-filters-btn"
                    onClick={() => {
                      setSubmissionSearchTerm('');
                      setSubmissionFilter('all');
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
                <p>Loading submissions data...</p>
              </div>
            ) : filteredSubmissions.length > 0 ? (
              isMobile ? (
                // Mobile Card Layout
                <div className="submissions-cards-container">
                  {filteredSubmissions.map((team) => (
                    <div key={team.id} className="submission-card">
                      <div className="submission-card-header">
                        <h4 className="submission-card-name">{team.teamName}</h4>
                        <span className="submission-date">
                          {formatSubmissionDate(team.submissionLinks?.lastUpdated)}
                        </span>
                      </div>
                      <div className="submission-card-info">
                        <div className="submission-card-row">
                          <span className="label">Topic:</span>
                          <span className="value">{team.topicName || 'Not specified'}</span>
                        </div>
                        <div className="submission-card-row">
                          <span className="label">Academic Year:</span>
                          <span className="value">{team.academicYear}</span>
                        </div>
                        <div className="submission-card-row">
                          <span className="label">Leader:</span>
                          <span className="value">{team.leaderName}</span>
                        </div>
                        <div className="submission-card-row">
                          <span className="label">Presentation:</span>
                          <a 
                            href={team.submissionLinks?.presentationLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="submission-link"
                          >
                            View Presentation
                          </a>
                        </div>
                      </div>
                      <div className="submission-card-actions">
                        <button 
                          className="view-submission-details-btn-mobile" 
                          onClick={() => handleViewSubmissionDetails(team)}
                        >
                          View All Links
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Desktop Table Layout
                <div className="submissions-table-container">
                  <table className="submissions-table">
                    <thead>
                      <tr>
                        <th>Team Name</th>
                        <th>Topic</th>
                        <th>Academic Year</th>
                        <th>Submission Date</th>
                        <th>Presentation Link</th>
                        <th>All Links</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.map((team) => (
                        <tr key={team.id}>
                          <td className="team-name">{team.teamName}</td>
                          <td>{team.topicName || 'Not specified'}</td>
                          <td>{team.academicYear}</td>
                          <td>
                            {formatSubmissionDate(team.submissionLinks?.lastUpdated)}
                          </td>
                          <td>
                            <a 
                              href={team.submissionLinks?.presentationLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="submission-link"
                            >
                              View Presentation
                            </a>
                          </td>
                          <td>
                            <button 
                              className="view-submission-details-btn" 
                              onClick={() => handleViewSubmissionDetails(team)}
                              title="View All Submission Links"
                            >
                              View All Links
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <div className="no-submissions">
                {submissionsData.length === 0 ? (
                  <p>No submissions received yet.</p>
                ) : (
                  <p>No submissions match your current search and filter criteria.</p>
                )}
              </div>
            )}
          </div>
        );
      case 'announcements':
        return (
          <div className="tab-content">
            <div className="announcements-header">
              <h3>Announcements Management</h3>
              <button 
                className="add-announcement-btn"
                onClick={() => setShowAnnouncementForm(true)}
                disabled={loading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add New Announcement
              </button>
            </div>

            {/* Announcement Form Modal */}
            {showAnnouncementForm && (
              <div className="announcement-form-overlay">
                <div className="announcement-form-modal">
                  <div className="modal-header">
                    <h4>{editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}</h4>
                    <button className="close-btn" onClick={resetAnnouncementForm}>×</button>
                  </div>
                  
                  <form onSubmit={handleAnnouncementSubmit} className="announcement-form">
                    <div className="form-group">
                      <label htmlFor="announcement-title">Title:</label>
                      <input
                        type="text"
                        id="announcement-title"
                        value={announcementForm.title}
                        onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})}
                        placeholder="Enter announcement title"
                        required
                        maxLength="100"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="announcement-type">Type:</label>
                      <select
                        id="announcement-type"
                        value={announcementForm.type}
                        onChange={(e) => setAnnouncementForm({...announcementForm, type: e.target.value})}
                        required
                      >
                        <option value="info">Info</option>
                        <option value="event">Event</option>
                        <option value="update">Update</option>
                        <option value="warning">Warning</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="announcement-message">Message:</label>
                      <textarea
                        id="announcement-message"
                        value={announcementForm.message}
                        onChange={(e) => setAnnouncementForm({...announcementForm, message: e.target.value})}
                        placeholder="Enter announcement message"
                        required
                        rows="4"
                        maxLength="500"
                      />
                      <small className="char-count">
                        {announcementForm.message.length}/500 characters
                      </small>
                    </div>
                    
                    <div className="form-actions">
                      <button type="button" className="cancel-btn" onClick={resetAnnouncementForm}>
                        Cancel
                      </button>
                      <button type="submit" className="save-btn" disabled={loading}>
                        {loading ? 'Saving...' : (editingAnnouncement ? 'Update' : 'Create')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Announcements List */}
            <div className="announcements-management-list">
              {announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <div key={announcement.id} className={`announcement-management-card ${announcement.type}`}>
                    <div className="announcement-content">
                      <div className="announcement-header">
                        <h4 className="announcement-title">{announcement.title}</h4>
                        <span className={`type-badge ${announcement.type}`}>
                          {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                        </span>
                      </div>
                      <p className="announcement-message">{announcement.message}</p>
                      <div className="announcement-meta">
                        <span className="timestamp">
                          Created: {formatTimestamp(announcement.createdAt)}
                        </span>
                        {announcement.updatedAt && announcement.updatedAt !== announcement.createdAt && (
                          <span className="timestamp">
                            Updated: {formatTimestamp(announcement.updatedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="announcement-actions">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditAnnouncement(announcement)}
                        title="Edit Announcement"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        title="Delete Announcement"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-announcements">
                  <p>No announcements created yet.</p>
                  <button 
                    className="create-first-btn"
                    onClick={() => setShowAnnouncementForm(true)}
                  >
                    Create Your First Announcement
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      case 'gallery':
        return (
          <div className="tab-content">
            <h3>Gallery Settings</h3>
            <div className="gallery-settings-section">
              <form onSubmit={handleGalleryUpdate} className="gallery-form">
                <div className="form-group">
                  <label htmlFor="gallery-drive-link">Google Drive Folder Link</label>
                  <input
                    type="url"
                    id="gallery-drive-link"
                    value={galleryData.driveLink}
                    onChange={(e) => setGalleryData({...galleryData, driveLink: e.target.value})}
                    placeholder="https://drive.google.com/drive/folders/YOUR_FOLDER_ID"
                    required
                  />
                  <small className="help-text">
                    Paste the full Google Drive folder link. Make sure the folder is publicly accessible.
                  </small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="gallery-link-title">Link Title</label>
                  <input
                    type="text"
                    id="gallery-link-title"
                    value={galleryData.linkTitle}
                    onChange={(e) => setGalleryData({...galleryData, linkTitle: e.target.value})}
                    placeholder="View More Photos"
                    required
                    maxLength="50"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="gallery-link-description">Link Description</label>
                  <input
                    type="text"
                    id="gallery-link-description"
                    value={galleryData.linkDescription}
                    onChange={(e) => setGalleryData({...galleryData, linkDescription: e.target.value})}
                    placeholder="Access our complete photo collection on Google Drive"
                    required
                    maxLength="100"
                  />
                </div>
                
                <div className="form-group">
                  <div className="toggle-field">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={galleryData.linkEnabled}
                        onChange={(e) => setGalleryData({...galleryData, linkEnabled: e.target.checked})}
                        className="toggle-checkbox"
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-text">
                        {galleryData.linkEnabled ? 'Link is enabled' : 'Link is disabled'}
                      </span>
                    </label>
                    <small className="help-text">
                      {galleryData.linkEnabled 
                        ? 'The Google Drive link will be visible and clickable on the gallery page.'
                        : 'The Google Drive link will be hidden from visitors on the gallery page.'
                      }
                    </small>
                  </div>
                </div>
                
                <button type="submit" className="update-gallery-btn" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Gallery Settings'}
                </button>
              </form>
              
              <div className="dome-gallery-management">
                <h4>Dome Gallery Images (Max 30)</h4>
                <p className="dome-info">Manage the images displayed in the 3D dome gallery. You can add up to 30 images.</p>
                
                {/* Image Source Toggle */}
                <div className="image-source-toggle">
                  <h5>Image Source</h5>
                  <div className="toggle-container">
                    <button 
                      type="button"
                      className={`toggle-btn ${imageSourceMode === 'firebase' ? 'active' : ''}`}
                      onClick={() => setImageSourceMode('firebase')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
                        <line x1="12" y1="22.08" x2="12" y2="12"/>
                      </svg>
                      Firebase Storage
                    </button>
                    <button 
                      type="button"
                      className={`toggle-btn ${imageSourceMode === 'manual' ? 'active' : ''}`}
                      onClick={() => setImageSourceMode('manual')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
                      </svg>
                      Manual URLs
                    </button>
                  </div>
                  <p className="toggle-description">
                    {imageSourceMode === 'firebase' 
                      ? 'Upload and manage images using Firebase Storage - images are stored in the cloud.'
                      : 'Manually enter image URLs - images are hosted externally.'
                    }
                  </p>
                </div>

                {/* Current Dome Images Display */}
                <div className="current-dome-images">
                  <h5>Current Dome Images ({domeImages.length}/30)</h5>
                  {domeImages.length > 0 ? (
                    <>
                      <div className="current-images-grid">
                        {domeImages.map((image, index) => (
                          <div key={index} className="current-image-item">
                            <div className="current-image-preview">
                              <img src={image.src} alt={image.alt} onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }} />
                              <div className="image-error" style={{ display: 'none' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                  <circle cx="8.5" cy="8.5" r="1.5"/>
                                  <polyline points="21,15 16,10 5,21"/>
                                </svg>
                                <span>Image not found</span>
                              </div>
                            </div>
                            <div className="current-image-info">
                              <span className="current-image-number">#{index + 1}</span>
                              <span className="current-image-alt" title={image.alt}>
                                {image.alt || 'No description'}
                              </span>
                              <button 
                                type="button"
                                className="remove-from-dome-btn"
                                onClick={() => removeDomeImage(index)}
                                title="Remove from dome"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="18" y1="6" x2="6" y2="18"/>
                                  <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Save All Changes Button */}
                      <div className="save-dome-changes">
                        <button 
                          type="button" 
                          className="save-all-dome-changes-btn" 
                          onClick={handleDomeImagesUpdate}
                          disabled={loading}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                            <polyline points="17,21 17,13 7,13 7,21"/>
                            <polyline points="7,3 7,8 15,8"/>
                          </svg>
                          {loading ? 'Saving Changes...' : 'Save All Dome Gallery Changes'}
                        </button>
                        <p className="save-description">
                          This will save all current dome gallery images and make them live on the website.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="no-current-images">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
                        <line x1="12" y1="22.08" x2="12" y2="12"/>
                      </svg>
                      <p>No images configured for the dome gallery</p>
                      <p>Use the {imageSourceMode === 'firebase' ? 'Firebase Storage' : 'Manual URLs'} section below to add images</p>
                      {imageSourceMode === 'manual' && (
                        <button 
                          type="button" 
                          className="add-default-images-btn"
                          onClick={addDefaultImages}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                          Add Default Images
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Firebase Storage Section */}
                {imageSourceMode === 'firebase' && (
                <div className="storage-section">
                  <h5>Firebase Storage</h5>
                  <div className="storage-controls">
                    <div className="upload-section">
                      <input
                        type="file"
                        id="image-upload"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="image-upload" className="upload-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7,10 12,15 17,10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        {uploadingFile ? 'Uploading...' : 'Upload Images'}
                      </label>
                      {storedImages.length > 0 && (
                        <button 
                          type="button" 
                          className="load-stored-btn"
                          onClick={loadStoredImagesIntoDome}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
                            <line x1="12" y1="22.08" x2="12" y2="12"/>
                          </svg>
                          Load All to Dome ({storedImages.length})
                        </button>
                      )}
                    </div>
                    <button 
                      type="button" 
                      className="toggle-stored-btn"
                      onClick={() => setShowStoredImages(!showStoredImages)}
                    >
                      {showStoredImages ? 'Hide' : 'Show'} Stored Images ({storedImages.length})
                    </button>
                  </div>

                  {/* Stored Images List */}
                  {showStoredImages && (
                    <div className="stored-images-container">
                      {storedImages.length > 0 ? (
                        <div className="stored-images-grid">
                          {storedImages.map((image, index) => (
                            <div key={index} className="stored-image-item">
                              <div className="stored-image-preview">
                                <img src={image.src} alt={image.alt} />
                              </div>
                              <div className="stored-image-info">
                                <span className="image-name">{image.fileName}</span>
                                <div className="stored-image-actions">
                                  <button 
                                    type="button"
                                    className="use-image-btn"
                                    onClick={() => addStoredImageToDome(image)}
                                    disabled={domeImages.length >= 30}
                                  >
                                    Use
                                  </button>
                                  <button 
                                    type="button"
                                    className="delete-stored-btn"
                                    onClick={() => deleteStoredImage(image.fileName)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-stored-images">
                          <p>No images stored in Firebase Storage yet.</p>
                          <p>Upload some images to get started!</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                )}

                {/* Manual Image Entry Section */}
                {imageSourceMode === 'manual' && (
                <div className="manual-entry-section">
                  <h5>Manual Image Entry</h5>
                  <div className="dome-images-header">
                    <span className="images-count">{domeImages.length}/30 images</span>
                    <button 
                      type="button" 
                      className="add-image-btn" 
                      onClick={addDomeImage}
                      disabled={domeImages.length >= 30}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Add Image URL
                    </button>
                  </div>

                  <div className="dome-images-list">
                    {domeImages.map((image, index) => (
                      <div key={index} className="dome-image-item">
                        <div className="dome-image-number">#{index + 1}</div>
                        <div className="dome-image-fields">
                          <div className="dome-field-group">
                            <label>Image URL:</label>
                            <input
                              type="url"
                              value={image.src}
                              onChange={(e) => updateDomeImage(index, 'src', e.target.value)}
                              placeholder="https://example.com/image.jpg"
                              required
                            />
                          </div>
                          <div className="dome-field-group">
                            <label>Alt Text:</label>
                            <input
                              type="text"
                              value={image.alt}
                              onChange={(e) => updateDomeImage(index, 'alt', e.target.value)}
                              placeholder="Image description"
                              maxLength="100"
                            />
                          </div>
                        </div>
                        <button 
                          type="button" 
                          className="remove-image-btn"
                          onClick={() => removeDomeImage(index)}
                          disabled={domeImages.length <= 1}
                          title="Remove image"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                )}
              </div>
            </div>
          </div>
        );
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
                  Includes: Teams data with member details, submission links, schedule information, and announcements
                </small>
              </div>

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
            className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            <span className="tab-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </span>
            Submissions
          </button>
          <button 
            className={`tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => setActiveTab('announcements')}
          >
            <span className="tab-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
              </svg>
            </span>
            Announcements
          </button>
          <button 
            className={`tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => setActiveTab('gallery')}
          >
            <span className="tab-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 16 5-7 6 6.5m6.5 2.5L16 13l-4.286 6M14 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
                <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>
              </svg>
            </span>
            Gallery
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

      {/* Submission Details Modal */}
      {showSubmissionDetails && selectedSubmission && (
        <div className="submission-details-modal-overlay">
          <div className="submission-details-modal">
            <div className="modal-header">
              <h2>Submission Details: {selectedSubmission.teamName}</h2>
              <button className="close-btn" onClick={handleCloseSubmissionDetails}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="submission-info-section">
                <h3>Team Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Team Name:</label>
                    <span>{selectedSubmission.teamName}</span>
                  </div>
                  <div className="info-item">
                    <label>Topic Name:</label>
                    <span>{selectedSubmission.topicName || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <label>Leader:</label>
                    <span>{selectedSubmission.leaderName}</span>
                  </div>
                  <div className="info-item">
                    <label>Academic Year:</label>
                    <span>{selectedSubmission.academicYear}</span>
                  </div>
                  <div className="info-item">
                    <label>Last Updated:</label>
                    <span>
                      {formatSubmissionDate(selectedSubmission.submissionLinks?.lastUpdated)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="submission-links-section">
                <h3>Submission Links</h3>
                <div className="submission-links-grid">
                  <div className="submission-link-item">
                    <label>📊 Presentation (Required):</label>
                    {selectedSubmission.submissionLinks?.presentationLink ? (
                      <a 
                        href={selectedSubmission.submissionLinks.presentationLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="submission-link-url"
                      >
                        {selectedSubmission.submissionLinks.presentationLink}
                      </a>
                    ) : (
                      <span className="no-link">Not provided</span>
                    )}
                  </div>
                  
                  <div className="submission-link-item">
                    <label>🎥 YouTube Video:</label>
                    {selectedSubmission.submissionLinks?.youtubeLink ? (
                      <a 
                        href={selectedSubmission.submissionLinks.youtubeLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="submission-link-url"
                      >
                        {selectedSubmission.submissionLinks.youtubeLink}
                      </a>
                    ) : (
                      <span className="no-link">Not provided</span>
                    )}
                  </div>
                  
                  <div className="submission-link-item">
                    <label>💻 GitHub Repository:</label>
                    {selectedSubmission.submissionLinks?.githubLink ? (
                      <a 
                        href={selectedSubmission.submissionLinks.githubLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="submission-link-url"
                      >
                        {selectedSubmission.submissionLinks.githubLink}
                      </a>
                    ) : (
                      <span className="no-link">Not provided</span>
                    )}
                  </div>
                  
                  <div className="submission-link-item">
                    <label>🔗 Other Link:</label>
                    {selectedSubmission.submissionLinks?.otherLink ? (
                      <a 
                        href={selectedSubmission.submissionLinks.otherLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="submission-link-url"
                      >
                        {selectedSubmission.submissionLinks.otherLink}
                      </a>
                    ) : (
                      <span className="no-link">Not provided</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <label>Topic Name:</label>
                    <span>{selectedTeam.topicName || 'Not specified'}</span>
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
