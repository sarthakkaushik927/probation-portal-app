# Probation Portal App 🚀

Welcome to the **Probation Portal** - the comprehensive mobile application for Next Gen Solutions probation management. 
Built with cutting-edge React Native technologies, this app provides a seamless, beautiful, and fluid experience for both Students and Administrators.

## 📱 Features

### For Students
- **Real-time Dashboard:** Track your attendance, upcoming deadlines, and current probation standing.
- **Task Management:** Submit tasks, track progress, and view feedback directly from admins.
- **Live Notifications:** Get instantly notified via Push Notifications & Pusher WebSockets when your tasks are reviewed or when announcements are made.
- **Dark Mode Support:** Fluid and responsive UI built with NativeWind, supporting system-wide dark and light themes seamlessly.

### For Administrators
- **User Management:** Monitor all student activities, update domain assignments, and manage roles.
- **Task Review Workflow:** Easily view student task submissions, review links (GitHub/Demo), and approve or reject submissions with remarks.
- **Advanced Analytics:** Comprehensive charts (via React Native Chart Kit) to visualize probation performance and domain statistics.
- **CSV Exports:** One-tap export of student data to CSV directly from the app.
- **Live Chat:** Real-time communication channels for different domains (Web, Android, Cloud, etc.)

## 🛠️ Technology Stack
- **Framework:** [Expo](https://expo.dev) / [React Native](https://reactnative.dev)
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **Styling:** [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching:** [TanStack React Query](https://tanstack.com/query/v5) (with AsyncStorage persistence)
- **Animations:** [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) & custom SVG integrations
- **Real-time:** Pusher JS
- **Push Notifications:** Expo Notifications & Firebase Admin (backend)

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- [pnpm](https://pnpm.io/)
- Expo CLI

### Installation

1. Clone the repository and navigate to the app directory:
   ```bash
   cd probation-portal
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Setup environment variables:
   Create a `.env` file in the root directory and add the necessary keys (API URLs, Pusher keys).

4. Start the development server:
   ```bash
   pnpm run start
   ```

### Building for Android

For local Android builds (if running into path length limitations on Windows), we recommend using npm with hoisted linker configuration or keeping the project on a top-level directory:

```bash
npx expo prebuild --platform android --clean
cd android
./gradlew assembleRelease
```

## 🎨 Design System
The application utilizes a custom design system with:
- Glassmorphism effects (`GlassCard`)
- Premium animated backgrounds (`Background.tsx`)
- Contextual domain color coding
- Interactive micro-animations for UX delight

## 📄 License
Internal use only. Next Gen Solutions.
