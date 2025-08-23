import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './About.css';

// Set up PDF.js worker for react-pdf v7 with pdfjs-dist v5
// Try CDN worker first, fallback to local if needed
try {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
} catch (error) {
  console.warn('CDN worker failed, falling back to local worker');
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

function About() {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('single');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [documentLoaded, setDocumentLoaded] = useState(false);
  const [docKey, setDocKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const errorAttemptsRef = useRef(0);

  const pdfOptions = useMemo(() => ({
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
  }), []);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    console.log('✅ PDF loaded successfully! Pages:', numPages);
    setNumPages(numPages);
    setDocumentLoaded(true);
    setLoading(false);
    setError(null);
    errorAttemptsRef.current = 0;
  }, []);

  const onDocumentLoadError = useCallback((error) => {
    console.error('❌ PDF loading failed:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    setLoading(false);
    setDocumentLoaded(false);
    setError(error.message || 'Failed to load PDF');
    
    // Check if it's a file not found vs corruption issue
    if (error.message?.includes('404') || error.message?.includes('Not Found')) {
      setError('PDF file not found. Please check if SparkPlannig.pdf exists in the public folder.');
    } else if (error.message?.includes('Invalid PDF structure')) {
      setError('PDF file appears to be corrupted or invalid. Please check the file.');
    }
    
    if (errorAttemptsRef.current < 2) {
      errorAttemptsRef.current += 1;
      console.log(`🔄 Retrying PDF load (attempt ${errorAttemptsRef.current + 1}/3)...`);
      setTimeout(() => {
        setDocKey(prev => prev + 1);
        setError(null);
        setLoading(true);
      }, 1500);
    } else {
      console.log('❌ Max retry attempts reached');
    }
  }, []);
  
  const onDocumentLoadStart = useCallback(() => {
    setLoading(true);
    setError(null);
    console.log('🔄 Starting PDF load...');
  }, []);

  const nextPage = useCallback(() => {
    if (currentPage < numPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, numPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => (prev === 'single' ? 'list' : 'single'));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => {
      const newState = !prev;
      if (newState) {
        setViewMode('single');
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }
      return newState;
    });
  }, []);

  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false);
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }, []);

  const toggleBrowserFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.log('Error attempting to exit fullscreen:', err);
      });
    }
  }, []);

  // Handle keyboard events for navigation in fullscreen
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (isFullscreen) {
        switch (event.key) {
          case 'Escape':
            exitFullscreen();
            break;
          case 'ArrowLeft':
            event.preventDefault();
            prevPage();
            break;
          case 'ArrowRight':
            event.preventDefault();
            nextPage();
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen, prevPage, nextPage, exitFullscreen]);

  // Cleanup overflow style on component unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // Calculate responsive width for PDF pages
  const getPageWidth = useCallback((isFullscreenMode = false) => {
    if (isFullscreenMode) {
      return Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9 * 0.707);
    }
    return viewMode === 'single'
      ? Math.min(800, window.innerWidth - 100)
      : Math.min(600, window.innerWidth - 100);
  }, [viewMode]);

  // Loading component
  const renderLoadingComponent = () => (
    <div className="pdf-loading">
      <p>Loading PDF document...</p>
      {error && (
        <p style={{ fontSize: '0.8rem', opacity: 0.7, color: '#ff6b6b' }}>
          Error: {error} (Retrying...)
        </p>
      )}
      <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
        Please wait a moment.
      </p>
    </div>
  );

  // Error component after retries fail
  const renderErrorComponent = () => (
    <div className="pdf-error">
      <p>❌ Failed to load PDF</p>
      <p style={{ fontSize: '0.8rem' }}>
        {error || 'The file might be missing, corrupted, or incompatible.'}
      </p>
      <div style={{ marginTop: '10px' }}>
        <button
          onClick={() => {
            setDocKey(prev => prev + 1);
            setError(null);
            errorAttemptsRef.current = 0;
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry Loading
        </button>
      </div>
    </div>
  );
  
  const pdfFile = "/SparkPlannig.pdf";

  return (
    <div className="about">
      <div className="about-content">
        <header className="about-header">
          <h1 className="about-title">Spark Planning</h1>
          <p className="about-subtitle">Complete ideathon guide and documentation</p>
        </header>

        <div className="pdf-container">
          <Document
            key={docKey}
            file={pdfFile}
            onLoadStart={onDocumentLoadStart}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={renderLoadingComponent()}
            error={renderErrorComponent()}
            options={pdfOptions}
          >
            {viewMode === 'single' ? (
              <Page
                pageNumber={currentPage}
                width={getPageWidth()}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={<div style={{ padding: '20px' }}>Loading page...</div>}
                error={<div style={{ padding: '20px', color: '#ff6b6b' }}>Error loading page</div>}
              />
            ) : (
              numPages && Array.from(new Array(numPages), (el, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  width={getPageWidth()}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  loading={<div style={{ padding: '20px' }}>Loading page {index + 1}...</div>}
                  error={<div style={{ padding: '20px', color: '#ff6b6b' }}>Error loading page {index + 1}</div>}
                />
              ))
            )}
          </Document>
        </div>

        <div className="about-controls">
          <button
            className="view-toggle-btn"
            onClick={toggleViewMode}
            disabled={loading || !documentLoaded}
          >
            {viewMode === 'single' ? 'List View' : 'Single Page'}
          </button>
          
          <button
            className="fullscreen-btn"
            onClick={toggleFullscreen}
            disabled={loading || !documentLoaded}
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
      {isFullscreen && documentLoaded && (
        <div className="fullscreen-modal">
          <div className="fullscreen-content">
            <Document
              key={`fs-${docKey}`}
              file={pdfFile}
              loading={<div className="pdf-loading">Loading PDF...</div>}
              error={<div className="pdf-error">Failed to load PDF in fullscreen</div>}
              options={pdfOptions}
            >
              <Page
                pageNumber={currentPage}
                width={getPageWidth(true)}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={<div style={{ padding: '20px' }}>Loading page...</div>}
                error={<div style={{ padding: '20px', color: '#ff6b6b' }}>Error loading page</div>}
              />
            </Document>
          </div>
          
          <button className="fs-btn fs-exit-btn" onClick={exitFullscreen}>
            ✕
          </button>
          
          <button className="fs-btn fs-browser-fullscreen-btn" onClick={toggleBrowserFullscreen}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3H5C3.89543 3 3 3.89543 3 5V8M21 8V5C21 3.89543 20.1046 3 19 3H16M16 21H19C20.1046 21 21 20.1046 21 19V16M8 21H5C3.89543 21 3 20.1046 3 19V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
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
