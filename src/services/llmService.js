const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite'
];

async function fetchGeminiWithFallback(apiKey, bodyObj) {
  let lastErr = null;
  for (const modelName of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey.trim()}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyObj)
      });
      if (response.status === 404) {
        console.warn(`[Gemini API] Model ${modelName} returned 404, attempting fallback model...`);
        lastErr = new Error(`Gemini API Error (404): Model ${modelName} not found`);
        continue;
      }
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API Error (${response.status}): ${errText.substring(0, 150)}`);
      }
      return await response.json();
    } catch (err) {
      if (err.message && err.message.includes('404')) {
        lastErr = err;
        continue;
      }
      throw err;
    }
  }
  throw lastErr || new Error('Gemini API Error (404): No compatible Gemini model endpoint found.');
}

/**
 * Uses LLM (Gemini or Groq) as an intelligent Intent Interpreter to extract ISO language codes, 
 * country codes, media types, search terms, and negative constraints for ANY prompt (e.g. "afghani movies")
 */
export async function extractStructuredIntentWithLLM(promptText, llmConfig = {}) {
  const { provider = 'gemini', geminiKey = '', groqKey = '' } = llmConfig;
  const apiKey = provider === 'gemini' ? geminiKey : groqKey;

  if (!apiKey || !apiKey.trim()) return null;

  const prompt = `Analyze this movie/TV recommendation prompt: "${promptText}".
Extract the user's intent into a JSON object with these exact keys:
{
  "langCode": "2-letter ISO language code (e.g. 'ps' or 'fa' for afghani/pashto/farsi, 'sr' for serbian, 'fr' for french) or null",
  "secondaryLangCode": "secondary ISO language code if applicable or null",
  "country": "2-letter ISO country code (e.g. 'AF' for Afghanistan, 'RS' for Serbia) or null",
  "mediaType": "'movie' | 'show' | 'all'",
  "genre": "primary genre string or 'all'",
  "excludeUS": boolean,
  "excludeBlockbusters": boolean,
  "excludeAnimation": boolean,
  "searchTitles": ["Array of 3-5 famous iconic movie/show titles that match this prompt (e.g. ['Osama', 'The Kite Runner', 'Earth and Ashes'] for Afghani)"]
}`;

  try {
    if (provider === 'gemini') {
      const data = await fetchGeminiWithFallback(apiKey, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
      });
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      return JSON.parse(rawText);
    } else if (provider === 'groq') {
      const url = 'https://api.groq.com/openai/v1/chat/completions';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          response_format: { type: 'json_object' }
        })
      });
      if (!response.ok) return null;
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '{}';
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('[LLM Intent Extractor error]:', err.message);
  }
  return null;
}

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
 * Call Google Gemini API with model fallback (gemini-2.0-flash -> gemini-1.5-flash-latest -> gemini-1.5-flash)
 */
export async function callGeminiAPI(promptText, userProfile, candidates, apiKey, userHistory = {}) {
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
    isBlockbuster: !!c.isBlockbuster,
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
1. Regional & Language Rule: Strictly respect user prompts asking for specific international cinema (e.g. Afghani movies, Serbian films, Iranian cinema, French movies). Select authentic films from or about that region/language.
2. Indie Movie Rule: If the user asks for "indie movies", "indie films", "indie cinema", "independent films", or "not blockbusters", EXCLUDE giant mainstream studio blockbusters (e.g. Moana, Frozen, Avengers, Inception, Toy Story, Star Wars, Marvel/Disney films). Select ONLY authentic independent or low-budget indie films.
3. Complex & Negative Constraint Rule: Strictly respect user negative constraints (e.g. "no US movies", "no Asian movies") and regional preferences (e.g. "European preferred", "intelligent gems"). If the user asks for European non-US gems, select authentic European movies.
4. Watched History Query Rule: If the user asks for "movies I watched", "movies I've seen", "what have I watched", or "show my watched movies", select ONLY candidates that have \`isWatched: true\` or appear in the User Watching History.
5. Actor/Director Rule: If the user asks for movies starring an actor (e.g. Brad Pitt, Leonardo DiCaprio) or directed by a director, select ONLY titles starring them or directed by them.
6. Streaming Availability Rule: If the user asks for titles available for streaming or watching online, EXCLUDE unreleased upcoming theatrical titles (e.g. The Odyssey, unreleased 2026/2027 films).
7. Reasoning: Provide custom 2-sentence film-critic reasoning taking into account the user's query and why it satisfies all user constraints.

Return ONLY a valid JSON array of objects with these exact keys:
[
  {
    "id": "item-id",
    "matchScore": 95,
    "reasoning": "2-sentence film critic explanation of why this title matches the prompt and user profile"
  }
]`;

  const data = await fetchGeminiWithFallback(apiKey, {
    contents: [{ parts: [{ text: systemInstruction }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1200,
      responseMimeType: "application/json"
    }
  });

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
    isIndieGem: !!c.isIndieGem,
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

Strictly respect user query (e.g. Afghani movies, Serbian films, indie movies). Return ONLY valid JSON array:
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
    console.log('[LLM Engine] Querying Google Gemini 1.5 Flash with full user history & regional context...');
    llmResults = await callGeminiAPI(promptText, userProfile, candidates, geminiKey, userHistory);
  } else if (provider === 'groq' && groqKey && groqKey.trim()) {
    console.log('[LLM Engine] Querying Groq Cloud (Llama 3.1 8B) with full user history & regional context...');
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
