import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  submitFAQQuestion, 
  getPublicFAQs,
  getUserFAQs,
  deleteFAQQuestion
} from '../services/firebase';
import './FAQ.css';

const FAQ = () => {
  const { currentUser, adminSession } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [publicFAQs, setPublicFAQs] = useState([]);
  const [userFAQs, setUserFAQs] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('public');
  // eslint-disable-next-line no-unused-vars
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [operationMode, setOperationMode] = useState('search');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandAll, setExpandAll] = useState(true);
  const [expandedFAQs, setExpandedFAQs] = useState(new Set());
  const [hoveredFAQ, setHoveredFAQ] = useState(null);
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, alpha-asc, alpha-desc
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [sortSubmenuOpen, setSortSubmenuOpen] = useState(false);
  const [submenuTimeout, setSubmenuTimeout] = useState(null);
  const [sortSubmenuTimeout, setSortSubmenuTimeout] = useState(null);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the dropdown container
      const dropdownContainer = event.target.closest('.dropdown-container');
      if (!dropdownContainer && (dropdownOpen || submenuOpen || sortSubmenuOpen)) {
        setDropdownOpen(false);
        setSubmenuOpen(false);
        setSortSubmenuOpen(false);
        // Clear submenu timeout when closing dropdown
        if (submenuTimeout) {
          clearTimeout(submenuTimeout);
          setSubmenuTimeout(null);
        }
        // Clear sort submenu timeout when closing dropdown
        if (sortSubmenuTimeout) {
          clearTimeout(sortSubmenuTimeout);
          setSortSubmenuTimeout(null);
        }
        // Clear dropdown timeout when closing dropdown
        if (dropdownTimeout) {
          clearTimeout(dropdownTimeout);
          setDropdownTimeout(null);
        }
      }
    };

    // Add event listener when dropdown is open
    if (dropdownOpen || submenuOpen || sortSubmenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup event listener and timeout
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (submenuTimeout) {
        clearTimeout(submenuTimeout);
      }
      if (sortSubmenuTimeout) {
        clearTimeout(sortSubmenuTimeout);
      }
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
      }
    };
  }, [dropdownOpen, submenuOpen, sortSubmenuOpen, submenuTimeout, sortSubmenuTimeout, dropdownTimeout]);

  useEffect(() => {
    setIsLoggedIn(!!currentUser);
  }, [currentUser]);

  useEffect(() => {
    setIsAdminLoggedIn(!!adminSession);
  }, [adminSession]);

  // Define callback functions before useEffect hooks
  const loadUserFAQs = useCallback(async () => {
    if (!currentUser?.uid) return;
    try {
      const result = await getUserFAQs(currentUser.uid);
      if (result.success) {
        setUserFAQs(result.data || []);
      }
    } catch (error) {
      console.error('Error loading user FAQs:', error);
    }
  }, [currentUser?.uid]);

  const getCurrentFAQs = useCallback(() => {
    switch (activeFilter) {
      case 'requested':
        return userFAQs;
      case 'answered':
        return userFAQs.filter(faq => faq.answer && faq.answer.trim() !== '');
      case 'public':
      default:
        return publicFAQs;
    }
  }, [activeFilter, userFAQs, publicFAQs]);

  const getFilteredFAQs = useCallback(() => {
    let faqs = getCurrentFAQs();
    // Use searchTerm for filtering regardless of operation mode when searchTerm exists
    if (searchTerm && searchTerm.trim()) {
      faqs = faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (faq.answer && faq.answer.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply sorting
    faqs = [...faqs].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.createdAt?.toDate?.() || a.createdAt) - new Date(b.createdAt?.toDate?.() || b.createdAt);
        case 'date-desc':
          return new Date(b.createdAt?.toDate?.() || b.createdAt) - new Date(a.createdAt?.toDate?.() || a.createdAt);
        case 'alpha-asc':
          return a.question.toLowerCase().localeCompare(b.question.toLowerCase());
        case 'alpha-desc':
          return b.question.toLowerCase().localeCompare(a.question.toLowerCase());
        default:
          return 0;
      }
    });
    
    return faqs;
  }, [getCurrentFAQs, searchTerm, sortBy]);

  useEffect(() => {
    loadPublicFAQs();
    if (isLoggedIn) {
      loadUserFAQs();
    }
  }, [isLoggedIn, loadUserFAQs]);

  // Update expanded FAQs when data changes (but not when expandAll changes)
  useEffect(() => {
    const currentFAQs = getCurrentFAQs();
    const currentIds = new Set(currentFAQs.map(faq => faq.id));
    
    // Filter out any IDs that no longer exist in current FAQs
    setExpandedFAQs(prevExpanded => {
      const filteredExpanded = new Set([...prevExpanded].filter(id => currentIds.has(id)));
      
      // If expand all is active, add any new FAQs
      if (expandAll) {
        currentIds.forEach(id => filteredExpanded.add(id));
      }
      
      return filteredExpanded;
    });
  }, [publicFAQs, userFAQs, activeFilter, getCurrentFAQs, searchTerm, operationMode, expandAll]);

  // Helper functions for submenu hover with delay (desktop) and click (mobile)
  const handleSubmenuMouseEnter = () => {
    // Only work on desktop (hover capability)
    if (window.matchMedia('(hover: hover)').matches) {
      // Clear any existing timeout
      if (submenuTimeout) {
        clearTimeout(submenuTimeout);
        setSubmenuTimeout(null);
      }
      setSubmenuOpen(true);
    }
  };

  const handleSubmenuMouseLeave = () => {
    // Only work on desktop (hover capability)
    if (window.matchMedia('(hover: hover)').matches) {
      // Set a delay before closing the submenu
      const timeout = setTimeout(() => {
        setSubmenuOpen(false);
      }, 300); // 300ms delay
      setSubmenuTimeout(timeout);
    }
  };

  // Helper functions for sort submenu hover with delay (desktop) and click (mobile)
  const handleSortSubmenuMouseEnter = () => {
    // Only work on desktop (hover capability)
    if (window.matchMedia('(hover: hover)').matches) {
      // Clear any existing timeout
      if (sortSubmenuTimeout) {
        clearTimeout(sortSubmenuTimeout);
        setSortSubmenuTimeout(null);
      }
      setSortSubmenuOpen(true);
    }
  };

  const handleSortSubmenuMouseLeave = () => {
    // Only work on desktop (hover capability)
    if (window.matchMedia('(hover: hover)').matches) {
      // Set a delay before closing the submenu
      const timeout = setTimeout(() => {
        setSortSubmenuOpen(false);
      }, 300); // 300ms delay
      setSortSubmenuTimeout(timeout);
    }
  };

  // Helper functions for main dropdown hover with delay (desktop) and click (mobile)
  const handleDropdownMouseEnter = () => {
    // Only work on desktop (hover capability)
    if (window.matchMedia('(hover: hover)').matches) {
      // Clear any existing timeout
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
        setDropdownTimeout(null);
      }
      setDropdownOpen(true);
    }
  };

  const handleDropdownMouseLeave = () => {
    // Only work on desktop (hover capability)
    if (window.matchMedia('(hover: hover)').matches) {
      // Set a delay before closing the dropdown
      const timeout = setTimeout(() => {
        setDropdownOpen(false);
        setSubmenuOpen(false); // Also close submenu when main dropdown closes
        setSortSubmenuOpen(false); // Also close sort submenu when main dropdown closes
      }, 300); // 300ms delay
      setDropdownTimeout(timeout);
    }
  };

  const loadPublicFAQs = async () => {
    try {
      setLoading(true);
      const result = await getPublicFAQs();
      if (result.success) {
        setPublicFAQs(result.data || []);
      }
    } catch (error) {
      console.error('Error loading public FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (operationMode !== 'add' && operationMode !== 'ask') return;
    if (!newQuestion.trim()) return;

    // Add confirmation dialog
    const confirmMessage = isLoggedIn 
      ? `Are you sure you want to submit this question?\n\n"${newQuestion.trim()}"\n\nYou will receive notifications about the status of your question.`
      : `Are you sure you want to submit this question anonymously?\n\n"${newQuestion.trim()}"\n\nNote: Anonymous users won't receive notifications about their questions.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setSubmitLoading(true);
      const result = await submitFAQQuestion(newQuestion.trim(), currentUser);
      if (result.success) {
        setNewQuestion('');
        setSearchTerm('');
        setOperationMode('search');
        if (isLoggedIn) {
          alert('Your question has been submitted for review!');
          // Reload user FAQs to show the new question
          loadUserFAQs();
        } else {
          alert('Your anonymous question has been submitted for review!');
        }
      } else {
        alert('Error submitting question: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting question:', error);
      alert('Error submitting question. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteQuestion = async (faqId) => {
    if (!isLoggedIn || !currentUser) {
      alert('You must be logged in to delete questions');
      return;
    }

    if (window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      try {
        const result = await deleteFAQQuestion(faqId, currentUser.uid);
        if (result.success) {
          alert('Question deleted successfully');
          // Reload user FAQs to reflect the deletion
          loadUserFAQs();
        } else {
          alert('Error deleting question: ' + result.message);
        }
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Error deleting question. Please try again.');
      }
    }
  };

  const handleOperationChange = (mode, filter = null, sortValue = null) => {
    // Handle expand-all separately without changing operation mode
    if (mode === 'expand-all') {
      const newExpandAll = !expandAll;
      setExpandAll(newExpandAll);
      
      // When toggling expand all, immediately update expanded FAQs
      if (newExpandAll) {
        // Expand all FAQs
        const currentFAQs = getCurrentFAQs();
        const allIds = new Set(currentFAQs.map(faq => faq.id));
        setExpandedFAQs(allIds);
      } else {
        // Collapse all FAQs
        setExpandedFAQs(new Set());
      }
      
      setDropdownOpen(false);
      setSubmenuOpen(false);
      setSortSubmenuOpen(false);
      return;
    }
    
    // Handle sort operations
    if (mode === 'sort' && sortValue) {
      setSortBy(sortValue);
      setDropdownOpen(false);
      setSubmenuOpen(false);
      setSortSubmenuOpen(false);
      return;
    }
    
    setOperationMode(mode);
    if (filter) setActiveFilter(filter);
    setDropdownOpen(false);
    setSubmenuOpen(false);
    setSortSubmenuOpen(false);
    
    if (mode === 'search') {
      setNewQuestion('');
      // Keep current searchTerm if any
    } else if (mode === 'ask') {
      // When manually switching to ask mode, clear search term
      setSearchTerm('');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // Always update search term when typing
    setSearchTerm(value);
    
    // If user starts typing and we're in ask mode, switch to search
    if (value.trim() && operationMode === 'ask') {
      setOperationMode('search');
    }
    
    // If we have search text, check for results
    if (value.trim()) {
      const currentFAQs = getCurrentFAQs();
      const filteredResults = currentFAQs.filter(faq => 
        faq.question.toLowerCase().includes(value.toLowerCase()) ||
        (faq.answer && faq.answer.toLowerCase().includes(value.toLowerCase()))
      );
      
      // If no results found, switch to ask mode and set the question
      if (filteredResults.length === 0) {
        setOperationMode('ask');
        setNewQuestion(value);
      } else if (operationMode === 'ask') {
        // If results found and we're in ask mode, switch back to search
        setOperationMode('search');
        setNewQuestion('');
      }
    } else {
      // If input is empty, go back to search mode and clear everything
      setOperationMode('search');
      setNewQuestion('');
    }
  };

  const getEmptyMessage = () => {
    if (searchTerm && searchTerm.trim()) {
      return 'No FAQs match your search. You can ask this as a new question!';
    }
    switch (activeFilter) {
      case 'requested':
        return 'You haven\'t asked any questions yet.';
      case 'answered':
        return 'None of your questions have been answered yet.';
      case 'public':
      default:
        return 'No questions yet. Be the first to ask!';
    }
  };

  const getInputPlaceholder = () => {
    if (operationMode === 'search') {
      return 'Search FAQs...';
    }
    return isLoggedIn ? 'Ask a question...' : 'Ask a question anonymously...';
  };

  const getOperationOptions = () => {
    const mainOptions = [
      { 
        mode: 'expand-all', 
        label: expandAll ? 'Collapse All' : 'Expand All', 
        icon: expandAll ? (
          <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m16 17-4-4-4 4m8-6-4-4-4 4"/>
            </svg>
        ) : (
          <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8 7 4 4 4-4m-8 6 4 4 4-4"/>
            </svg>
        )
      }
    ];

    // Show the opposite mode in menu (if in search, show ask; if in ask, show search)
    if (operationMode === 'search') {
      mainOptions.push({ 
        mode: 'ask', 
        label: 'Ask question', 
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2"/>
        </svg>
      });
    } else {
      mainOptions.push({ 
        mode: 'search', 
        label: 'Search', 
        icon: <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/>
             </svg>
      });
    }

    // Add "Other" option if user is logged in and not admin
    if (isLoggedIn && !isAdminLoggedIn) {
      mainOptions.push({
        mode: 'other',
        label: 'view',
        icon: <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M6 4v10m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v2m6-16v2m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v10m6-16v10m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v2"/>
            </svg>,
        hasSubmenu: true
      });
    }

    // Add sort option at the end
    mainOptions.push({
      mode: 'sort',
      label: 'Sort',
      icon: <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 20V7m0 13-4-4m4 4 4-4m4-12v13m0-13 4 4m-4-4-4 4"/>
        </svg>,
      hasSubmenu: true,
      isSort: true
    });

    return mainOptions;
  };

  const getSubmenuOptions = () => {
    if (!isLoggedIn || isAdminLoggedIn) return [];
    
    return [
      { 
        mode: 'filter', 
        filter: 'public', 
        label: 'All FAQs', 
        icon: <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M16 19h4a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-2m-2.236-4a3 3 0 1 0 0-4M3 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
            </svg>
      },
      { 
        mode: 'filter', 
        filter: 'requested', 
        label: 'My Requested', 
        icon: <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12h4m-2 2v-4M4 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
            </svg>
      },
      { 
        mode: 'filter', 
        filter: 'answered', 
        label: 'My Answered', 
        icon: <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.5 8.046H11V6.119c0-.921-.9-1.446-1.524-.894l-5.108 4.49a1.2 1.2 0 0 0 0 1.739l5.108 4.49c.624.556 1.524.027 1.524-.893v-1.928h2a3.023 3.023 0 0 1 3 3.046V19a5.593 5.593 0 0 0-1.5-10.954Z"/>
            </svg>
      }
    ];
  };

  const getSortSubmenuOptions = () => {
    return [
      { 
        mode: 'sort', 
        sortValue: 'date-desc', 
        label: 'Date (Newest)', 
        icon: <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.881 16H7.119a1 1 0 0 1-.772-1.636l4.881-5.927a1 1 0 0 1 1.544 0l4.88 5.927a1 1 0 0 1-.77 1.636Z"/>
            </svg>

      },
      { 
        mode: 'sort', 
        sortValue: 'date-asc', 
        label: 'Date (Oldest)', 
        icon: <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 20V10m0 10-3-3m3 3 3-3m5-13v10m0-10 3 3m-3-3-3 3"/>
                </svg>
      },
      { 
        mode: 'sort', 
        sortValue: 'alpha-asc', 
        label: 'A to Z', 
        icon: <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M7 4l3 3M7 4 4 7m9-3h6l-6 6h6m-6.5 10 3.5-7 3.5 7M14 18h4"/>
                </svg>
      },
      { 
        mode: 'sort', 
        sortValue: 'alpha-desc', 
        label: 'Z to A', 
        icon: <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 20V10m0 10-3-3m3 3 3-3m5-13v10m0-10 3 3m-3-3-3 3"/>
                </svg>


      }
    ];
  };

  const toggleExpanded = useCallback((faqId) => {
    setExpandedFAQs(prevExpanded => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(faqId)) {
        newExpanded.delete(faqId);
        // If we're collapsing an FAQ while expand all is active, turn off expand all
        if (expandAll) {
          setExpandAll(false);
        }
      } else {
        newExpanded.add(faqId);
      }
      return newExpanded;
    });
  }, [expandAll]);

  // Function to convert URLs in text to clickable links
  const renderTextWithLinks = (text) => {
    if (!text) return text;
    
    // Enhanced regular expression to match various URL patterns
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+|www\.[^\s<>"{}|\\^`[\]]+)/gi;
    
    // Split text by URLs and map to JSX elements
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        // Ensure the URL has a protocol
        const url = part.startsWith('www.') ? `https://${part}` : part;
        
        return (
          <a 
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="answer-link"
            onClick={(e) => e.stopPropagation()} // Prevent FAQ toggle when clicking link
            title={`Open ${url} in new tab`}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="faq-container">
      <div className="faq-content">
        {/* Header */}
        <div className="faq-header">
          <h1>FAQ</h1>
          <p>Frequently Asked Questions</p>
        </div>

        {/* Unified Operation Bar */}
        <div className="operation-bar">
          <form onSubmit={handleSubmitQuestion} className="operation-form">
            <div className="operation-container">
              <input
                type="text"
                value={operationMode === 'search' ? searchTerm : newQuestion}
                onChange={handleInputChange}
                placeholder={getInputPlaceholder()}
                required={operationMode === 'add' || operationMode === 'ask'}
                className="operation-input"
              />
              <div className="operation-controls">
                {(operationMode === 'add' || operationMode === 'ask') && (
                  <button type="submit" disabled={submitLoading} className="submit-btn">
                    {submitLoading ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.416" strokeDashoffset="31.416">
                          <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                          <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                        </circle>
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11.917 9.724 16.5 19 7.5"/>
                        </svg>
                    )}
                  </button>
                )}
                <div 
                  className="dropdown-container"
                  onMouseEnter={handleDropdownMouseEnter}
                  onMouseLeave={handleDropdownMouseLeave}
                >
                  <button 
                    type="button"
                    className="dropdown-btn"
                    onClick={() => {
                      // Toggle dropdown on click for better mobile experience
                      setDropdownOpen(!dropdownOpen);
                      // Close submenu when closing main dropdown
                      if (dropdownOpen) {
                        setSubmenuOpen(false);
                        setSortSubmenuOpen(false);
                      }
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="3" fill="currentColor"/>
                      <circle cx="12" cy="4" r="3" fill="currentColor"/>
                      <circle cx="12" cy="20" r="3" fill="currentColor"/>
                    </svg>
                  </button>
                  {dropdownOpen && (
                    <div className="dropdown-menu">
                      {getOperationOptions().map((option, index) => (
                        <div 
                          key={index} 
                          className="dropdown-item-container"
                          onMouseEnter={() => {
                            if (option.hasSubmenu) {
                              if (option.isSort) {
                                handleSortSubmenuMouseEnter();
                                // Close the other submenu if it's open
                                setSubmenuOpen(false);
                              } else {
                                handleSubmenuMouseEnter();
                                // Close the sort submenu if it's open
                                setSortSubmenuOpen(false);
                              }
                            }
                          }}
                          onMouseLeave={() => {
                            if (option.hasSubmenu) {
                              if (option.isSort) {
                                handleSortSubmenuMouseLeave();
                              } else {
                                handleSubmenuMouseLeave();
                              }
                            }
                          }}
                        >
                          <button
                            type="button"
                            className={`dropdown-item ${
                              (operationMode === option.mode && !option.filter) ||
                              (option.filter && activeFilter === option.filter) ||
                              (option.mode === 'expand-all' && expandAll) ? 'active' : ''
                            }`}
                            onClick={() => {
                              if (option.hasSubmenu) {
                                // Toggle submenu on click for better mobile experience
                                if (option.isSort) {
                                  setSortSubmenuOpen(!sortSubmenuOpen);
                                  setSubmenuOpen(false); // Close the other submenu
                                } else {
                                  setSubmenuOpen(!submenuOpen);
                                  setSortSubmenuOpen(false); // Close the sort submenu
                                }
                              } else {
                                handleOperationChange(option.mode, option.filter);
                              }
                            }}
                          >
                            <span className="dropdown-icon">{option.icon}</span>
                            {option.label}
                            {option.hasSubmenu && (
                              <span className={`submenu-arrow ${(option.isSort ? sortSubmenuOpen : submenuOpen) ? 'open' : ''}`}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                              </span>
                            )}
                          </button>
                          {option.hasSubmenu && option.isSort && sortSubmenuOpen && (
                            <div 
                              className="submenu"
                              onMouseEnter={handleSortSubmenuMouseEnter}
                              onMouseLeave={handleSortSubmenuMouseLeave}
                            >
                              {getSortSubmenuOptions().map((subOption, subIndex) => (
                                <button
                                  key={subIndex}
                                  type="button"
                                  className={`submenu-item ${
                                    subOption.sortValue && sortBy === subOption.sortValue ? 'active' : ''
                                  }`}
                                  onClick={() => {
                                    handleOperationChange(subOption.mode, subOption.filter, subOption.sortValue);
                                    // Close submenu after selection for better mobile experience
                                    setSortSubmenuOpen(false);
                                  }}
                                >
                                  <span className="dropdown-icon">{subOption.icon}</span>
                                  {subOption.label}
                                </button>
                              ))}
                            </div>
                          )}
                          {option.hasSubmenu && !option.isSort && submenuOpen && (
                            <div 
                              className="submenu"
                              onMouseEnter={handleSubmenuMouseEnter}
                              onMouseLeave={handleSubmenuMouseLeave}
                            >
                              {getSubmenuOptions().map((subOption, subIndex) => (
                                <button
                                  key={subIndex}
                                  type="button"
                                  className={`submenu-item ${
                                    subOption.filter && activeFilter === subOption.filter ? 'active' : ''
                                  }`}
                                  onClick={() => {
                                    handleOperationChange(subOption.mode, subOption.filter);
                                    // Close submenu after selection for better mobile experience
                                    setSubmenuOpen(false);
                                  }}
                                >
                                  <span className="dropdown-icon">{subOption.icon}</span>
                                  {subOption.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {(operationMode === 'add' || operationMode === 'ask') && !isLoggedIn && (
              <p className="operation-notice">
                You're submitting as an anonymous user. You won't receive notifications about your question and if accepted, it will be shown publicly.
              </p>
            )}
          </form>
        </div>

      {/* FAQ List */}
      <div className="faq-section">
        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : getFilteredFAQs().length === 0 ? (
          <div className="empty-state">
            <p>{getEmptyMessage()}</p>
          </div>
        ) : (
          <div className="faq-items">
            {getFilteredFAQs().map((faq, index) => (
              <div key={faq.id} className="faq-thread">
                {/* Question */}
                <div 
                  className="question-bubble" 
                  onClick={() => toggleExpanded(faq.id)}
                  onMouseEnter={() => setHoveredFAQ(faq.id)}
                  onMouseLeave={() => setHoveredFAQ(null)}
                >
                  <div className="question-content">
                    <span className="question-number">Q{index + 1}</span>
                    <div className="question-text">{faq.question}</div>
                    {activeFilter === 'requested' && (
                      <span className={`status-badge ${faq.status}`}>
                        {faq.status === 'pending' ? 'Pending' : 
                         faq.status === 'approved' ? 'Approved' : 'Rejected'}
                      </span>
                    )}
                    {/* Delete button for user's own questions that can be deleted */}
                    {isLoggedIn && 
                     currentUser && 
                     faq.userId === currentUser.uid && 
                     (faq.status === 'pending' || faq.status === 'rejected') && 
                     activeFilter === 'requested' && (
                      <button
                        className="delete-question-btn"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent expanding the FAQ
                          handleDeleteQuestion(faq.id);
                        }}
                        title="Delete question"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2"/>
                          <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                    )}
                    <span className={`expand-icon ${(expandedFAQs.has(faq.id) || hoveredFAQ === faq.id) ? 'expanded' : ''}`}>
                      ▼
                    </span>
                  </div>
                </div>
                
                {/* Show answer when expanded (clicked) or hovered */}
                <div className={`faq-expandable-content ${(expandedFAQs.has(faq.id) || hoveredFAQ === faq.id) ? 'expanded' : ''} ${hoveredFAQ === faq.id && !expandedFAQs.has(faq.id) ? 'hovered' : ''}`}>
                  {/* Connecting Line */}
                  <div className="thread-connector"></div>
                  
                  {/* Answer */}
                  <div className="answer-bubble">
                    {faq.status === 'rejected' ? (
                      <div className="rejection-content">
                        <span className="answer-label">Status:</span>
                        <div className="rejection-message">
                          <strong>This question was rejected</strong>
                          {faq.rejectionReason && (
                            <div className="rejection-reason">
                              <strong>Reason:</strong> {faq.rejectionReason}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : faq.answer ? (
                      <div className="answer-content">
                        <span className="answer-label">Ans:</span>
                        <div className="answer-text">{renderTextWithLinks(faq.answer)}</div>
                      </div>
                    ) : (
                      <div className="no-answer">
                        <span className="answer-label">Ans:</span>
                        <div className="pending-text">Answer pending...</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Thread Meta */}
                  <div className="thread-meta">
                    Asked by {faq.teamName || 'Anonymous User'} on {new Date(faq.createdAt?.toDate?.() || faq.createdAt).toLocaleDateString()} at {new Date(faq.createdAt?.toDate?.() || faq.createdAt).toLocaleTimeString()}
                    {activeFilter === 'requested' && faq.status && (
                      <span className="meta-status"> • Status: {faq.status}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Information Section */}
      <div className="faq-info">
        <h3>How to use FAQ</h3>
        <p>
          Use the menu button in the search bar above to access different options:
        </p>
        <ul>
          <li><strong>Search:</strong> Find existing questions and answers</li>
          <li><strong>Ask Question:</strong> Submit new questions (available to all users)</li>
          <li><strong>Expand/Collapse All:</strong> Show or hide all answers at once</li>
          {isLoggedIn && !isAdminLoggedIn && (
            <>
              <li><strong>Public FAQs:</strong> View all approved questions and answers</li>
              <li><strong>My Requested:</strong> See your submitted questions and their status</li>
              <li><strong>My Answered:</strong> View only your questions that have been answered</li>
            </>
          )}
        </ul>
        <p>
          <strong>Question Process:</strong> When you submit a question, it goes through an approval process by administrators. 
          Once approved and answered, it becomes publicly available for all users to see. 
          {isLoggedIn ? ' You will receive notifications about your question status.' : ' Anonymous users won\'t receive notifications about their questions.'}
        </p>
      </div>
      </div>
    </div>
  );
};

export default FAQ;
