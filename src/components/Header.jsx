import React from 'react';
import { Film, Tv, Sparkles, Settings, History, Heart, RefreshCw, Zap, Tv2, UserCheck } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  onOpenSettings, 
  isLiveMode, 
  traktConfig = {}, 
  isLoading, 
  onSync 
}) {
  const username = traktConfig?.username ? traktConfig.username.trim() : '';

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-purple-600 shadow-lg shadow-rose-600/30">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight gradient-text">
                  Trakt AI Agent
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isLiveMode 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isLiveMode ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                  {isLiveMode ? `Trakt Live ${username ? `(@${username})` : ''}` : 'Sandbox Demo'}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Smart Movie & TV Show Recommender based on your Trakt history, genres & release years
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'recommendations'
                  ? 'gradient-accent text-white shadow-md shadow-rose-900/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Recommendations</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'history'
                  ? 'gradient-accent text-white shadow-md shadow-rose-900/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Watched History</span>
              <span className="sm:hidden">History</span>
            </button>

            <button
              onClick={() => setActiveTab('likes')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'likes'
                  ? 'gradient-accent text-white shadow-md shadow-rose-900/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Likes & Ratings</span>
              <span className="sm:hidden">Likes</span>
            </button>
          </nav>

          {/* Controls & Device Auth Link */}
          <div className="flex items-center gap-2">
            {isLiveMode && (
              <button
                onClick={onSync}
                disabled={isLoading}
                title="Sync with Trakt API"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-rose-400' : ''}`} />
                <span className="hidden md:inline">Sync Trakt</span>
              </button>
            )}

            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600/20 text-rose-200 hover:bg-rose-600/30 border border-rose-500/40 text-xs sm:text-sm font-semibold transition-all shadow-md"
            >
              <Tv2 className="w-4 h-4 text-rose-400" />
              <span>Connect Device</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
