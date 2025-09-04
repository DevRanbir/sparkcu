import React from 'react';
import './Rules.css';
import SEOHead from '../components/SEOHead';

const Rules = () => {
  const rulesData = {
    general: {
      title: "General Rules",
      icon: "📋",
      rules: [
        "Teams must strictly follow PPT Guidelines (12 slides max).",
        "No similar/repeated content between teams (plagiarism leads to disqualification).",
        "All team members must be CU BE CSE students (1st or 2nd year).",
        "One Team Leader must be appointed for communication."
      ]
    },
    ai: {
      title: "AI Usage Rules",
      icon: "🤖",
      rules: [
        "AI is allowed for idea generation & coding contest support.",
        "AI is NOT allowed for direct PPT creation (e.g., Gamma, Canva premade templates, or similar well-known design platforms). Using them = direct disqualification.",
        "Teams must present in their own words; AI-generated text must be customized."
      ]
    },
    coding: {
      title: "Coding Contest Rules",
      icon: "💻",
      rules: [
        "Participation earns +0.5 mark, Best in Category = +1, Best in at least 2 = +2.",
        "Contest will be time-limited – fastest and most accurate teams secure top positions.",
        "Use of AI is allowed in contest, but the faster team will be the winner."
      ]
    },
    presentation: {
      title: "Presentation Rules",
      icon: "🎤",
      rules: [
        "Strict adherence to time limit (5–6 minutes).",
        "Every team must give the floor to the Team Leader at least once.",
        "Teams must be ready for Q&A by judges."
      ]
    },
    behavioral: {
      title: "Behavioral Rules",
      icon: "🤝",
      rules: [
        "Respect mentors, organizers, and other teams.",
        "Any form of misconduct or unfair means will result in disqualification.",
        "Judges' decision will be final and binding."
      ]
    },
    marking: {
      title: "Marking Criteria",
      icon: "📝",
      rules: [
        "Clarity and coherence of presentation.",
        "Depth of understanding of the topic.",
        "Creativity and originality in approach."
      ]
    }
  };

  return (
    <div className="rules-page">
      <SEOHead 
        title="Rules & Guidelines | CuSpark Ideathon 2025-26"
        description="Essential rules and guidelines for CuSpark Ideathon participants. Learn about team formation, presentation guidelines, and competition requirements for CSE students."
        keywords="CuSpark Rules, Ideathon Guidelines, Competition Rules, CSE Competition, Team Formation, Presentation Guidelines"
        url="https://cuspark.live/rules"
      />
      <div className="rules-header">
        <h1>SparkCU Ideathon Rules</h1>
        <p>Essential guidelines for all participants</p>
      </div>
      
      <div className="rules-grid">
        {Object.entries(rulesData).map(([key, section]) => (
          <div key={key} className={`rule-card ${key}`}>
            <div className="rule-header">
              <span className="rule-icon">{section.icon}</span>
              <h3>{section.title}</h3>
            </div>
            <div className="rule-content">
              {section.rules.map((rule, index) => (
                <div key={index} className="rule-item">
                  <span className="rule-bullet">•</span>
                  <span className="rule-text">{rule}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Rules;
