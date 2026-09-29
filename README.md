# CAMPUSCONNECT – COLLEGE COMMUNITY PORTAL

**CampusConnect** is a centralized, digital academic and community management portal designed for higher-education institutions. It seamlessly unites **Students**, **Faculty Mentors**, **Class Advisors**, and **Administrators** under a role-governed digital ecosystem.

---

## 1. Project Overview & Core Modules

CampusConnect integrates fragmented collegiate systems into one unified platform:

- **Authentication & Multi-Role Access Control**: Unified login screen with automatic sub-role detection for Faculty (`mentor` vs `advisor`).
- **Student Profile & Document Vault**: Profile management with document verification status (10th, 12th marksheet, internship certificates).
- **Multi-Tier On-Duty (OD) Management**:
  - *Tier 1*: College Administrative verification
  - *Tier 2*: Assigned Faculty Mentor approval
  - *Tier 3*: Class Advisor record & attendance exemption
- **Mentor-Mentee System & Office Hours**:
  - Mentee directory and individual portfolios
  - Mentors publish consultation slots
  - Students request meetings (Online / In-Person)
  - Post-meeting counselling feedback logs with mentor suggestions and follow-up tracking
- **Class Advisor Cohort Console**:
  - Cohort analytics (Year & Section)
  - Attendance audits with shortfall warnings (< 75%)
  - Hosteller vs. Day Scholar demographics & bus routes
  - Approved OD registers
- **Academic Management**:
  - Subject-wise internal marks (40) and semester marks (60)
  - SGPA, cumulative CGPA, and backlog registers
  - Subject-wise lecture attendance tracking
- **Learning Management System (LMS)**:
  - Course curriculum & syllabus modules
  - Downloadable study resources, lecture notes, and lab manuals
- **Online Timed MCQ Assessments**:
  - Automated scoring engine
  - Live countdown timer
  - Answer evaluation report with explanations
- **Career & Placement Drive Tracker**:
  - Upcoming and ongoing recruitment drives
  - Stage tracking: `Applied` → `Shortlisted` → `Aptitude Round` → `Technical Round` → `HR Round` → `Selected`
- **Campus Societies, Events & Announcements**:
  - Club charters & student membership
  - Flagship symposiums, hackathons & guest lectures
  - Priority-tiered announcements with target audience routing
- **Notification Center**: Real-time alerts for OD approvals, meeting confirmations, and drive selections.

---

## 2. Technology Stack

- **Frontend**:
  - React.js (TypeScript SPA with Vite)
  - React Router DOM
  - Axios for centralized API communication
  - Lucide React icon suite
  - Modern CSS & Tailwind CSS utilities
- **Backend**:
  - Node.js & Express.js
  - RESTful API architecture
  - Multer for secure multipart document uploads
  - JWT (JSON Web Tokens) & Bcrypt password hashing
- **Database**:
  - MongoDB & Mongoose-compatible persistent data store with atomic disk synchronization
- **Security**:
  - Strict role-based & faculty sub-role access control
  - Bearer token authentication

---

## 3. Project Architecture

```
CampusConnect/
│
├── frontend/ (src/)
│   ├── assets/
│   ├── components/
│   │   └── common/ (Navbar, Sidebar, StatusBadge, Modal, etc.)
│   ├── layouts/ (MainLayout, ProtectedRoute)
│   ├── pages/
│   │   ├── auth/ (Unified Login)
│   │   ├── student/ (Dashboard, Profile, Mentor, OD, Academics, LMS, Placement, etc.)
│   │   ├── faculty/
│   │   │   ├── mentor/ (Dashboard, Mentees, OD, Meetings, Counselling, Slots, etc.)
│   │   │   └── advisor/ (Dashboard, Students, Attendance, Academics, OD, Placement)
│   │   └── admin/ (Dashboard, Users, Mentor Mapping, Advisor Mapping, OD, Placements, LMS, etc.)
│   ├── services/ (api.ts - Axios client & service functions)
│   ├── context/ (AuthContext.tsx)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── backend/
│   ├── config/ (db.ts)
│   ├── controllers/ (auth, student, mentor, advisor, od, document, lms, placement, etc.)
│   ├── middleware/ (auth.ts, upload.ts)
│   ├── models/ (User, StudentProfile, FacultyProfile, ODRequest, Assessment, Course, etc.)
│   ├── routes/ (authRoutes, studentRoutes, mentorRoutes, advisorRoutes, odRoutes, etc.)
│   ├── utils/ (seed.ts)
│   └── uploads/ (documents, od, lms)
│
├── server.ts
├── package.json
└── README.md
```

---

## 4. Role Hierarchy & Sub-Role Structure

There are **three main roles**:
1. **Student**
2. **Faculty**
   - *Sub-Role 1*: **Faculty Mentor**
   - *Sub-Role 2*: **Class Advisor**
3. **Administrator**

When logging in through the unified login portal as **Faculty**, the backend automatically examines the user's `facultyType` and routes:
- `facultyType: 'mentor'` → `/faculty/mentor/dashboard`
- `facultyType: 'advisor'` → `/faculty/advisor/dashboard`

---

## 5. Demo Evaluator Credentials

All demo accounts use the standard password: **`password123`**

| Role | Email | Register No / ID | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@campusconnect.com` | `ADM-001` | Full administrative control, user provisioning, mapping, tier-1 OD verification |
| **Student** | `student@campusconnect.com` | `717822P101` | Dashboard, OD application, meeting booking, counselling, assessments, placement |
| **Faculty Mentor** | `mentor@campusconnect.com` | `FAC-CSE-014` | Mentee roster, OD tier-2 approval, consultation scheduling, counselling feedback |
| **Faculty Advisor** | `advisor@campusconnect.com` | `FAC-CSE-009` | Class cohort roster (CSE 3-A), attendance shortfall alerts, approved OD register |

*(Note: The login page includes 1-click quick login buttons for all 4 profiles for instant testing.)*

---

## 6. Installation & Run Commands

### Development Setup
```bash
# 1. Install all dependencies
npm install

# 2. Run full-stack dev server (starts Express API & Vite dev server on port 3000)
npm run dev

# 3. Production Build
npm run build
```

---

## 7. Environment Variables

Create `.env` based on `.env.example`:
```env
PORT=3000
JWT_SECRET=campusconnect_jwt_super_secure_college_secret_key_2026
VITE_API_URL=/api
MONGO_URI=mongodb://localhost:27017/campusconnect
```
