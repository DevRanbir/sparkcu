import React from 'react';
import './Result.css';
import CardSwap, { Card } from  '../components/CardSwap/CardSwap'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import RotatingText from '../TextAnimations/RotatingText/RotatingText';

const Result = () => {
  // Sample data for winners table - replace with actual data
  const winnersData = [
    { position: 1, teamName: "Team Alpha", score: 95 },
    { position: 2, teamName: "Team Beta", score: 89 },
    { position: 3, teamName: "Team Gamma", score: 84 },
    { position: 4, teamName: "Team Delta", score: 78 },
    { position: 5, teamName: "Team Epsilon", score: 72 },
  ];

  return (
    <div className="result-page">
      <div className="result-content">
        <div className="result-header">
          <h1>Results</h1>
          <p>The winners of our competition will be announced here shortly. Stay tuned!</p>
        </div>


        <div style={{position: 'relative',marginTop: '100vh' }}>
            <CardSwap
                cardDistance={70}
                verticalDistance={90}
                delay={5000}
                pauseOnHover={true}
            >
                <Card>
                <h3>Card 1</h3>
                <p>Your content here</p>
                <DotLottieReact
                    src="https://lottie.host/11026e90-1707-4d10-ace5-d7c59fefe233/YmWesrfPmp.lottie"
                    loop
                    autoplay
                />
                </Card>
                <Card>
                <h3>Card 2</h3>
                <p>Your content here</p>
                <DotLottieReact
                    src="https://lottie.host/9d0ad823-048b-4914-8834-33bbf8ba3628/OZFRv6doVW.lottie"
                    loop
                    autoplay
                />
                </Card>
                <Card>
                <h3>Card 3</h3>
                <p>Your content here</p>
                <DotLottieReact
                    src="https://lottie.host/0673973f-72a2-4f5a-a1cc-7783d2f6920d/lyrA7FAiC2.lottie"
                    loop
                    autoplay
                />
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
          </div>
          
          <div className="winners-table-container">
            <table className="winners-table">
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Team Name</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {winnersData.map((team, index) => (
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
                    <td className="score">{team.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;
