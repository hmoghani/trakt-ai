import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import AgentChat from './components/AgentChat';
import RecommendationGrid from './components/RecommendationGrid';
import MediaModal from './components/MediaModal';
import TraktSettingsModal from './components/TraktSettingsModal';
import HistoryViewer from './components/HistoryViewer';

import { DEMO_GENRES, DEMO_USER_WATCHED, DEMO_USER_LIKES, DEMO_CATALOG_CANDIDATES } from './data/demoData';
import { analyzeUserProfile, generateRecommendations } from './services/recommendationEngine';
import { fetchUserWatched, fetchUserWatchlist, fetchUserCustomLists, fetchCustomListItems, fetchUserLikes, fetchTrending, fetchGenres, fetchDeepCatalog } from './services/traktApi';
import { generateLLMRecommendations } from './services/llmService';

export default function App() {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [llmResults, setLlmResults] = useState(null);

  // Trakt Credentials Config from localStorage
  const [traktConfig, setTraktConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('trakt_config');
      return saved ? JSON.parse(saved) : { clientId: '', clientSecret: '', username: '', bearerToken: '' };
    } catch (e) {
      return { clientId: '', clientSecret: '', username: '', bearerToken: '' };
    }
  });

  // Persistent Live Mode state initializer
  const [isLiveMode, setIsLiveMode] = useState(() => {
    try {
      const saved = localStorage.getItem('trakt_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return !!(parsed.clientId || parsed.username || parsed.bearerToken);
      }
    } catch (e) {}
    return false;
  });

  // Filter State
  const [filters, setFilters] = useState({
    mediaType: 'all',
    genre: 'all',
    yearMode: 'all',
    exactYear: '',
    decade: '',
    minYear: 1980,
    maxYear: 2026,
    excludeWatched: true,
    sortBy: 'matchScore'
  });

  // Data Store
  const [watchedMovies, setWatchedMovies] = useState(DEMO_USER_WATCHED.movies);
  const [watchedShows, setWatchedShows] = useState(DEMO_USER_WATCHED.shows);
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [customLists, setCustomLists] = useState([]);
  const [likedItems, setLikedItems] = useState(DEMO_USER_LIKES);
  const [catalogCandidates, setCatalogCandidates] = useState(DEMO_CATALOG_CANDIDATES);
  const [genresList, setGenresList] = useState(DEMO_GENRES);

  // Persistent auto-sync on app startup if logged in
  useEffect(() => {
    if (traktConfig && (traktConfig.clientId || traktConfig.username || traktConfig.bearerToken)) {
      setIsLiveMode(true);
      syncWithTrakt(traktConfig);
    }
  }, []);

  // Save Config to LocalStorage
  const handleSaveConfig = (newConfig) => {
    setTraktConfig(newConfig);
    try {
      localStorage.setItem('trakt_config', JSON.stringify(newConfig));
    } catch (e) {}

    if (newConfig.clientId || newConfig.username || newConfig.bearerToken) {
      setIsLiveMode(true);
      syncWithTrakt(newConfig);
    }
  };

  // Sync with Trakt API function
  const syncWithTrakt = async (config = traktConfig) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (config.clientId) {
        const apiGenres = await fetchGenres('movies', { clientId: config.clientId });
        if (Array.isArray(apiGenres) && apiGenres.length > 0) {
          setGenresList(apiGenres);
        }
      }

      if (config.username || config.bearerToken) {
        const moviesRes = await fetchUserWatched('movies', config);
        const showsRes = await fetchUserWatched('shows', config);
        
        if (Array.isArray(moviesRes) && moviesRes.length > 0) {
          const parsedMovies = moviesRes.map(item => {
            const m = item.movie || item;
            return {
              id: m.ids?.slug || m.title?.toLowerCase().replace(/\s+/g, '-'),
              title: m.title || 'Unknown Movie',
              year: m.year || 2023,
              type: 'movie',
              genres: m.genres || ['Drama'],
              userRating: item.rating || m.rating || 8.0,
              traktRating: m.rating || 8.0,
              watchedAt: item.watched_at || new Date().toISOString(),
              plays: item.plays || 1,
              ids: m.ids || {}
            };
          });
          setWatchedMovies(parsedMovies);
        }

        if (Array.isArray(showsRes) && showsRes.length > 0) {
          const showsMap = new Map();

          showsRes.forEach(item => {
            const s = item.show || item.series || item;
            if (!s || !s.title) return;

            const showKey = s.ids?.slug || s.ids?.trakt || s.title.toLowerCase().replace(/\s+/g, '-');

            if (!showsMap.has(showKey)) {
              showsMap.set(showKey, {
                id: showKey,
                title: s.title,
                year: s.year || 2023,
                type: 'show',
                genres: s.genres || ['Drama'],
                userRating: item.rating || s.rating || 8.0,
                traktRating: s.rating || 8.0,
                watchedAt: item.last_watched_at || item.watched_at || new Date().toISOString(),
                plays: item.plays || 1,
                episodesWatched: item.plays || 1,
                ids: s.ids || {}
              });
            } else {
              const existing = showsMap.get(showKey);
              existing.plays += (item.plays || 1);
              existing.episodesWatched += 1;
            }
          });

          setWatchedShows(Array.from(showsMap.values()));
        }

        const wlMovies = await fetchUserWatchlist('movies', config);
        const wlShows = await fetchUserWatchlist('shows', config);
        const parsedWatchlist = [];

        if (Array.isArray(wlMovies)) {
          wlMovies.forEach(item => {
            const m = item.movie || item;
            if (m.title) {
              parsedWatchlist.push({
                id: m.ids?.slug || m.title.toLowerCase().replace(/\s+/g, '-'),
                title: m.title,
                year: m.year,
                type: 'movie',
                genres: m.genres || ['Drama'],
                traktRating: m.rating || 8.0,
                ids: m.ids || {}
              });
            }
          });
        }

        if (Array.isArray(wlShows)) {
          wlShows.forEach(item => {
            const s = item.show || item;
            if (s.title) {
              parsedWatchlist.push({
                id: s.ids?.slug || s.title.toLowerCase().replace(/\s+/g, '-'),
                title: s.title,
                year: s.year,
                type: 'show',
                genres: s.genres || ['Drama'],
                traktRating: s.rating || 8.0,
                ids: s.ids || {}
              });
            }
          });
        }
        setWatchlistItems(parsedWatchlist);

        const userLists = await fetchUserCustomLists(config);
        if (Array.isArray(userLists) && userLists.length > 0) {
          const loadedLists = await Promise.all(userLists.map(async list => {
            const itemsRes = await fetchCustomListItems(list.ids?.slug || list.name, config);
            const parsedItems = (itemsRes || []).map(item => {
              const media = item.movie || item.show || {};
              return {
                id: media.ids?.slug || media.title?.toLowerCase().replace(/\s+/g, '-'),
                title: media.title || 'Untitled',
                year: media.year,
                type: item.type === 'show' ? 'show' : 'movie',
                genres: media.genres || ['Drama'],
                traktRating: media.rating || 8.0,
                ids: media.ids || {}
              };
            });
            return {
              ...list,
              items: parsedItems
            };
          }));
          setCustomLists(loadedLists);
        }

        const userLikes = await fetchUserLikes(config);
        if (Array.isArray(userLikes) && userLikes.length > 0) {
          const parsedLikes = userLikes.map(item => {
            const media = item.movie || item.show || {};
            return {
              id: media.ids?.slug || media.title?.toLowerCase().replace(/\s+/g, '-'),
              title: media.title || 'Untitled',
              year: media.year,
              type: item.type === 'show' ? 'show' : 'movie',
              genres: media.genres || ['Drama'],
              userRating: item.rating || 9,
              traktRating: media.rating || 8.0,
              ids: media.ids || {}
            };
          });
          setLikedItems(parsedLikes);
        }
      }

      if (config.clientId) {
        const deepCatalog = await fetchDeepCatalog({ clientId: config.clientId, pages: 5, limit: 100 });
        if (deepCatalog && deepCatalog.length > 0) {
          const candMap = new Map();
          [...deepCatalog, ...DEMO_CATALOG_CANDIDATES].forEach(c => {
            if (!c || !c.title) return;
            const key = c.id || c.title.toLowerCase().replace(/[\s\-_]+/g, '');
            if (!candMap.has(key)) {
              candMap.set(key, c);
            }
          });
          setCatalogCandidates(Array.from(candMap.values()));
        }
      }

    } catch (err) {
      console.error('[Trakt AI] Live API sync failed:', err);
      setErrorMsg(`Trakt API Notice: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Compute User Profile
  const userProfile = useMemo(() => {
    return analyzeUserProfile(watchedMovies, watchedShows, likedItems);
  }, [watchedMovies, watchedShows, likedItems]);

  // Watched Set for Exclusion
  const watchedIdsSet = useMemo(() => {
    const set = new Set();
    watchedMovies.forEach(m => set.add(m.id));
    watchedShows.forEach(s => set.add(s.id));
    return set;
  }, [watchedMovies, watchedShows]);

  // Compute Recommendations (LLM override if present, else fallback to rule engine)
  const recommendations = useMemo(() => {
    if (llmResults && Array.isArray(llmResults) && llmResults.length > 0) {
      return llmResults;
    }
    return generateRecommendations(catalogCandidates, userProfile, filters, watchedIdsSet);
  }, [llmResults, catalogCandidates, userProfile, filters, watchedIdsSet]);

  // Agent Natural Prompt Query Handler
  const handleAgentQuery = async (parsedFilters, promptText) => {
    setLlmResults(null);
    setFilters(prev => ({
      ...prev,
      ...parsedFilters
    }));

    // Check if LLM API Key is configured in localStorage or Vite env
    try {
      const savedLlm = localStorage.getItem('trakt_llm_config');
      const llmConfig = savedLlm ? JSON.parse(savedLlm) : {
        provider: 'gemini',
        geminiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
        groqKey: import.meta.env.VITE_GROQ_API_KEY || ''
      };

      if ((llmConfig.provider === 'gemini' && llmConfig.geminiKey) || (llmConfig.provider === 'groq' && llmConfig.groqKey)) {
        setIsLoading(true);
        const aiRes = await generateLLMRecommendations(promptText, userProfile, catalogCandidates, llmConfig);
        if (aiRes && aiRes.length > 0) {
          setLlmResults(aiRes);
        }
      }
    } catch (err) {
      console.warn('[LLM Query Error] Falling back to local engine:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetFilters = () => {
    setLlmResults(null);
    setFilters({
      mediaType: 'all',
      genre: 'all',
      yearMode: 'all',
      exactYear: '',
      decade: '',
      minYear: 1980,
      maxYear: 2026,
      excludeWatched: true,
      sortBy: 'matchScore'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isLiveMode={isLiveMode}
        traktConfig={traktConfig}
        isLoading={isLoading}
        onSync={() => syncWithTrakt()}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Notification Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center justify-between">
            <span>{errorMsg}</span>
            <button 
              onClick={() => setErrorMsg(null)}
              className="text-rose-400 font-bold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Recommendations */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            
            {/* Natural Language Prompt Assistant Box */}
            <AgentChat
              onAgentQuery={handleAgentQuery}
              genresList={genresList}
            />

            {/* Filter Controls Panel */}
            <FilterBar
              filters={filters}
              setFilters={(newFilters) => {
                setLlmResults(null);
                setFilters(newFilters);
              }}
              genresList={genresList}
              totalResults={recommendations.length}
              onResetFilters={handleResetFilters}
            />

            {/* Recommendation Grid */}
            <RecommendationGrid
              recommendations={recommendations}
              onSelectMedia={(item) => setSelectedMedia(item)}
              isLoading={isLoading}
            />

          </div>
        )}

        {/* Tab 2: Watched History & Library */}
        {activeTab === 'history' && (
          <HistoryViewer
            userProfile={userProfile}
            watchedMovies={watchedMovies}
            watchedShows={watchedShows}
            likedItems={likedItems}
            watchlistItems={watchlistItems}
            customLists={customLists}
            mode="history"
          />
        )}

        {/* Tab 3: Likes & Ratings */}
        {activeTab === 'likes' && (
          <HistoryViewer
            userProfile={userProfile}
            watchedMovies={watchedMovies}
            watchedShows={watchedShows}
            likedItems={likedItems}
            watchlistItems={watchlistItems}
            customLists={customLists}
            mode="likes"
          />
        )}

      </main>

      {/* Detail Modal */}
      <MediaModal
        item={selectedMedia}
        onClose={() => setSelectedMedia(null)}
      />

      {/* Trakt API Settings Drawer */}
      <TraktSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        traktConfig={traktConfig}
        onSaveConfig={handleSaveConfig}
        isLiveMode={isLiveMode}
        setIsLiveMode={setIsLiveMode}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Trakt AI Recommender • Powered by Trakt.tv API v2, Google Gemini & Groq LLMs</p>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="https://trakt.tv" target="_blank" rel="noopener noreferrer" className="hover:text-rose-400">Trakt.tv</a>
            <span>•</span>
            <a href="https://docs.trakt.tv" target="_blank" rel="noopener noreferrer" className="hover:text-rose-400">API Documentation</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
