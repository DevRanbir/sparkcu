import React, { useEffect, useRef } from 'react';
import './KeyMaps.css';

function KeyMaps() {
  const svgRef = useRef(null);

  useEffect(() => {
    // Load markmap scripts and initialize
    const loadMarkmap = async () => {
      // Load required scripts if not already loaded
      if (!window.markmap) {
        // Load D3
        if (!window.d3) {
          const d3Script = document.createElement('script');
          d3Script.src = 'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js';
          document.head.appendChild(d3Script);
          await new Promise(resolve => d3Script.onload = resolve);
        }

        // Load markmap-view
        const markmapScript = document.createElement('script');
        markmapScript.src = 'https://cdn.jsdelivr.net/npm/markmap-view@0.18.12/dist/browser/index.js';
        document.head.appendChild(markmapScript);
        await new Promise(resolve => markmapScript.onload = resolve);

        // Load markmap-toolbar
        const toolbarScript = document.createElement('script');
        toolbarScript.src = 'https://cdn.jsdelivr.net/npm/markmap-toolbar@0.18.12/dist/index.js';
        document.head.appendChild(toolbarScript);
        await new Promise(resolve => toolbarScript.onload = resolve);

        // Load toolbar CSS
        const toolbarCSS = document.createElement('link');
        toolbarCSS.rel = 'stylesheet';
        toolbarCSS.href = 'https://cdn.jsdelivr.net/npm/markmap-toolbar@0.18.12/dist/style.css';
        document.head.appendChild(toolbarCSS);
      }

      // Initialize markmap with the optimized data from the HTML file
      const markmapData = {
        "content": "Spark Ideathon",
        "children": [
          {
            "content": "About",
            "children": [
              {"content": "Title: Igniting Ideas, Inspiring Innovation", "children": []},
              {"content": "Academic Session: 2025-26", "children": []},
              {"content": "For: 1st and 2nd Year Students", "children": []},
              {"content": "Course: Bachelor of Engineering - CSE", "children": []}
            ]
          },
          {
            "content": "Objectives",
            "children": [
              {"content": "Foster creativity, problem-solving, and innovation", "children": []}
            ]
          },
          {
            "content": "Main Sections",
            "children": [
              {
                "content": "Expert Guidance",
                "children": [
                  {"content": "Mentorship sessions by industry experts & professors", "children": []},
                  {"content": "Insights on problem statements, tools, and technologies", "children": []},
                  {"content": "Guide and inspire participants with clarity and confidence", "children": []}
                ]
              },
              {
                "content": "Coding Contest (Optional)",
                "children": [
                  {
                    "content": "Scoring",
                    "children": [
                      {"content": "Participation in any round: +0.5 mark", "children": []},
                      {"content": "Best in Category: +1 mark", "children": []},
                      {"content": "Overall Topper (2+ categories): +2 marks", "children": []}
                    ]
                  },
                  {
                    "content": "Rounds",
                    "children": [
                      {
                        "content": "Round 1: Web Development Quiz",
                        "children": [
                          {"content": "HTML, CSS, JavaScript basics", "children": []},
                          {"content": "Frameworks and best practices", "children": []}
                        ]
                      },
                      {
                        "content": "Round 2: General Programming Quiz",
                        "children": [
                          {"content": "C, C++, Python concepts", "children": []},
                          {"content": "Data Structures, Algorithms, Debugging", "children": []}
                        ]
                      },
                      {
                        "content": "Round 3: App Development Quiz",
                        "children": [
                          {"content": "Android, iOS, cross-platform basics", "children": []},
                          {"content": "App architecture, UI/UX, APIs", "children": []}
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                "content": "PPT Presentation (Main Evaluation)",
                "children": [
                  {
                    "content": "Scoring (10 Marks)",
                    "children": [
                      {"content": "Problem Understanding & Relevance: 2 marks", "children": []},
                      {"content": "Creativity & Innovation: 3 marks", "children": []},
                      {"content": "Technical Feasibility: 2 marks", "children": []},
                      {"content": "Presentation & Communication: 3 marks", "children": []}
                    ]
                  },
                  {
                    "content": "Required Slides",
                    "children": [
                      {"content": "1. Title Page", "children": []},
                      {"content": "2. Problem Statement", "children": []},
                      {"content": "3. Why This Problem Matters", "children": []},
                      {"content": "4. Proposed Solution", "children": []},
                      {"content": "5. Creativity & Innovation", "children": []},
                      {"content": "6. Target Users/Beneficiaries", "children": []},
                      {"content": "7. Tech Stack/Tools", "children": []},
                      {"content": "8. Implementation Plan", "children": []},
                      {"content": "9. Prototype/Demo", "children": []},
                      {"content": "10. Results/Expected Outcomes", "children": []},
                      {"content": "11. Future Scope & Challenges", "children": []},
                      {"content": "12. Thank You + Contact Info", "children": []}
                    ]
                  },
                  {
                    "content": "Topics (Open Innovation)",
                    "children": [
                      {
                        "content": "Suggested Domains",
                        "children": [
                          {"content": "AI & Machine Learning", "children": []},
                          {"content": "Web3 & Blockchain", "children": []},
                          {"content": "App Development", "children": []},
                          {"content": "Cybersecurity & Privacy", "children": []},
                          {"content": "IoT/Smart Systems", "children": []}
                        ]
                      },
                      {
                        "content": "Example Ideas",
                        "children": [
                          {"content": "AI-Powered Health Assistant", "children": []},
                          {"content": "Blockchain Certificate Verification", "children": []},
                          {"content": "Mental Wellness App", "children": []},
                          {"content": "Smart Waste Management", "children": []},
                          {"content": "Web3 Crowdfunding Platform", "children": []}
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "content": "Team Requirements",
            "children": [
              {"content": "Team size: 3-4 members", "children": []},
              {"content": "Eligible: 1st or 2nd year BE CSE, Chandigarh University", "children": []},
              {"content": "Must nominate one Team Leader", "children": []},
              {"content": "Encourages collaboration and fair participation", "children": []}
            ]
          },
          {
            "content": "Judging & Scoring",
            "children": [
              {"content": "PPT Presentation: Main evaluation (10 marks)", "children": []},
              {"content": "Coding Contest: Optional bonus (up to +2 marks)", "children": []},
              {"content": "Maintains fairness while rewarding innovation and coding", "children": []}
            ]
          },
          {
            "content": "Rewards & Recognition",
            "children": [
              {"content": "Full Day Duty Leave for all participants", "children": []},
              {"content": "E-Certificates for every participant", "children": []},
              {"content": "Category-specific certificates from clubs", "children": []},
              {"content": "Trophies & Certificates for Top 3 Teams", "children": []}
            ]
          },
          {
            "content": "Rules",
            "children": [
              {
                "content": "General Rules",
                "children": [
                  {"content": "Follow PPT Guidelines (12 slides max)", "children": []},
                  {"content": "No plagiarism (leads to disqualification)", "children": []},
                  {"content": "All members must be CU BE CSE students", "children": []},
                  {"content": "One Team Leader for communication", "children": []}
                ]
              },
              {
                "content": "AI Usage Rules",
                "children": [
                  {"content": "AI allowed for idea generation & coding contest", "children": []},
                  {"content": "AI NOT allowed for direct PPT creation", "children": []},
                  {"content": "Prohibited AI tools = disqualification", "children": []},
                  {"content": "Present in own words, customize AI text", "children": []}
                ]
              },
              {
                "content": "Coding Contest Rules",
                "children": [
                  {"content": "Time-limited format", "children": []},
                  {"content": "Fastest and most accurate teams win", "children": []},
                  {"content": "AI allowed but speed determines winner", "children": []}
                ]
              },
              {
                "content": "PPT Presentation Rules",
                "children": [
                  {"content": "Time limit: 5-6 minutes", "children": []},
                  {"content": "Team Leader must present at least once", "children": []},
                  {"content": "Ready for Q&A by judges", "children": []}
                ]
              },
              {
                "content": "Behavioral Rules",
                "children": [
                  {"content": "Respect mentors, organizers, and teams", "children": []},
                  {"content": "Misconduct results in disqualification", "children": []},
                  {"content": "Judges' decision is final", "children": []}
                ]
              }
            ]
          },
          {
            "content": "Contact Information",
            "children": [
              {"content": "Email: spark.ideathon@cumail.com", "children": []},
              {"content": "Phone: +91-XXXXXXXXXX", "children": []},
              {"content": "Website: CUSPARK.live", "children": []},
              {"content": "Organized by: Chandigarh University - Dept. of CSE", "children": []}
            ]
          }
        ]
      };

      if (window.markmap && svgRef.current) {
        // Clear any existing content
        svgRef.current.innerHTML = '';
        
        // Create markmap instance with optimized options
        const mm = window.markmap.Markmap.create(svgRef.current, {
          initialExpandLevel: 2,
          embedAssets: true
        }, markmapData);

        // Add toolbar
        setTimeout(() => {
          if (window.markmap.Toolbar && svgRef.current && svgRef.current.parentElement) {
            const toolbar = new window.markmap.Toolbar();
            toolbar.attach(mm);
            const toolbarElement = toolbar.render();
            toolbarElement.setAttribute("style", "position:absolute;bottom:20px;right:20px");
            svgRef.current.parentElement.appendChild(toolbarElement);
          }
        }, 100);

        // Apply dark theme by default
        document.body.classList.add('mm-dark');
      }
    };

    loadMarkmap();
  }, []);

  return (
    <div className="keymaps">
      <div className="keymaps-content">
        <div className="keymaps-header">
          <h1 className="keymaps-title">Spark Ideathon</h1>
          <p className="keymaps-subtitle">Interactive Knowledge Map</p>
        </div>
        
        <div className="mindmap-container">
          <svg ref={svgRef} className="mindmap-svg" id="mindmap"></svg>
        </div>
        
        <div className="mindmap-controls">
          <span className="control-hint">Click nodes to expand • Use toolbar for controls • Drag to pan</span>
        </div>
      </div>
    </div>
  );
}

export default KeyMaps;
