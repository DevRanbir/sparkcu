import React, { useState, useEffect } from 'react';
import './Gallery.css';
import DomeGallery from '../components/DomeGallery/DomeGallery.jsx';
import { getGalleryData } from '../services/firebase';

const Gallery = () => {
  const [galleryData, setGalleryData] = useState({
    driveLink: 'https://drive.google.com/drive/folders/YOUR_FOLDER_ID',
    linkTitle: 'View More Photos',
    linkDescription: 'Access our complete photo collection on Google Drive',
    linkEnabled: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    try {
      const result = await getGalleryData();
      if (result.success && result.data) {
        setGalleryData(result.data);
      }
    } catch (error) {
      console.error('Error fetching gallery data:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="gallery-page">
      <div className="gallery-content">
        <div style={{ width: '100vw', height: '100vh' }}>
      <     DomeGallery />
        </div>

        <div className="gallery-header">
        <h1>Gallery</h1>
        <p>
          Explore the moments from our previous events and get a glimpse of the
          excitement and innovation that happens at SparkCU.
        </p>
      </div>

      {galleryData.linkEnabled && (
        <div className="drive-link-container">
          <a 
            href={galleryData.driveLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="drive-link-box"
          >
            <div className="drive-icon">
              <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11H4m15.5 5a.5.5 0 0 0 .5-.5V8a1 1 0 0 0-1-1h-3.75a1 1 0 0 1-.829-.44l-1.436-2.12a1 1 0 0 0-.828-.44H8a1 1 0 0 0-1 1M4 9v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-3.75a1 1 0 0 1-.829-.44L9.985 8.44A1 1 0 0 0 9.157 8H5a1 1 0 0 0-1 1Z"/>
              </svg>
            </div>
            <div className="drive-text">
              <h3>{galleryData.linkTitle}</h3>
              <p>{galleryData.linkDescription}</p>
            </div>
            <div className="drive-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </a>
        </div>
      )}
      </div>
    </div>
  );
};

export default Gallery;
