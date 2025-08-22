import React, { useEffect, useRef, useState } from 'react';
import './Homepage.css';
import RotatingText from './TextAnimations/RotatingText/RotatingText';

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
        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="main-title">
            SparkCU{' '}
            <RotatingText
              texts={[
                "Ideathon",
                "Innovation",
                "Competition",
                "Challenge"
              ]}
              staggerFrom={"last"}
              initial={{ y: "-150%" }}
              animate={{ y: 0 }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={9000}
            />
          </h1>
          <p className="hero-subtitle">Hackathon-style competition for 1st & 2nd year CSE students</p>
          <p className="session-info">2025-26 Academic Session | Department of CSE, Chandigarh University</p>
        </div>

        {/* Navigation Links */}
        <div className="nav-links">
          <a href="#register" className="nav-link">Register</a>
          <a href="#login" className="nav-link">Login</a>
          <a href="#schedule" className="nav-link">Schedule</a>
          <a href="#rules" className="nav-link">Rules</a>
          <a href="#about" className="nav-link">About</a>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <section className="about-section">
            <h2>About the Competition</h2>
            <p>A hackathon-style competition designed for 1st and 2nd year CSE students to encourage creativity, innovation, and problem-solving skills.</p>
            
            <div className="features">
              <span className="feature">Ideas & Innovation</span>
              <span className="feature">Team Competition</span>
              <span className="feature">Expert Mentorship</span>
            </div>
          </section>

          <section className="evaluation-section">
            <h2>Evaluation Criteria</h2>
            
            <div className="eval-primary">
              <h3>Presentation Assessment</h3>
              <div className="criteria-list">
                <div className="criterion">
                  <div className="criterion-score">2</div>
                  <div className="criterion-details">
                    <span className="criterion-name">Problem Understanding</span>
                    <span className="criterion-desc">Clarity of problem identification</span>
                  </div>
                </div>
                <div className="criterion">
                  <div className="criterion-score">3</div>
                  <div className="criterion-details">
                    <span className="criterion-name">Innovation</span>
                    <span className="criterion-desc">Creativity and uniqueness</span>
                  </div>
                </div>
                <div className="criterion">
                  <div className="criterion-score">2</div>
                  <div className="criterion-details">
                    <span className="criterion-name">Feasibility</span>
                    <span className="criterion-desc">Technical implementation</span>
                  </div>
                </div>
                <div className="criterion">
                  <div className="criterion-score">3</div>
                  <div className="criterion-details">
                    <span className="criterion-name">Presentation</span>
                    <span className="criterion-desc">Communication skills</span>
                  </div>
                </div>
              </div>
              <div className="total-score">Total: 10 marks</div>
            </div>
            
            <div className="eval-bonus">
              <h3>Bonus Opportunities</h3>
              <div className="bonus-grid">
                <div className="bonus-item">
                  <span className="bonus-value">+0.5</span>
                  <span className="bonus-label">Participation</span>
                </div>
                <div className="bonus-item">
                  <span className="bonus-value">+1.0</span>
                  <span className="bonus-label">Category Winner</span>
                </div>
                <div className="bonus-item">
                  <span className="bonus-value">+2.0</span>
                  <span className="bonus-label">Overall Champion</span>
                </div>
              </div>
              <p className="bonus-note">Three coding rounds: Web Development, Programming, App Development</p>
            </div>
          </section>

          <section className="rewards-section">
            <h2>Rewards & Recognition</h2>
            
            <div className="main-rewards">
              <h3>Competition Winners</h3>
              <div className="rewards-grid">
                <div className="reward-card champion">
                  <div className="reward-rank">🏆 1st</div>
                  <div className="reward-title">Champion</div>
                  <div className="reward-desc">Trophy + Certificate</div>
                </div>
                <div className="reward-card runner-up">
                  <div className="reward-rank">🥈 2nd</div>
                  <div className="reward-title">Runner-up</div>
                  <div className="reward-desc">Trophy + Certificate</div>
                </div>
                <div className="reward-card third">
                  <div className="reward-rank">🥉 3rd</div>
                  <div className="reward-title">Third Place</div>
                  <div className="reward-desc">Trophy + Certificate</div>
                </div>
              </div>
            </div>

            <div className="additional-rewards">
              <h3>Additional Recognition</h3>
              <div className="rewards-list">
                <div className="reward-item">
                  <span className="reward-icon">🏅</span>
                  <div className="reward-details">
                    <span className="reward-name">Category Winners</span>
                    <span className="reward-detail">Special certificates for coding contest winners</span>
                  </div>
                </div>
                <div className="reward-item">
                  <span className="reward-icon">📜</span>
                  <div className="reward-details">
                    <span className="reward-name">E-Certificates</span>
                    <span className="reward-detail">All participants receive digital certificates</span>
                  </div>
                </div>
                <div className="reward-item">
                  <span className="reward-icon">📅</span>
                  <div className="reward-details">
                    <span className="reward-name">Duty Leave</span>
                    <span className="reward-detail">Full day duty leave for all participants</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="action-section">
              <button className="primary-btn">Join the Competition</button>
            </div>
          </section>
        </div>
        
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
