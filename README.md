# 🎬 Trakt AI Recommender

An AI-powered, multi-vector movie and TV show recommendation engine connected to the **Trakt.tv API v2**, **Google Gemini 1.5 Flash**, and **Groq Cloud (Llama 3.1 8B)**.

---

## Features

- **Natural Language Prompt Assistant**: Enter conversational queries like `"movies with Brad Pitt in it"`, `"farsi movies for adults"`, `"90s R-rated thrillers"`, or `"movies available for streaming 2026"`.
- **Free Multi-Provider LLM Engine**: Native support for **Google Gemini 1.5 Flash** and **Groq Cloud (Llama 3.1 8B)** (100% free tier APIs). Generates film critic reasoning and match percentages with a glowing AI status indicator badge.
- **Trakt People Graph & Actor Filmography**: Live search against Trakt's official person database (`/search/person`, `/people/{id}/movies`) to fetch complete filmographies for actors and directors (*Brad Pitt*, *Leonardo DiCaprio*, *Christopher Nolan*, *Quentin Tarantino*).
- **World Cinema & Language Engine**: Automatic language intent detection and Trakt ISO language filtering for **Farsi / Persian** (`fa`), **French** (`fr`), **Spanish** (`es`), **Japanese** (`ja`), **Korean** (`ko`), **Italian** (`it`), and **German** (`de`).
- **Streaming Availability Protection**: Automatically excludes unreleased upcoming theatrical movies (*The Odyssey*, in-production films) when users request titles available for streaming or watching online.
- **Multi-Vector Semantic Rule Engine**: Combines reference title matching, Jaccard genre overlap, era alignment, and subgenre theme vectors (*Deep Space*, *Cosmic Horror*, *Cyberpunk*, *AI & Androids*).
- **Multi-Source Poster Resolver**: High-resolution cover resolver combining **OMDb API**, **TVMaze API**, and **iTunes Store Open Media API** for 100% artwork coverage.
- **Trakt Sync & Library Hub**: Syncs your **Watched Movies & TV Shows** (consolidated show cards with episode counts), **Trakt Watchlist**, **Custom Lists**, and **Rated Titles**.
- **Kodi-Style Device Code & OAuth Pairing**: Authenticate seamlessly via an 8-character pairing code at [trakt.tv/activate](https://trakt.tv/activate) or Client ID credentials.
- **Automated 100-Scenario Test Suite**: Includes a built-in Playwright headless browser test suite auditing accuracy across 100 real-world prompt scenarios.

---

## Quick Start & Installation

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

## Free LLM API Key Setup (Google Gemini)

To enable live generative AI critic recommendations:

1. Go to **[Google AI Studio](https://aistudio.google.com/app/apikey)**.
2. Click **Create API Key** (100% Free tier, no credit card required).
3. Open **Trakt AI** in your browser at `http://localhost:3000`.
4. Click the **Trakt API Settings** gear icon (top right).
5. Navigate to the **Free LLM AI Engine** tab.
6. Select **Google Gemini 1.5 Flash**, paste your key, and click **Save Settings**.
7. Look for the green **`🤖 Active LLM: Google Gemini 1.5 Flash`** status badge above the prompt bar.

---

## Trakt.tv API Key Setup Guide

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

## Running the Automated 100-Scenario Test Suite

To run the full Playwright automated browser test suite across 100 prompt scenarios:

```bash
node scratch/test_suite_100_scenarios.js
```

---

## Technology Stack

- **Core**: React 18, Vite 5, JavaScript (ES2022+)
- **Styling**: Tailwind CSS, Glassmorphism, CSS Animations
- **Icons**: Lucide React
- **LLM Services**:
  - [Google Gemini 1.5 Flash API](https://ai.google.dev/) (Free Generative AI)
  - [Groq Cloud API](https://groq.com/) (Llama 3.1 8B Instant)
- **APIs**:
  - [Trakt.tv API v2](https://trakt.docs.apiary.io/) (Sync, History, Watchlist, Lists, People, Recommendations)
  - [OMDb API](https://www.omdbapi.com/) (Official Amazon/IMDb Movie & TV Covers)
  - [TVMaze API](https://www.tvmaze.com/api) (TV Show Poster Lookup)
  - [iTunes Store Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html) (HD 600x600 Cover Art)

---

## License

MIT © [hmoghani](https://github.com/hmoghani)
