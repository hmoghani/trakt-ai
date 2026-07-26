// Trakt API Client Service with 1000-Title Catalog Loader, People/Actor Search, Watchlist & Custom Lists Support

const TRAKT_BASE_URL = 'https://api.trakt.tv';

/**
 * Helper to construct Trakt API headers
 */
function getHeaders(clientId, bearerToken = null) {
  const headers = {
    'Content-Type': 'application/json',
    'trakt-api-version': '2',
  };
  if (clientId && clientId.trim()) {
    headers['trakt-api-key'] = clientId.trim();
  }
  if (bearerToken && bearerToken.trim()) {
    headers['Authorization'] = `Bearer ${bearerToken.trim()}`;
  }
  return headers;
}

/**
 * Generic API fetch wrapper with JSON parsing and error handling
 */
async function traktFetch(endpoint, { clientId, bearerToken = null, params = {} } = {}) {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${TRAKT_BASE_URL}${endpoint}${queryParams ? `?${queryParams}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(clientId, bearerToken)
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Trakt API 401 Unauthorized: Check your Client ID or Token.');
    } else if (response.status === 403) {
      throw new Error('Trakt API 403 Forbidden: Access denied.');
    } else if (response.status === 429) {
      throw new Error('Trakt API 429 Rate Limit Exceeded. Please try again later.');
    }
    throw new Error(`Trakt API error (${response.status}): ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Search Trakt People Graph (Actor / Director) and fetch their official filmography
 */
export async function searchPersonFilmography(personName = '', { clientId }) {
  if (!personName || !personName.trim()) return [];

  try {
    // 1. Search person by name
    const searchRes = await traktFetch(`/search/person`, {
      clientId,
      params: { query: personName.trim(), extended: 'full', limit: 5 }
    });

    if (!Array.isArray(searchRes) || searchRes.length === 0) {
      return [];
    }

    const person = searchRes[0].person;
    if (!person || !person.ids?.slug) return [];

    const slug = person.ids.slug;

    // 2. Fetch movies starring this person
    const moviesRes = await traktFetch(`/people/${slug}/movies?extended=full`, { clientId });
    
    const results = [];
    const castList = moviesRes?.cast || [];

    castList.forEach(item => {
      const m = item.movie;
      if (m && m.title) {
        results.push({
          id: m.ids?.slug || m.ids?.trakt || m.title.toLowerCase().replace(/[\s\-_]+/g, ''),
          title: m.title,
          year: m.year || 2020,
          type: 'movie',
          genres: m.genres || ['Drama'],
          traktRating: m.rating || 8.0,
          votes: m.votes || 10000,
          runtime: m.runtime || 120,
          overview: m.overview || `Starring ${person.name}.`,
          cast: [person.name],
          ids: m.ids || {}
        });
      }
    });

    return results;
  } catch (err) {
    console.warn(`[Trakt API] Failed to fetch filmography for ${personName}:`, err.message);
    return [];
  }
}

/**
 * Fetch 1000 Titles for Deep Recommendations
 */
export async function fetchDeepCatalog({ clientId, pages = 5, limit = 100 }) {
  if (!clientId || !clientId.trim()) return [];

  const candidates = [];
  const fetchedKeys = new Set();

  const addCandidate = (item, type) => {
    if (!item) return;
    const media = item.movie || item.show || item;
    if (!media || !media.title) return;

    const key = media.ids?.slug || media.ids?.trakt || media.title.toLowerCase().replace(/[\s\-_]+/g, '');
    if (fetchedKeys.has(key)) return;
    fetchedKeys.add(key);

    candidates.push({
      id: key,
      title: media.title,
      year: media.year || 2023,
      type: type || (item.show ? 'show' : 'movie'),
      genres: media.genres || ['Drama'],
      traktRating: media.rating || 8.0,
      votes: media.votes || 5000,
      runtime: media.runtime || (type === 'show' ? 45 : 110),
      overview: media.overview || `Featured ${type} on Trakt.`,
      ids: media.ids || {}
    });
  };

  try {
    const promises = [];

    for (let page = 1; page <= pages; page++) {
      promises.push(
        traktFetch(`/movies/trending?page=${page}&limit=${limit}&extended=full`, { clientId })
          .then(items => { if (Array.isArray(items)) items.forEach(i => addCandidate(i, 'movie')); })
          .catch(() => {})
      );

      promises.push(
        traktFetch(`/movies/popular?page=${page}&limit=${limit}&extended=full`, { clientId })
          .then(items => { if (Array.isArray(items)) items.forEach(i => addCandidate(i, 'movie')); })
          .catch(() => {})
      );

      promises.push(
        traktFetch(`/shows/trending?page=${page}&limit=${limit}&extended=full`, { clientId })
          .then(items => { if (Array.isArray(items)) items.forEach(i => addCandidate(i, 'show')); })
          .catch(() => {})
      );

      promises.push(
        traktFetch(`/shows/popular?page=${page}&limit=${limit}&extended=full`, { clientId })
          .then(items => { if (Array.isArray(items)) items.forEach(i => addCandidate(i, 'show')); })
          .catch(() => {})
      );
    }

    await Promise.all(promises);
  } catch (err) {
    console.warn('[Trakt Deep Catalog] Error fetching 1000 titles:', err.message);
  }

  return candidates;
}

/**
 * Fetch Related Media from Trakt Server Graph
 */
export async function fetchRelatedMedia(type = 'movies', id, { clientId }) {
  if (!id) return [];
  try {
    return await traktFetch(`/${type}/${encodeURIComponent(id)}/related?extended=full&limit=20`, { clientId });
  } catch (err) {
    console.warn(`[Trakt API] Failed to fetch related ${type} for ${id}:`, err.message);
    return [];
  }
}

/**
 * Exchange PIN / OAuth Code for Access Token
 */
export async function exchangeOAuthToken(code, clientId, clientSecret, redirectUri = 'urn:ietf:wg:oauth:2.0:oob') {
  const url = `${TRAKT_BASE_URL}/oauth/token`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code: code.trim(),
      client_id: clientId.trim(),
      client_secret: clientSecret.trim(),
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })
  });

  if (!response.ok) {
    throw new Error(`OAuth token exchange failed (${response.status}): ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Trakt Device Code OAuth Grant Step 1
 */
export async function generateDeviceCode(clientId) {
  if (!clientId || !clientId.trim()) {
    throw new Error('Trakt Client ID is required to generate device code.');
  }

  const url = `${TRAKT_BASE_URL}/oauth/device/code`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: clientId.trim()
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to generate device code (${response.status})`);
  }

  return await response.json();
}

/**
 * Trakt Device Code OAuth Grant Step 2
 */
export async function pollDeviceToken(deviceCode, clientId, clientSecret = '') {
  if (!clientId || !clientId.trim()) {
    return { status: 'error', message: 'Missing Client ID' };
  }

  const url = `${TRAKT_BASE_URL}/oauth/device/token`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code: deviceCode,
      client_id: clientId.trim()
    })
  });

  if (response.status === 400) {
    return { status: 'pending' };
  }
  if (response.status === 404 || response.status === 409 || response.status === 410) {
    return { status: 'expired' };
  }

  if (!response.ok) {
    throw new Error(`Device token error (${response.status})`);
  }

  const data = await response.json();
  return { status: 'success', data };
}

/**
 * Simulated Demo Device Code generator
 */
export function generateDemoDeviceCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return {
    device_code: 'demo_device_' + Date.now(),
    user_code: code,
    verification_url: 'https://trakt.tv/activate',
    expires_in: 600,
    interval: 5,
    isDemo: true
  };
}

/**
 * Fetch Watched History for Movies or Shows
 */
export async function fetchUserWatched(type = 'movies', { clientId, bearerToken, username = '' }) {
  try {
    if (bearerToken) {
      return await traktFetch(`/sync/watched/${type}?extended=full`, { clientId, bearerToken });
    } else if (username) {
      return await traktFetch(`/users/${encodeURIComponent(username)}/history/${type}?extended=full`, { clientId });
    } else {
      throw new Error('Provide either OAuth Token or Username to fetch Trakt history.');
    }
  } catch (err) {
    console.warn(`[Trakt API] Failed to fetch watched ${type}:`, err.message);
    return [];
  }
}

/**
 * Fetch User Watchlist (Movies or Shows)
 */
export async function fetchUserWatchlist(type = 'movies', { clientId, bearerToken, username = '' }) {
  try {
    if (bearerToken) {
      return await traktFetch(`/sync/watchlist/${type}?extended=full`, { clientId, bearerToken });
    } else if (username) {
      return await traktFetch(`/users/${encodeURIComponent(username)}/watchlist/${type}?extended=full`, { clientId });
    }
    return [];
  } catch (err) {
    console.warn(`[Trakt API] Failed to fetch watchlist ${type}:`, err.message);
    return [];
  }
}

/**
 * Fetch User Custom Lists
 */
export async function fetchUserCustomLists({ clientId, bearerToken, username = '' }) {
  try {
    const userTarget = bearerToken ? 'me' : encodeURIComponent(username);
    if (!userTarget) return [];
    return await traktFetch(`/users/${userTarget}/lists`, { clientId, bearerToken });
  } catch (err) {
    console.warn('[Trakt API] Failed to fetch custom lists:', err.message);
    return [];
  }
}

/**
 * Fetch Items from a Specific Custom List
 */
export async function fetchCustomListItems(listSlug, { clientId, bearerToken, username = '' }) {
  try {
    const userTarget = bearerToken ? 'me' : encodeURIComponent(username);
    if (!userTarget || !listSlug) return [];
    return await traktFetch(`/users/${userTarget}/lists/${encodeURIComponent(listSlug)}/items?extended=full`, { clientId, bearerToken });
  } catch (err) {
    console.warn(`[Trakt API] Failed to fetch items for custom list ${listSlug}:`, err.message);
    return [];
  }
}

/**
 * Fetch User Likes / Ratings
 */
export async function fetchUserLikes({ clientId, bearerToken, username = '' }) {
  try {
    if (bearerToken) {
      return await traktFetch(`/sync/ratings?extended=full`, { clientId, bearerToken });
    } else if (username) {
      return await traktFetch(`/users/${encodeURIComponent(username)}/likes?extended=full`, { clientId });
    }
    return [];
  } catch (err) {
    console.warn('[Trakt API] Failed to fetch likes/ratings:', err.message);
    return [];
  }
}

/**
 * Fetch Personalized Trakt Recommendations
 */
export async function fetchTraktRecommendations(type = 'movies', { clientId, bearerToken }) {
  if (!bearerToken) {
    throw new Error('Trakt direct recommendations endpoint requires OAuth token.');
  }
  return await traktFetch(`/recommendations/${type}?extended=full&limit=30`, { clientId, bearerToken });
}

/**
 * Fetch Trending Catalog
 */
export async function fetchTrending(type = 'movies', { clientId }) {
  return await traktFetch(`/${type}/trending?extended=full&limit=50`, { clientId });
}

/**
 * Fetch Popular Catalog
 */
export async function fetchPopular(type = 'movies', { clientId }) {
  return await traktFetch(`/${type}/popular?extended=full&limit=50`, { clientId });
}

/**
 * Fetch Genres
 */
export async function fetchGenres(type = 'movies', { clientId }) {
  return await traktFetch(`/genres/${type}`, { clientId });
}

/**
 * Search Media by Query
 */
export async function searchTraktMedia(query, type = 'movie', { clientId }) {
  return await traktFetch(`/search/${type}`, {
    clientId,
    params: { query, extended: 'full', limit: 20 }
  });
}
