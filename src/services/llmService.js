// LLM Service for Google Gemini 1.5 Flash & Groq (Llama 3.1 8B)

/**
 * Builds a comprehensive, rich context payload of the user's watched movies, watched shows, ratings, and likes
 */
export function buildUserHistoryContext(userHistory = {}) {
  const { watchedMovies = [], watchedShows = [], likedItems = [] } = userHistory;

  const movieSummary = (watchedMovies || []).slice(0, 100).map(m => 
    `${m.title}${m.year ? ` (${m.year})` : ''}${m.userRating ? ` [Rating: ${m.userRating}/10]` : ''}`
  ).join('; ');

  const showSummary = (watchedShows || []).slice(0, 50).map(s => 
    `${s.title}${s.year ? ` (${s.year})` : ''}${s.userRating ? ` [Rating: ${s.userRating}/10]` : ''}`
  ).join('; ');

  const likesSummary = (likedItems || []).slice(0, 50).map(l => l.title).join(', ');

  return `USER WATCHING HISTORY & RATINGS CONTEXT (${watchedMovies.length} Movies, ${watchedShows.length} TV Shows):
- Watched Movies: ${movieSummary || 'None recorded yet'}
- Watched TV Shows: ${showSummary || 'None recorded yet'}
- Favorited & Liked Media: ${likesSummary || 'None recorded yet'}`;
}

/**
 * Call Google Gemini 1.5 Flash API (100% Free - 1M Token Context Window)
 */
export async function callGeminiAPI(promptText, userProfile, candidates, apiKey, userHistory = {}) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;

  const historyContext = buildUserHistoryContext(userHistory);

  const compactCandidates = candidates.slice(0, 80).map(c => ({
    id: c.id,
    title: c.title,
    year: c.year,
    type: c.type,
    language: c.language || 'en',
    country: c.country || (c.isEuropean ? 'EU' : 'US'),
    isEuropean: !!c.isEuropean,
    isIndieGem: !!c.isIndieGem,
    genres: c.genres,
    isWatched: !!c.isWatched,
    userRating: c.userRating || null,
    themes: c.themes || [],
    cast: c.cast || [],
    director: c.director || '',
    traktRating: c.traktRating || 8.0,
    overview: c.overview?.substring(0, 150)
  }));

  const systemInstruction = `You are an elite film critic and recommendation AI.
${historyContext}
User Top Genres: ${(userProfile.topGenres || []).join(', ')}.

USER PROMPT: "${promptText}".

CANDIDATE CATALOG:
${JSON.stringify(compactCandidates)}

CRITICAL INSTRUCTIONS:
1. Complex & Negative Constraint Rule: Strictly respect user negative constraints (e.g. "no US movies", "no Asian movies") and regional preferences (e.g. "European preferred", "intelligent gems", "not blockbusters"). If the user asks for European non-US gems, select authentic European movies (e.g. Timecrimes / Los Cronocrímenes, Aniara, El Hoyo / The Platform, Open Your Eyes / Abre los Ojos, Dark, The Bothersome Man).
2. Watched History Query Rule: If the user asks for "movies I watched", "movies I've seen", "what have I watched", or "show my watched movies", select ONLY candidates that have \`isWatched: true\` or appear in the User Watching History.
3. Actor/Director Rule: If the user asks for movies starring an actor (e.g. Brad Pitt, Leonardo DiCaprio) or directed by a director, select ONLY titles starring them or directed by them.
4. Streaming Availability Rule: If the user asks for titles available for streaming or watching online, EXCLUDE unreleased upcoming theatrical titles (e.g. The Odyssey, unreleased 2026/2027 films).
5. Exclusion Rule: If the user requests live-action / adult / no animation, exclude animated items. If specific genre or media type (movie vs TV show) is requested, strictly filter by it.
6. Reasoning: Provide custom 2-sentence film-critic reasoning taking into account the user's query and why it satisfies all user constraints.

Return ONLY a valid JSON array of objects with these exact keys:
[
  {
    "id": "item-id",
    "matchScore": 95,
    "reasoning": "2-sentence film critic explanation of why this title matches the prompt and user profile"
  }
]`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: systemInstruction }]
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1200,
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errText.substring(0, 150)}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
  
  try {
    return JSON.parse(rawText);
  } catch (e) {
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  }
}

/**
 * Call Groq Cloud API (Llama 3.1 8B — 100% Free & Ultra-Fast)
 */
export async function callGroqAPI(promptText, userProfile, candidates, apiKey, userHistory = {}) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const historyContext = buildUserHistoryContext(userHistory);

  const compactCandidates = candidates.slice(0, 80).map(c => ({
    id: c.id,
    title: c.title,
    year: c.year,
    type: c.type,
    language: c.language || 'en',
    isEuropean: !!c.isEuropean,
    genres: c.genres,
    isWatched: !!c.isWatched,
    userRating: c.userRating || null,
    themes: c.themes || [],
    cast: c.cast || [],
    director: c.director || '',
    traktRating: c.traktRating || 8.0
  }));

  const prompt = `You are an elite film critic AI.
${historyContext}
User Top Genres: ${(userProfile.topGenres || []).join(', ')}.

USER PROMPT: "${promptText}".

CANDIDATES CATALOG:
${JSON.stringify(compactCandidates)}

Strictly enforce negative constraints (e.g. "no US movies", "no Asian movies") and European indie gem preferences. Return ONLY valid JSON array:
[
  {
    "id": "candidate-id",
    "matchScore": 95,
    "reasoning": "Detailed 2-sentence explanation of why this fits all user constraints"
  }
]`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'You output strictly valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 1200,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API Error (${response.status}): ${errText.substring(0, 150)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '[]';
  
  const parsed = JSON.parse(content);
  return Array.isArray(parsed) ? parsed : (parsed.recommendations || parsed.results || Object.values(parsed)[0]);
}

/**
 * Combined LLM Orchestrator: routes to Gemini, Groq, or returns null to fall back to local engine
 */
export async function generateLLMRecommendations(promptText, userProfile, candidates, llmConfig = {}, userHistory = {}) {
  const { provider = 'gemini', geminiKey = '', groqKey = '' } = llmConfig;

  let llmResults = [];

  if (provider === 'gemini' && geminiKey && geminiKey.trim()) {
    console.log('[LLM Engine] Querying Google Gemini 1.5 Flash with full user history & complex negative constraint context...');
    llmResults = await callGeminiAPI(promptText, userProfile, candidates, geminiKey, userHistory);
  } else if (provider === 'groq' && groqKey && groqKey.trim()) {
    console.log('[LLM Engine] Querying Groq Cloud (Llama 3.1 8B) with full user history & complex negative constraint context...');
    llmResults = await callGroqAPI(promptText, userProfile, candidates, groqKey, userHistory);
  } else {
    return null;
  }

  if (!Array.isArray(llmResults) || llmResults.length === 0) {
    return null;
  }

  const candidateMap = new Map();
  candidates.forEach(c => candidateMap.set(c.id, c));

  const enriched = [];
  llmResults.forEach(res => {
    const original = candidateMap.get(res.id);
    if (original) {
      enriched.push({
        ...original,
        matchScore: res.matchScore || 90,
        reasoning: `🤖 AI LLM Critic: ${res.reasoning}`
      });
    }
  });

  return enriched.length > 0 ? enriched : null;
}
