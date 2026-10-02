# 01. Complete Project Overview

## Application Information
**Name**: CCC Probation Portal
**Package ID**: `com.nextgen.portal`
**Version Name**: `1.5.0` *(Must bump for Play Store uploads)*
**Version Code**: `8` *(Must increment by +1 for Play Store uploads)*

## Architecture
This is a **Monorepo** consisting of two main pieces:
1. **Frontend App (`probation-portal`)**: A React Native mobile app built using Expo SDK 53 with file-based routing (`expo-router`).
2. **Backend API (`probation-portal-api`)**: A Node.js + Express.js API using Prisma ORM connected to a PostgreSQL database.

## Core Features & Logic
* **Authentication**: JWT-based login + OTP email verification via Nodemailer. Expo Push Tokens are registered on login.
* **Roles**: `ADMIN` and `USER`.
* **Tasks**:
  * **Individual Tasks**: Assigned based on domain (`FRONTEND`, `BACKEND`, etc.) or `COMMON`.
  * **Team Tasks**: Admin explicitly selects multiple users and assigns them a Team Name.
* **Submissions**:
  * **Individual**: Submit a single GitHub link and Demo link.
  * **Team**: Collaborative JSON link array. Any member can add custom-named links (e.g. "Figma", "Live Demo").
* **Realtime Services**:
  * **Pusher**: Server sends events (`submission-status`, `task-assigned`, etc.) to specific `user-{id}` channels. The React Native app listens and invalidates React Query caches instantly.
  * **Expo Push Notifications**: Standard OS-level notifications for offline users.
* **Attendance**: Admins mark users Present/Absent/Leave. Users see stats.

## Development Workflows

**Starting the Frontend (Local Dev):**
```powershell
cd probation-portal
yarn start
```
*(Press `a` to open in Android Emulator)*

**Starting the Backend (Local Dev):**
```powershell
cd probation-portal-api
npm run dev
```

**Syncing Database Schema (Prisma):**
Whenever you modify `schema.prisma`:
```powershell
cd probation-portal-api
npx prisma db push
npx prisma generate
```
*(Important: If VS Code shows TS errors after this, press `Ctrl+Shift+P` -> `Developer: Reload Window`)*
