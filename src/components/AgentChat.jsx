import React, { useState } from 'react';
import { Bot, Send, Sparkles, Command } from 'lucide-react';
import { parseAgentPrompt } from '../services/recommendationEngine';

export default function AgentChat({ onAgentQuery, genresList = [] }) {
  const [promptInput, setPromptInput] = useState('');
  const [lastAgentFeedback, setLastAgentFeedback] = useState(null);

  const samplePrompts = [
    "Find me high-rated 90s Sci-Fi movies",
    "Recommend mind-bending thriller TV shows from 2020s",
    "Show me dark mystery movies I haven't watched yet",
    "Give me top action comedies"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    const parsedFilters = parseAgentPrompt(promptInput, genresList);
    onAgentQuery(parsedFilters, promptInput);

    // Provide friendly agent feedback message
    const feedbackParts = [];
    if (parsedFilters.genre !== 'all') feedbackParts.push(`Genre: ${parsedFilters.genre}`);
    if (parsedFilters.yearMode === 'decade') feedbackParts.push(`Era: ${parsedFilters.decade}s`);
    if (parsedFilters.yearMode === 'exact') feedbackParts.push(`Year: ${parsedFilters.exactYear}`);
    if (parsedFilters.mediaType !== 'all') feedbackParts.push(`Type: ${parsedFilters.mediaType}s`);

    const summary = feedbackParts.length > 0
      ? `Applied AI filters -> ${feedbackParts.join(' • ')}`
      : `Searching recommendations based on your request: "${promptInput}"`;

    setLastAgentFeedback(summary);
  };

  const handleSelectSample = (sample) => {
    setPromptInput(sample);
    const parsedFilters = parseAgentPrompt(sample, genresList);
    onAgentQuery(parsedFilters, sample);
    setLastAgentFeedback(`Applied AI filters for "${sample}"`);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 mb-8 border border-purple-900/40 bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950/40 shadow-2xl">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
          <Bot className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            Ask Recommendation Agent
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Natural Language Prompt
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Tell the AI agent what you want to watch (e.g., genre, era, mood, or specific year)
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative mb-3">
        <input
          type="text"
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder="e.g. 'Show me 90s sci-fi movies' or 'Recommend dark thriller shows from the last 5 years'..."
          className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-inner"
        />
        <button
          type="submit"
          disabled={!promptInput.trim()}
          className="absolute right-2 top-1.5 bottom-1.5 px-3.5 rounded-lg gradient-accent text-white flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-all shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Quick Prompt Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" /> Quick Prompts:
        </span>
        {samplePrompts.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectSample(sample)}
            className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 text-[11px] text-slate-300 hover:text-white transition-all"
          >
            {sample}
          </button>
        ))}
      </div>

      {/* Agent Response Feedback Banner */}
      {lastAgentFeedback && (
        <div className="mt-3 p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-200 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-400" />
            <span>{lastAgentFeedback}</span>
          </div>
          <button 
            onClick={() => setLastAgentFeedback(null)}
            className="text-purple-400 hover:text-purple-200 text-[10px] font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
