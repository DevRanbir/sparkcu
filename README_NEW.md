# 🚀 SparkCU - Chandigarh University Ideathon Platform

[![React](https://img.shields.io/badge/React-18.0+-blue.svg)](https://reactjs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-Latest-blue.svg)](https://www.w3.org/Style/CSS/)

A modern web platform for the **Spark Ideathon 2025-26** - A hackathon-style competition organized by the Department of CSE at Chandigarh University, designed specifically for 1st and 2nd-year Bachelor of Engineering (CSE) students to encourage creativity, innovation, and problem-solving.

## 🌟 Event Overview

### 📋 Event Details
- **Target Audience**: 1st and 2nd-year BE CSE students at Chandigarh University
- **Theme**: Open Innovation
- **Suggested Domains**: AI/ML, Web3, IoT, Cybersecurity
- **Website**: [CUSPARK.live](https://CUSPARK.live)

### 🏗️ Event Structure

The Spark Ideathon consists of three main components:

#### 1. 👨‍🏫 Expert Guidance
- Mentorship sessions with industry experts and university professors
- Help teams refine ideas and understand necessary tools and technologies

#### 2. 📊 PPT Presentation (Main Evaluation - 10 marks)
Core competition component with evaluation criteria:
- **Problem Understanding & Relevance**: 2 marks
- **Creativity & Innovation**: 3 marks  
- **Technical Feasibility / Implementation**: 2 marks
- **Presentation & Communication**: 3 marks

#### 3. 💻 Coding Contest (Optional Bonus)
Quiz-based contest with multiple-choice questions across three rounds:
- **Web Development**
- **General Programming** 
- **App Development**

**Bonus Scoring**:
- Participation in any round: +0.5 marks
- Best in one category: +1 mark
- Overall Topper (best in 2+ categories): +2 marks
- *Total score capped at 10 marks*

## 👥 Team Requirements

### Team Composition
- **Size**: Minimum 3, Maximum 4 members
- **Eligibility**: All members must be 1st or 2nd-year BE CSE students at Chandigarh University
- **Leadership**: Each team must designate one Team Leader for communication

### 📋 Presentation Guidelines
- **Maximum**: 12 slides
- **Required Slides**: Title Page, Problem Statement, Proposed Solution, Tech Stack, Future Scope
- **Theme**: Open Innovation (teams choose their own problem statement)

## 📏 Rules and Policies

### ❌ Prohibited Actions
- **Plagiarism**: Copying content or ideas from other teams → Immediate disqualification
- **AI Misuse**: Using AI tools (Gamma, Canva templates) to directly create final PPT → Disqualification

### ✅ Allowed AI Usage
- Brainstorming ideas
- Support during coding contest
- *All presented content must be customized and in team's own words*

### 🤝 Conduct
- Respectful behavior expected from all participants
- Misconduct leads to disqualification
- Judges' decisions are final

## 🏆 Rewards and Recognition

### For All Participants
- 📅 Full Day Duty Leave (DL)
- 📜 E-Certificates

### Top Performers
- 🥇🥈🥉 **Top 3 Teams**: Trophies and certificates
- 🏅 **Category Winners**: Coding contest certificates (subject to club confirmation)

## 🖥️ Website Architecture

### 📄 Core Pages (5 Pages)

#### 1. 🏠 **Home Page** (`/`)
**Purpose**: Main landing page to attract and inform visitors
**Components**:
- Navbar
- HeroSection (event title, dates, "Register Now" button)
- AboutSummary (brief event explanation)
- TimelineSection
- PrizesSection
- SponsorsSection
- Footer

#### 2. 📖 **Rules & Guidelines** (`/rules`)
**Purpose**: Comprehensive rules listing to avoid confusion
**Components**:
- Navbar
- Rulebook (General, PPT, AI Usage, Coding Contest rules)
- FAQ (Accordion component)
- Footer

#### 3. 📅 **Schedule/Timeline** (`/schedule`)
**Purpose**: Dedicated event timeline page
**Components**:
- Navbar
- TimelineComponent (visual event dates representation)
- Footer

#### 4. 📝 **Registration** (`/register`)
**Purpose**: Team registration form
**Components**:
- Navbar
- RegistrationForm
- Footer

#### 5. 👤 **Team Dashboard** (`/dashboard`)
**Purpose**: Protected area for registered teams
**Components**:
- Navbar
- DashboardLayout
  - TeamPanel (view/edit members)
  - SubmissionPanel (FileUpload for PPT)
  - Announcements section
- Footer

### 🧩 Reusable Components

#### Navigation & Layout
- **Navbar**: Main navigation with links to all pages
- **Footer**: Contact info, social media links, quick links
- **Modal**: Pop-ups for confirmations, alerts, additional info

#### Content Components
- **HeroSection**: Large attention-grabbing homepage section
- **Button**: Consistent styling for CTAs ("Register Now", "Submit", "Login")
- **ProfileCard**: Display mentor/judge pictures, names, bios
- **Accordion**: Collapsible FAQ items
- **TimelineComponent**: Visual event milestone sequence

#### Form Components
- **RegistrationForm**: User registration with validation
- **LoginForm**: Team login with validation
- **FileUpload**: PPT file upload in dashboard

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/sparkcu.git

# Navigate to project directory
cd sparkcu

# Install dependencies
npm install

# Start development server
npm start
```

### Available Scripts

- **`npm start`**: Runs the app in development mode at [http://localhost:3000](http://localhost:3000)
- **`npm test`**: Launches the test runner in interactive watch mode
- **`npm run build`**: Builds the app for production to the `build` folder
- **`npm run eject`**: Ejects from Create React App (⚠️ one-way operation)

## 📁 Project Structure

```
sparkcu/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── ...
├── src/
│   ├── components/
│   │   ├── Sidebar/
│   │   ├── Navbar/
│   │   ├── Footer/
│   │   ├── HeroSection/
│   │   ├── TimelineComponent/
│   │   └── ...
│   ├── pages/
│   │   ├── Homepage/
│   │   ├── Rules/
│   │   ├── Schedule/
│   │   ├── Registration/
│   │   └── Dashboard/
│   ├── App.js
│   ├── App.css
│   └── index.js
├── package.json
└── README.md
```

## 🛠️ Technologies Used

- **Frontend**: React.js, CSS3, HTML5
- **Styling**: CSS Modules, Flexbox, Grid
- **Icons**: SVG Icons
- **Build Tool**: Create React App
- **Version Control**: Git

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Contact

- **Event Organizers**: Department of CSE, Chandigarh University
- **Website**: [CUSPARK.live](https://CUSPARK.live)
- **Project Repository**: [GitHub Repository](https://github.com/your-username/sparkcu)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>🎯 Empowering Innovation at Chandigarh University</strong><br>
  Made with ❤️ for the Spark Ideathon 2025-26
</div>
