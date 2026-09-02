# Aara — Web Player & Streaming Music App

A modern music streaming and discovery web application built with React, Vite, Express, and Jamendo Music API integration.

![Aara Banner](https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80)

---

## 🌟 Key Features

### 🎧 Seamless Streaming & Playback Engine
- **Global Persistent Player Bar**: Uninterrupted playback across page transitions, search queries, and library management.
- **Full Playback Controls**: Play, pause, progress scrubbing, duration display, volume control, mute, next/previous tracks, repeat (off / all / one), and queue shuffle.
- **Hardware & Lockscreen Media Session Integration**: Full support for OS-level lockscreens, Bluetooth displays, smartwatches, and native media keys (`navigator.mediaSession`).
- **Global Keyboard Shortcuts**:
  - `Space`: Play / Pause playback (guarded against active search/input fields).
  - `ArrowLeft` / `ArrowRight`: Seek 5s backward / forward.
  - `ArrowUp` / `ArrowDown`: Volume up / down (5% increments).
  - `M`: Instant Mute / Unmute.
  - `N` / `P`: Next / Previous track.
  - `L`: Like / Unlike currently playing track.

### 🔒 Auth-Gated Listening Experience
- **Song Poster Sign-Up Dialog**: Unauthenticated users attempting to play any track are greeted with a customized modal displaying the track's album poster, track name, artist info, and actions to **Sign up free**, **Download app**, or **Log in**.
- **Auto-Resume Playback**: Automatically begins playing the requested track as soon as the user logs in or registers.

### 🌐 Exploration & Discovery Hub
- **Explore (`/`)**: Personalized home feed with time-aware greetings (*Good morning / afternoon / evening*), trending mixes, top artists, and recommended albums.
- **Browse (`/browse`)**: 12+ sonic genres (*Pop Hits*, *Chill & Lo-Fi*, *EDM*, *Rock*, *Ambient*, *Jazz*, etc.), mood filters (*Focus*, *Workout*, *Party*, *Night Drive*), decades (*80s*, *90s*, *2000s*, *Modern*), and an in-place category drawer player.
- **Live Streams (`/live`)**: 24/7 continuous themed radio stations (*Aara Lo-Fi 24/7*, *Neon Horizons Synthwave*, *Midnight Velvet Jazz*, *Deep Focus*, etc.) with live listeners counter, animated visualizers, emoji reaction particles, and scheduled broadcast reminders.
- **Search (`/search`)**: Real-time debounced search by track title, artist, album, and genres with instant suggestions and history.

### 📚 User Library & Custom Playlists
- **Liked Songs**: Quick-add favorites with instant sync and local fallback persistence.
- **Custom Playlists**: Create, name, re-order, and delete personal playlists with custom descriptions.
- **Recently Played**: Automatic track history tracking.
- **Jamendo Attribution & Licensing**: Direct Creative Commons license inspection links and artist source attribution for every track.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Lucide / FontAwesome Icons, Vanilla CSS Design System with dark-mode aesthetic.
- **Backend / Proxy**: Node.js, Express, Axios.
- **Music API**: Jamendo Music API v3.0 (`audioformat=mp32`, `include=musicinfo`).
- **PWA Ready**: `manifest.json`, SVG application icons, and standalone mobile viewport optimization.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or newer)
- npm or bun

### 2. Environment Configuration
Create a `.env` file in the root directory based on `.env.example`:

```env
PORT=3000
NODE_ENV=development
JAMENDO_CLIENT_ID=your_jamendo_client_id_here
```

### 3. Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run Oxlint validation
npm run lint

# Build production bundle
npm run build
```

---

## 📂 Project Architecture

```text
├── client/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/                     # Login & Signup pages
│   │   │   ├── BrowseView/               # Genre & Decades Explorer
│   │   │   ├── Header/                   # Search bar, navigation & user profile
│   │   │   ├── LeftSidebar/              # Library navigation & playlists
│   │   │   ├── LiveView/                 # 24/7 Live Radio Stations
│   │   │   ├── MainContent/              # Explore & Discovery Home Feed
│   │   │   ├── PlayerBar/                # Global audio player & track controls
│   │   │   ├── PlaylistView/             # Custom playlist manager
│   │   │   ├── PremiumView/              # Premium subscription overview
│   │   │   ├── SearchView/               # Search catalog & results
│   │   │   └── SongAuthPosterModal/      # Auth-gate song poster dialog
│   │   ├── context/
│   │   │   ├── AuthContext.jsx           # User authentication state
│   │   │   ├── PlayerContext.jsx         # Audio engine & MediaSession state
│   │   │   └── usePlayer.js
│   │   ├── utils/
│   │   │   └── imageFallback.js          # Resilient image fallback handlers
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── vite.config.js
├── server/
│   ├── index.js                          # Express server & Jamendo API proxy
│   └── routes/
├── metadata.json
├── package.json
└── README.md
```

---

## 📜 Licensing & Jamendo Compliance

Music streams and metadata provided by the **Jamendo API**. All tracks comply with Creative Commons and Jamendo terms of service. Proper artist credit and license URLs are rendered for every playable item.
