import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './Prizes.css';

function Prizes() {
  return (
    <div className="prizes">
      <div className="prizes-content">
        <div className="prizes-header">
          <h1 className="prizes-title">🏆 Rewards & Recognition</h1>
          <p className="prizes-subtitle">Celebrating Innovation and Excellence</p>
        </div>

        {/* Lottie Animation */}
        <div className="lottie-container">
          <DotLottieReact
            src="https://lottie.host/69319d86-3397-4280-9d0f-758aa466b0d0/EZR5Qw1ctY.lottie"
            loop
            autoplay
          />
        </div>

        <div className="prizes-grid">
          {/* Main Prizes Section */}
          <div className="prize-category main-prizes">
            <h2 className="category-title">🥇 Main Competition Prizes</h2>
            <div className="prize-cards">
              <div className="prize-card first-place">
                <div className="prize-icon">🥇</div>
                <h3>1st Place</h3>
                <p>Trophy + Certificate</p>
              </div>
              <div className="prize-card second-place">
                <div className="prize-icon">🥈</div>
                <h3>2nd Place</h3>
                <p>Trophy + Certificate</p>
              </div>
              <div className="prize-card third-place">
                <div className="prize-icon">🥉</div>
                <h3>3rd Place</h3>
                <p>Trophy + Certificate</p>
              </div>
            </div>
          </div>

          {/* Coding Contest Prizes */}
          <div className="prize-category coding-prizes">
            <h2 className="category-title">💻 Coding Contest Rewards</h2>
            <div className="coding-rewards">
              <div className="reward-item">
                <div className="reward-icon">🎯</div>
                <div className="reward-details">
                  <h4>Participation Bonus</h4>
                  <p>+0.5 marks for participating in any round</p>
                </div>
              </div>
              <div className="reward-item">
                <div className="reward-icon">🏅</div>
                <div className="reward-details">
                  <h4>Category Winner</h4>
                  <p>+1 mark for best in Web Development, App Development, or General Programming</p>
                </div>
              </div>
              <div className="reward-item">
                <div className="reward-icon">👑</div>
                <div className="reward-details">
                  <h4>Overall Topper</h4>
                  <p>+2 marks for best performance in at least two categories</p>
                </div>
              </div>
            </div>
            <div className="bonus-note">
              <p><strong>Note:</strong> Coding contest provides bonus marks (total score capped at 10)</p>
            </div>
          </div>

          {/* Universal Rewards */}
          <div className="prize-category universal-rewards">
            <h2 className="category-title">🎉 For All Participants</h2>
            <div className="universal-items">
              <div className="universal-item">
                <div className="universal-icon">📜</div>
                <div className="universal-details">
                  <h4>E-Certificate</h4>
                  <p>Digital certificate of participation for all teams</p>
                </div>
              </div>
              <div className="universal-item">
                <div className="universal-icon">🏖️</div>
                <div className="universal-details">
                  <h4>Full Day Duty Leave (DL)</h4>
                  <p>Complete academic day off for all participants</p>
                </div>
              </div>
            </div>
          </div>

          {/* Special Recognition */}
          <div className="prize-category special-recognition">
            <h2 className="category-title">⭐ Special Recognition</h2>
            <div className="special-items">
              <div className="special-item">
                <div className="special-icon">🏆</div>
                <div className="special-details">
                  <h4>Category-Specific Certificates</h4>
                  <p>Additional certificates for coding contest winners (subject to confirmation by respective clubs)</p>
                </div>
              </div>
              <div className="special-item">
                <div className="special-icon">🌟</div>
                <div className="special-details">
                  <h4>Expert Mentorship</h4>
                  <p>Guidance sessions with industry experts and university professors</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="prizes-footer">
          <p className="footer-note">
            🎯 <strong>Remember:</strong> All decisions by judges are final. Good luck to all participants!
          </p>
        </div>
      </div>
    </div>
  );
}

export default Prizes;
