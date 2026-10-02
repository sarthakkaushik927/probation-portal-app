# CCC Probation Portal — Product Requirements Document

## 1. Overview

**App Name**: CCC_Probation  
**Package**: `com.nextgen.portal`  
**Platform**: Android (primary), Web (secondary), iOS (planned)  
**Stack**: React Native (Expo SDK 53) + Express.js + PostgreSQL + Prisma  

---

## 2. Core Features

### 2.1 Authentication
- Email/password signup with OTP email verification
- Login with JWT token-based auth
- Forgot password flow (OTP → reset)
- Role-based access: **ADMIN** and **USER**
- Push token registration on login for Expo notifications

### 2.2 Admin Dashboard
- Overview statistics: total users, active tasks, pending/approved/rejected submissions
- Live charts from real data (not hardcoded)
- Quick-action cards for navigation

### 2.3 Task Management

#### Individual Tasks
- Create tasks with title, description, domain, deadline, and optional PDF attachment
- Tasks are assigned to users by domain (FRONTEND, BACKEND, APP, UIUX, CLOUD, ML, COMMON)
- COMMON domain tasks go to all users

#### Team Tasks (v1.5.0+)
- Create tasks with team name, title, description, domain, deadline
- Autocomplete member search with chip-based selector
- Assign specific users to the task
- Team members share a single **TeamSubmission** with:
  - Custom-named links (e.g., "GitHub Repo", "Figma Design", "Deployed App")
  - Multiple links with add/remove
  - Attachments (file upload via Cloudinary)
- All team members see real-time updates when any member adds/removes links

### 2.4 Submissions
- **Individual**: Each user submits GitHub link + demo/deployed link + optional remarks
- **Team**: Shared submission with synced custom-named links across all members
- Status: PENDING → APPROVED / REJECTED
- Admin can review, approve, reject with notifications sent to users

### 2.5 Attendance
- Admin marks daily attendance (PRESENT, ABSENT, LEAVE)
- User sees their attendance calendar with stats (present %, absent, leaves)
- CSV export for admin

### 2.6 Notifications
- In-app notification center with read/unread
- Push notifications via Expo for:
  - Task assignment (individual & team)
  - Submission status changes (approved/rejected)
  - Attendance marking
  - Team link updates
- Real-time via Pusher channels (`user-{id}`)
- Broadcast notifications from admin

### 2.7 Chat
- Global chat room for all users
- Message with optional attachments
- @mentions with real-time toast notifications

### 2.8 Discussion Threads
- Per-submission discussion threads
- Comment system for admin-user communication on submissions

---

## 3. Domain/Domain System

| Domain   | Description                |
|----------|----------------------------|
| FRONTEND | Frontend development tasks |
| BACKEND  | Backend development tasks  |
| APP      | Mobile app tasks           |
| UIUX     | UI/UX design tasks         |
| CLOUD    | Cloud/DevOps tasks         |
| ML       | Machine learning tasks     |
| COMMON   | Assigned to all users      |

---

## 4. User Roles

### Admin
- Full CRUD on tasks, users, submissions
- Attendance management
- CSV exports (users, attendance, submissions)
- Broadcast notifications
- Team task management (add/remove members)

### User
- View assigned tasks (individual by domain + team by assignment)
- Submit links for individual tasks
- Collaborate on team task links
- View attendance
- Global chat access
- Profile management (name, avatar, password)

---

## 5. Tech Architecture

### Frontend
- **Framework**: Expo SDK 53 with expo-router (file-based routing)
- **Styling**: NativeWind (TailwindCSS for RN)
- **State**: Zustand (auth store), React Query (server state)
- **Realtime**: Pusher-js client
- **Navigation**: Custom animated tab bar with blur effects

### Backend
- **Runtime**: Node.js + Express.js
- **ORM**: Prisma with PostgreSQL
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Realtime**: Pusher server-side + Socket.IO fallback
- **Push**: Expo Push Notifications
- **Hosting**: Vercel (serverless)

### Database Models
- User, Task, TaskAssignment, Submission, TeamSubmission, Comment
- Attendance, Notification, OTP, Message

---

## 6. Version History

| Version | versionCode | Changes |
|---------|-------------|---------|
| 1.0.0   | 1           | Initial release |
| 1.4.3   | 7           | Bug fixes, discussion threads, CSV exports |
| 1.5.0   | 8           | Team tasks, custom links, R8 obfuscation, Firebase update, Pusher everywhere, orientation fix |
