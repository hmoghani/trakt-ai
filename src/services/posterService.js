// Universal 100% Reliable Poster Service (OMDb + TVMaze + iTunes + Dynamic Fallback)

const posterCache = new Map();

// Load ONLY valid HTTP image URLs from persistent localStorage
try {
  const saved = localStorage.getItem('trakt_poster_cache_v6');
  if (saved) {
    const parsed = JSON.parse(saved);
    Object.entries(parsed).forEach(([k, v]) => {
      if (v && v.startsWith('http')) {
        posterCache.set(k, v);
      }
    });
  }
} catch (e) {}

function savePosterCache() {
  try {
    const obj = {};
    posterCache.forEach((v, k) => {
      if (v && v.startsWith('http')) {
        obj[k] = v;
      }
    });
    localStorage.setItem('trakt_poster_cache_v6', JSON.stringify(obj));
  } catch (e) {}
}

const OMDB_KEYS = ['trilogy', 'b70ac64e'];

/**
 * Normalizes title for search API compatibility (removes accents, colons, special chars)
 */
function cleanTitleForSearch(rawTitle = '') {
  return rawTitle
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics / accents
    .replace(/[:\-_]/g, ' ')         // replace colons and dashes with spaces
    .replace(/[^\w\s]/g, '')        // remove remaining non-alphanumeric chars
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Dynamic XML-escaped SVG Fallback Poster
 */
export function getFallbackPoster(title = 'Media', year = '', genre = 'Drama') {
  const colors = [
    ['#e11d48', '#8b5cf6'],
    ['#0284c7', '#7c3aed'],
    ['#d97706', '#dc2626'],
    ['#059669', '#2563eb'],
    ['#7c3aed', '#db2777'],
    ['#4f46e5', '#9333ea']
  ];

  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const [c1, c2] = colors[colorIndex];

  const cleanTitle = escapeXml(title);
  const cleanGenre = escapeXml(genre);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
    <defs>
      <linearGradient id="g_${Math.abs(hash)}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="${c2}" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    <rect width="400" height="600" fill="url(#g_${Math.abs(hash)})"/>
    <rect width="400" height="600" fill="#000000" fill-opacity="0.3"/>
    <circle cx="200" cy="220" r="80" fill="#ffffff" fill-opacity="0.08"/>
    <text x="200" y="240" font-family="-apple-system, sans-serif" font-size="64" fill="#ffffff" text-anchor="middle" opacity="0.4">🎬</text>
    <text x="200" y="420" font-family="-apple-system, sans-serif" font-size="26" font-weight="800" fill="#ffffff" text-anchor="middle">${cleanTitle}</text>
    <text x="200" y="460" font-family="-apple-system, sans-serif" font-size="16" font-weight="600" fill="#f43f5e" text-anchor="middle">${year} • ${cleanGenre}</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeXml(unsafe = '') {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Universal 100% Reliable Poster Resolver:
 * 1. Persistent Cache
 * 2. OMDb API (Official Amazon/IMDb Movie & TV Covers)
 * 3. TVMaze API (for TV Shows)
 * 4. iTunes Search API
 * 5. Dynamic SVG Fallback
 */
export async function fetchPosterArt(item = {}) {
  if (!item || !item.title) return getFallbackPoster('Media');

  const cacheKey = `${item.type || 'movie'}_${item.id || item.title.toLowerCase().replace(/\s+/g, '-')}`;
  if (posterCache.has(cacheKey)) {
    const cached = posterCache.get(cacheKey);
    if (cached && cached.startsWith('http')) {
      return cached;
    }
  }

  // If item already has a valid HTTP poster URL (excluding unsplash placeholders)
  if (item.poster && item.poster.startsWith('http') && !item.poster.includes('unsplash.com')) {
    posterCache.set(cacheKey, item.poster);
    savePosterCache();
    return item.poster;
  }

  const rawTitle = item.title.trim();
  const searchTitle = cleanTitleForSearch(rawTitle);
  const type = item.type === 'show' ? 'series' : 'movie';
  const year = item.year;
  const imdbId = item.ids?.imdb || item.imdbId;

  try {
    // Strategy 1: OMDb API by IMDb ID or Title & Year (Official Amazon/IMDb Posters)
    for (const key of OMDB_KEYS) {
      let omdbUrl = '';
      if (imdbId) {
        omdbUrl = `https://www.omdbapi.com/?i=${encodeURIComponent(imdbId)}&apikey=${key}`;
      } else {
        omdbUrl = `https://www.omdbapi.com/?t=${encodeURIComponent(searchTitle)}&type=${type}${year ? `&y=${year}` : ''}&apikey=${key}`;
      }

      const omdbRes = await fetch(omdbUrl);
      if (omdbRes.ok) {
        const omdbData = await omdbRes.json();
        if (omdbData.Poster && omdbData.Poster.startsWith('http') && omdbData.Poster !== 'N/A') {
          posterCache.set(cacheKey, omdbData.Poster);
          savePosterCache();
          return omdbData.Poster;
        }
      }
    }

    // Strategy 1B: OMDb fallback without type/year filter
    for (const key of OMDB_KEYS) {
      const omdbUrl = `https://www.omdbapi.com/?t=${encodeURIComponent(searchTitle)}&apikey=${key}`;
      const omdbRes = await fetch(omdbUrl);
      if (omdbRes.ok) {
        const omdbData = await omdbRes.json();
        if (omdbData.Poster && omdbData.Poster.startsWith('http') && omdbData.Poster !== 'N/A') {
          posterCache.set(cacheKey, omdbData.Poster);
          savePosterCache();
          return omdbData.Poster;
        }
      }
    }

    // Strategy 2: TVMaze API for TV Shows
    if (type === 'series' || item.type === 'show') {
      const tvMazeUrl = `https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(searchTitle)}`;
      const tvRes = await fetch(tvMazeUrl);
      if (tvRes.ok) {
        const tvData = await tvRes.json();
        if (tvData.image?.original || tvData.image?.medium) {
          const img = tvData.image.original || tvData.image.medium;
          posterCache.set(cacheKey, img);
          savePosterCache();
          return img;
        }
      }
    }

    // Strategy 3: iTunes Store Open Media API
    const entity = (item.type === 'show') ? 'tvSeason' : 'movie';
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(searchTitle)}&entity=${entity}&limit=5`;
    const itunesRes = await fetch(itunesUrl);
    if (itunesRes.ok) {
      const itunesData = await itunesRes.json();
      if (itunesData.results && itunesData.results.length > 0) {
        const rawArt = itunesData.results[0].artworkUrl100 || itunesData.results[0].artworkUrl60;
        if (rawArt) {
          const hdArt = rawArt.replace('100x100bb', '600x600bb').replace('60x60bb', '600x600bb');
          posterCache.set(cacheKey, hdArt);
          savePosterCache();
          return hdArt;
        }
      }
    }
  } catch (err) {
    console.warn(`[PosterArt] Error fetching artwork for ${rawTitle}:`, err.message);
  }

  // Strategy 4: Dynamic SVG Fallback
  return getFallbackPoster(rawTitle, year, item.genres?.[0] || 'Drama');
}

export const getMediaPoster = fetchPosterArt;
