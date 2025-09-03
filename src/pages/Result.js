import React, { useEffect, useState, useCallback } from 'react';
import './Result.css';
import CardSwap, { Card } from  '../components/CardSwap/CardSwap'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import confetti from 'canvas-confetti';
import { getResults } from '../services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';

const Result = () => {
  // State for results data
  const [resultsData, setResultsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firstPositionTeam, setFirstPositionTeam] = useState(null);
  const [secondPositionTeam, setSecondPositionTeam] = useState(null);
  const [thirdPositionTeam, setThirdPositionTeam] = useState(null);

  // Function to get team details for first position
  const getFirstPositionTeamDetails = async (teamName) => {
    try {
      const teamsRef = collection(db, 'teams');
      const q = query(teamsRef, where('teamName', '==', teamName));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const teamDoc = querySnapshot.docs[0];
        return teamDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error fetching team details:', error);
      return null;
    }
  };

  // Fetch results from Firebase
  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getResults();
      if (result.success) {
        // Sort by rank and take all the fields we need including detailed scores
        const sortedResults = result.results
          .map(team => ({
            position: team.rank || 0,
            teamName: team.teamName || 'Unknown Team',
            grandTotal: team.grandTotal || 0,
            problemUnderstanding: team.problemUnderstanding || 0,
            innovation: team.innovation || 0,
            feasibility: team.feasibility || 0,
            presentation: team.presentation || 0,
            contestScore: team.contestScore || 0
          }))
          .sort((a, b) => a.position - b.position);
        
        setResultsData(sortedResults);
        
        // Get first position team details (combine results data with team member data)
        if (sortedResults.length > 0 && sortedResults[0].position === 1) {
          const teamDetails = await getFirstPositionTeamDetails(sortedResults[0].teamName);
          setFirstPositionTeam({
            ...sortedResults[0],
            ...teamDetails
          });
        }
        
        // Get second position team details (combine results data with team member data)
        if (sortedResults.length > 1 && sortedResults[1].position === 2) {
          const teamDetails = await getFirstPositionTeamDetails(sortedResults[1].teamName);
          setSecondPositionTeam({
            ...sortedResults[1],
            ...teamDetails
          });
        }
        
        // Get third position team details (combine results data with team member data)
        if (sortedResults.length > 2 && sortedResults[2].position === 3) {
          const teamDetails = await getFirstPositionTeamDetails(sortedResults[2].teamName);
          setThirdPositionTeam({
            ...sortedResults[2],
            ...teamDetails
          });
        }
        
        setError(null);
      } else {
        setError('Failed to load results');
        console.error('Error fetching results:', result.message);
      }
    } catch (error) {
      setError('Error loading results');
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Confetti celebration function
  const celebrateWinners = () => {
    var duration = 35 * 1000;
    var animationEnd = Date.now() + duration;
    var skew = 1;

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    (function frame() {
      var timeLeft = animationEnd - Date.now();
      var ticks = Math.max(200, 500 * (timeLeft / duration));
      skew = Math.max(0.8, skew - 0.001);

      confetti({
        particleCount: 1,
        startVelocity: 0,
        ticks: ticks,
        origin: {
          x: Math.random(),
          // since particles fall down, skew start toward the top
          y: (Math.random() * skew) - 0.2
        },
        colors: ['#ffdd00ff'],
        shapes: ['circle'],
        gravity: randomInRange(0.4, 0.6),
        scalar: randomInRange(0.4, 1),
        drift: randomInRange(-0.4, 0.4)
      });

      if (timeLeft > 0) {
        requestAnimationFrame(frame);
      }
    }());

    var count = 200;
    var defaults = {
      origin: { y: 1 }
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  // Fetch results on component mount
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Trigger confetti on component mount (after results are loaded)
  useEffect(() => {
    if (!loading && resultsData.length > 0) {
      // Delay to ensure page has loaded and rendered
      const timer = setTimeout(() => {
        celebrateWinners();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [loading, resultsData]);

  // Check if user is on mobile device
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile devices on component mount
  useEffect(() => {
    const checkMobile = () => {
      const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
      setIsMobile(mobileCheck);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Set cardDistance value based on device
  const cardDistanceValue = isMobile ? 1 : 8;
  const skewAmountValue = isMobile ? 0 : 8;
  
  return (
    <div className="result-page">
      <div className="result-content">
        <div className="result-header">
          <h1>Results</h1>
          <p>CuSpark Ideathon celebrates innovation, talent, teamwork, dedication, and success of the Winners.</p>
        </div>


        <div style={{position: 'relative',marginTop: '100vh' }}>
            <CardSwap
                cardDistance={cardDistanceValue}
                verticalDistance={70}
                delay={5000}
                pauseOnHover={true}
                skewAmount={skewAmountValue}
            >
                <Card>
                  <div style={{
                    position: 'relative',
                    borderRadius: '15px',
                    minHeight: '400px',
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0)',
                    border: '1px solid rgba(255, 255, 255, 1)'
                  }}>
                    {/* Background DotLottie */}
                    <div style={{
                      position: 'absolute',
                      top: '65%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 1,
                      opacity: 0.3
                    }}>
                      <DotLottieReact
                        src="https://lottie.host/11026e90-1707-4d10-ace5-d7c59fefe233/YmWesrfPmp.lottie"
                        loop
                        autoplay
                        style={{ width: '300px', height: '300px' }}
                      />
                    </div>
                    
                    {/* Translucent Content Overlay */}
                    <div style={{
                      position: 'relative',
                      zIndex: 2,
                      background: 'rgba(255, 255, 255, 0)',
                      padding: '20px',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center'
                    }}>
                      <h3 style={{
                        color: '#FFD700',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        marginBottom: '15px',
                        margin: '0 0 15px 0'
                      }}>
                        🏆 CHAMPIONS
                      </h3>
                      
                      {firstPositionTeam ? (
                        <div style={{ width: '100%' }}>
                          <div style={{
                            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                            borderRadius: '10px',
                            padding: '15px',
                            marginBottom: '15px',
                            color: '#fff',
                            fontWeight: 'bold'
                          }}>
                            <h4 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>
                              {firstPositionTeam.teamName}
                            </h4>
                            <p style={{ margin: '0', fontSize: '16px' }}>
                              Grand Total: {firstPositionTeam.grandTotal}/12
                            </p>
                          </div>
                          
                          {/* Detailed Scores Section */}
                          <div style={{
                            background: 'rgba(255, 255, 255, 0)',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '15px'
                          }}>
                            <h5 style={{
                              color: '#333',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              marginBottom: '10px',
                              borderBottom: '2px solid #FFD700',
                              paddingBottom: '4px'
                            }}>
                              Performance Breakdown:
                            </h5>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: 'left' }}>
                              <div style={{ fontSize: '12px', color: '#555' }}>
                                <span style={{ fontWeight: 'bold', color: '#333' }}>Problem Understanding:</span>
                                <br />
                                <span style={{ color: '#4CAF50', fontWeight: 'bold' }}></span>
                                <span style={{ color: '#9C27B0', fontWeight: 'bold' }}>
                                  {firstPositionTeam.presentation || 'N/A'}/3
                                </span>
                              </div>
                              
                              <div style={{ fontSize: '12px', color: '#555', gridColumn: 'span 2' }}>
                                <span style={{ fontWeight: 'bold', color: '#333' }}>Contest Score:</span>
                                <br />
                                <span style={{ color: '#E91E63', fontWeight: 'bold' }}>
                                  {firstPositionTeam.contestScore || 'N/A'}/2
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Team Members Section */}
                          <div style={{
                            textAlign: 'left',
                            background: 'rgba(255, 255, 255, 0)',
                            borderRadius: '8px',
                            padding: '12px'
                          }}>
                            <h5 style={{
                              color: '#333',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              marginBottom: '8px',
                              borderBottom: '2px solid #FFD700',
                              paddingBottom: '4px'
                            }}>
                              Team Members:
                            </h5>
                            
                            {firstPositionTeam.members && firstPositionTeam.members.map((member, index) => (
                              <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '6px',
                                fontSize: '13px',
                                color: '#555'
                              }}>
                                <span style={{
                                  display: 'inline-block',
                                  width: '16px',
                                  height: '16px',
                                  backgroundColor: member.status === 'leader' ? '#FFD700' : '#4CAF50',
                                  borderRadius: '50%',
                                  marginRight: '8px',
                                  fontSize: '10px',
                                  textAlign: 'center',
                                  lineHeight: '16px',
                                  color: '#fff',
                                  fontWeight: 'bold'
                                }}>
                                  {member.status === 'leader' ? 'L' : 'M'}
                                </span>
                                <span style={{ fontWeight: member.status === 'leader' ? 'bold' : 'normal' }}>
                                  {member.name}
                                  {member.status === 'leader' && (
                                    <span style={{ color: '#FFD700', fontSize: '11px', marginLeft: '4px' }}>
                                      (Leader)
                                    </span>
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: '#666', fontSize: '14px' }}>
                          <p>🎉 Congratulations to our winners!</p>
                          <p>Team details will be displayed here once available.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
                <Card>
                  <div style={{
                    position: 'relative',
                    borderRadius: '15px',
                    minHeight: '400px',
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}>
                    {/* Background DotLottie */}
                    <div style={{
                      position: 'absolute',
                      top: '65%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 1,
                      opacity: 0.3
                    }}>
                      <DotLottieReact
                        src="https://lottie.host/9d0ad823-048b-4914-8834-33bbf8ba3628/OZFRv6doVW.lottie"
                        loop
                        autoplay
                        style={{ width: '300px', height: '300px' }}
                      />
                    </div>
                    
                    {/* Translucent Content Overlay */}
                    <div style={{
                      position: 'relative',
                      zIndex: 2,
                      background: 'rgba(255, 255, 255, 0)',
                      padding: '20px',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center'
                    }}>
                      <h3 style={{
                        color: '#000000ff',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        marginBottom: '15px',
                        margin: '0 0 15px 0'
                      }}>
                        🥈 RUNNERS-UP
                      </h3>
                      
                      {secondPositionTeam ? (
                        <div style={{ width: '100%' }}>
                          <div style={{
                            background: '#A0A0A0',
                            borderRadius: '10px',
                            padding: '15px',
                            marginBottom: '15px',
                            color: '#fff',
                            fontWeight: 'bold'
                          }}>
                            <h4 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>
                              {secondPositionTeam.teamName}
                            </h4>
                            <p style={{ margin: '0', fontSize: '16px' }}>
                              Grand Total: {secondPositionTeam.grandTotal}/12
                            </p>
                          </div>
                          
                          {/* Detailed Scores Section */}
                          <div style={{
                            background: 'rgba(255, 255, 255, 0)',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '15px'
                          }}>
                            <h5 style={{
                              color: '#333',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              marginBottom: '10px',
                              borderBottom: '2px solid #C0C0C0',
                              paddingBottom: '4px'
                            }}>
                              Performance Breakdown:
                            </h5>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: 'left' }}>
                              <div style={{ fontSize: '12px', color: '#555' }}>
                                <span style={{ fontWeight: 'bold', color: '#333' }}>Problem Understanding:</span>
                                <br />
                                <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                                  {secondPositionTeam.problemUnderstanding || 'N/A'}/2
                                </span>
                              </div>
                              
                              <div style={{ fontSize: '12px', color: '#555' }}>
                                <span style={{ fontWeight: 'bold', color: '#333' }}>Innovation:</span>
                                <br />
                                <span style={{ color: '#2196F3', fontWeight: 'bold' }}>
                                  {secondPositionTeam.innovation || 'N/A'}/3
                                </span>
                              </div>
                              
                              <div style={{ fontSize: '12px', color: '#555' }}>
                                <span style={{ fontWeight: 'bold', color: '#333' }}>Feasibility:</span>
                                <br />
                                <span style={{ color: '#FF9800', fontWeight: 'bold' }}>
                                  {secondPositionTeam.feasibility || 'N/A'}/2
                                </span>
                              </div>
                              
                              <div style={{ fontSize: '12px', color: '#555' }}>
                                <span style={{ fontWeight: 'bold', color: '#333' }}>Presentation:</span>
                                <br />
                                <span style={{ color: '#9C27B0', fontWeight: 'bold' }}>
                                  {secondPositionTeam.presentation || 'N/A'}/3
                                </span>
                              </div>
                              
                              <div style={{ fontSize: '12px', color: '#555', gridColumn: 'span 2' }}>
                                <span style={{ fontWeight: 'bold', color: '#333' }}>Contest Score:</span>
                                <br />
                                <span style={{ color: '#E91E63', fontWeight: 'bold' }}>
                                  {secondPositionTeam.contestScore || 'N/A'}/2
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Team Members Section */}
                          <div style={{
                            textAlign: 'left',
                            background: 'rgba(0, 0, 0, 0)',
                            borderRadius: '8px',
                            padding: '12px'
                          }}>
                            <h5 style={{
                              color: '#333',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              marginBottom: '8px',
                              borderBottom: '2px solid #C0C0C0',
                              paddingBottom: '4px'
                            }}>
                              Team Members:
                            </h5>
                            
                            {secondPositionTeam.members && secondPositionTeam.members.map((member, index) => (
                              <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '6px',
                                fontSize: '13px',
                                color: '#555'
                              }}>
                                <span style={{
                                  display: 'inline-block',
                                  width: '16px',
                                  height: '16px',
                                  backgroundColor: member.status === 'leader' ? '#C0C0C0' : '#4CAF50',
                                  borderRadius: '50%',
                                  marginRight: '8px',
                                  fontSize: '10px',
                                  textAlign: 'center',
                                  lineHeight: '16px',
                                  color: '#fff',
                                  fontWeight: 'bold'
                                }}>
                                  {member.status === 'leader' ? 'L' : 'M'}
                                </span>
                                <span style={{ fontWeight: member.status === 'leader' ? 'bold' : 'normal' }}>
                                  {member.name}
                                  {member.status === 'leader' && (
                                    <span style={{ color: '#C0C0C0', fontSize: '11px', marginLeft: '4px' }}>
                                      (Leader)
                                    </span>
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: '#666', fontSize: '14px' }}>
                          <p>🥈 Excellent performance!</p>
                          <p>Second place team details will be displayed here once available.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
                <Card>
                  <div style={{
                    position: 'relative',
                    borderRadius: '15px',
                    minHeight: '400px',
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0)',
                    border: '1px solid rgba(255, 255, 255, 0)'
                  }}>
                    {/* Background DotLottie */}
                    <div style={{
                      position: 'absolute',
                      top: '65%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 1,
                      opacity: 0.3
                    }}>
                      <DotLottieReact
                        src="https://lottie.host/0673973f-72a2-4f5a-a1cc-7783d2f6920d/lyrA7FAiC2.lottie"
                        loop
                        autoplay
                        style={{ width: '300px', height: '300px' }}
                      />
                    </div>
                    
                    {/* Translucent Content Overlay */}
                    <div style={{
                      position: 'relative',
                      zIndex: 2,
                      background: 'rgba(255, 255, 255, 0)',
                      padding: '20px',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center'
                    }}>
                      <h3 style={{
                        color: '#CD7F32',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        marginBottom: '15px',
                        margin: '0 0 15px 0'
                      }}>
                        🥉 THIRD PLACE
                      </h3>
                      
                      {thirdPositionTeam ? (
                        <div style={{ width: '100%' }}>
                          <div style={{
                            background: 'linear-gradient(135deg, #CD7F32, #B8860B)',
                            borderRadius: '10px',
                            padding: '15px',
                            marginBottom: '15px',
                            color: '#fff',
                            fontWeight: 'bold'
                          }}>
                            <h4 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>
                              {thirdPositionTeam.teamName}
                            </h4>
                            <p style={{ margin: '0', fontSize: '16px' }}>
                              Grand Total: {thirdPositionTeam.grandTotal}/12
                            </p>
                          </div>
                          
                          {/* Detailed Scores Section */}
                          <div style={{
                            background: 'rgba(255, 255, 255, 0)',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '15px'
                          }}>
                            <h5 style={{
                              color: '#333',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              marginBottom: '10px',
                              borderBottom: '2px solid #CD7F32',
                              paddingBottom: '4px'
                            }}>
                              Performance Breakdown:
                            </h5>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: 'left' }}>
                              <div style={{ fontSize: '12px', color: '#555' }}>
                                <span style={{ fontWeight: 'bold', color: '#333' }}>Problem Understanding:</span>
                                <br />
                                <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                                  {thirdPositionTeam.problemUnderstanding || 'N/A'}/2
                                </span>
                              </div>
                              
                              <div style={{ fontSize: '12px', color: '#555' }}>
                                <span style={{ fontWeight: 'bold', color: '#333' }}>Innovation:</span>
                                <br />
                                <span style={{ color: '#2196F3', fontWeight: 'bold' }}>
                                  {thirdPositionTeam.innovation || 'N/A'}/3
                                </span>
                              </div>
                              
                              <div style={{ fontSize: '12px', color: '#555' }}>
                                <span style={{ fontWeight: 'bold', color: '#333' }}>Feasibility:</span>
                                <br />
                                <span style={{ color: '#FF9800', fontWeight: 'bold' }}>
                                  {thirdPositionTeam.feasibility || 'N/A'}/2
                                </span>
                              </div>
                              
                              <div style={{ fontSize: '12px', color: '#555' }}>
                                <span style={{ fontWeight: 'bold', color: '#333' }}>Presentation:</span>
                                <br />
                                <span style={{ color: '#9C27B0', fontWeight: 'bold' }}>
                                  {thirdPositionTeam.presentation || 'N/A'}/3
                                </span>
                              </div>
                              
                              <div style={{ fontSize: '12px', color: '#555', gridColumn: 'span 2' }}>
                                <span style={{ fontWeight: 'bold', color: '#333' }}>Contest Score:</span>
                                <br />
                                <span style={{ color: '#E91E63', fontWeight: 'bold' }}>
                                  {thirdPositionTeam.contestScore || 'N/A'}/2
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Team Members Section */}
                          <div style={{
                            textAlign: 'left',
                            background: 'rgba(255, 255, 255, 0)',
                            borderRadius: '8px',
                            padding: '12px'
                          }}>
                            <h5 style={{
                              color: '#333',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              marginBottom: '8px',
                              borderBottom: '2px solid #CD7F32',
                              paddingBottom: '4px'
                            }}>
                              Team Members:
                            </h5>
                            
                            {thirdPositionTeam.members && thirdPositionTeam.members.map((member, index) => (
                              <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '6px',
                                fontSize: '13px',
                                color: '#555'
                              }}>
                                <span style={{
                                  display: 'inline-block',
                                  width: '16px',
                                  height: '16px',
                                  backgroundColor: member.status === 'leader' ? '#CD7F32' : '#4CAF50',
                                  borderRadius: '50%',
                                  marginRight: '8px',
                                  fontSize: '10px',
                                  textAlign: 'center',
                                  lineHeight: '16px',
                                  color: '#fff',
                                  fontWeight: 'bold'
                                }}>
                                  {member.status === 'leader' ? 'L' : 'M'}
                                </span>
                                <span style={{ fontWeight: member.status === 'leader' ? 'bold' : 'normal' }}>
                                  {member.name}
                                  {member.status === 'leader' && (
                                    <span style={{ color: '#CD7F32', fontSize: '11px', marginLeft: '4px' }}>
                                      (Leader)
                                    </span>
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: '#666', fontSize: '14px' }}>
                          <p>Outstanding effort!</p>
                          <p>Third place team details will be displayed here once available.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
            </CardSwap>
        </div>
      
      </div>

      {/* Winners Section - Separate div with 100vh spacing */}
      <div className="winners-section">
        <div className="winners-content">
          <div className="winners-header">
            <h1 className="winners-title">WINNERS</h1>
            <p className="winners-subtitle">Final Competition Results</p>
            <div className="results-description">
              <p>
                We are delighted to announce the official results of the SparkCU Ideathon, where teams from diverse disciplines showcased impactful solutions to real-world challenges; evaluated on problem understanding, creativity, technical feasibility, presentation, and coding performance, the rigorous judging process reflected each team’s hard work and innovation, with winners recognized for outstanding achievements and all participants appreciated for making the event a true success and a step toward future collaboration.
              </p>
            </div>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading results...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button onClick={fetchResults} className="retry-button">
                Try Again
              </button>
            </div>
          ) : resultsData.length > 0 ? (
            <div className="winners-table-container">
              <table className="winners-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Team Name</th>
                    <th>Grand Total</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsData.map((team, index) => (
                    <tr key={index} className={`position-${team.position}`}>
                      <td className="position-cell">
                        {team.position <= 3 ? (
                          <span className="medal">
                            {team.position === 1 ? 
                            <svg className="medal" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                  <path fill="#FFD700" d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"/>
                            </svg> : team.position === 2 ? 
                            <svg className="medal" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                  <path fill="#B1B1B1" d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"/>
                            </svg> : <svg className="medal" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                  <path fill="#CD7F32" d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"/>
                            </svg> 
                            }
                          </span>
                        ) : (
                          <span className="position-number">{team.position}</span>
                        )}
                      </td>
                      <td className="team-name">{team.teamName}</td>
                      <td className="score">{team.grandTotal}/12</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ 
                color: '#000', 
                fontSize: '12px', 
                margin: '0', 
                marginTop: '10px',
                textAlign: 'center'
              }}>
                More detailed information is sent to the team dashboard
              </p>
            </div>
          ) : (
            <div className="no-results-container">
              <h3>No Results Yet</h3>
              <p>Competition results will be displayed here once they are available.</p>
              <button onClick={fetchResults} className="refresh-button">
                Refresh Results
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Result;
