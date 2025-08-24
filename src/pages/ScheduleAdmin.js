import React, { useState, useEffect } from 'react';
import { getScheduleData, addScheduleItem, updateScheduleItem, clearScheduleData, initializeScheduleData, isAdminLoggedIn } from '../services/firebase';
import './ScheduleAdmin.css';

const ScheduleAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    time: '',
    event: '',
    description: '',
    location: '',
    type: 'registration',
    timeOrder: 1
  });

  useEffect(() => {
    const adminSession = isAdminLoggedIn();
    if (adminSession) {
      setIsAdmin(true);
      loadScheduleData();
    } else {
      setIsAdmin(false);
    }
  }, []);

  const loadScheduleData = async () => {
    try {
      setLoading(true);
      const result = await getScheduleData();
      if (result.success) {
        setScheduleData(result.data);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (editingItem) {
        result = await updateScheduleItem(editingItem.id, formData);
      } else {
        result = await addScheduleItem(formData);
      }

      if (result.success) {
        await loadScheduleData();
        resetForm();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error saving schedule item:', error);
      alert('Error saving schedule item');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      time: item.time,
      event: item.event,
      description: item.description,
      location: item.location,
      type: item.type,
      timeOrder: item.timeOrder
    });
  };

  const resetForm = () => {
    setFormData({
      time: '',
      event: '',
      description: '',
      location: '',
      type: 'registration',
      timeOrder: scheduleData.length + 1
    });
    setEditingItem(null);
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all schedule data? This action cannot be undone.')) {
      setLoading(true);
      try {
        const result = await clearScheduleData();
        if (result.success) {
          await loadScheduleData();
          alert('All schedule data cleared successfully');
        } else {
          alert('Error: ' + result.message);
        }
      } catch (error) {
        console.error('Error clearing schedule data:', error);
        alert('Error clearing schedule data');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReinitialize = async () => {
    if (window.confirm('Are you sure you want to reinitialize with default schedule? This will clear all existing data.')) {
      setLoading(true);
      try {
        // First clear existing data
        await clearScheduleData();
        
        // Then initialize with default data
        const defaultData = [
          // You can put your default schedule here or import it
          {
            time: "9:00 AM",
            event: "Registration & Check-in",
            description: "Arrive, register, and collect your welcome kit",
            location: "Main Lobby",
            type: "registration",
            timeOrder: 1
          }
          // Add more default items as needed
        ];
        
        const result = await initializeScheduleData(defaultData);
        if (result.success) {
          await loadScheduleData();
          alert('Schedule reinitialized successfully');
        } else {
          alert('Error: ' + result.message);
        }
      } catch (error) {
        console.error('Error reinitializing schedule:', error);
        alert('Error reinitializing schedule');
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isAdmin) {
    return (
      <div className="schedule-admin-page">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-admin-page">
      <div className="admin-header">
        <h1>Schedule Administration</h1>
        <p>Manage the event schedule</p>
      </div>

      <div className="admin-content">
        <div className="admin-form-section">
          <h2>{editingItem ? 'Edit Schedule Item' : 'Add New Schedule Item'}</h2>
          <form onSubmit={handleSubmit} className="schedule-form">
            <div className="form-group">
              <label htmlFor="time">Time *</label>
              <input
                type="text"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                placeholder="e.g., 9:00 AM"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="event">Event Name *</label>
              <input
                type="text"
                id="event"
                name="event"
                value={formData.event}
                onChange={handleInputChange}
                placeholder="Event name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Event description"
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Event location"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="registration">Registration</option>
                <option value="ceremony">Ceremony</option>
                <option value="networking">Networking</option>
                <option value="work">Work Session</option>
                <option value="break">Break</option>
                <option value="mentoring">Mentoring</option>
                <option value="presentation">Presentation</option>
                <option value="judging">Judging</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="timeOrder">Order *</label>
              <input
                type="number"
                id="timeOrder"
                name="timeOrder"
                value={formData.timeOrder}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (editingItem ? 'Update Item' : 'Add Item')}
              </button>
              {editingItem && (
                <button type="button" onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="admin-list-section">
          <div className="admin-controls">
            <h2>Current Schedule Items</h2>
            <div className="danger-zone">
              <h3>Danger Zone</h3>
              <button 
                onClick={handleClearAll} 
                className="danger-btn"
                disabled={loading}
              >
                Clear All Data
              </button>
              <button 
                onClick={handleReinitialize} 
                className="warning-btn"
                disabled={loading}
              >
                Reinitialize with Defaults
              </button>
            </div>
          </div>
          
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="schedule-list">
              {scheduleData.map((item) => (
                <div key={item.id} className="schedule-item">
                  <div className="item-info">
                    <h3>{item.time} - {item.event}</h3>
                    <p>{item.description}</p>
                    <small>{item.location} | Type: {item.type} | Order: {item.timeOrder}</small>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => handleEdit(item)}>Edit</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleAdmin;
