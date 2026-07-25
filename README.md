# 🎬 Trakt AI Recommender

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.1-646cff.svg?logo=vite)](https://vitejs.dev/)
[![Trakt API](https://img.shields.io/badge/Trakt.tv-API%20v2-red.svg)](https://trakt.docs.apiary.io/)

> An AI-powered, multi-vector movie and TV show recommendation engine connected to the **Trakt.tv API v2**.

---

## ✨ Features

- 🤖 **Natural Language Prompt Assistant**: Enter conversational queries like `"Sci-Fi movies like Alien"`, `"90s mind-bending thrillers"`, or `"recent dark comedy TV shows"`.
- 🧬 **Multi-Vector Semantic Intelligence Engine**: Combines reference title matching, Jaccard genre overlap, era alignment, and subgenre theme vectors (*Deep Space*, *Cosmic Horror*, *Cyberpunk*, *AI & Androids*).
- 🖼️ **Multi-Source Poster Resolver**: High-resolution movie & TV show cover resolver combining **OMDb API**, **TVMaze API**, and **iTunes Store Open Media API** for 100% artwork coverage.
- 📺 **Trakt Sync & Library Hub**: Syncs and displays your **Watched Movies & TV Shows** (consolidated into 1 show card per series with episode counts), **Trakt Watchlist**, **Custom Lists**, and **Rated Titles**.
- 🔑 **Kodi-Style Device Code & OAuth Pairing**: Authenticate seamlessly via an 8-character pairing code at [trakt.tv/activate](https://trakt.tv/activate) or via Client ID & Secret credentials.
- 🔒 **Privacy-First & Persistent**: User credentials and tokens stay 100% inside your browser's local storage—no external backend required.

---

## 🚀 Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher)
- `npm` or `pnpm` / `yarn`

### 1. Clone the Repository
```bash
git clone https://github.com/hmoghani/trakt-ai.git
cd trakt-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Build for Production
```bash
npm run build
```
The compiled, optimized production bundle will be generated in the `dist/` directory.

---

## 🔑 Trakt.tv API Key Setup Guide

You can run **Trakt AI** in Demo Mode out of the box, or connect your personal **Trakt.tv API key** to fetch live history and personalized recommendations.

### Step 1: Create a Trakt Application
1. Sign in to your [Trakt.tv](https://trakt.tv) account.
2. Go to **[Trakt API Applications](https://trakt.tv/oauth/applications/new)**.
3. Fill in the application fields:
   - **Name**: `Trakt AI Recommender`
   - **Description**: `AI Movie & TV Show Recommendation Agent`
   - **Redirect URI**: `urn:ietf:wg:oauth:2.0:oob`
   - **Permissions**: Check `public` and `/sync` read permissions.
4. Click **Save App**.

### Step 2: Connect to the App
1. Copy your **Client ID** and **Client Secret**.
2. Open **Trakt AI** at `http://localhost:3000`.
3. Click the **Trakt API Settings** button (top right gear icon).
4. Choose your preferred connection method:
   - **Method A: Device Code Pairing (Recommended)**: Click **Connect Device**, copy your 8-character code, and authorize at [trakt.tv/activate](https://trakt.tv/activate).
   - **Method B: Client ID & Secret**: Enter your Trakt Client ID and Secret directly.
   - **Method C: Username Lookup**: Enter your public Trakt username to read public history and lists.

---

## 🛠️ Technology Stack

- **Core**: React 18, Vite 5, JavaScript (ES2022+)
- **Styling**: Tailwind CSS (CDN/Custom System), Glassmorphism, CSS Animations
- **Icons**: Lucide React
- **APIs**:
  - [Trakt.tv API v2](https://trakt.docs.apiary.io/) (Sync, History, Watchlist, Lists, Recommendations)
  - [OMDb API](https://www.omdbapi.com/) (Official Amazon/IMDb Movie & TV Covers)
  - [TVMaze API](https://www.tvmaze.com/api) (TV Show Poster Lookup)
  - [iTunes Store Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html) (HD 600x600 Cover Art)

---

## 📄 License

MIT © [hmoghani](https://github.com/hmoghani)
