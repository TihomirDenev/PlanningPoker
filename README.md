<div align="center">
<h1> 🎯 Planning Poker </h1>
<br/>
  <img src="public/og-image.png" alt="JJ Logo" style="height: 250px; margin: 0rem;" />
  <br/>
  <h3>A real-time, multiplayer estimation tool for agile teams</h3>
  <a href="https://planning-poker-beta.vercel.app/" target="_blank">🌐 Live Demo</a>
  <br/>
  <br/>
  <img src="https://img.shields.io/badge/Angular-18.2.0-red.svg" alt="Angular Version"/>
  <img src="https://img.shields.io/badge/TypeScript-5.5.2-blue.svg" alt="TypeScript Version"/>
  <img src="https://img.shields.io/badge/Firebase-9.23.0-orange.svg" alt="Firebase Version"/>
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License"/>
</div>

## 📝 Description

**Planning Poker** is a modern, real-time multiplayer estimation tool designed for agile development teams. Built with Angular 18 and Firebase, it provides an intuitive interface for story point estimation with live collaboration features.

### Key Benefits:

- ⚡ **Real-time collaboration** - See votes and player activity instantly
- 🎨 **Modern UI** - Clean, responsive design with playful elements
- 🔧 **Customizable** - Create custom voting card sets
- 📱 **Mobile-friendly** - Works seamlessly across all devices
- 🚀 **Fast performance** - Optimized for quick estimation sessions

## ✨ Features

🏠 **Lobby System**

- Quick access to Create Room, Join Room, or view All Active Rooms
- Real-time room list with player counts
- Intuitive navigation between different actions

🎮 **Room Management**

- **Create Room**: Set up new estimation sessions with custom or default voting cards
- **Join Room**: Quick room entry with name and room identifier
- **All Rooms**: Live overview of all active sessions

🗳️ **Voting System**

- Select or remove votes with one click
- Real-time vote visibility and player status
- Reveal all votes simultaneously
- Clear votes for new rounds
- Live player list with voting status

🔄 **Real-time Updates**

- Instant synchronization across all connected users
- Live player activity indicators
- Real-time room list updates
- Automatic vote count updates

## 🛠️ Technologies

### **Frontend**

- **Angular 18.2.0** - Modern SPA framework
- **TypeScript 5.5.2** - Type-safe JavaScript
- **SCSS** - Advanced CSS preprocessing
- **PrimeNG 17.0.0** - UI component library
- **PrimeIcons 7.0.0** - Icon library

### **Backend & Services**

- **Firebase 9.23.0** - Real-time database & hosting
- **Firestore** - NoSQL cloud database
- **Angular Fire 7.6.1** - Firebase integration

### **Development Tools**

- **Angular CLI 18.2.1** - Development and build tools
- **RxJS 7.8.0** - Reactive programming

## 📁 Project Structure

```
src/
├── app/
│   ├── pages/                # Application pages
│   │   ├── lobby/            # Main lobby page
│   │   ├── create-room/      # Room creation
│   │   ├── join-room/        # Room joining
│   │   ├── room/             # Main voting room
│   │   ├── all-rooms/        # Room listing
│   │   ├── cleanup/          # Data cleanup
│   │   └── not-found/        # 404 page
│   ├── shared/               # Shared components & services
│   │   ├── services/         # Business logic services
│   │   ├── models/           # TypeScript interfaces
│   │   ├── utils/            # Utility functions
│   │   ├── constants/        # Application constants
│   │   └── styles/           # Shared styles
│   ├── app.component.*       # Root component
│   ├── app.routes.ts         # Application routing
│   └── app.config.ts         # Application configuration
├── environments/             # Environment configurations
└── main.ts                   # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Angular CLI** (v18.2.1)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/TihomirDenev/PlanningPoker.git
   cd PlanningPoker
   ```

2. **Install dependencies**

   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start development server**

   ```bash
   npm run start
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

## 🔧 Environment Setup

### Firebase Configuration

1. **Create a Firebase project** at [Firebase Console](https://console.firebase.google.com/)

2. **Enable Firestore Database** in your Firebase project

3. **Get your Firebase config** from Project Settings > General > Your apps

4. **Update environment files**:
   ```typescript
   // src/environments/environment.ts
   export const environment = {
     production: false,
     firebase: {
       apiKey: "your-api-key",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "your-sender-id",
       appId: "your-app-id",
     },
   };
   ```

### Environment Files

- `environment.ts` - Development configuration
- `environment.prod.ts` - Production configuration

## 🎮 How It Works

### User Flow

1. **Lobby**: Users land on the main lobby page
2. **Room Creation/Joining**: Choose to create or join a room
3. **Voting Session**: Participate in real-time estimation
4. **Results**: Reveal and discuss vote results

### Real-time Features

- **WebSocket-like updates** via Firebase Firestore
- **Live player tracking** with online/offline status
- **Instant vote synchronization** across all participants
- **Room state management** with automatic cleanup

### Data Flow

```
User Action → Angular Service → Firebase Firestore → Real-time Updates → All Connected Users
```

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Angular Team** for the amazing framework
- **Firebase Team** for real-time database services
- **PrimeNG Team** for the UI component library
- **Open Source Community** for inspiration and tools

---

<div align="center">
  <p>Made with ❤️ for agile teams everywhere</p>
  <p>
    <a href="https://github.com/TihomirDenev/PlanningPoker/issues">Report Bug</a>
    ·
    <a href="https://github.com/TihomirDenev/PlanningPoker/issues">Request Feature</a>
  </p>
</div>
