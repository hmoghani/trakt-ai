import React from 'react';
import { Star, Film, Tv, Info, Sparkles, CheckCircle2, ChevronRight, Tag } from 'lucide-react';
import PosterImage from './PosterImage';

export default function RecommendationGrid({ recommendations = [], onSelectMedia, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <div key={n} className="glass-panel rounded-2xl p-4 h-96 flex flex-col justify-between shimmer">
            <div className="w-full h-48 bg-slate-800/60 rounded-xl"></div>
            <div className="space-y-3 mt-4">
              <div className="h-4 bg-slate-800/80 rounded w-3/4"></div>
              <div className="h-3 bg-slate-800/60 rounded w-1/2"></div>
              <div className="h-10 bg-slate-800/40 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center max-w-xl mx-auto my-12 border border-slate-800 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
          <Film className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-100">No Recommendations Match Your Query</h3>
        <p className="text-sm text-slate-400">
          Try expanding your release year range, choosing 'All Genres', or trying a prompt like <span className="text-purple-300 font-mono">"Sci-Fi movies like Alien"</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {recommendations.map((item) => {
        const isHighMatch = item.matchScore >= 85;
        const isMediumMatch = item.matchScore >= 75;
        
        const matchBadgeClass = isHighMatch
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-950/50'
          : isMediumMatch
          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-950/50'
          : 'bg-amber-500/20 text-amber-300 border-amber-500/40';

        const reasoningBullets = item.reasoning ? item.reasoning.split(' • ') : [];

        return (
          <div
            key={item.id}
            onClick={() => onSelectMedia(item)}
            className="group glass-panel-interactive rounded-2xl overflow-hidden border border-slate-800/80 cursor-pointer flex flex-col justify-between hover:border-rose-500/50 transition-all duration-300"
          >
            {/* Poster Thumbnail & Overlay */}
            <div className="relative aspect-[16/10] sm:aspect-[16/11] w-full overflow-hidden bg-slate-900">
              <PosterImage
                item={item}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

              {/* Match Score Badge */}
              <div className={`absolute top-3 left-3 px-3 py-1 rounded-xl text-xs font-bold border backdrop-blur-md flex items-center gap-1 shadow-lg ${matchBadgeClass}`}>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{item.matchScore}% Match</span>
              </div>

              {/* Media Type */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-slate-900/80 text-slate-200 border border-slate-700/80 backdrop-blur-md capitalize">
                  {item.type === 'movie' ? 'Movie' : 'TV Show'}
                </span>
              </div>

              {/* Trakt Rating Badge */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 text-amber-400 border border-slate-800 text-xs font-bold backdrop-blur-md">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{item.traktRating ? item.traktRating.toFixed(1) : '7.8'}</span>
                <span className="text-slate-500 font-normal text-[10px]">/10</span>
              </div>

              {/* Release Year */}
              <div className="absolute bottom-3 right-3 text-xs font-semibold text-slate-300 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 backdrop-blur-md">
                {item.year}
              </div>
            </div>

            {/* Card Content Body */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 group-hover:text-rose-400 transition-colors line-clamp-1">
                  {item.title}
                </h3>
                
                {/* Themes / Subgenre Tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {(item.themes || item.genres || []).slice(0, 3).map((theme, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-purple-950/40 text-purple-300 text-[10px] font-semibold border border-purple-800/40">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Reasoning Box */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300/90 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  AI Match Analysis
                </div>
                <ul className="space-y-0.5 text-[10px] text-slate-300">
                  {reasoningBullets.slice(0, 2).map((b, idx) => (
                    <li key={idx} className="line-clamp-1">{b}</li>
                  ))}
                </ul>
              </div>

              {/* Card Footer Details */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px]">
                  {item.runtime ? `${item.runtime} mins` : item.type === 'show' ? 'Multi-Season' : ''}
                </span>
                <span className="flex items-center gap-1 text-rose-400 font-medium group-hover:translate-x-1 transition-transform text-xs">
                  Full Details <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}
