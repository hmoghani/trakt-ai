import React, { useState } from 'react';
import { Film, Tv, Heart, Star, Calendar, PieChart, Sparkles, Eye, Bookmark, List, Layers, Filter } from 'lucide-react';
import PosterImage from './PosterImage';

export default function HistoryViewer({ 
  userProfile = {}, 
  watchedMovies = [], 
  watchedShows = [], 
  likedItems = [], 
  watchlistItems = [],
  customLists = [],
  mode = 'history' 
}) {
  const [subTab, setSubTab] = useState(mode); // 'history', 'watchlist', 'lists', 'likes'
  const [mediaFilter, setMediaFilter] = useState('all'); // 'all', 'movie', 'show'
  const [selectedListSlug, setSelectedListSlug] = useState(customLists[0]?.ids?.slug || null);

  // Helper to group TV show items so each series appears as 1 single card
  const groupShowsAndMovies = (items = []) => {
    const map = new Map();
    items.forEach(item => {
      const key = `${item.type || 'movie'}_${item.id || item.title?.toLowerCase().replace(/\s+/g, '-')}`;
      if (!map.has(key)) {
        map.set(key, { ...item });
      } else {
        const existing = map.get(key);
        existing.plays = (existing.plays || 1) + (item.plays || 1);
        if (existing.type === 'show') {
          existing.episodesWatched = (existing.episodesWatched || 1) + 1;
        }
      }
    });
    return Array.from(map.values());
  };

  // Combine or filter items based on active subTab
  let rawDisplayItems = [];

  if (subTab === 'history') {
    rawDisplayItems = groupShowsAndMovies([...watchedMovies, ...watchedShows]);
  } else if (subTab === 'watchlist') {
    rawDisplayItems = groupShowsAndMovies(watchlistItems);
  } else if (subTab === 'likes') {
    rawDisplayItems = groupShowsAndMovies(likedItems);
  } else if (subTab === 'lists') {
    const activeList = customLists.find(l => l.ids?.slug === selectedListSlug) || customLists[0];
    rawDisplayItems = groupShowsAndMovies(activeList?.items || []);
  }

  // Apply Media Type Filter ('all', 'movie', 'show')
  const displayItems = rawDisplayItems.filter(item => {
    if (mediaFilter === 'movie') return item.type === 'movie';
    if (mediaFilter === 'show') return item.type === 'show';
    return true;
  });

  const movieCount = rawDisplayItems.filter(i => i.type === 'movie').length;
  const showCount = rawDisplayItems.filter(i => i.type === 'show').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Profile Overview Stats */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">
                Your Trakt Library & Viewing Profile
              </h2>
              <p className="text-xs text-slate-400">
                Analyzed by Trakt AI Agent to curate personalized recommendations
              </p>
            </div>
          </div>

          {/* Top Sub-Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setSubTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                subTab === 'history' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Watched ({watchedMovies.length + watchedShows.length})</span>
            </button>

            <button
              onClick={() => setSubTab('watchlist')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                subTab === 'watchlist' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Watchlist ({watchlistItems.length})</span>
            </button>

            <button
              onClick={() => setSubTab('lists')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                subTab === 'lists' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Custom Lists ({customLists.length})</span>
            </button>

            <button
              onClick={() => setSubTab('likes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                subTab === 'likes' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Liked ({likedItems.length})</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-white">
                {watchedMovies.length}
              </span>
              <span className="text-xs text-slate-400 block font-medium">Watched Movies</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-white">
                {watchedShows.length}
              </span>
              <span className="text-xs text-slate-400 block font-medium">Unique TV Series</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-white capitalize truncate max-w-[120px] block">
                {userProfile.favoriteGenre || 'Science Fiction'}
              </span>
              <span className="text-xs text-slate-400 block font-medium">#1 Favorite Genre</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-white">
                {userProfile.yearDistribution ? `${Object.keys(userProfile.yearDistribution).sort((a,b)=>userProfile.yearDistribution[b]-userProfile.yearDistribution[a])[0] || 2020}s` : '2020s'}
              </span>
              <span className="text-xs text-slate-400 block font-medium">Favorite Era</span>
            </div>
          </div>
        </div>

        {/* Top Genres Breakdown Bars */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Genre Preference Breakdown
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(userProfile.topGenres || ['Science Fiction', 'Drama', 'Action', 'Thriller', 'Mystery', 'Comedy']).slice(0, 6).map((g) => {
              const pct = userProfile.genreBreakdown ? userProfile.genreBreakdown[g] || 15 : 20;
              return (
                <div key={g} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-200">{g}</span>
                    <span className="text-rose-400 font-bold">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div 
                      className="bg-gradient-to-r from-rose-500 to-purple-600 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${Math.max(8, Math.min(100, pct))}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Custom Lists Selector Drawer (Visible if subTab === 'lists') */}
      {subTab === 'lists' && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <List className="w-4 h-4 text-blue-400" />
            <span>Select Trakt Custom List:</span>
          </h3>
          {customLists.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No custom lists found for this Trakt account.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {customLists.map((l) => (
                <button
                  key={l.ids?.slug || l.name}
                  onClick={() => setSelectedListSlug(l.ids?.slug)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    (selectedListSlug === l.ids?.slug || (!selectedListSlug && customLists[0]?.ids?.slug === l.ids?.slug))
                      ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-lg'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className="text-xs font-bold block">{l.name || 'Custom List'}</span>
                    <span className="text-[10px] text-slate-400 block">{l.item_count || l.items?.length || 0} items</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Media Items Table / Grid */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-6">
        
        {/* Header & Type Switcher (All vs Movies vs TV Shows) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            {subTab === 'history' && <Eye className="w-5 h-5 text-rose-400" />}
            {subTab === 'watchlist' && <Bookmark className="w-5 h-5 text-purple-400" />}
            {subTab === 'lists' && <List className="w-5 h-5 text-blue-400" />}
            {subTab === 'likes' && <Heart className="w-5 h-5 text-amber-400" />}
            <span className="capitalize">
              {subTab === 'history' && 'Synced Watched History'}
              {subTab === 'watchlist' && 'Trakt Watchlist Items'}
              {subTab === 'lists' && (customLists.find(l=>l.ids?.slug===selectedListSlug)?.name || 'Custom List Items')}
              {subTab === 'likes' && 'Liked & Rated Media Items'}
            </span>
          </h3>

          {/* Media Type Filter Pills (All / Movies / TV Shows) */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setMediaFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                mediaFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Media ({rawDisplayItems.length})
            </button>
            <button
              onClick={() => setMediaFilter('movie')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                mediaFilter === 'movie' ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Movies ({movieCount})</span>
            </button>
            <button
              onClick={() => setMediaFilter('show')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                mediaFilter === 'show' ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>TV Shows ({showCount})</span>
            </button>
          </div>
        </div>

        {/* Empty State Notice */}
        {displayItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs space-y-2">
            <p>No items found for this category or filter selection.</p>
            <p className="text-slate-500">Log in or save your Trakt credentials in settings to sync live items.</p>
          </div>
        ) : (
          /* Media Item Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayItems.map((item, idx) => (
              <div key={item.id || idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex gap-4 items-center hover:border-slate-700 transition-all">
                <div className="w-14 h-20 overflow-hidden rounded-xl border border-slate-800 shrink-0 bg-slate-950">
                  <PosterImage item={item} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-100 truncate">{item.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold capitalize ${
                      item.type === 'movie' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                    }`}>
                      {item.type === 'movie' ? 'Movie' : 'TV Show'}
                    </span>
                    <span>•</span>
                    <span>{item.year}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {item.userRating && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 text-[10px] font-bold border border-amber-500/20">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        Rating: {item.userRating}/10
                      </span>
                    )}
                    {item.type === 'show' ? (
                      <span className="text-[10px] text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-800/40 font-medium">
                        {item.episodesWatched ? `${item.episodesWatched} episodes watched` : `${item.plays || 1} plays`}
                      </span>
                    ) : item.plays ? (
                      <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                        {item.plays} plays
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
