import React from 'react';
import { X, Star, Calendar, Clock, Film, ExternalLink, Sparkles, CheckCircle2, User, Play } from 'lucide-react';
import PosterImage from './PosterImage';

export default function MediaModal({ item, onClose }) {
  if (!item) return null;

  const traktUrl = `https://trakt.tv/${item.type === 'movie' ? 'movies' : 'shows'}/${item.id}`;
  const trailerSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(item.title + ' ' + item.year + ' trailer')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="glass-panel w-full max-w-2xl rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Banner Artwork & Close Button */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-900 overflow-hidden">
          <PosterImage
            item={item}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md transition-all hover:scale-110"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Banner Badges */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {item.matchScore}% Match
                </span>
                <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-900/80 text-slate-300 border border-slate-700 backdrop-blur-md capitalize">
                  {item.type}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {item.title}
              </h2>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 text-amber-400 border border-slate-800 backdrop-blur-md font-bold text-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{item.traktRating ? item.traktRating.toFixed(1) : '8.2'}</span>
              <span className="text-slate-500 text-xs font-normal">/10</span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Quick Stats Line */}
          <div className="flex items-center gap-6 text-xs text-slate-400 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-rose-400" />
              <span>Release Year: <strong className="text-slate-200">{item.year}</strong></span>
            </div>
            {item.runtime && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Runtime: <strong className="text-slate-200">{item.runtime} mins</strong></span>
              </div>
            )}
            {item.votes && (
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-400" />
                <span>Votes: <strong className="text-slate-200">{item.votes.toLocaleString()}</strong></span>
              </div>
            )}
          </div>

          {/* Agent Recommendation Reasoning Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/30 via-slate-900 to-purple-950/30 border border-rose-800/40 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Why the Trakt AI Agent Recommends This:
            </h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {item.reasoning}
            </p>
          </div>

          {/* Genres Tags */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Genres</h4>
            <div className="flex flex-wrap gap-2">
              {(item.genres || []).map((g, idx) => (
                <span key={idx} className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Overview / Synopsis */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Synopsis</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {item.overview || "No overview available for this title."}
            </p>
          </div>

          {/* Cast & Crew */}
          {item.director && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block mb-1">Director</span>
                <span className="text-slate-200 font-medium">{item.director}</span>
              </div>
              {item.cast && (
                <div>
                  <span className="text-slate-500 font-semibold block mb-1">Key Cast</span>
                  <span className="text-slate-200 font-medium">{item.cast.join(', ')}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons: Trakt & Trailer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <a
              href={trailerSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              <Play className="w-4 h-4 text-red-500 fill-red-500" />
              <span>Watch Trailer</span>
            </a>

            <a
              href={traktUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-accent text-white text-xs font-semibold shadow-lg shadow-rose-950/40 hover:opacity-95 transition-all"
            >
              <span>View on Trakt.tv</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
