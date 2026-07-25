import React from 'react';
import { Film, Tv, Calendar, SlidersHorizontal, EyeOff, Sparkles, X, Layers } from 'lucide-react';

export default function FilterBar({ 
  filters, 
  setFilters, 
  genresList = [], 
  totalResults = 0,
  onResetFilters 
}) {
  const handleMediaTypeChange = (type) => {
    setFilters(prev => ({ ...prev, mediaType: type }));
  };

  const handleGenreSelect = (genreName) => {
    setFilters(prev => ({ 
      ...prev, 
      genre: prev.genre === genreName ? 'all' : genreName 
    }));
  };

  const handleYearModeChange = (mode) => {
    setFilters(prev => ({ ...prev, yearMode: mode }));
  };

  const handleDecadeSelect = (dec) => {
    setFilters(prev => ({
      ...prev,
      yearMode: prev.decade === dec && prev.yearMode === 'decade' ? 'all' : 'decade',
      decade: dec
    }));
  };

  const popularGenres = ["Science Fiction", "Action", "Drama", "Comedy", "Thriller", "Horror", "Animation"];
  const decadeOptions = [
    { label: '2020s', value: '2020' },
    { label: '2010s', value: '2010' },
    { label: '2000s', value: '2000' },
    { label: '1990s', value: '1990' },
    { label: '1980s', value: '1980' }
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 mb-8 border border-slate-800/90 shadow-xl space-y-6">
      
      {/* Top Filter Controls: Media Type & Quick Preset Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        
        {/* Media Type Tabs */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
            Type:
          </span>
          <div className="inline-flex p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => handleMediaTypeChange('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                filters.mediaType === 'all'
                  ? 'bg-rose-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Media</span>
            </button>
            <button
              onClick={() => handleMediaTypeChange('movie')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                filters.mediaType === 'movie'
                  ? 'bg-rose-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Movies</span>
            </button>
            <button
              onClick={() => handleMediaTypeChange('show')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                filters.mediaType === 'show'
                  ? 'bg-rose-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>TV Shows</span>
            </button>
          </div>
        </div>

        {/* Decade / Era Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-rose-400" />
            <span>Era:</span>
          </span>
          {decadeOptions.map((dec) => (
            <button
              key={dec.value}
              onClick={() => handleDecadeSelect(dec.value)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border ${
                filters.yearMode === 'decade' && filters.decade === dec.value
                  ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {dec.label}
            </button>
          ))}
        </div>

        {/* Sort & Watched Toggle */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700">
            <input
              type="checkbox"
              checked={filters.excludeWatched}
              onChange={(e) => setFilters(prev => ({ ...prev, excludeWatched: e.target.checked }))}
              className="rounded border-slate-700 bg-slate-950 text-rose-600 focus:ring-rose-500/30"
            />
            <EyeOff className="w-3.5 h-3.5 text-rose-400" />
            <span>Hide Watched</span>
          </label>

          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            className="bg-slate-900/80 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-rose-500 cursor-pointer font-medium"
          >
            <option value="matchScore">Sort: Agent Match Score</option>
            <option value="rating">Sort: Trakt Rating</option>
            <option value="year">Sort: Release Year (Newest)</option>
            <option value="title">Sort: Title (A-Z)</option>
          </select>
        </div>

      </div>

      {/* Main Filter Section: Genre Selector & Specific Year Input */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
        
        {/* Genre Quick Selection Pills & Dropdown */}
        <div className="md:col-span-8 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Genre Filter:</span>
            </span>
            {filters.genre !== 'all' && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, genre: 'all' }))}
                className="text-xs text-rose-400 hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear Genre
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilters(prev => ({ ...prev, genre: 'all' }))}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                filters.genre === 'all'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              All Genres
            </button>
            {popularGenres.map(g => (
              <button
                key={g}
                onClick={() => handleGenreSelect(g)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  filters.genre.toLowerCase() === g.toLowerCase()
                    ? 'bg-rose-500/25 text-rose-200 border-rose-500/50 shadow-sm font-semibold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {g}
              </button>
            ))}

            <select
              value={filters.genre}
              onChange={(e) => setFilters(prev => ({ ...prev, genre: e.target.value }))}
              className="bg-slate-900/80 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="all">More Genres...</option>
              {genresList.map(g => (
                <option key={g.slug || g.name} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Specific Year / Range Inputs */}
        <div className="md:col-span-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Release Year Filter:
            </span>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => handleYearModeChange('all')}
                className={`text-xs ${filters.yearMode === 'all' ? 'text-rose-400 font-semibold' : 'text-slate-500'}`}
              >
                Any
              </button>
              <span className="text-slate-700">|</span>
              <button
                onClick={() => handleYearModeChange('exact')}
                className={`text-xs ${filters.yearMode === 'exact' ? 'text-rose-400 font-semibold' : 'text-slate-500'}`}
              >
                Exact Year
              </button>
              <span className="text-slate-700">|</span>
              <button
                onClick={() => handleYearModeChange('range')}
                className={`text-xs ${filters.yearMode === 'range' ? 'text-rose-400 font-semibold' : 'text-slate-500'}`}
              >
                Range
              </button>
            </div>
          </div>

          {filters.yearMode === 'exact' && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="e.g. 2024"
                min="1920"
                max="2026"
                value={filters.exactYear}
                onChange={(e) => setFilters(prev => ({ ...prev, exactYear: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
          )}

          {filters.yearMode === 'range' && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min (1980)"
                value={filters.minYear}
                onChange={(e) => setFilters(prev => ({ ...prev, minYear: parseInt(e.target.value, 10) || 1970 }))}
                className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
              <span className="text-xs text-slate-500">–</span>
              <input
                type="number"
                placeholder="Max (2024)"
                value={filters.maxYear}
                onChange={(e) => setFilters(prev => ({ ...prev, maxYear: parseInt(e.target.value, 10) || 2026 }))}
                className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
          )}

          {filters.yearMode === 'all' && (
            <div className="text-xs text-slate-500 bg-slate-900/50 rounded-xl px-3 py-2 border border-slate-800/50">
              Showing releases across all years & decades
            </div>
          )}

          {filters.yearMode === 'decade' && (
            <div className="text-xs text-rose-300/90 bg-purple-950/30 rounded-xl px-3 py-2 border border-purple-800/40">
              Filtering for {filters.decade}s releases
            </div>
          )}
        </div>

      </div>

      {/* Active Filter Summary Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
        <div>
          Showing <span className="font-semibold text-slate-100">{totalResults}</span> agent recommendations
          {filters.genre !== 'all' && <span className="text-rose-400 ml-1">in {filters.genre}</span>}
        </div>

        {(filters.genre !== 'all' || filters.yearMode !== 'all' || filters.mediaType !== 'all') && (
          <button
            onClick={onResetFilters}
            className="text-slate-400 hover:text-rose-400 text-xs font-medium underline flex items-center gap-1"
          >
            Reset All Filters
          </button>
        )}
      </div>

    </div>
  );
}
