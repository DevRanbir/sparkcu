import React, { useEffect, useRef, useState } from 'react';
import './Homepage.css';

function Homepage() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, []);

  const handleVideoClick = () => {
    if (videoRef.current && !isPlaying) {
      videoRef.current.currentTime = 0; // Reset to beginning
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    console.log('Video finished playing');
  };

  return (
    <div className="homepage">
      <div className="homepage-content">
        <div className="video-container">
          <video
            ref={videoRef}
            className="center-video"
            muted
            playsInline
            onClick={handleVideoClick}
            onEnded={handleVideoEnded}
            style={{ cursor: isPlaying ? 'default' : 'pointer' }}
          >
            <source src="/video1.mp4" type="video/mp4" />
            <source src="/your-video.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
