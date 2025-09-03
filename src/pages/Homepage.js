import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './Homepage.css';
import RotatingText from '../TextAnimations/RotatingText/RotatingText';
import { getAllTeams, getCountdownData } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import CircularGallery from '../components/CircularGallery/CircularGallery';

function Homepage() {
  const { currentUser, loading: authLoading } = useAuth();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const [teams, setTeams] = useState([]);
  const [countdownData, setCountdownData] = useState({});
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const calculateTimeLeft = useCallback(() => {
    if (!countdownData.targetDate) return;
    
    const now = new Date().getTime();
    const target = new Date(countdownData.targetDate).getTime();
    const difference = target - now;

    if (difference > 0) {
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      });
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }
  }, [countdownData.targetDate]);

  useEffect(() => {
    // Fetch data for stats
    fetchData();
    
    // Auto-play video once on page load
    const autoPlayVideo = async () => {
      if (videoRef.current && !hasAutoPlayed) {
        try {
          await videoRef.current.play();
          setIsPlaying(true);
          setHasAutoPlayed(true);
        } catch (error) {
          console.log('Auto-play was prevented by browser:', error);
          // Auto-play failed, user interaction will be required
        }
      }
    };

    // Small delay to ensure video is loaded
    const timer = setTimeout(autoPlayVideo, 500);
    
    return () => clearTimeout(timer);
  }, [hasAutoPlayed]);

  // Countdown timer effect
  useEffect(() => {
    if (countdownData.targetDate) {
      const interval = setInterval(() => {
        calculateTimeLeft();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [countdownData.targetDate, calculateTimeLeft]);

  const fetchData = async () => {
    try {
      const [teamsResponse, countdownResponse] = await Promise.all([
        getAllTeams(),
        getCountdownData()
      ]);
      
      // Extract teams data
      const teamsData = teamsResponse?.success && teamsResponse?.teams ? teamsResponse.teams : [];
      
      // Extract countdown data
      const countdownDataObj = countdownResponse?.success && countdownResponse?.data ? countdownResponse.data : {};
      
      setTeams(teamsData);
      setCountdownData(countdownDataObj);
      
      console.log('Fetched data:', {
        teams: teamsData.length,
        countdown: countdownDataObj
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set default values on error
      setTeams([]);
      setCountdownData({});
    }
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        // If it hasn't auto-played yet, start from beginning
        if (!hasAutoPlayed) {
          videoRef.current.currentTime = 0;
          setHasAutoPlayed(true);
        }
        videoRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.log('Video play was prevented:', error);
            // Handle the error gracefully - video won't play until user interacts
          });
      }
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0; // Reset to beginning to show thumbnail
      videoRef.current.load(); // Reload the video to show the poster/thumbnail
    }
    console.log('Video finished playing');
  };

  return (
    <div className="homepage">
      <div className="homepage-content">
        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="main-title">
            CuSpark{' '}
            <RotatingText
              texts={[
                "Ideathon",
                "Innovate",
                "Hackfest",
                "Workshop"
              ]}
              staggerFrom={"last"}
              initial={{ y: "-140%" }}
              animate={{ y: 0 }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={4000}
            />
          </h1>
          <p className="hero-subtitle">Hackathon-style competition for 1st & 2nd year CSE students</p>
          <p className="session-info">2025-26 Academic Session | Department of CSE, Chandigarh University</p>
        </div>

        {/* Navigation Links */}
        <div className="nav-links">
          {!authLoading && (
            currentUser ? (
              // User is logged in - show Dashboard
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
            ) : (
              // User is not logged in - show Register and Login
              <>
                <Link to="/register" className="nav-link">Register</Link>
                <Link to="/login" className="nav-link">Login</Link>
              </>
            )
          )}
          <Link to="/schedule" className="nav-link">Schedule</Link>
          <Link to="/rules" className="nav-link">Rules</Link>
          <Link to="/about" className="nav-link">About</Link>
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

          {/* Countdown Section */}
          <section className="countdown-section">
            <h2>Event Countdown</h2>
            <div className="countdown-container">
              <h3 className="countdown-title">For {countdownData.title || 'SparkCU Ideathon'}</h3>
              {countdownData.targetDate && (
                <p className="countdown-date">
                  Event Date: {new Date(countdownData.targetDate).toLocaleDateString()}
                </p>
              )}
              <div className="countdown-timer">
                <div className="time-unit">
                  <span className="time-number">{timeLeft.days}</span>
                  <span className="time-label">Days</span>
                </div>
                <div className="time-unit">
                  <span className="time-number">{timeLeft.hours}</span>
                  <span className="time-label">Hours</span>
                </div>
                <div className="time-unit">
                  <span className="time-number">{timeLeft.minutes}</span>
                  <span className="time-label">Minutes</span>
                </div>
                <div className="time-unit">
                  <span className="time-number">{timeLeft.seconds}</span>
                  <span className="time-label">Seconds</span>
                </div>
              </div>
            </div>
          </section>

          <section className="video-section">
            <h2>Watch SparkCU Introductionary Video</h2>
            <div className="youtube-container">
              <iframe
                className="youtube-video"
                src="https://www.youtube.com/embed/CF_-ykCpcUU?si=P4Yo8ZJlvQonS6M-&cc_load_policy=1&hd=1&rel=0&modestbranding=1&iv_load_policy=3"
                title="SparkCU Competition Highlights"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </section>

          {/* Stats Section */}
          <section className="stats-section">
            <h2>Competition Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total Teams</h4>
                <p className="stat-number">{Array.isArray(teams) ? teams.length : 0}</p>
              </div>
              <div className="stat-card">
                <h4>Total Participants</h4>
                <p className="stat-number">{Array.isArray(teams) ? teams.reduce((acc, team) => acc + (team.members ? team.members.length : 0), 0) : 0}</p>
              </div>
              <div className="stat-card">
                <h4>Registrations Today</h4>
                <p className="stat-number">{Array.isArray(teams) ? teams.filter(team => {
                  if (!team.createdAt) return false;
                  const today = new Date();
                  const teamDate = team.createdAt.toDate ? team.createdAt.toDate() : new Date(team.createdAt);
                  return teamDate.toDateString() === today.toDateString();
                }).length : 0}</p>
              </div>
              <div className="stat-card">
                <h4>Total Submissions</h4>
                <p className="stat-number">{Array.isArray(teams) ? teams.filter(team => team.submissionLinks).length : 0}</p>
              </div>
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
              {!authLoading && (
                currentUser ? (
                  <Link to="/dashboard" className="primary-btn">Go to Dashboard</Link>
                ) : (
                  <Link to="/register" className="primary-btn">Join the Competition</Link>
                )
              )}
            </div>
          </section>

          <div style={{ height: '700px', width: '100%', position: 'relative', transform: 'scale(0.8)', marginTop: '-8rem', zIndex: 10000000 }}>
            <CircularGallery bend={2} textColor="#000000ff" borderRadius={0.05} scrollEase={0.02}/>
          </div>

        </div>

        <div className="media-container">
          <div className="video-container">
            <video
              ref={videoRef}
              className="center-video"
              muted
              playsInline
              onClick={handleVideoClick}
              onEnded={handleVideoEnded}
              style={{ cursor: 'pointer' }}
            >
              <source src="/video1.mp4" type="video/mp4" />
              <source src="/your-video.webm" type="video/webm" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="image-container">
            <img 
              src="/culogo.png" 
              alt="SparkCU Competition" 
              className="side-image"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
