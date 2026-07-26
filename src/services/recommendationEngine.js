// Smart Multi-Vector Recommendation & Intent AI Engine

/**
 * Normalizes genre strings for resilient comparison (e.g. "Science Fiction" === "science-fiction")
 */
function normalizeGenre(str = '') {
  return str.toLowerCase().replace(/[\s\-_]+/g, '');
}

/**
 * Analyzes user watched history and likes to extract user genre preferences & viewing profile
 */
export function analyzeUserProfile(watchedMovies = [], watchedShows = [], likedItems = []) {
  const genreCounts = {};
  const genreWeights = {};
  const yearCounts = {};
  const themesCounts = {};
  let totalItemsAnalyzed = 0;

  const allItems = [
    ...watchedMovies.map(item => ({ ...item, isLiked: false })),
    ...watchedShows.map(item => ({ ...item, isLiked: false })),
    ...likedItems.map(item => ({ ...item, isLiked: true }))
  ];

  allItems.forEach(item => {
    totalItemsAnalyzed++;
    const ratingMultiplier = item.userRating ? Math.max(1, item.userRating / 5) : 1.2;
    const playMultiplier = item.plays ? Math.min(2, 1 + item.plays * 0.2) : 1;
    const weight = (item.isLiked ? 2.0 : 1.0) * ratingMultiplier * playMultiplier;

    if (item.genres && Array.isArray(item.genres)) {
      item.genres.forEach(g => {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
        genreWeights[g] = (genreWeights[g] || 0) + weight;
      });
    }

    if (item.themes && Array.isArray(item.themes)) {
      item.themes.forEach(t => {
        themesCounts[t] = (themesCounts[t] || 0) + weight;
      });
    }

    if (item.year) {
      const decade = Math.floor(item.year / 10) * 10;
      yearCounts[decade] = (yearCounts[decade] || 0) + 1;
    }
  });

  const sortedGenres = Object.keys(genreWeights).sort((a, b) => genreWeights[b] - genreWeights[a]);
  const sortedThemes = Object.keys(themesCounts).sort((a, b) => themesCounts[b] - themesCounts[a]);
  const topGenre = sortedGenres[0] || 'Science Fiction';
  
  const totalGenreWeight = Object.values(genreWeights).reduce((a, b) => a + b, 0) || 1;
  const genreBreakdown = {};
  sortedGenres.forEach(g => {
    genreBreakdown[g] = Math.round((genreWeights[g] / totalGenreWeight) * 100);
  });

  return {
    totalItemsAnalyzed,
    topGenres: sortedGenres,
    topThemes: sortedThemes,
    favoriteGenre: topGenre,
    genreBreakdown,
    yearDistribution: yearCounts
  };
}

/**
 * Known Reference Title Database & Semantic Profiles
 */
const REFERENCE_MEDIA = [
  {
    keywords: ['alien', 'xenomorph', 'romulus'],
    title: 'Alien',
    genre: 'Science Fiction',
    secondaryGenres: ['Horror', 'Thriller'],
    themes: ['Alien Creature', 'Deep Space', 'Cosmic Horror', 'Claustrophobic Survival'],
    isLiveActionAdult: true
  },
  {
    keywords: ['prometheus', 'alien covenant', 'covenant', 'engineer'],
    title: 'Prometheus',
    genre: 'Science Fiction',
    secondaryGenres: ['Horror', 'Mystery', 'Thriller'],
    themes: ['Deep Space', 'Cosmic Horror', 'Alien Prequel', 'Engineers', 'AI Android', 'Claustrophobic Survival'],
    isLiveActionAdult: true
  },
  {
    keywords: ['blade runner', 'blade runner 2049', 'deckard'],
    title: 'Blade Runner',
    genre: 'Science Fiction',
    secondaryGenres: ['Drama', 'Mystery'],
    themes: ['Cyberpunk', 'AI & Androids', 'Neo-Noir', 'Dystopian'],
    isLiveActionAdult: true
  },
  {
    keywords: ['interstellar', 'wormhole'],
    title: 'Interstellar',
    genre: 'Science Fiction',
    secondaryGenres: ['Drama', 'Adventure'],
    themes: ['Deep Space', 'Wormholes & Time Dilation', 'Cosmic Survival'],
    isLiveActionAdult: true
  },
  {
    keywords: ['matrix', 'neo'],
    title: 'The Matrix',
    genre: 'Science Fiction',
    secondaryGenres: ['Action'],
    themes: ['Simulated Reality', 'Cyberpunk', 'AI Rebellion'],
    isLiveActionAdult: true
  },
  {
    keywords: ['dark', 'time travel'],
    title: 'Dark',
    genre: 'Science Fiction',
    secondaryGenres: ['Mystery', 'Drama'],
    themes: ['Time Travel Paradox', 'Multiverse', 'Grim Atmosphere'],
    isLiveActionAdult: true
  },
  {
    keywords: ['severance', 'lumon'],
    title: 'Severance',
    genre: 'Science Fiction',
    secondaryGenres: ['Thriller', 'Mystery'],
    themes: ['Corporate Dystopia', 'Memory Manipulation', 'Psychological Mystery'],
    isLiveActionAdult: true
  },
  {
    keywords: ['the thing', 'john carpenter'],
    title: 'The Thing',
    genre: 'Science Fiction',
    secondaryGenres: ['Horror', 'Mystery'],
    themes: ['Parasitic Shapeshifter', 'Isolation', 'Paranoia', 'Cosmic Horror'],
    isLiveActionAdult: true
  }
];

/**
 * Structured Reasoning Generator
 */
function generateStructuredReasoning(item, userProfile, filters, referenceMatch, matchScore) {
  const points = [];

  // Point 1: Language, Reference Title or Actor Match
  if (filters.langCode) {
    const langNames = { fa: 'Persian/Farsi', fr: 'French', es: 'Spanish', ja: 'Japanese', ko: 'Korean', it: 'Italian', de: 'German' };
    const langName = langNames[filters.langCode] || filters.langCode.toUpperCase();
    points.push(`🌐 Foreign Cinema: Authentic ${langName} title (${item.title})`);
  } else if (filters.personName) {
    points.push(`🎭 Actor Match: Stars ${filters.personName}`);
  } else if (referenceMatch) {
    const themeOverlap = (item.themes || []).filter(t => (referenceMatch.themes || []).includes(t));
    if (themeOverlap.length > 0) {
      points.push(`🧬 Theme Match: Shares '${themeOverlap[0]}' themes with ${referenceMatch.title}`);
    } else {
      points.push(`🎬 Similar Vibe: Fits the ${referenceMatch.genre} tone of ${referenceMatch.title}`);
    }
  } else {
    const matchedGenres = (item.genres || []).filter(g => (userProfile.topGenres || []).includes(g));
    if (matchedGenres.length > 0) {
      const topG = matchedGenres[0];
      const pct = userProfile.genreBreakdown[topG] || 25;
      points.push(`🎯 Top Genre: Fits your #${userProfile.topGenres.indexOf(topG) + 1} genre ${topG} (${pct}% of your history)`);
    } else {
      points.push(`✨ Recommendation based on your viewing profile`);
    }
  }

  // Point 2: Subgenres & Era
  if (filters.yearRange?.exact && item.year === parseInt(filters.yearRange.exact, 10)) {
    points.push(`📅 Released in your requested target year (${item.year})`);
  } else if (filters.yearRange?.min && filters.yearRange?.max && item.year >= filters.yearRange.min && item.year <= filters.yearRange.max) {
    points.push(`📅 Released in your target period (${filters.yearRange.min}–${filters.yearRange.max})`);
  } else if (item.themes && item.themes.length > 0) {
    points.push(`🏷️ Key Themes: ${item.themes.slice(0, 2).join(', ')}`);
  }

  // Point 3: Trakt Acclaim
  if (item.traktRating) {
    points.push(`⭐ Trakt Acclaim: ${item.traktRating.toFixed(1)}/10 community rating`);
  }

  return points.join(' • ');
}

/**
 * Main recommendation function: Multi-vector semantic scoring, animation exclusion, and deduplication
 */
export function generateRecommendations(catalogCandidates = [], userProfile, filters = {}, watchedIds = new Set()) {
  const {
    mediaType = 'all',
    genre = 'all',
    yearMode = 'all',
    exactYear = '',
    decade = '',
    minYear = 1970,
    maxYear = 2026,
    excludeWatched = true,
    excludeAnimation = false,
    personName = null,
    langCode = null,
    sortBy = 'matchScore',
    referenceTitleKey = null
  } = filters;

  const uniqueCandidatesMap = new Map();
  (catalogCandidates || []).forEach(item => {
    if (!item || !item.title) return;
    const key = item.id || normalizeGenre(item.title);
    if (!uniqueCandidatesMap.has(key)) {
      uniqueCandidatesMap.set(key, item);
    }
  });
  const candidatesList = Array.from(uniqueCandidatesMap.values());

  let referenceMatch = null;
  if (referenceTitleKey) {
    referenceMatch = REFERENCE_MEDIA.find(r => r.keywords.includes(referenceTitleKey.toLowerCase())) || null;
  }

  const targetGenre = (genre !== 'all') ? genre : (referenceMatch ? referenceMatch.genre : 'all');
  const shouldExcludeAnimation = excludeAnimation || (referenceMatch && referenceMatch.isLiveActionAdult);

  // 1. Strict Candidate Filter
  const filtered = candidatesList.filter(item => {
    if (excludeWatched && watchedIds.has(item.id)) {
      return false;
    }

    if (mediaType !== 'all' && item.type !== mediaType) {
      return false;
    }

    // Language Filter
    if (langCode) {
      const farsiTitles = ['A Separation', 'The Salesman', 'Children of Heaven', 'Taste of Cherry', 'About Elly'];
      const itemLang = item.language || (farsiTitles.includes(item.title) ? 'fa' : 'en');
      if (itemLang !== langCode) {
        return false;
      }
    }

    // Exclude animation if requested or implied by adult / live-action reference query
    if (shouldExcludeAnimation) {
      const isAnimated = (item.genres || []).some(g => normalizeGenre(g) === 'animation' || normalizeGenre(g) === 'anime');
      if (isAnimated) {
        return false;
      }
    }

    // Person / Actor Name Filter if present
    if (personName) {
      const normPerson = personName.toLowerCase();
      const castMatch = (item.cast || []).some(c => c.toLowerCase().includes(normPerson));
      const directorMatch = item.director && item.director.toLowerCase().includes(normPerson);
      if (!castMatch && !directorMatch) {
        return false;
      }
    }

    // Strict Genre Exclusion: Candidate MUST contain target genre (or secondary reference genre)
    if (targetGenre !== 'all') {
      const targetNorm = normalizeGenre(targetGenre);
      const itemGenresNorm = (item.genres || []).map(g => normalizeGenre(g));
      const hasPrimary = itemGenresNorm.includes(targetNorm);
      const hasSecondary = referenceMatch && (referenceMatch.secondaryGenres || []).some(sg => itemGenresNorm.includes(normalizeGenre(sg)));
      
      if (!hasPrimary && !hasSecondary) {
        return false;
      }
    }

    // Year Filter
    if (yearMode === 'exact' && exactYear) {
      if (item.year !== parseInt(exactYear, 10)) return false;
    } else if (yearMode === 'decade' && decade) {
      const decNum = parseInt(decade, 10);
      if (item.year < decNum || item.year >= decNum + 10) return false;
    } else if (yearMode === 'range') {
      if (item.year < minYear || item.year > maxYear) return false;
    }

    return true;
  });

  // 2. Multi-Vector Scoring
  const scored = filtered.map(item => {
    let score = 0;

    if (langCode && (item.language === langCode || langCode === 'fa')) {
      score += 45;
    }

    if (personName) {
      score += 40;
    }

    const itemGenresNorm = (item.genres || []).map(g => normalizeGenre(g));
    if (targetGenre !== 'all' && itemGenresNorm.includes(normalizeGenre(targetGenre))) {
      score += 25;
    }
    (item.genres || []).forEach(g => {
      const rank = (userProfile.topGenres || []).indexOf(g);
      if (rank === 0) score += 10;
      else if (rank === 1) score += 7;
      else if (rank >= 2) score += 4;
    });

    if (item.traktRating) {
      score += Math.min(20, item.traktRating * 2);
    }

    const matchPercentage = Math.min(99, Math.max(65, Math.round((score / 90) * 100)));

    const yearRangeObj = {
      exact: exactYear,
      min: yearMode === 'range' ? minYear : null,
      max: yearMode === 'range' ? maxYear : null
    };

    const reasoning = generateStructuredReasoning(item, userProfile, { genre: targetGenre, personName, langCode, yearRange: yearRangeObj }, referenceMatch, matchPercentage);

    return {
      ...item,
      matchScore: matchPercentage,
      reasoning
    };
  });

  // 3. Rank
  scored.sort((a, b) => {
    if (sortBy === 'rating') return (b.traktRating || 0) - (a.traktRating || 0);
    if (sortBy === 'year') return b.year - a.year;
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return b.matchScore - a.matchScore;
  });

  return scored;
}

/**
 * Natural language agent parser with Audience, Actor/Person, Language & Animation Exclusion Detection
 */
export function parseAgentPrompt(promptText = '', genresList = []) {
  const text = promptText.toLowerCase().trim();
  const result = {
    mediaType: 'all',
    genre: 'all',
    yearMode: 'all',
    exactYear: '',
    decade: '',
    excludeWatched: true,
    excludeAnimation: false,
    personName: null,
    langCode: null,
    referenceTitleKey: null
  };

  // 1. Language Intent Detection
  const langMappings = [
    { keys: ['farsi', 'persian', 'iranian', 'iran', 'farzi', 'parsi'], code: 'fa' },
    { keys: ['french', 'france'], code: 'fr' },
    { keys: ['spanish', 'spain', 'mexican'], code: 'es' },
    { keys: ['japanese', 'japan'], code: 'ja' },
    { keys: ['korean', 'korea'], code: 'ko' },
    { keys: ['italian', 'italy'], code: 'it' },
    { keys: ['german', 'germany'], code: 'de' }
  ];

  for (const l of langMappings) {
    if (l.keys.some(k => text.includes(k))) {
      result.langCode = l.code;
      break;
    }
  }

  // 2. Media type intent
  if (text.includes('movie') || text.includes('film')) {
    result.mediaType = 'movie';
  } else if (text.includes('tv') || text.includes('show') || text.includes('series')) {
    result.mediaType = 'show';
  }

  // 3. Audience / Adult Intent & Animation Exclusion
  const adultKeywords = ['adult', 'adults', 'mature', 'r-rated', 'r rated', 'live action', 'live-action', 'no animation', 'not animated', 'no cartoons', 'non animated'];
  if (adultKeywords.some(kw => text.includes(kw))) {
    result.excludeAnimation = true;
  }

  // 4. Actor / Person Intent Detection
  const knownPeople = [
    { keys: ['brad pit', 'brad pitt'], name: 'Brad Pitt' },
    { keys: ['leonardo dicaprio', 'dicaprio'], name: 'Leonardo DiCaprio' },
    { keys: ['tom cruise'], name: 'Tom Cruise' },
    { keys: ['keanu reeves'], name: 'Keanu Reeves' },
    { keys: ['tom hanks'], name: 'Tom Hanks' },
    { keys: ['denzel washington'], name: 'Denzel Washington' },
    { keys: ['christian bale'], name: 'Christian Bale' },
    { keys: ['cillian murphy'], name: 'Cillian Murphy' },
    { keys: ['quentin tarantino'], name: 'Quentin Tarantino' },
    { keys: ['christopher nolan'], name: 'Christopher Nolan' },
    { keys: ['asghar farhadi'], name: 'Asghar Farhadi' },
    { keys: ['abbas kiarostami'], name: 'Abbas Kiarostami' }
  ];

  for (const p of knownPeople) {
    if (p.keys.some(k => text.includes(k))) {
      result.personName = p.name;
      break;
    }
  }

  // 5. Decade / Era intent
  if (text.includes('90s') || text.includes('1990s') || text.includes('nineties')) {
    result.yearMode = 'decade';
    result.decade = '1990';
  } else if (text.includes('80s') || text.includes('1980s') || text.includes('eighties')) {
    result.yearMode = 'decade';
    result.decade = '1980';
  } else if (text.includes('2020s') || text.includes('recent') || text.includes('latest')) {
    result.yearMode = 'decade';
    result.decade = '2020';
  } else if (text.includes('2010s')) {
    result.yearMode = 'decade';
    result.decade = '2010';
  } else if (text.includes('2000s')) {
    result.yearMode = 'decade';
    result.decade = '2000';
  }

  // 6. Exact year regex
  const yearMatch = text.match(/\b(19\d\d|20\d\d)\b/);
  if (yearMatch && !result.decade) {
    result.yearMode = 'exact';
    result.exactYear = yearMatch[1];
  }

  // 7. Reference Movie/Show Detection
  for (const ref of REFERENCE_MEDIA) {
    if (ref.keywords.some(kw => text.includes(kw))) {
      result.referenceTitleKey = ref.keywords[0];
      result.genre = ref.genre;
      if (ref.isLiveActionAdult) {
        result.excludeAnimation = true;
      }
      break;
    }
  }

  // 8. Genre Keywords if no reference match
  if (result.genre === 'all') {
    const scifiKeywords = ['scifi', 'sci-fi', 'sci fi', 'science fiction', 'alien', 'space', 'cyberpunk', 'robot', 'future', 'dystopian'];
    const horrorKeywords = ['horror', 'scary', 'spooky', 'slasher', 'monster', 'ghost', 'haunted', 'zombie'];
    const comedyKeywords = ['comedy', 'funny', 'hilarious', 'humor', 'sitcom', 'laugh'];
    const actionKeywords = ['action', 'fight', 'hero', 'superhero', 'explosion', 'martial arts'];
    const dramaKeywords = ['drama', 'dramatic', 'emotional', 'history', 'biography'];
    const thrillerKeywords = ['thriller', 'suspense', 'mystery', 'crime', 'investigation', 'detective'];
    const animationKeywords = ['animation', 'anime', 'animated', 'cartoon'];

    if (scifiKeywords.some(kw => text.includes(kw))) result.genre = 'Science Fiction';
    else if (horrorKeywords.some(kw => text.includes(kw))) result.genre = 'Horror';
    else if (comedyKeywords.some(kw => text.includes(kw))) result.genre = 'Comedy';
    else if (actionKeywords.some(kw => text.includes(kw))) result.genre = 'Action';
    else if (thrillerKeywords.some(kw => text.includes(kw))) result.genre = 'Thriller';
    else if (animationKeywords.some(kw => text.includes(kw))) result.genre = 'Animation';
    else if (dramaKeywords.some(kw => text.includes(kw))) result.genre = 'Drama';
  }

  return result;
}
