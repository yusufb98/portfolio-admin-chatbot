# YusuPortfolyo - Project Documentation

## Overview

This project is a modern, minimal, and professional portfolio website that includes an admin panel and an interactive chatbot. It is built around a Robotics & Computer Vision themed profile.

## Design Philosophy

- **Minimal & Professional** - No glassmorphism, clean lines
- **Neutral Color Palette** - Black/white/gray tones with an emerald accent
- **Smooth Animations** - Precise transitions with Framer Motion
- **Responsive** - Works across all screen sizes

## Tech Stack

### Backend
- **Node.js** - Runtime
- **Express.js** (v4.18.2) - Web framework
- **better-sqlite3** - SQLite database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **multer** - File uploads

### Frontend
- **React 18** - UI framework
- **Vite 5** - Build tool
- **Tailwind CSS 3.4** - Styling (minimal neutral theme)
- **Framer Motion** - Animations
- **Zustand** - State management
- **React Router v6** - Routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **React Icons** - Icons

## Project Structure

```
YusuPortfolyo/
├── client/                 # Frontend React app
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # UI components
│   │   │   └── Chatbot/   # Chatbot widget
│   │   ├── pages/         # Pages
│   │   │   └── admin/     # Admin panel pages
│   │   ├── services/      # API services
│   │   ├── store/         # Zustand store
│   │   ├── App.jsx        # Main app
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styling system
│   ├── tailwind.config.js # Tailwind configuration
│   └── package.json
├── server/                 # Backend Node.js app
│   ├── database/          # Database
│   │   ├── db.js          # Connection
│   │   └── init.js        # Schema & seed
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   ├── uploads/           # Uploaded files
│   ├── server.js          # Entry point
│   └── package.json
├── docs/                   # Documentation
│   ├── README.md          # This file
│   ├── DESIGN_SYSTEM.md   # Design system
│   ├── endpoints/         # API endpoint docs
│   └── modules/           # Module notes
└── package.json           # Root package
```

## Features

### Public Site
- ✅ Hero section (typing animation, grid pattern background)
- ✅ About section (profile information, contact cards)
- ✅ Skills (category filtering, progress bar animation)
- ✅ Projects (filtering, detail modal, previous/next navigation)
- ✅ Contact form (validation, toast notifications)
- ✅ Footer (quick links, back-to-top button)
- ✅ Dark/Light theme switch (animated toggle)
- ✅ Smooth scroll navigation
- ✅ SEO optimization (dynamic page title)
- ✅ Responsive minimal design
- ✅ CV download

### Admin Panel
- ✅ Secure login with JWT authentication
- ✅ Dashboard (stats, recent messages, quick actions)
- ✅ Profile management (avatar, CV upload)
- ✅ Project management (CRUD, ordering, featuring)
- ✅ Skill management (CRUD, categorization)
- ✅ Chatbot management (settings, Q&A)
- ✅ Message management (read, delete)
- ✅ Site settings (page title, change password, SEO, theme)

### Chatbot
- ✅ Keyword-based responses
- ✅ Welcome message
- ✅ Fallback message
- ✅ Typing indicator (bounce animation)
- ✅ Message history
- ✅ Reset chat
- ✅ Configurable from admin panel

## Installation

```bash
# In the root directory
npm install

# Server dependencies
cd server && npm install

# Client dependencies
cd ../client && npm install
```

## Running

### Development
```bash
# Server (port 5000)
cd server && npm run dev

# Client (port 5173)
cd client && npm run dev
```

### Production
```bash
# Build
cd client && npm run build

# Start
cd ../server && npm start
```

## Default Login Credentials

- **Username:** admin
- **Password:** admin123

⚠️ Don’t forget to change the password in production!

## Environment Variables

`server/.env` file:
```
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

## Lisans

MIT
