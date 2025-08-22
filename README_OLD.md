Spark Ideathon: Complete Overview
The 

Spark Ideathon is a hackathon-style competition for the 2025-26 academic session, organized by the Department of CSE at Chandigarh University. It's designed specifically for 


1st and 2nd-year Bachelor of Engineering (CSE) students to encourage creativity, innovation, and problem-solving.




Event Structure and Evaluation
The event is broken down into three main parts, with a clear focus on the presentation of ideas.


Expert Guidance: Mentorship sessions with industry experts and university professors will be held to help teams refine their ideas and understand the necessary tools and technologies.



PPT Presentation (Main Evaluation): This is the core of the competition and is worth 10 marks. Teams are judged on their PowerPoint presentation based on the following criteria:




Problem Understanding & Relevance: 2 marks 


Creativity & Innovation: 3 marks 


Technical Feasibility / Implementation: 2 marks 


Presentation & Communication: 3 marks 


Coding Contest (Optional): This is an optional, quiz-based contest with multiple-choice questions designed to award bonus marks. The contest has three rounds: Web Development, General Programming, and App Development. The bonus marks are awarded as follows:






Participation in any round: +0.5 marks 



Best in one category (e.g., Web, App, or General): +1 mark 



Overall Topper (best in at least two categories): +2 marks 


The total score is 

capped at 10, meaning these are bonus points to help teams reach the maximum score.

Team and Presentation Requirements
To ensure fair participation, all teams must adhere to specific guidelines.

Team Composition:

Teams must have a minimum of 

3 and a maximum of 4 members.

All members must be 1st or 2nd-year BE CSE students at Chandigarh University.


Each team must designate one person as the 

Team Leader for communication purposes.


Presentation (PPT) Guidelines:

The presentation must be a maximum of 

12 slides.


The presentation must include specific slides such as a Title Page, Problem Statement, Proposed Solution, Tech Stack, and Future Scope, among others.





Teams are free to choose their own problem statement under the theme of "Open Innovation," with suggested domains like 

AI/ML, Web3, IoT, and Cybersecurity.

Key Rules and Policies

Plagiarism: Copying content or ideas from other teams will lead to immediate disqualification.

AI Usage:


Allowed 👍: AI can be used for brainstorming ideas and as support during the coding contest.




Not Allowed 👎: Using AI tools like Gamma or Canva's pre-made templates to directly create the final PPT is strictly forbidden and will result in disqualification. All presented content must be customized and in the team's own words.



Conduct: All participants are expected to be respectful, and any misconduct will lead to disqualification. The judges' decisions are final.


Rewards and Recognition 🏆
All participants will receive a 

Full Day Duty Leave (DL) and E-Certificates.

The 

Top 3 Teams will be awarded trophies and certificates.

There may be category-specific certificates for winners of the coding contest, to be confirmed by respective clubs.

Website Project Structure
To support the Spark Ideathon, a website (

CUSPARK.live ) would be essential. Here is a proposed structure for its pages and the reusable components needed to build them.

Pages
Home Page (/)

The main landing page to attract and inform visitors.

Components: Navbar, HeroSection (with event title, dates, and a "Register Now" Button), AboutSummary (briefly explaining the event), TimelineSection, PrizesSection, SponsorsSection, Footer.

Detailed Rules & Guidelines Page (/rules)

A comprehensive page listing all rules to avoid confusion.

Components: Navbar, Rulebook (with sections for General, PPT, AI Usage, and Coding Contest rules), FAQ (using an Accordion component), Footer.

Schedule / Timeline Page (/schedule)

A dedicated page for the event timeline.

Components: Navbar, TimelineComponent (a visual representation of event dates like registration deadlines, mentorship sessions, presentation day, etc.), Footer.


Registration Page (/register)

A form for teams to register for the event.

Components: Navbar, RegistrationForm, Footer.

Login Page (/login)

For registered teams to access their dashboard.

Components: Navbar, LoginForm, Footer.

Team Dashboard (/dashboard)

A protected area for registered teams.

Components: Navbar, DashboardLayout (containing a TeamPanel to view/edit members, a SubmissionPanel with a FileUpload component for the PPT, and an Announcements section), Footer.

Reusable Components
Navbar: The site's main navigation bar with links to Home, Rules, Schedule, and a "Register/Login" Button.

Footer: The site's footer containing contact information, social media links, and quick links.

HeroSection: A large, attention-grabbing section for the top of the Home page.

Button: A reusable button component with consistent styling for calls-to-action (e.g., "Register Now", "Submit", "Login").

ProfileCard: A card to display a picture, name, and brief bio for mentors and judges.

Accordion: A collapsible item used for the FAQ section to show and hide answers.

TimelineComponent: A visual element to display the sequence of event milestones.

RegistrationForm / LoginForm: Forms for user input with validation.

FileUpload: A component allowing users to upload their PPT files in the dashboard.

Modal: A pop-up component for confirmations, alerts, or displaying additional information.