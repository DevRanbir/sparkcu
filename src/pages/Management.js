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
  deleteStoredDomeGalleryImage,
  getPageVisibilitySettings,
  updatePageVisibilitySettings,
  getSubmissionSettings,
  updateSubmissionSettings,
  getAutoAnnouncementSettings,
  checkAndCreateAutoAnnouncements,
  getNotifications,
  addNotifications,
  updateNotifications,
  deleteNotification,
  deleteAllNotifications,
  addDownloadHistory,
  getDownloadHistory,
  getResults,
  saveResults,
  deleteAllResults
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
  
  // Submission Settings state
  const [submissionSettings, setSubmissionSettings] = useState({
    enabled: true,
    message: 'Submissions are currently open'
  });
  const [updatingSubmissionSettings, setUpdatingSubmissionSettings] = useState(false);
  
  // Auto Announcement Settings state
  const [autoAnnouncementSettings, setAutoAnnouncementSettings] = useState({
    enabled: true,
    message: 'Auto-announcements for schedule events'
  });
  // eslint-disable-next-line
  const [updatingAutoAnnouncements, setUpdatingAutoAnnouncements] = useState(false);
  
  // Page Visibility state
  const [pageVisibilitySettings, setPageVisibilitySettings] = useState({
    home: true,
    rules: true,
    schedule: true,
    about: true,
    keymaps: true,
    prizes: true,
    gallery: true,
    result: true,
    dashboard: true,
    login: true,
    register: true
  });
  const [updatingPageVisibility, setUpdatingPageVisibility] = useState(false);
  
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [uploadingNotifications, setUploadingNotifications] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [deletingAllNotifications, setDeletingAllNotifications] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [downloadHistory, setDownloadHistory] = useState([]);
  
  // Custom message popup state
  const [showCustomMessagePopup, setShowCustomMessagePopup] = useState(false);
  const [customMessageForm, setCustomMessageForm] = useState({
    selectedTeams: [],
    message: ''
  });
  const [sendingCustomMessage, setSendingCustomMessage] = useState(false);
  const [teamSearchTerm, setTeamSearchTerm] = useState('');
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  
  // Edit notification state
  const [showEditNotificationPopup, setShowEditNotificationPopup] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [editNotificationForm, setEditNotificationForm] = useState({
    message: ''
  });
  const [updatingNotification, setUpdatingNotification] = useState(false);
  
  // Results state
  const [resultsData, setResultsData] = useState([]);
  const [uploadingResults, setUploadingResults] = useState(false);
  const [downloadingResultsTemplate, setDownloadingResultsTemplate] = useState(false);
  const [deletingAllResults, setDeletingAllResults] = useState(false);
  const [sendingResultsNotifications, setSendingResultsNotifications] = useState(false);
  const [resultsPreview, setResultsPreview] = useState([]);
  const [showResultsPreview, setShowResultsPreview] = useState(false);
  
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
    fetchPageVisibilitySettings();
    fetchSubmissionSettings();
    fetchAutoAnnouncementSettings();
    fetchNotifications();
    fetchDownloadHistory();
    fetchResultsData();

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

  // Auto-announcement checker - runs every 30 seconds
  useEffect(() => {
    const checkAutoAnnouncements = async () => {
      if (autoAnnouncementSettings.enabled) {
        try {
          const result = await checkAndCreateAutoAnnouncements();
          if (result.success && result.createdCount > 0) {
            console.log(`Created ${result.createdCount} auto-announcements:`, result.announcements);
            // Refresh announcements to show the new ones
            fetchAnnouncements();
          }
        } catch (error) {
          console.error('Error checking auto-announcements:', error);
        }
      }
    };

    // Check immediately on mount if enabled
    if (autoAnnouncementSettings.enabled) {
      checkAutoAnnouncements();
    }

    // Set up interval to check every 30 seconds (30000 ms) for more responsive checking
    const interval = setInterval(checkAutoAnnouncements, 30000);

    return () => clearInterval(interval);
  }, [autoAnnouncementSettings.enabled]);

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

  const fetchResultsData = async () => {
    try {
      const result = await getResults();
      if (result.success) {
        setResultsData(result.results);
      } else {
        console.error('Failed to fetch results:', result.message);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
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

  const fetchPageVisibilitySettings = async () => {
    try {
      const result = await getPageVisibilitySettings();
      if (result.success) {
        setPageVisibilitySettings(result.data);
      }
    } catch (error) {
      console.error('Error fetching page visibility settings:', error);
    }
  };

  const fetchSubmissionSettings = async () => {
    try {
      const result = await getSubmissionSettings();
      if (result.success) {
        setSubmissionSettings(result.settings);
      }
    } catch (error) {
      console.error('Error fetching submission settings:', error);
    }
  };

  const fetchAutoAnnouncementSettings = async () => {
    try {
      const result = await getAutoAnnouncementSettings();
      if (result.success) {
        setAutoAnnouncementSettings(result.settings);
      }
    } catch (error) {
      console.error('Error fetching auto announcement settings:', error);
    }
  };

  const handlePageVisibilityUpdate = async (pageName, isVisible) => {
    setUpdatingPageVisibility(true);
    try {
      const updatedSettings = {
        ...pageVisibilitySettings,
        [pageName]: isVisible
      };
      
      const result = await updatePageVisibilitySettings(updatedSettings);
      if (result.success) {
        setPageVisibilitySettings(updatedSettings);
        // You could add a toast notification here
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating page visibility:', error);
      alert('Error updating page visibility');
    } finally {
      setUpdatingPageVisibility(false);
    }
  };

  const handleSubmissionSettingsUpdate = async (event) => {
    const enabled = event.target.checked;
    setUpdatingSubmissionSettings(true);
    try {
      const updatedSettings = {
        enabled: enabled,
        message: enabled ? 'Submissions are currently open' : 'Submissions are currently closed'
      };
      
      const result = await updateSubmissionSettings(updatedSettings);
      if (result.success) {
        setSubmissionSettings(updatedSettings);
        alert(`Submissions ${enabled ? 'enabled' : 'disabled'} successfully!`);
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating submission settings:', error);
      alert('Error updating submission settings');
    } finally {
      setUpdatingSubmissionSettings(false);
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

  // Notification functions
  const fetchNotifications = async () => {
    try {
      const result = await getNotifications();
      if (result.success) {
        setNotifications(result.notifications);
      } else {
        console.error('Failed to fetch notifications:', result.message);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
      alert('Please upload an Excel file (.xlsx or .xls)');
      event.target.value = '';
      return;
    }

    // Check file consistency with last downloaded template
    const lastDownloadedTemplate = localStorage.getItem('lastDownloadedTemplate');
    if (lastDownloadedTemplate) {
      const uploadedBaseName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      const downloadedBaseName = lastDownloadedTemplate.replace(/\.[^/.]+$/, "").replace(/_\d{4}-\d{2}-\d{2}_.*/, ""); // Remove date/time suffix
      
      if (!uploadedBaseName.startsWith(downloadedBaseName.replace(/_\d{4}-\d{2}-\d{2}.*/, ""))) {
        const proceedAnyway = window.confirm(
          `⚠️ File Consistency Warning!\n\n` +
          `Expected file based on last download: ${lastDownloadedTemplate}\n` +
          `Uploaded file: ${file.name}\n\n` +
          `For consistency, please use the last downloaded template.\n\n` +
          `Do you want to proceed anyway? (Not recommended)`
        );
        
        if (!proceedAnyway) {
          event.target.value = '';
          return;
        }
      }
    }

    setUploadingNotifications(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Validate the Excel structure
          if (jsonData.length === 0) {
            alert('Excel file is empty');
            return;
          }

          // Check for required columns
          const firstRow = jsonData[0];
          const headers = Object.keys(firstRow);
          
          if (!headers.find(h => h.toLowerCase().includes('team name'))) {
            alert('Excel file must contain a "Team Name" column');
            return;
          }

          if (!headers.find(h => h.toLowerCase().includes('leader name'))) {
            alert('Excel file must contain a "Leader Name" column');
            return;
          }

          // Determine format type based on timestamp columns
          const isHistoricalFormat = headers.some(h => h.match(/^\d{1,2}\/\d{1,2}\/\d{4}_\d{1,2}-\d{1,2}-\d{1,2}$/)); // DD/MM/YYYY_HH-MM-SS format
          const isSimpleFormat = !isHistoricalFormat;

          // Get registered teams for validation
          const registeredTeams = teams.map(team => ({
            name: team.teamName,
            leader: team.leaderName || 'N/A'
          }));
          
          // Process notifications data
          const notificationsToAdd = [];
          const notificationsToUpdate = [];
          const invalidTeams = [];
          const leaderMismatches = [];
          let processedTeams = 0;
          
          console.log('Processing format:', isHistoricalFormat ? 'Historical (TABLE 2)' : 'Simple (TABLE 1)');
          
          jsonData.forEach((row, index) => {
            const teamName = (row['Team Name'] || '').toString().trim();
            const leaderName = (row['Leader Name'] || '').toString().trim();
            
            if (!teamName) {
              return; // Skip empty rows
            }
            
            // Find registered team (case-insensitive)
            const registeredTeam = registeredTeams.find(team => 
              team.name.toLowerCase() === teamName.toLowerCase()
            );
            
            if (!registeredTeam) {
              invalidTeams.push(teamName);
              return;
            }
            
            // Check leader name consistency (optional warning)
            if (leaderName && registeredTeam.leader !== 'N/A' && 
                leaderName.toLowerCase() !== registeredTeam.leader.toLowerCase()) {
              leaderMismatches.push(`${teamName}: Expected "${registeredTeam.leader}", got "${leaderName}"`);
            }
            
            let hasNotifications = false;
            
            if (isSimpleFormat) {
              // TABLE 1: Single timestamp column
              const timestampColumns = headers.filter(h => h !== 'Team Name' && h !== 'Leader Name');
              
              timestampColumns.forEach(timestampColumn => {
                const notification = (row[timestampColumn] || '').toString().trim();
                if (notification) {
                  // Split multiple notifications by " | "
                  const notifications = notification.split(' | ').map(n => n.trim()).filter(n => n);
                  
                  notifications.forEach(notif => {
                    // Parse timestamp from column header for proper dating
                    const parsedTimestamp = parseTimestampFromHeader(timestampColumn);
                    
                    notificationsToAdd.push({
                      teamName: registeredTeam.name, // Use correct case
                      notification: notif,
                      customTimestamp: parsedTimestamp
                    });
                    hasNotifications = true;
                  });
                }
              });
            } else {
              // TABLE 2: Multiple timestamp columns (DD/MM/YYYY_HH-MM-SS format)
              const timestampColumns = headers.filter(h => h.match(/^\d{1,2}\/\d{1,2}\/\d{4}_\d{1,2}-\d{1,2}-\d{1,2}$/));
              
              timestampColumns.forEach(timestampColumn => {
                const notification = (row[timestampColumn] || '').toString().trim();
                if (notification) {
                  // Split multiple notifications by " | "
                  const notifications = notification.split(' | ').map(n => n.trim()).filter(n => n);
                  
                  notifications.forEach(notif => {
                    // Check if this is an update (has [ID:xxx] prefix) or new notification
                    const idMatch = notif.match(/^\[ID:([^\]]+)\](.*)$/);
                    const parsedTimestamp = parseTimestampFromHeader(timestampColumn);
                    
                    if (idMatch) {
                      // This is an update to existing notification
                      const notificationId = idMatch[1];
                      const updatedText = idMatch[2].trim();
                      
                      if (updatedText) { // Only update if there's actual text
                        notificationsToUpdate.push({
                          teamName: registeredTeam.name,
                          notificationId: notificationId,
                          newNotification: updatedText,
                          originalTimestamp: parsedTimestamp
                        });
                        hasNotifications = true;
                      }
                    } else {
                      // This is a new notification
                      if (notif) { // Only add if there's actual text
                        notificationsToAdd.push({
                          teamName: registeredTeam.name,
                          notification: notif,
                          customTimestamp: parsedTimestamp
                        });
                        hasNotifications = true;
                      }
                    }
                  });
                }
              });
            }
            
            if (hasNotifications) {
              processedTeams++;
            }
          });
          
          // Helper function to parse timestamp from column header
          function parseTimestampFromHeader(header) {
            try {
              if (header.includes('_')) {
                // Historical format: DD/MM/YYYY_HH-MM-SS
                const [datePart, timePart] = header.split('_');
                const [day, month, year] = datePart.split('/').map(Number);
                const [hours, minutes, seconds] = timePart.split('-').map(Number);
                return new Date(year, month - 1, day, hours, minutes, seconds || 0);
              } else {
                // Simple format: DD/MM/YYYY
                const [day, month, year] = header.split('/').map(Number);
                return new Date(year, month - 1, day);
              }
            } catch (error) {
              console.warn('Failed to parse timestamp from header:', header);
              return new Date(); // Fallback to current time
            }
          }

          // Show validation results
          let warningMessage = '';
          if (invalidTeams.length > 0) {
            warningMessage += `⚠️ Unregistered teams (will be skipped):\n${[...new Set(invalidTeams)].join(', ')}\n\n`;
          }
          if (leaderMismatches.length > 0) {
            warningMessage += `⚠️ Leader name mismatches:\n${leaderMismatches.slice(0, 5).join('\n')}`;
            if (leaderMismatches.length > 5) {
              warningMessage += `\n... and ${leaderMismatches.length - 5} more`;
            }
            warningMessage += '\n\n';
          }
          
          const totalOperations = notificationsToAdd.length + notificationsToUpdate.length;
          
          if (totalOperations === 0) {
            alert('No valid notifications found in the Excel file.\n\n' + warningMessage);
            return;
          }

          // Show confirmation
          const confirmMessage = 
            `📊 Upload Summary:\n` +
            `• Format: ${isHistoricalFormat ? 'Historical (TABLE 2)' : 'Simple (TABLE 1)'}\n` +
            `• Teams processed: ${processedTeams}\n` +
            `• New notifications: ${notificationsToAdd.length}\n` +
            `• Updated notifications: ${notificationsToUpdate.length}\n\n` +
            `${warningMessage}` +
            `Do you want to proceed with ${totalOperations} operations?`;
          
          if (!window.confirm(confirmMessage)) {
            return;
          }

          // Process updates first (if any)
          let updateResults = { success: true, updatedCount: 0, errors: [] };
          if (notificationsToUpdate.length > 0) {
            updateResults = await updateNotifications(notificationsToUpdate);
          }

          // Process new notifications
          let addResults = { success: true, addedCount: 0 };
          if (notificationsToAdd.length > 0) {
            addResults = await addNotifications(notificationsToAdd);
          }

          // Show combined results
          if (updateResults.success && addResults.success) {
            // Update last uploaded file info
            localStorage.setItem('lastUploadedFile', file.name);
            localStorage.setItem('lastUploadTime', new Date().toISOString());
            
            // Show success message
            const teamBreakdown = {};
            notificationsToAdd.forEach(notif => {
              teamBreakdown[notif.teamName] = (teamBreakdown[notif.teamName] || [0, 0]);
              teamBreakdown[notif.teamName][0] += 1; // New notifications
            });
            notificationsToUpdate.forEach(notif => {
              teamBreakdown[notif.teamName] = (teamBreakdown[notif.teamName] || [0, 0]);
              teamBreakdown[notif.teamName][1] += 1; // Updated notifications
            });
            
            const breakdownText = Object.entries(teamBreakdown)
              .map(([team, counts]) => {
                const [newCount, updateCount] = counts;
                const parts = [];
                if (newCount > 0) parts.push(`${newCount} new`);
                if (updateCount > 0) parts.push(`${updateCount} updated`);
                return `• ${team}: ${parts.join(', ')}`;
              })
              .join('\n');
            
            const successMessage = 
              `✅ Upload Successful!\n\n` +
              `${notificationsToAdd.length} new notifications added\n` +
              `${updateResults.updatedCount || 0} notifications updated\n\n` +
              `Breakdown:\n${breakdownText}`;
            
            alert(successMessage);
            
            // Refresh notifications list
            await fetchNotifications();
          } else {
            let errorMessage = 'Some operations failed:\n\n';
            if (!addResults.success) {
              errorMessage += `• Error adding new notifications: ${addResults.message}\n`;
            }
            if (!updateResults.success) {
              errorMessage += `• Error updating notifications: ${updateResults.errors.join(', ')}\n`;
            }
            alert(errorMessage);
          }
        } catch (error) {
          console.error('Error processing file:', error);
          alert('Error processing Excel file: ' + error.message);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file: ' + error.message);
    } finally {
      setUploadingNotifications(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const downloadNotificationTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      // Get all registered teams with leader names
      const teamsData = teams.map(team => ({
        teamName: team.teamName,
        leaderName: team.leaderName || 'N/A'
      })).sort((a, b) => a.teamName.localeCompare(b.teamName));

      // Check if there are any existing notifications
      const hasExistingNotifications = notifications.length > 0;
      
      let templateData = [];
      let metaData = [];
      let filename = '';
      let sortedTimestamps = []; // Declare in broader scope
      
      if (!hasExistingNotifications) {
        // TABLE 1: Simple format for first time use
        const currentDateTime = new Date();
        const dateTimeString = `${currentDateTime.toLocaleDateString('en-GB')}_${currentDateTime.toLocaleTimeString('en-GB', { hour12: false }).replace(/:/g, '-')}`;
        
        templateData = teamsData.map(team => ({
          'Team Name': team.teamName,
          'Leader Name': team.leaderName,
          [dateTimeString]: '' // Empty by default
        }));
        
        filename = `Notifications_Template_${currentDateTime.toISOString().split('T')[0]}_${currentDateTime.toTimeString().split(' ')[0].replace(/:/g, '-')}.xlsx`;
      } else {
        // TABLE 2: Historical format with timestamp columns
        
        // Get all unique date-time combinations from existing notifications
        const notificationTimestamps = new Set();
        const notificationMetaMap = new Map(); // Store notification metadata
        
        notifications.forEach(notif => {
          if (notif.createdAt) {
            const date = notif.createdAt.toDate ? notif.createdAt.toDate() : new Date(notif.createdAt);
            const dateTimeString = `${date.toLocaleDateString('en-GB')}_${date.toLocaleTimeString('en-GB', { hour12: false }).replace(/:/g, '-')}`;
            notificationTimestamps.add(dateTimeString);
            
            // Store metadata for this timestamp
            if (!notificationMetaMap.has(dateTimeString)) {
              notificationMetaMap.set(dateTimeString, {
                fullDateTime: date.toLocaleString('en-GB'),
                originalTimestamp: date.getTime(),
                notificationIds: []
              });
            }
            
            // Store notification ID for tracking updates
            if (notif.id) {
              notificationMetaMap.get(dateTimeString).notificationIds.push({
                teamName: notif.teamName,
                notificationId: notif.id,
                originalText: notif.notification
              });
            }
          }
        });
        
        // Sort timestamps chronologically
        sortedTimestamps = Array.from(notificationTimestamps).sort((a, b) => {
          const timestampA = notificationMetaMap.get(a).originalTimestamp;
          const timestampB = notificationMetaMap.get(b).originalTimestamp;
          return timestampA - timestampB;
        });
        
        // Add current date-time as the latest column (empty by default for new notifications)
        const currentDateTime = new Date();
        const currentTimestampString = `${currentDateTime.toLocaleDateString('en-GB')}_${currentDateTime.toLocaleTimeString('en-GB', { hour12: false }).replace(/:/g, '-')}`;
        if (!sortedTimestamps.includes(currentTimestampString)) {
          sortedTimestamps.push(currentTimestampString);
          notificationMetaMap.set(currentTimestampString, {
            fullDateTime: currentDateTime.toLocaleString('en-GB'),
            originalTimestamp: currentDateTime.getTime(),
            notificationIds: []
          });
        }
        
        // Organize notifications by team and timestamp
        const teamNotifications = {};
        teamsData.forEach(team => {
          teamNotifications[team.teamName] = {};
          sortedTimestamps.forEach(timestamp => {
            teamNotifications[team.teamName][timestamp] = [];
          });
        });
        
        // Fill in existing notifications with their IDs for tracking
        notifications.forEach(notif => {
          if (notif.createdAt && teamNotifications[notif.teamName]) {
            const date = notif.createdAt.toDate ? notif.createdAt.toDate() : new Date(notif.createdAt);
            const timestampString = `${date.toLocaleDateString('en-GB')}_${date.toLocaleTimeString('en-GB', { hour12: false }).replace(/:/g, '-')}`;
            if (teamNotifications[notif.teamName][timestampString]) {
              // Include notification ID for tracking updates
              const notificationWithId = notif.id ? `[ID:${notif.id}]${notif.notification}` : notif.notification;
              teamNotifications[notif.teamName][timestampString].push(notificationWithId);
            }
          }
        });
        
        // Create template data
        templateData = teamsData.map(team => {
          const row = {
            'Team Name': team.teamName,
            'Leader Name': team.leaderName
          };
          
          sortedTimestamps.forEach(timestamp => {
            const notifications = teamNotifications[team.teamName][timestamp] || [];
            row[timestamp] = notifications.join(' | '); // Join multiple notifications with " | "
          });
          
          return row;
        });
        
        // Create metadata sheet for timestamp mapping
        metaData = sortedTimestamps.map(timestamp => ({
          'Column Header': timestamp,
          'Full Date Time': notificationMetaMap.get(timestamp).fullDateTime,
          'Timestamp': notificationMetaMap.get(timestamp).originalTimestamp,
          'Purpose': timestamp === currentTimestampString ? 'NEW NOTIFICATIONS (Add here)' : 'Historical data (Can be edited)',
          'Note': 'Use [ID:xxx] prefix to update existing notifications, or add new text for new notifications'
        }));
        
        filename = `Notifications_Historical_${currentDateTime.toISOString().split('T')[0]}_${currentDateTime.toTimeString().split(' ')[0].replace(/:/g, '-')}.xlsx`;
      }

      // If no teams are registered, add example data
      if (templateData.length === 0) {
        if (!hasExistingNotifications) {
          // Example for TABLE 1
          const exampleDateTime = new Date();
          const exampleTimestamp = `${exampleDateTime.toLocaleDateString('en-GB')}_${exampleDateTime.toLocaleTimeString('en-GB', { hour12: false }).replace(/:/g, '-')}`;
          templateData = [
            { 'Team Name': 'CoreTeam', 'Leader Name': 'Ranbir Khurana', [exampleTimestamp]: '' },
            { 'Team Name': 'CoreTeam2', 'Leader Name': 'John Doe', [exampleTimestamp]: '' }
          ];
        } else {
          // Example for TABLE 2
          const example1 = '01/09/2025_09-30-00';
          const example2 = '02/09/2025_14-15-30';
          const example3 = '03/09/2025_10-00-00';
          templateData = [
            { 
              'Team Name': 'CoreTeam', 
              'Leader Name': 'Ranbir Khurana',
              [example1]: '[ID:notif1]Updated notification text',
              [example2]: 'Historical notification',
              [example3]: 'New notification here' // Current timestamp column
            },
            { 
              'Team Name': 'CoreTeam2', 
              'Leader Name': 'John Doe',
              [example1]: '[ID:notif2]Another updated notification',
              [example2]: 'Historical notification for team 2',
              [example3]: '' // Current timestamp column (empty by default)
            }
          ];
          
          metaData = [
            { 'Column Header': example1, 'Full Date Time': '01/09/2025, 09:30:00', 'Timestamp': 1725174600000, 'Purpose': 'Historical data (Can be edited)', 'Note': 'Use [ID:xxx] prefix to update existing notifications' },
            { 'Column Header': example2, 'Full Date Time': '02/09/2025, 14:15:30', 'Timestamp': 1725278130000, 'Purpose': 'Historical data (Can be edited)', 'Note': 'Use [ID:xxx] prefix to update existing notifications' },
            { 'Column Header': example3, 'Full Date Time': '03/09/2025, 10:00:00', 'Timestamp': 1725350400000, 'Purpose': 'NEW NOTIFICATIONS (Add here)', 'Note': 'Add new notification text without ID prefix' }
          ];
        }
        filename = `Notifications_Example_${new Date().toISOString().split('T')[0]}.xlsx`;
      }

      // Create Excel workbook
      const wb = XLSX.utils.book_new();
      
      // Add main notifications sheet
      const ws = XLSX.utils.json_to_sheet(templateData);
      XLSX.utils.book_append_sheet(wb, ws, 'Notifications');

      // Add metadata sheet for timestamp mapping (if historical format)
      if (hasExistingNotifications && metaData.length > 0) {
        const metaWs = XLSX.utils.json_to_sheet(metaData);
        XLSX.utils.book_append_sheet(wb, metaWs, 'Timestamp Info');
        
        // Style metadata sheet
        const metaHeaderRange = XLSX.utils.decode_range(metaWs['!ref']);
        for (let col = metaHeaderRange.s.c; col <= metaHeaderRange.e.c; col++) {
          const headerCell = XLSX.utils.encode_cell({ r: 0, c: col });
          if (metaWs[headerCell]) {
            metaWs[headerCell].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: "FFEEAA" } }
            };
          }
        }
        
        // Set metadata column widths
        metaWs['!cols'] = [
          { wch: 20 }, // Column Header
          { wch: 25 }, // Full Date Time
          { wch: 15 }, // Timestamp
          { wch: 30 }, // Purpose
          { wch: 40 }  // Note
        ];
      }

      // Add instructions sheet
      const instructions = [
        { 'Step': 1, 'Instruction': hasExistingNotifications ? 'This is a HISTORICAL format with timestamp columns' : 'This is a SIMPLE format for first-time use' },
        { 'Step': 2, 'Instruction': hasExistingNotifications ? 'To UPDATE existing notifications, keep the [ID:xxx] prefix and modify the text after it' : 'Fill in notifications in the date-time column' },
        { 'Step': 3, 'Instruction': hasExistingNotifications ? 'To ADD new notifications, add text in the latest timestamp column (rightmost) WITHOUT [ID:] prefix' : 'Use " | " (space-pipe-space) to separate multiple notifications' },
        { 'Step': 4, 'Instruction': 'Use " | " (space-pipe-space) to separate multiple notifications for the same timestamp' },
        { 'Step': 5, 'Instruction': 'Save and upload the file back to the system' },
        { 'Step': '', 'Instruction': '' },
        { 'Step': 'IMPORTANT', 'Instruction': hasExistingNotifications ? 'Check "Timestamp Info" sheet to understand column meanings' : 'Each new download creates a new timestamp column for historical tracking' },
        { 'Step': 'WARNING', 'Instruction': 'Only registered team names will be processed during upload' }
      ];
      
      const instructionsWs = XLSX.utils.json_to_sheet(instructions);
      XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instructions');

      // Style the main notifications sheet header row
      const headerRange = XLSX.utils.decode_range(ws['!ref']);
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const headerCell = XLSX.utils.encode_cell({ r: 0, c: col });
        if (ws[headerCell]) {
          ws[headerCell].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "EEEEEE" } }
          };
        }
      }

      // Set column widths for main sheet
      const columnWidths = [];
      const headers = Object.keys(templateData[0] || {});
      headers.forEach((header, index) => {
        if (index < 2) { // Team Name and Leader Name
          columnWidths.push({ wch: 20 });
        } else { // Timestamp columns
          columnWidths.push({ wch: 35 });
        }
      });
      ws['!cols'] = columnWidths;

      // Download the file
      XLSX.writeFile(wb, filename);

      // Record download history with enhanced tracking
      localStorage.setItem('lastDownloadedTemplate', filename);
      localStorage.setItem('lastDownloadTime', new Date().toISOString());
      localStorage.setItem('lastDownloadFormat', hasExistingNotifications ? 'historical' : 'simple');
      localStorage.setItem('lastDownloadTimestamps', hasExistingNotifications ? JSON.stringify(sortedTimestamps || []) : '[]');
      await addDownloadHistory({
        filename: filename,
        teamCount: teamsData.length,
        notificationCount: notifications.length,
        templateType: hasExistingNotifications ? 'historical' : 'simple',
        adminId: 'admin'
      });

      // Store the last downloaded filename for consistency checking
      localStorage.setItem('lastDownloadedTemplate', filename);

      alert(`Template downloaded successfully!\nFilename: ${filename}\nFormat: ${hasExistingNotifications ? 'Historical (TABLE 2)' : 'Simple (TABLE 1)'}`);
    } catch (error) {
      console.error('Error generating template:', error);
      alert('Error generating template: ' + error.message);
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      setLoading(true);
      try {
        console.log('Deleting notification with ID:', notificationId);
        
        // Find the notification in our local state to get the correct team info
        const notification = notifications.find(notif => notif.id === notificationId);
        if (!notification) {
          console.error('Notification not found in local state');
          alert('Notification not found. Please refresh the page.');
          setLoading(false);
          return;
        }
        
        console.log('Found notification for deletion:', notification);
        
        // Use the teamId and notificationIndex from the notification object
        const actualNotificationId = `${notification.teamId}_${notification.notificationIndex}`;
        console.log('Using actual notification ID for deletion:', actualNotificationId);
        
        const result = await deleteNotification(actualNotificationId);
        if (result.success) {
          alert('Notification deleted successfully!');
          fetchNotifications(); // Refresh the list
        } else {
          alert('Error deleting notification: ' + result.message);
        }
      } catch (error) {
        console.error('Error deleting notification:', error);
        alert('Error deleting notification');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (notifications.length === 0) {
      alert('No notifications to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ALL ${notifications.length} notifications? This action cannot be undone.`)) {
      return;
    }

    setDeletingAllNotifications(true);
    try {
      const result = await deleteAllNotifications();
      if (result.success) {
        alert(result.message);
        setNotifications([]);
        fetchNotifications(); // Refresh the list
      } else {
        alert('Error deleting notifications: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      alert('Error deleting notifications: ' + error.message);
    } finally {
      setDeletingAllNotifications(false);
    }
  };

  // ========== RESULTS FUNCTIONS ==========
  
  const downloadResultsTemplate = async () => {
    setDownloadingResultsTemplate(true);
    try {
      // Get all registered teams
      const teamsData = teams.map(team => ({
        teamName: team.teamName,
        rank: '',
        problemUnderstanding: '',
        innovation: '',
        feasibility: '',
        presentation: '',
        total: '',
        contestScore: '',
        grandTotal: '',
        judgeReview: ''
      })).sort((a, b) => a.teamName.localeCompare(b.teamName));

      // If no teams, add example data
      if (teamsData.length === 0) {
        teamsData.push({
          teamName: 'Example Team 1',
          rank: '1',
          problemUnderstanding: '2',
          innovation: '3',
          feasibility: '2',
          presentation: '3',
          total: '10',
          contestScore: '2',
          grandTotal: '12',
          judgeReview: 'Excellent presentation and innovative solution'
        });
        teamsData.push({
          teamName: 'Example Team 2',
          rank: '2',
          problemUnderstanding: '1',
          innovation: '2',
          feasibility: '2',
          presentation: '2',
          total: '7',
          contestScore: '1.5',
          grandTotal: '8.5',
          judgeReview: 'Good effort but needs improvement in innovation'
        });
      }

      // Create Excel workbook
      const wb = XLSX.utils.book_new();
      
      // Create main results sheet
      const resultsSheet = XLSX.utils.json_to_sheet(teamsData.map(team => ({
        'Team Name': team.teamName,
        'Rank': team.rank,
        'Problem Understanding (0-2)': team.problemUnderstanding,
        'Innovation (0-3)': team.innovation,
        'Feasibility (0-2)': team.feasibility,
        'Presentation (0-3)': team.presentation,
        'Total (0-10)': team.total,
        'Contest Score (0-2)': team.contestScore,
        'Grand Total (0-12)': team.grandTotal,
        'Judge Review': team.judgeReview
      })));

      // Add Excel formulas for the first 100 rows
      for (let row = 2; row <= 101; row++) { // Row 2 to 101 (skipping header row 1)
        // Formula 1: Total (G column) = SUM(C:F) - Problem Understanding + Innovation + Feasibility + Presentation
        const totalCell = `G${row}`;
        resultsSheet[totalCell] = { 
          f: `SUM(C${row}:F${row})`,
          t: 'n'
        };

        // Formula 2: Grand Total (I column) = SUM(G,H) - Total + Contest Score
        const grandTotalCell = `I${row}`;
        resultsSheet[grandTotalCell] = {
          f: `SUM(G${row},H${row})`,
          t: 'n'
        };

        // Formula 3: Rank (B column) = RANK(I,$I$2:$I$101,0) - Rank based on Grand Total
        const rankCell = `B${row}`;
        resultsSheet[rankCell] = {
          f: `RANK(I${row},$I$2:$I$101,0)`,
          t: 'n'
        };
      }
      
      XLSX.utils.book_append_sheet(wb, resultsSheet, 'Results');

      // Add instructions sheet
      const instructions = [
        { 'Field': 'IMPORTANT', 'Description': 'Automatic Formulas Applied', 'Valid Values': 'Total, Grand Total, and Rank columns have automatic calculations' },
        { 'Field': 'Team Name', 'Description': 'Team name (Do not modify)', 'Valid Values': 'Registered team names only' },
        { 'Field': 'Rank', 'Description': 'Final ranking position (AUTO-CALCULATED)', 'Valid Values': 'Automatically calculated based on Grand Total' },
        { 'Field': 'Problem Understanding', 'Description': 'Score for problem understanding', 'Valid Values': '0 to 2 (decimals allowed)' },
        { 'Field': 'Innovation', 'Description': 'Score for innovation and creativity', 'Valid Values': '0 to 3 (decimals allowed)' },
        { 'Field': 'Feasibility', 'Description': 'Score for technical feasibility', 'Valid Values': '0 to 2 (decimals allowed)' },
        { 'Field': 'Presentation', 'Description': 'Score for presentation skills', 'Valid Values': '0 to 3 (decimals allowed)' },
        { 'Field': 'Total', 'Description': 'Total score (AUTO-CALCULATED)', 'Valid Values': 'Sum of Problem + Innovation + Feasibility + Presentation' },
        { 'Field': 'Contest Score', 'Description': 'Additional contest/coding score', 'Valid Values': '0 to 2 (decimals allowed)' },
        { 'Field': 'Grand Total', 'Description': 'Overall total score (AUTO-CALCULATED)', 'Valid Values': 'Sum of Total + Contest Score' },
        { 'Field': 'Judge Review', 'Description': 'Judge comments and feedback', 'Valid Values': 'Free text' },
        { 'Field': 'HOW TO USE', 'Description': '1. Enter scores in columns C-F and H', 'Valid Values': '2. Total, Grand Total, and Rank will calculate automatically' },
        { 'Field': 'FORMULA INFO', 'Description': 'Applied to rows 2-101 for 100 teams', 'Valid Values': 'Formulas: =SUM(C:F), =SUM(G,H), =RANK(I,$I$2:$I$101,0)' }
      ];
      
      const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
      XLSX.utils.book_append_sheet(wb, instructionsSheet, 'Instructions');

      // Style headers
      const headerRange = XLSX.utils.decode_range(resultsSheet['!ref']);
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const headerCell = XLSX.utils.encode_cell({ r: 0, c: col });
        if (resultsSheet[headerCell]) {
          // Special styling for auto-calculated columns (B, G, I - Rank, Total, Grand Total)
          if (col === 1 || col === 6 || col === 8) { // B, G, I columns (0-indexed)
            resultsSheet[headerCell].s = {
              font: { bold: true, color: { rgb: "FFFFFF" } },
              fill: { fgColor: { rgb: "4CAF50" } }, // Green background for auto-calculated
              alignment: { horizontal: "center" }
            };
          } else {
            resultsSheet[headerCell].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: "EEEEEE" } }
            };
          }
        }
      }

      // Style the formula cells with light green background for first 100 rows
      for (let row = 2; row <= 101; row++) {
        // Style Rank column (B)
        const rankCell = `B${row}`;
        if (!resultsSheet[rankCell]) resultsSheet[rankCell] = {};
        resultsSheet[rankCell].s = {
          fill: { fgColor: { rgb: "E8F5E8" } }, // Light green
          alignment: { horizontal: "center" }
        };

        // Style Total column (G)
        const totalCell = `G${row}`;
        if (!resultsSheet[totalCell]) resultsSheet[totalCell] = {};
        resultsSheet[totalCell].s = {
          fill: { fgColor: { rgb: "E8F5E8" } }, // Light green
          alignment: { horizontal: "center" }
        };

        // Style Grand Total column (I)
        const grandTotalCell = `I${row}`;
        if (!resultsSheet[grandTotalCell]) resultsSheet[grandTotalCell] = {};
        resultsSheet[grandTotalCell].s = {
          fill: { fgColor: { rgb: "E8F5E8" } }, // Light green
          alignment: { horizontal: "center" }
        };
      }

      // Set column widths
      resultsSheet['!cols'] = [
        { wch: 20 }, // Team Name
        { wch: 8 },  // Rank
        { wch: 20 }, // Problem Understanding
        { wch: 15 }, // Innovation
        { wch: 15 }, // Feasibility
        { wch: 15 }, // Presentation
        { wch: 12 }, // Total
        { wch: 15 }, // Contest Score
        { wch: 15 }, // Grand Total
        { wch: 40 }  // Judge Review
      ];

      // Generate filename
      const filename = `Results_Template_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Download
      XLSX.writeFile(wb, filename);
      
      alert(`Results template downloaded successfully!\nFilename: ${filename}`);
    } catch (error) {
      console.error('Error generating results template:', error);
      alert('Error generating results template: ' + error.message);
    } finally {
      setDownloadingResultsTemplate(false);
    }
  };

  const handleResultsFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
      alert('Please upload an Excel file (.xlsx or .xls)');
      event.target.value = '';
      return;
    }

    setUploadingResults(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length === 0) {
            alert('Excel file is empty');
            return;
          }

          // Validate structure
          const firstRow = jsonData[0];
          const requiredFields = ['Team Name', 'Rank', 'Problem Understanding (0-2)', 'Innovation (0-3)', 'Feasibility (0-2)', 'Presentation (0-3)', 'Total (0-10)', 'Contest Score (0-2)', 'Grand Total (0-12)', 'Judge Review'];
          const missingFields = requiredFields.filter(field => !Object.keys(firstRow).includes(field));
          
          if (missingFields.length > 0) {
            alert(`Missing required columns: ${missingFields.join(', ')}`);
            return;
          }

          // Process results data
          const processedResults = jsonData.map((row, index) => {
            const teamName = row['Team Name']?.toString().trim();
            if (!teamName) return null;

            return {
              teamName: teamName,
              rank: parseInt(row['Rank']) || 0,
              problemUnderstanding: parseFloat(row['Problem Understanding (0-2)']) || 0,
              innovation: parseFloat(row['Innovation (0-3)']) || 0,
              feasibility: parseFloat(row['Feasibility (0-2)']) || 0,
              presentation: parseFloat(row['Presentation (0-3)']) || 0,
              total: parseFloat(row['Total (0-10)']) || 0,
              contestScore: parseFloat(row['Contest Score (0-2)']) || 0,
              grandTotal: parseFloat(row['Grand Total (0-12)']) || 0,
              judgeReview: row['Judge Review']?.toString() || '',
              createdAt: new Date()
            };
          }).filter(result => result !== null);

          setResultsPreview(processedResults);
          setShowResultsPreview(true);
          
        } catch (error) {
          alert('Error reading file: ' + error.message);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      alert('Error uploading file: ' + error.message);
    } finally {
      setUploadingResults(false);
      event.target.value = '';
    }
  };

  const handleSaveResults = async () => {
    if (resultsPreview.length === 0) {
      alert('No results data to save');
      return;
    }

    setUploadingResults(true);
    try {
      const result = await saveResults(resultsPreview);
      if (result.success) {
        alert(`Successfully saved results for ${resultsPreview.length} teams!`);
        setShowResultsPreview(false);
        setResultsPreview([]);
        fetchResultsData(); // Refresh the results data
      } else {
        alert('Error saving results: ' + result.message);
      }
    } catch (error) {
      alert('Error saving results: ' + error.message);
    } finally {
      setUploadingResults(false);
    }
  };

  const handleDeleteAllResults = async () => {
    if (resultsData.length === 0) {
      alert('No results to delete');
      return;
    }

    if (!window.confirm('Are you sure you want to delete ALL results? This action cannot be undone.')) {
      return;
    }

    setDeletingAllResults(true);
    try {
      const result = await deleteAllResults();
      if (result.success) {
        alert('All results deleted successfully!');
        setResultsData([]);
      } else {
        alert('Error deleting results: ' + result.message);
      }
    } catch (error) {
      alert('Error deleting results: ' + error.message);
    } finally {
      setDeletingAllResults(false);
    }
  };

  const handleSendResultsToAllTeams = async () => {
    if (resultsData.length === 0) {
      alert('No results to send. Please upload and save results first.');
      return;
    }

    if (!window.confirm(`Are you sure you want to send results notifications to all ${resultsData.length} teams?`)) {
      return;
    }

    setSendingResultsNotifications(true);
    try {
      // Create personalized notifications for each team
      const notificationsToAdd = resultsData.map(result => {
        const rankSuffix = (rank) => {
          if (rank === 1) return '1st';
          if (rank === 2) return '2nd';
          if (rank === 3) return '3rd';
          return `${rank}th`;
        };

        const getPositionRange = (rank) => {
          if (rank <= 3) return '3';
          if (rank <= 10) return '10';
          return 'overall';
        };

        const message = `🎉 SparkCU Ideathon Results – Dear ${result.teamName}, you have secured Rank ${rankSuffix(result.rank)} with a Grand Total Score of ${result.grandTotal}/12. Your performance breakdown is as follows: Problem Understanding: ${result.problemUnderstanding}/2, Innovation & Creativity: ${result.innovation}/3, Technical Feasibility: ${result.feasibility}/2, Presentation Skills: ${result.presentation}/3, Main Competition Total: ${result.total}/10, Contest/Coding Score: ${result.contestScore}/2. Judge's Feedback: "${result.judgeReview || 'No feedback provided'}". Congratulations on achieving a Top ${getPositionRange(result.rank)} position—your hard work, creativity, and dedication made SparkCU Ideathon a true success.`;

        return {
          teamName: result.teamName,
          notification: message
        };
      });

      const result = await addNotifications(notificationsToAdd);
      if (result.success) {
        alert(`Results notifications sent successfully to ${resultsData.length} teams!`);
      } else {
        alert('Error sending notifications: ' + result.message);
      }
    } catch (error) {
      console.error('Error sending results notifications:', error);
      alert('Error sending notifications: ' + error.message);
    } finally {
      setSendingResultsNotifications(false);
    }
  };

  // ========== CUSTOM MESSAGE FUNCTIONS ==========
  
  const handleSendCustomMessage = () => {
    setShowCustomMessagePopup(true);
    setCustomMessageForm({
      selectedTeams: [],
      message: ''
    });
    setTeamSearchTerm('');
    setShowTeamDropdown(false);
  };

  const handleCustomMessageTeamToggle = (teamName) => {
    setCustomMessageForm(prev => ({
      ...prev,
      selectedTeams: prev.selectedTeams.includes(teamName)
        ? prev.selectedTeams.filter(team => team !== teamName)
        : [...prev.selectedTeams, teamName]
    }));
  };

  const handleSelectAllTeams = () => {
    const filteredTeams = getFilteredTeams();
    const allFilteredTeamNames = filteredTeams.map(team => team.teamName);
    setCustomMessageForm(prev => ({
      ...prev,
      selectedTeams: prev.selectedTeams.length === allFilteredTeamNames.length ? [] : allFilteredTeamNames
    }));
  };

  const getFilteredTeams = () => {
    if (!teamSearchTerm.trim()) {
      return teams;
    }
    return teams.filter(team =>
      team.teamName.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
      team.leaderName.toLowerCase().includes(teamSearchTerm.toLowerCase())
    );
  };

  const handleTeamSearchChange = (e) => {
    setTeamSearchTerm(e.target.value);
    setShowTeamDropdown(true);
  };

  const handleTeamSearchFocus = () => {
    setShowTeamDropdown(true);
  };

  const handleTeamSearchBlur = () => {
    // Delay hiding to allow clicking on dropdown items
    setTimeout(() => setShowTeamDropdown(false), 200);
  };

  const handleRemoveSelectedTeam = (teamName) => {
    setCustomMessageForm(prev => ({
      ...prev,
      selectedTeams: prev.selectedTeams.filter(team => team !== teamName)
    }));
  };

  const handleCustomMessageSubmit = async () => {
    if (!customMessageForm.message.trim()) {
      alert('Please enter a message');
      return;
    }
    
    if (customMessageForm.selectedTeams.length === 0) {
      alert('Please select at least one team');
      return;
    }

    setSendingCustomMessage(true);
    try {
      const notificationsToAdd = customMessageForm.selectedTeams.map(teamName => ({
        teamName: teamName,
        notification: customMessageForm.message.trim(),
        customTimestamp: new Date()
      }));

      const result = await addNotifications(notificationsToAdd);
      if (result.success) {
        alert(`✅ Custom message sent successfully to ${customMessageForm.selectedTeams.length} team(s)!`);
        setShowCustomMessagePopup(false);
        setCustomMessageForm({ selectedTeams: [], message: '' });
        await fetchNotifications(); // Refresh the list
      } else {
        alert('Error sending custom message: ' + result.message);
      }
    } catch (error) {
      console.error('Error sending custom message:', error);
      alert('Error sending custom message');
    } finally {
      setSendingCustomMessage(false);
    }
  };

  const handleCancelCustomMessage = () => {
    setShowCustomMessagePopup(false);
    setCustomMessageForm({ selectedTeams: [], message: '' });
    setTeamSearchTerm('');
    setShowTeamDropdown(false);
  };

  // ========== EDIT NOTIFICATION FUNCTIONS ==========
  
  const handleEditNotification = (notification) => {
    setEditingNotification(notification);
    setEditNotificationForm({
      message: notification.notification
    });
    setShowEditNotificationPopup(true);
  };

  const handleEditNotificationSubmit = async () => {
    if (!editNotificationForm.message.trim()) {
      alert('Please enter a message');
      return;
    }

    setUpdatingNotification(true);
    try {
      const notificationUpdate = [{
        teamName: editingNotification.teamName,
        notificationId: editingNotification.id,
        newNotification: editNotificationForm.message.trim(),
        originalTimestamp: editingNotification.createdAt
      }];

      const result = await updateNotifications(notificationUpdate);
      if (result.success) {
        alert('✅ Notification updated successfully!');
        setShowEditNotificationPopup(false);
        setEditingNotification(null);
        setEditNotificationForm({ message: '' });
        await fetchNotifications(); // Refresh the list
      } else {
        alert('Error updating notification: ' + (result.errors?.[0] || result.message));
      }
    } catch (error) {
      console.error('Error updating notification:', error);
      alert('Error updating notification');
    } finally {
      setUpdatingNotification(false);
    }
  };

  const handleCancelEditNotification = () => {
    setShowEditNotificationPopup(false);
    setEditingNotification(null);
    setEditNotificationForm({ message: '' });
  };

  const fetchDownloadHistory = async () => {
    try {
      const result = await getDownloadHistory();
      if (result.success) {
        setDownloadHistory(result.downloadHistory);
      } else {
        console.error('Failed to fetch download history:', result.message);
      }
    } catch (error) {
      console.error('Error fetching download history:', error);
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
              <div className="stat-card" onClick={() => setActiveTab('teams')} style={{ cursor: 'pointer' }}>
                <h4>Total Teams</h4>
                <p className="stat-number">{teamsCount}</p>
                <small className="stat-subtitle">
                  {teams.filter(team => team.emailVerified).length} verified, {teams.filter(team => !team.emailVerified).length} pending
                </small>
              </div>
              <div className="stat-card" onClick={() => setActiveTab('teams')} style={{ cursor: 'pointer' }}>
                <h4>Total Users</h4>
                <p className="stat-number">{teams.reduce((acc, team) => acc + (team.members ? team.members.length : 0), 0)}</p>
                <small className="stat-subtitle">Active participants</small>
              </div>
              <div className="stat-card" onClick={() => setActiveTab('teams')} style={{ cursor: 'pointer' }}>
                <h4>Registrations Today</h4>
                <p className="stat-number">{teams.filter(team => {
                  if (!team.createdAt) return false;
                  const today = new Date();
                  const teamDate = team.createdAt.toDate ? team.createdAt.toDate() : new Date(team.createdAt);
                  return teamDate.toDateString() === today.toDateString();
                }).length}</p>
                <small className="stat-subtitle">New teams today</small>
              </div>
              <div className="stat-card" onClick={() => setActiveTab('submissions')} style={{ cursor: 'pointer' }}>
                <h4>Total Submissions</h4>
                <p className="stat-number">{submissionsData.length}</p>
                <small className="stat-subtitle">Projects submitted</small>
              </div>
              <div className="stat-card" onClick={() => setActiveTab('notifiers')} style={{ cursor: 'pointer' }}>
                <h4>Sent Notifiers</h4>
                <p className="stat-number">{notifications.length}</p>
                <small className="stat-subtitle">Team notifications</small>
              </div>
              <div className="stat-card" onClick={() => setActiveTab('schedule')} style={{ cursor: 'pointer' }}>
                <h4>Schedule Events</h4>
                <p className="stat-number">{scheduleData.length}</p>
                <small className="stat-subtitle">Planned activities</small>
              </div>
              <div className="stat-card" onClick={() => setActiveTab('pages')} style={{ cursor: 'pointer' }}>
                <h4>Page Visibility</h4>
                <p className="stat-number">{Object.values(pageVisibilitySettings).filter(visible => visible).length}/{Object.keys(pageVisibilitySettings).length}</p>
                <small className="stat-subtitle">Pages enabled</small>
              </div>
              <div className="stat-card" onClick={() => setActiveTab('countdown')} style={{ cursor: 'pointer' }}>
                <h4>Event Countdown</h4>
                <p className="stat-text">{countdownData.title}</p>
                <small className="stat-subtitle">
                  {countdownData.targetDate ? 
                    new Date(countdownData.targetDate).toLocaleDateString() : 
                    'Not set'
                  }
                </small>
              </div>
              <div className="stat-card" onClick={() => setActiveTab('schedule')} style={{ cursor: 'pointer' }}>
                <h4>Next Scheduled</h4>
                <p className="stat-text">{getNextScheduledTask().event}</p>
                <small className="stat-subtitle">{getNextScheduledTask().time}</small>
              </div>
              <div className="stat-card" onClick={() => setActiveTab('announcements')} style={{ cursor: 'pointer' }}>
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
              <div className="stat-card" onClick={() => setActiveTab('gallery')} style={{ cursor: 'pointer' }}>
                <h4>Gallery img link</h4>
                <p className="stat-text">{galleryData.linkEnabled ? 'Active' : 'Disabled'}</p>
                <small className="stat-subtitle">{galleryData.linkTitle || 'No title set'}</small>
              </div>
              <div className="stat-card" style={{ cursor: 'default' }}>
                <h4>System Status</h4>
                <p className="stat-status online">Online</p>
                <small className="stat-subtitle">All services operational</small>
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
                <div className="submissions-controls">
                  <button onClick={fetchSubmissionsData} className="refresh-btn" disabled={loading}>
                    {loading ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
              </div>
            </div>

            <label className="toggle-container">
              <span className="toggle-label">
                {submissionSettings.enabled ? 'Submissions Enabled' : 'Submissions Disabled'}
              </span>
              <input
                type="checkbox"
                checked={submissionSettings.enabled}
                onChange={handleSubmissionSettingsUpdate}
                disabled={updatingSubmissionSettings}
              />
              <span className="toggle-slider"></span>
            </label>

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
              <div className="announcements-controls">
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
      case 'notifiers':
        return (
          <div className="tab-content">
            <div className="notifiers-section">
              <div className="notifiers-header">
                <h3>Team Notifications</h3>
                <p>Upload Excel files to send notifications to teams</p>
              </div>

              <div className="notifiers-actions">
                <div className="upload-area">
                  <input
                    type="file"
                    id="notification-file-upload"
                    accept=".xlsx,.xls"
                    onChange={handleNotificationFileUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    className="upload-button"
                    onClick={() => document.getElementById('notification-file-upload').click()}
                    disabled={uploadingNotifications}
                  >
                    {uploadingNotifications ? 'Uploading...' : 'Upload Excel File'}
                  </button>
                  <span className="file-hint">Excel files only (.xlsx, .xls)</span>
                </div>

                <div className="download-area">
                  <button
                    className="download-button"
                    onClick={downloadNotificationTemplate}
                    disabled={downloadingTemplate}
                  >
                    {downloadingTemplate ? 'Generating...' : 'Download Template'}
                  </button>
                  <span className="file-hint">Get Excel template with current data</span>
                </div>

                <div className="custom-message-area">
                  <button
                    className="custom-message-button"
                    onClick={handleSendCustomMessage}
                    disabled={sendingCustomMessage}
                  >
                    📝 Send Custom
                  </button>
                  <span className="file-hint">Send message directly to selected teams</span>
                </div>

                <div className="delete-all-area">
                  <button
                    className="delete-all-notifications-button"
                    onClick={handleDeleteAllNotifications}
                    disabled={deletingAllNotifications || notifications.length === 0}
                  >
                    🗑️ {deletingAllNotifications ? 'Deleting...' : 'Delete All...'}
                  </button>
                  <span className="file-hint">Remove all notifications from database</span>
                </div>
              </div>

              <div className="notifiers-stats">
                <div className="stat-card">
                  <span className="stat-number">{teams.length}</span>
                  <span className="stat-label">Teams</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{notifications.length}</span>
                  <span className="stat-label">Notifications</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{notifications.filter(n => !n.read).length}</span>
                  <span className="stat-label">Unread</span>
                </div>
              </div>

              <div className="notifiers-list">
                <div className="list-header">
                  <h4>Notifications</h4>
                  <button className="refresh-button" onClick={fetchNotifications}>
                    ↻ Refresh
                  </button>
                </div>
                
                {notifications.length > 0 ? (
                  <div className="notifications-table">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`notification-row ${notification.read ? 'read' : 'unread'}`}>
                        <div className="notification-info">
                          <div className="team-name">{notification.teamName}</div>
                          <div className="notification-text">{notification.notification}</div>
                          <div className="notification-meta">
                            {notification.createdAt ? 
                              (notification.createdAt.toDate ? 
                                notification.createdAt.toDate().toLocaleDateString() : 
                                new Date(notification.createdAt).toLocaleDateString()
                              ) : 'N/A'
                            }
                            <span className={`status ${notification.read ? 'read' : 'unread'}`}>
                              {notification.read ? 'Read' : 'Unread'}
                            </span>
                          </div>
                        </div>
                        <div className="notification-actions">
                          <button 
                            className="edit-button"
                            onClick={() => handleEditNotification(notification)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button 
                            className="delete-button"
                            onClick={() => handleDeleteNotification(notification.id)}
                            title="Delete"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No notifications yet</p>
                    <span>Upload an Excel file to add notifications</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'results':
        return (
          <div className="tab-content">
            <div className="results-section">
              <div className="results-header">
                <h3>Competition Results</h3>
                <p>Upload Excel files with team results and scores</p>
              </div>

              <div className="results-actions">
                <div className="upload-area">
                  <input
                    type="file"
                    id="results-file-upload"
                    accept=".xlsx,.xls"
                    onChange={handleResultsFileUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    className="upload-button"
                    onClick={() => document.getElementById('results-file-upload').click()}
                    disabled={uploadingResults}
                  >
                    {uploadingResults ? 'Uploading...' : 'Upload Results Excel'}
                  </button>
                  <span className="file-hint">Excel files with team scores (.xlsx, .xls)</span>
                </div>

                <div className="download-area">
                  <button
                    className="download-button"
                    onClick={downloadResultsTemplate}
                    disabled={downloadingResultsTemplate}
                  >
                    {downloadingResultsTemplate ? 'Generating...' : 'Download Template'}
                  </button>
                  <span className="file-hint">Get Excel template with scoring structure</span>
                </div>

                <div className="notify-area">
                  <button
                    className="notify-results-button"
                    onClick={handleSendResultsToAllTeams}
                    disabled={sendingResultsNotifications || resultsData.length === 0}
                  >
                    {sendingResultsNotifications ? 'Sending...' : 'Send Results'}
                  </button>
                  <span className="file-hint">Send personalized results to each team</span>
                </div>

                <div className="delete-area">
                  <button
                    className="delete-all-button"
                    onClick={handleDeleteAllResults}
                    disabled={deletingAllResults || resultsData.length === 0}
                  >
                    🗑️ {deletingAllResults ? 'Deleting...' : 'Delete All Results'}
                  </button>
                  <span className="file-hint">Remove all saved results from database</span>
                </div>
              </div>

              <div className="results-stats">
                <div className="stat-card">
                  <span className="stat-number">{teams.length}</span>
                  <span className="stat-label">Total Teams</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{resultsData.length}</span>
                  <span className="stat-label">Results Saved</span>
                </div>
              </div>

              {/* Results Preview Modal */}
              {showResultsPreview && (
                <div className="results-preview-modal">
                  <div className="modal-content">
                    <h4>Results Preview</h4>
                    <p>Review the results before saving to Firebase</p>
                    
                    <div className="results-table-container">
                      <table className="results-table">
                        <thead>
                          <tr>
                            <th>Team Name</th>
                            <th>Rank</th>
                            <th>Problem (2)</th>
                            <th>Innovation (3)</th>
                            <th>Feasibility (2)</th>
                            <th>Presentation (3)</th>
                            <th>Total (10)</th>
                            <th>Contest (2)</th>
                            <th>Grand Total (12)</th>
                            <th>Review</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultsPreview.map((result, index) => (
                            <tr key={index}>
                              <td>{result.teamName}</td>
                              <td>{result.rank}</td>
                              <td>{result.problemUnderstanding}</td>
                              <td>{result.innovation}</td>
                              <td>{result.feasibility}</td>
                              <td>{result.presentation}</td>
                              <td>{result.total}</td>
                              <td>{result.contestScore}</td>
                              <td>{result.grandTotal}</td>
                              <td className="review-cell">{result.judgeReview}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="modal-actions">
                      <button onClick={handleSaveResults} disabled={uploadingResults}>
                        {uploadingResults ? 'Saving...' : 'Save Results'}
                      </button>
                      <button onClick={() => setShowResultsPreview(false)}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Saved Results Table */}
              {resultsData.length > 0 && (
                <div className="saved-results-section">
                  <h4>Saved Results</h4>
                  <div className="results-table-container">
                    <table className="results-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Team Name</th>
                          <th>Problem (2)</th>
                          <th>Innovation (3)</th>
                          <th>Feasibility (2)</th>
                          <th>Presentation (3)</th>
                          <th>Total (10)</th>
                          <th>Contest (2)</th>
                          <th>Grand Total (12)</th>
                          <th>Judge Review</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultsData
                          .sort((a, b) => a.rank - b.rank)
                          .map((result, index) => (
                          <tr key={index} className={result.rank <= 3 ? 'winner-row' : ''}>
                            <td className="rank-cell">
                              {result.rank <= 3 ? (
                                <span className={`rank-badge rank-${result.rank}`}>
                                  {result.rank === 1 ? '🥇' : result.rank === 2 ? '🥈' : '🥉'} {result.rank}
                                </span>
                              ) : (
                                result.rank
                              )}
                            </td>
                            <td className="team-name-cell">{result.teamName}</td>
                            <td>{result.problemUnderstanding}</td>
                            <td>{result.innovation}</td>
                            <td>{result.feasibility}</td>
                            <td>{result.presentation}</td>
                            <td className="total-cell">{result.total}</td>
                            <td>{result.contestScore}</td>
                            <td className="grand-total-cell">{result.grandTotal}</td>
                            <td className="review-cell">{result.judgeReview}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
      case 'pages':
        return (
          <div className="tab-content">
            <h3>Page Visibility Management</h3>
            <div className="management-section">
              <div className="page-visibility-header">
                <p>Control which pages are visible to users. Disabled pages will not appear in the navigation sidebar for regular users.</p>
                <small><strong>Note:</strong> As an admin, you can access all pages regardless of these settings. Dashboard will always be visible to logged-in users. Login and Register pages control access to authentication.</small>
              </div>
              
              <div className="page-visibility-grid">
                {Object.entries(pageVisibilitySettings).map(([pageName, isVisible]) => {
                  const pageDisplayNames = {
                    home: 'Home',
                    rules: 'Rules',
                    schedule: 'Schedule',
                    about: 'About',
                    keymaps: 'Key Maps',
                    prizes: 'Prizes',
                    gallery: 'Gallery',
                    result: 'Result',
                    dashboard: 'Dashboard',
                    login: 'Login',
                    register: 'Register'
                  };
                  
                  const pageDescriptions = {
                    home: 'Main landing page with event information',
                    rules: 'Competition rules and guidelines',
                    schedule: 'Event timeline and schedule',
                    about: 'About the event and organizers',
                    keymaps: 'Important locations and key maps',
                    prizes: 'Prize information and categories',
                    gallery: 'Photo gallery from previous events',
                    result: 'Competition results and announcements',
                    dashboard: 'User dashboard (always visible when logged in)',
                    login: 'User login page',
                    register: 'User registration page'
                  };
                  
                  return (
                    <div key={pageName} className="page-visibility-card">
                      <div className="page-info">
                        <h4>{pageDisplayNames[pageName] || pageName}</h4>
                        <p>{pageDescriptions[pageName] || 'Page description'}</p>
                        <div className="page-status-container">
                          <span className={`page-status ${isVisible ? 'visible' : 'hidden'}`}>
                            {isVisible ? 'Visible to Users' : 'Hidden from Users'}
                          </span>
                        </div>
                      </div>
                      <div className="page-toggle">
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={isVisible}
                            onChange={(e) => handlePageVisibilityUpdate(pageName, e.target.checked)}
                            disabled={updatingPageVisibility || pageName === 'dashboard'}
                            title={pageName === 'dashboard' ? 'Dashboard is always visible to logged-in users' : ''}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {updatingPageVisibility && (
                <div className="updating-indicator">
                  <p>Updating page visibility...</p>
                </div>
              )}
              
              <div className="page-visibility-actions">
                <button 
                  onClick={() => {
                    const allVisible = Object.fromEntries(
                      Object.keys(pageVisibilitySettings).map(key => [key, true])
                    );
                    Object.keys(allVisible).forEach(page => {
                      if (page !== 'dashboard') { // Don't update dashboard
                        handlePageVisibilityUpdate(page, true);
                      }
                    });
                  }}
                  disabled={updatingPageVisibility}
                  className="action-btn show-all"
                >
                  Show All Pages
                </button>
                <button 
                  onClick={fetchPageVisibilitySettings}
                  disabled={updatingPageVisibility}
                  className="action-btn refresh"
                >
                  Refresh Settings
                </button>
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
            className={`tab-btn ${activeTab === 'notifiers' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifiers')}
          >
            <span className="tab-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
            </span>
            Notifiers
          </button>
          <button 
            className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            <span className="tab-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.5 0 4.74 1.02 6.36 2.64"/>
                <path d="M21 3v6h-6"/>
              </svg>
            </span>
            Results
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
            className={`tab-btn ${activeTab === 'pages' ? 'active' : ''}`}
            onClick={() => setActiveTab('pages')}
          >
            <span className="tab-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="9" y1="9" x2="10" y2="9"/>
                <line x1="9" y1="13" x2="15" y2="13"/>
                <line x1="9" y1="17" x2="15" y2="17"/>
              </svg>
            </span>
            Pages
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

      {/* Custom Message Popup */}
      {showCustomMessagePopup && (
        <div className="popup-overlay">
          <div className="popup-content custom-message-popup">
            <div className="popup-header">
              <h3>Send Custom Message</h3>
              <button className="close-btn" onClick={handleCancelCustomMessage}>×</button>
            </div>
            
            <div className="popup-body">
              <div className="form-group">
                <label>Select Teams:</label>
                <div className="team-selection">
                  <div className="search-wrapper">
                    <div className="search-input-container">
                      <input
                        type="text"
                        className="team-search-input"
                        placeholder="Search teams by name or leader..."
                        value={teamSearchTerm}
                        onChange={handleTeamSearchChange}
                        onFocus={handleTeamSearchFocus}
                        onBlur={handleTeamSearchBlur}
                      />
                      <button 
                        type="button" 
                        className="dropdown-toggle-btn"
                        onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                      >
                        {showTeamDropdown ? '▲' : '▼'}
                      </button>
                    </div>
                    
                    {showTeamDropdown && (
                      <div className="teams-dropdown">
                        <div className="dropdown-header">
                          <button 
                            type="button" 
                            className="select-all-btn"
                            onClick={handleSelectAllTeams}
                          >
                            {customMessageForm.selectedTeams.length === getFilteredTeams().length ? 'Deselect All' : 'Select All'}
                          </button>
                          <span className="results-count">
                            {getFilteredTeams().length} team(s) found
                          </span>
                        </div>
                        
                        <div className="teams-dropdown-list">
                          {getFilteredTeams().length > 0 ? (
                            getFilteredTeams().map((team) => (
                              <div 
                                key={team.teamName} 
                                className={`team-dropdown-item ${customMessageForm.selectedTeams.includes(team.teamName) ? 'selected' : ''}`}
                                onClick={() => handleCustomMessageTeamToggle(team.teamName)}
                              >
                                <div className="team-info">
                                  <span className="team-name">{team.teamName}</span>
                                  <span className="team-leader">Leader: {team.leaderName}</span>
                                </div>
                                <div className="selection-indicator">
                                  {customMessageForm.selectedTeams.includes(team.teamName) ? '✓' : '+'}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="no-results">
                              No teams found matching "{teamSearchTerm}"
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Selected Teams Display */}
                  {customMessageForm.selectedTeams.length > 0 && (
                    <div className="selected-teams">
                      <div className="selected-teams-header">
                        <span>Selected Teams ({customMessageForm.selectedTeams.length}):</span>
                        <button 
                          type="button" 
                          className="clear-all-btn"
                          onClick={() => setCustomMessageForm(prev => ({...prev, selectedTeams: []}))}
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="selected-teams-list">
                        {customMessageForm.selectedTeams.map((teamName) => {
                          const team = teams.find(t => t.teamName === teamName);
                          return (
                            <div key={teamName} className="selected-team-tag">
                              <div className="selected-team-info">
                                <span className="selected-team-name">{teamName}</span>
                                {team && <span className="selected-team-leader">{team.leaderName}</span>}
                              </div>
                              <button 
                                type="button"
                                className="remove-team-btn"
                                onClick={() => handleRemoveSelectedTeam(teamName)}
                                title="Remove team"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="custom-message">Message:</label>
                <textarea
                  id="custom-message"
                  value={customMessageForm.message}
                  onChange={(e) => setCustomMessageForm(prev => ({...prev, message: e.target.value}))}
                  placeholder="Enter your message here..."
                  rows="4"
                  maxLength="500"
                />
                <small className="char-count">
                  {customMessageForm.message.length}/500 characters
                </small>
              </div>
            </div>
            
            <div className="popup-footer">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={handleCancelCustomMessage}
                disabled={sendingCustomMessage}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="send-btn" 
                onClick={handleCustomMessageSubmit}
                disabled={sendingCustomMessage || !customMessageForm.message.trim() || customMessageForm.selectedTeams.length === 0}
              >
                {sendingCustomMessage ? 'Sending...' : `Send to ${customMessageForm.selectedTeams.length} team(s)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Notification Popup */}
      {showEditNotificationPopup && editingNotification && (
        <div className="popup-overlay">
          <div className="popup-content edit-notification-popup">
            <div className="popup-header">
              <h3>Edit Notification</h3>
              <button className="close-btn" onClick={handleCancelEditNotification}>×</button>
            </div>
            
            <div className="popup-body">
              <div className="notification-details">
                <div className="detail-row">
                  <span className="label">Team:</span>
                  <span className="value">{editingNotification.teamName}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Created:</span>
                  <span className="value">
                    {editingNotification.createdAt ? 
                      (editingNotification.createdAt.toDate ? 
                        editingNotification.createdAt.toDate().toLocaleString() : 
                        new Date(editingNotification.createdAt).toLocaleString()
                      ) : 'N/A'
                    }
                  </span>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-message">Message:</label>
                <textarea
                  id="edit-message"
                  value={editNotificationForm.message}
                  onChange={(e) => setEditNotificationForm({message: e.target.value})}
                  placeholder="Enter updated message..."
                  rows="4"
                  maxLength="500"
                />
                <small className="char-count">
                  {editNotificationForm.message.length}/500 characters
                </small>
              </div>
            </div>
            
            <div className="popup-footer">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={handleCancelEditNotification}
                disabled={updatingNotification}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="save-btn" 
                onClick={handleEditNotificationSubmit}
                disabled={updatingNotification || !editNotificationForm.message.trim()}
              >
                {updatingNotification ? 'Updating...' : 'Update Notification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Management;
