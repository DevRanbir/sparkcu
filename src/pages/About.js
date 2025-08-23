import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import './About.css';

// Set up PDF.js worker using local file
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

function About() {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'list'
  const [isFullscreen, setIsFullscreen] = useState(false);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const nextPage = useCallback(() => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, numPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const toggleViewMode = () => {
    setViewMode(viewMode === 'single' ? 'list' : 'single');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      setViewMode('single'); // Force single page mode in fullscreen
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  };

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      // Enter browser fullscreen
      document.documentElement.requestFullscreen().catch(err => {
        console.log('Error attempting to enable fullscreen:', err);
      });
    } else {
      // Exit browser fullscreen
      document.exitFullscreen().catch(err => {
        console.log('Error attempting to exit fullscreen:', err);
      });
    }
  };

  // Handle ESC key to exit fullscreen
  React.useEffect(() => {
    const handleKeyPress = (event) => {
      if (isFullscreen) {
        if (event.key === 'Escape') {
          exitFullscreen();
        } else if (event.key === 'ArrowLeft') {
          prevPage();
        } else if (event.key === 'ArrowRight') {
          nextPage();
        }
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isFullscreen, currentPage, numPages, nextPage, prevPage]);

  // Cleanup scrollbar styles on component unmount
  React.useEffect(() => {
    return () => {
      // Restore scrollbars when component unmounts
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <div className="about">
      <div className="about-content">
        <header className="about-header">
          <h1 className="about-title">Spark Planning</h1>
          <p className="about-subtitle">Complete ideathon guide and documentation</p>
        </header>

        <div className="pdf-container">
          <Document
            file="/SparkPlannig.pdf"
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="pdf-loading">Loading PDF...</div>}
            error={<div className="pdf-error">Failed to load PDF</div>}
          >
            {viewMode === 'single' ? (
              <Page 
                pageNumber={currentPage} 
                width={Math.min(800, window.innerWidth - 100)}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            ) : (
              numPages && Array.from(new Array(numPages), (el, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  width={Math.min(600, window.innerWidth - 100)}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              ))
            )}
          </Document>
        </div>

        <div className="about-controls">
          <button 
            className="view-toggle-btn"
            onClick={toggleViewMode}
          >
            {viewMode === 'single' ? 'List View' : 'Single Page'}
          </button>
          
          <button 
            className="fullscreen-btn"
            onClick={toggleFullscreen}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3H5C3.89543 3 3 3.89543 3 5V8M21 8V5C21 3.89543 20.1046 3 19 3H16M16 21H19C20.1046 21 21 20.1046 21 19V16M8 21H5C3.89543 21 3 20.1046 3 19V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Fullscreen
          </button>
          
          {viewMode === 'single' && numPages && (
            <div className="page-navigation">
              <button 
                className="nav-btn"
                onClick={prevPage}
                disabled={currentPage <= 1}
              >
                ←
              </button>
              <span className="page-info">
                {currentPage} / {numPages}
              </span>
              <button 
                className="nav-btn"
                onClick={nextPage}
                disabled={currentPage >= numPages}
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fullscreen-modal">
          <div className="fullscreen-content">
            <Document
              file="/SparkPlannig.pdf"
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="pdf-loading">Loading PDF...</div>}
              error={<div className="pdf-error">Failed to load PDF</div>}
            >
              <Page 
                pageNumber={currentPage} 
                width={Math.min(window.innerWidth - 40, (window.innerHeight - 80) * 0.7)}
                scale={2.0}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          </div>
          
          {/* Exit button - top left */}
          <button className="fs-btn fs-exit-btn" onClick={exitFullscreen}>
            ✕
          </button>
          
          {/* Browser fullscreen button - top left, next to exit */}
          <button className="fs-btn fs-browser-fullscreen-btn" onClick={toggleBrowserFullscreen}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3H5C3.89543 3 3 3.89543 3 5V8M21 8V5C21 3.89543 20.1046 3 19 3H16M16 21H19C20.1046 21 21 20.1046 21 19V16M8 21H5C3.89543 21 3 20.1046 3 19V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* Navigation buttons - bottom center */}
          <div className="fullscreen-nav-controls">
            <button 
              className="fs-btn fs-nav-btn"
              onClick={prevPage}
              disabled={currentPage <= 1}
            >
              ←
            </button>
            <button 
              className="fs-btn fs-nav-btn"
              onClick={nextPage}
              disabled={currentPage >= numPages}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default About;
