// LLM Service for Google Gemini 1.5 Flash & Groq (Llama 3.1 8B)

/**
 * Call Google Gemini 1.5 Flash API (100% Free)
 */
export async function callGeminiAPI(promptText, userProfile, candidates, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;

  const compactCandidates = candidates.slice(0, 40).map(c => ({
    id: c.id,
    title: c.title,
    year: c.year,
    type: c.type,
    genres: c.genres,
    themes: c.themes || [],
    traktRating: c.traktRating || 8.0,
    overview: c.overview?.substring(0, 150)
  }));

  const systemInstruction = `You are an elite movie & TV recommendation AI critic.
User Viewing Profile: Top Genres: ${(userProfile.topGenres || []).join(', ')}.
User Query: "${promptText}".

Candidates Catalog:
${JSON.stringify(compactCandidates)}

Task: Select the top 10 best matching candidates for the user query and profile.
Exclusion Rule: If the user requests live-action / adult / no animation, exclude animated items. If specific genre/media type is requested, strictly filter by it.

Return ONLY a valid JSON array of objects with these exact keys:
[
  {
    "id": "item-id",
    "matchScore": 95,
    "reasoning": "2-sentence film critic explanation of why this title matches the query and profile"
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
        maxOutputTokens: 1000,
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
    // Clean codeblock markers if present
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  }
}

/**
 * Call Groq Cloud API (Llama 3.1 8B — 100% Free & Ultra-Fast)
 */
export async function callGroqAPI(promptText, userProfile, candidates, apiKey) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const compactCandidates = candidates.slice(0, 40).map(c => ({
    id: c.id,
    title: c.title,
    year: c.year,
    type: c.type,
    genres: c.genres,
    themes: c.themes || [],
    traktRating: c.traktRating || 8.0
  }));

  const prompt = `You are a film critic AI.
User Profile: Top Genres: ${(userProfile.topGenres || []).join(', ')}.
User Query: "${promptText}".

Catalog:
${JSON.stringify(compactCandidates)}

Select the top 10 best matching items. Return ONLY valid JSON array:
[
  {
    "id": "candidate-id",
    "matchScore": 95,
    "reasoning": "Detailed 2-sentence explanation of why this fits"
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
      max_tokens: 1000,
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
 * Combined LLM Orchestrator: routes to Gemini, Groq, or falls back to local engine
 */
export async function generateLLMRecommendations(promptText, userProfile, candidates, llmConfig = {}) {
  const { provider = 'gemini', geminiKey = '', groqKey = '' } = llmConfig;

  let llmResults = [];

  if (provider === 'gemini' && geminiKey && geminiKey.trim()) {
    console.log('[LLM Engine] Querying Google Gemini 1.5 Flash...');
    llmResults = await callGeminiAPI(promptText, userProfile, candidates, geminiKey);
  } else if (provider === 'groq' && groqKey && groqKey.trim()) {
    console.log('[LLM Engine] Querying Groq Cloud (Llama 3.1 8B)...');
    llmResults = await callGroqAPI(promptText, userProfile, candidates, groqKey);
  } else {
    return null; // Return null to fallback to local engine
  }

  if (!Array.isArray(llmResults) || llmResults.length === 0) {
    return null;
  }

  // Merge LLM scores and reasoning back into full candidate objects
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
