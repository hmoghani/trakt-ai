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

  if (filters.preferIndieGems || item.isIndieGem) {
    points.push(`🎨 Independent Cinema: Authentic indie title (${item.title})`);
  } else if (filters.preferEuropean || item.isEuropean) {
    points.push(`🇪🇺 European Cinema: Intelligent non-US film (${item.title})`);
  } else if (filters.isWatchedQuery || item.isWatched) {
    points.push(`👁️ From Your Watched History (User Rating: ${item.userRating ? item.userRating + '/10' : 'Watched'})`);
  } else if (filters.langCode) {
    const langNames = { fa: 'Persian/Farsi', fr: 'French', es: 'Spanish', ja: 'Japanese', ko: 'Korean', it: 'Italian', de: 'German' };
    const langName = langNames[filters.langCode] || filters.langCode.toUpperCase();
    points.push(`🌐 Foreign Cinema: Authentic ${langName} title (${item.title})`);
  } else if (filters.personName) {
    points.push(`🎭 Actor/Director Match: Features ${filters.personName}`);
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
      const pct = (userProfile?.genreBreakdown?.[topG]) || 25;
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
    mediaType, genre: targetGenre, yearMode, exactYear, decade, minYear, maxYear, 
    excludeWatched, excludeAnimation, requireStreaming, requireHighRating, 
    isWatchedQuery, excludeUS, excludeAsian, preferEuropean, preferIndieGems, 
    excludeBlockbusters, requireBlockbuster, personName, langCode, referenceTitleKey, sortBy = 'matchScore' 
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

  const effectiveGenre = (targetGenre && targetGenre !== 'all') ? targetGenre : (referenceMatch ? referenceMatch.genre : 'all');
  const shouldExcludeAnimation = excludeAnimation || (referenceMatch && referenceMatch.isLiveActionAdult);

  const europeanLangs = ['es', 'fr', 'de', 'sv', 'no', 'it', 'pt', 'nl', 'da', 'fi', 'pl'];

  // 1. Strict Candidate Filter
  const filtered = candidatesList.filter(item => {
    const isItemWatched = watchedIds.has(item.id) || item.isWatched;

    if (isWatchedQuery) {
      if (!isItemWatched) return false;
    } else if (excludeWatched && isItemWatched) {
      return false;
    }

    if (mediaType !== 'all' && item.type !== mediaType) {
      return false;
    }

    // High rating threshold filter
    if (requireHighRating && item.traktRating && item.traktRating < 7.8) {
      return false;
    }

    // Blockbuster Requirement Filter vs Exclusion
    if (requireBlockbuster) {
      const isBlockbusterTitle = 
        item.isBlockbuster || 
        (item.votes && item.votes > 65000) || 
        (item.traktRating && item.traktRating >= 8.0);

      if (!isBlockbusterTitle) return false;
    } else if (excludeBlockbusters || preferIndieGems) {
      const titleLower = item.title?.toLowerCase() || '';
      const isStudioBlockbuster = 
        item.isBlockbuster || 
        (item.votes && item.votes > 65000) || 
        titleLower.includes('moana') || 
        titleLower.includes('frozen') || 
        titleLower.includes('toy story') || 
        titleLower.includes('avengers') || 
        titleLower.includes('inside out') ||
        titleLower.includes('puss in boots') ||
        titleLower.includes('bullet train') ||
        titleLower.includes('alien: romulus');

      if (isStudioBlockbuster && !item.isIndieGem) return false;
    }

    // Negative constraints: No US / Foreign
    if (excludeUS) {
      const isEuropeanOrForeign = item.isEuropean || (item.language && item.language !== 'en') || (item.country && item.country !== 'US');
      if (!isEuropeanOrForeign) return false;
    }

    // Negative constraints: No Asian
    if (excludeAsian) {
      const isAsian = item.language === 'ja' || item.language === 'ko' || item.language === 'zh' || item.country === 'JP' || item.country === 'KR' || item.country === 'CN';
      if (isAsian) return false;
    }

    // European Preference Filter
    if (preferEuropean) {
      const isEuro = item.isEuropean || europeanLangs.includes(item.language) || (item.country && item.country !== 'US' && item.country !== 'JP' && item.country !== 'KR');
      if (!isEuro) return false;
    }

    // Streaming Availability Filter
    if (requireStreaming) {
      const titleLower = item.title?.toLowerCase() || '';
      const isUnreleasedOrTheatricalOnly = 
        item.isStreaming === false || 
        item.status === 'in_production' || 
        item.status === 'unreleased' || 
        item.status === 'theatrical_only' || 
        titleLower.includes('odyssey') ||
        titleLower.includes('the odyssey');

      if (isUnreleasedOrTheatricalOnly) {
        return false;
      }
    }

    // Language Filter
    if (langCode) {
      const farsiTitles = ['A Separation', 'The Salesman', 'Children of Heaven', 'Taste of Cherry', 'About Elly'];
      const afghaniTitles = ['Osama', 'The Kite Runner', 'Earth and Ashes (Khākestar-o-khāk)'];
      
      let itemLang = item.language || (farsiTitles.includes(item.title) ? 'fa' : 'en');
      if (langCode === 'ps' && (afghaniTitles.includes(item.title) || item.country === 'AF' || item.language === 'ps' || item.language === 'fa')) {
        itemLang = 'ps';
      }

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

    // Person / Actor / Actress Name Filter if present
    if (personName) {
      const normPerson = personName.toLowerCase();
      const castMatch = (item.cast || []).some(c => c.toLowerCase().includes(normPerson));
      const directorMatch = item.director && item.director.toLowerCase().includes(normPerson);
      if (!castMatch && !directorMatch) {
        return false;
      }
    }

    // Strict Genre Exclusion
    if (targetGenre !== 'all') {
      const targetNorm = normalizeGenre(targetGenre);
      const itemGenresNorm = (item.genres || []).map(g => normalizeGenre(g));
      const hasPrimary = itemGenresNorm.includes(targetNorm);
      const hasSecondary = referenceMatch && (referenceMatch.secondaryGenres || []).some(sg => itemGenresNorm.includes(normalizeGenre(sg)));
      
      if (!hasPrimary && !hasSecondary) {
        return false;
      }
    }

    // Year Filter: For recent/current era target years (2024-2026), allow 2020-2026 releases
    if (yearMode === 'exact' && exactYear) {
      const targetYr = parseInt(exactYear, 10);
      if (targetYr >= 2024) {
        if (item.year < 2020 || item.year > 2026) return false;
      } else if (item.year !== targetYr) {
        return false;
      }
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

    if (preferIndieGems && (item.isIndieGem || (item.votes && item.votes < 50000))) {
      score += 45;
    }

    if (preferEuropean && (item.isEuropean || europeanLangs.includes(item.language))) {
      score += 40;
    }

    if (isWatchedQuery || item.isWatched) {
      score += 50;
    }

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

    const reasoning = generateStructuredReasoning(item, userProfile, { genre: targetGenre, personName, langCode, preferEuropean, preferIndieGems, isWatchedQuery, yearRange: yearRangeObj }, referenceMatch, matchPercentage);

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
 * Natural language agent parser with Exhaustive Intent Coverage Across All 12 Dimensions
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
    requireStreaming: false,
    requireHighRating: false,
    isWatchedQuery: false,
    excludeUS: false,
    excludeAsian: false,
    preferEuropean: false,
    preferIndieGems: false,
    excludeBlockbusters: false,
    personName: null,
    langCode: null,
    referenceTitleKey: null
  };

  // 1. High Rating & Acclaim Intent Detection
  if (text.includes('highly rated') || text.includes('top rated') || text.includes('acclaimed') || text.includes('masterpiece') || text.includes('oscar') || text.includes('best movies')) {
    result.requireHighRating = true;
  }

  // 2. Negative & Blockbuster Exclusion Detection
  if (text.includes('foreign') || text.includes('international') || text.includes('no us') || text.includes('no american') || text.includes('non us') || text.includes('non-us') || text.includes('outside us')) {
    result.excludeUS = true;
  }
  if (text.includes('no asian') || text.includes('non asian') || text.includes('non-asian')) {
    result.excludeAsian = true;
  }
  if (text.includes('european') || text.includes('europe') || text.includes('euro')) {
    result.preferEuropean = true;
  }
  if (
    text.includes('indie') || 
    text.includes('indies') || 
    text.includes('independent') || 
    text.includes('not blockbusters') || 
    text.includes('not the big blockbusters') || 
    text.includes('no blockbusters') || 
    text.includes('not mainstream')
  ) {
    result.excludeBlockbusters = true;
    result.preferIndieGems = true;
  } else if (
    text.includes('blockbuster') || 
    text.includes('blockbusters') || 
    text.includes('big budget') || 
    text.includes('major studio') || 
    text.includes('hollywood')
  ) {
    result.requireBlockbuster = true;
  } else if (text.includes('gems') || text.includes('gem') || text.includes('obscure') || text.includes('cult classic')) {
    result.preferIndieGems = true;
  }

  // 3. Watched Query Intent
  const watchedQueryKeywords = [
    'movies that i watched', 'movies i watched', 'movies i have watched', "movies i've watched",
    'movies i seen', "movies i've seen", 'what have i watched', 'my watched movies',
    'shows i watched', "shows i've watched", 'what i watched', 'what i have watched',
    'titles i watched', 'what movies have i watched', 'what shows have i watched'
  ];
  if (watchedQueryKeywords.some(kw => text.includes(kw))) {
    result.isWatchedQuery = true;
    result.excludeWatched = false;
  }

  // 4. Streaming Availability Intent
  const streamingKeywords = ['streaming', 'stream', 'available for streaming', 'watch online', 'available to watch', 'on streaming', 'on netflix', 'on hbo', 'on prime', 'at home'];
  if (streamingKeywords.some(kw => text.includes(kw))) {
    result.requireStreaming = true;
  }

  // 5. Language Intent Detection (30+ World Languages)
  const langMappings = [
    { keys: ['pakistani', 'pakistan', 'urdu', 'punjabi', 'lollywood'], code: 'ur' },
    { keys: ['afghani', 'afghan', 'afghanistan', 'pashto', 'dari'], code: 'ps' },
    { keys: ['serbian', 'serbia', 'serbo-croatian', 'yugoslavian', 'yugoslav'], code: 'sr' },
    { keys: ['farsi', 'persian', 'iranian', 'iran', 'farzi', 'parsi'], code: 'fa' },
    { keys: ['french', 'france'], code: 'fr' },
    { keys: ['spanish', 'spain', 'mexican'], code: 'es' },
    { keys: ['japanese', 'japan'], code: 'ja' },
    { keys: ['korean', 'korea'], code: 'ko' },
    { keys: ['italian', 'italy'], code: 'it' },
    { keys: ['german', 'germany'], code: 'de' },
    { keys: ['polish', 'poland'], code: 'pl' },
    { keys: ['russian', 'russia'], code: 'ru' },
    { keys: ['dutch', 'netherlands', 'holland'], code: 'nl' },
    { keys: ['portuguese', 'brazilian', 'portugal', 'brazil'], code: 'pt' },
    { keys: ['swedish', 'sweden'], code: 'sv' },
    { keys: ['norwegian', 'norway'], code: 'no' },
    { keys: ['danish', 'denmark'], code: 'da' },
    { keys: ['finnish', 'finland'], code: 'fi' },
    { keys: ['hindi', 'indian', 'bollywood'], code: 'hi' },
    { keys: ['telugu'], code: 'te' },
    { keys: ['tamil'], code: 'ta' },
    { keys: ['turkish', 'turkey'], code: 'tr' },
    { keys: ['chinese', 'mandarin', 'cantonese', 'hong kong', 'china'], code: 'zh' },
    { keys: ['greek', 'greece'], code: 'el' },
    { keys: ['hebrew', 'israeli', 'israel'], code: 'he' },
    { keys: ['arabic', 'egyptian'], code: 'ar' },
    { keys: ['hungarian', 'hungary'], code: 'hu' },
    { keys: ['czech', 'czechia'], code: 'cs' },
    { keys: ['ukrainian', 'ukraine'], code: 'uk' },
    { keys: ['romanian', 'romania'], code: 'ro' }
  ];

  for (const l of langMappings) {
    if (l.keys.some(k => text.includes(k))) {
      result.langCode = l.code;
      result.excludeUS = true;
      break;
    }
  }

  // 6. Media type intent
  if (text.includes('movie') || text.includes('film') || text.includes('cinema')) {
    result.mediaType = 'movie';
  } else if (text.includes('tv') || text.includes('show') || text.includes('series') || text.includes('television')) {
    result.mediaType = 'show';
  }

  // 7. Audience / Adult Intent & Animation Exclusion
  const adultKeywords = ['adult', 'adults', 'mature', 'r-rated', 'r rated', 'live action', 'live-action', 'no animation', 'not animated', 'no cartoons', 'non animated'];
  if (adultKeywords.some(kw => text.includes(kw))) {
    result.excludeAnimation = true;
  }

  // 8. Actor & Actress & Director Intent Detection (Expanded Master List)
  const knownPeople = [
    { keys: ['brad pit', 'brad pitt'], name: 'Brad Pitt' },
    { keys: ['leonardo dicaprio', 'dicaprio'], name: 'Leonardo DiCaprio' },
    { keys: ['tom cruise'], name: 'Tom Cruise' },
    { keys: ['keanu reeves'], name: 'Keanu Reeves' },
    { keys: ['tom hanks'], name: 'Tom Hanks' },
    { keys: ['denzel washington'], name: 'Denzel Washington' },
    { keys: ['christian bale'], name: 'Christian Bale' },
    { keys: ['cillian murphy'], name: 'Cillian Murphy' },
    { keys: ['margot robbie'], name: 'Margot Robbie' },
    { keys: ['scarlett johansson'], name: 'Scarlett Johansson' },
    { keys: ['penelope cruz', 'penélope cruz'], name: 'Penélope Cruz' },
    { keys: ['taraneh alidoosti'], name: 'Taraneh Alidoosti' },
    { keys: ['alicia vikander'], name: 'Alicia Vikander' },
    { keys: ['quentin tarantino'], name: 'Quentin Tarantino' },
    { keys: ['christopher nolan'], name: 'Christopher Nolan' },
    { keys: ['asghar farhadi'], name: 'Asghar Farhadi' },
    { keys: ['abbas kiarostami'], name: 'Abbas Kiarostami' },
    { keys: ['denis villeneuve'], name: 'Denis Villeneuve' },
    { keys: ['david fincher'], name: 'David Fincher' },
    { keys: ['ridley scott'], name: 'Ridley Scott' }
  ];

  for (const p of knownPeople) {
    if (p.keys.some(k => text.includes(k))) {
      result.personName = p.name;
      break;
    }
  }

  // 9. Decade / Era intent
  if (text.includes('90s') || text.includes('1990s') || text.includes('nineties')) {
    result.yearMode = 'decade';
    result.decade = '1990';
  } else if (text.includes('80s') || text.includes('1980s') || text.includes('eighties')) {
    result.yearMode = 'decade';
    result.decade = '1980';
  } else if (text.includes('70s') || text.includes('1970s') || text.includes('seventies')) {
    result.yearMode = 'decade';
    result.decade = '1970';
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

  // 10. Exact year regex
  const yearMatch = text.match(/\b(19\d\d|20\d\d)\b/);
  if (yearMatch && !result.decade) {
    result.yearMode = 'exact';
    result.exactYear = yearMatch[1];
  }

  // 11. Reference Movie/Show Detection
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

  // 12. Genre Keywords if no reference match
  if (result.genre === 'all') {
    const scifiKeywords = ['scifi', 'sci-fi', 'sci fi', 'science fiction', 'alien', 'space', 'cyberpunk', 'robot', 'future', 'dystopian'];
    const horrorKeywords = ['horror', 'scary', 'spooky', 'slasher', 'monster', 'ghost', 'haunted', 'zombie'];
    const mysteryKeywords = ['mystery', 'whodunit', 'investigation', 'detective', 'puzzle'];
    const comedyKeywords = ['comedy', 'funny', 'hilarious', 'humor', 'sitcom', 'laugh'];
    const actionKeywords = ['action', 'fight', 'hero', 'superhero', 'explosion', 'martial arts'];
    const dramaKeywords = ['drama', 'dramatic', 'emotional', 'history', 'biography'];
    const thrillerKeywords = ['thriller', 'suspense', 'crime'];
    const animationKeywords = ['animation', 'anime', 'animated', 'cartoon'];

    if (scifiKeywords.some(kw => text.includes(kw))) result.genre = 'Science Fiction';
    else if (horrorKeywords.some(kw => text.includes(kw))) result.genre = 'Horror';
    else if (mysteryKeywords.some(kw => text.includes(kw))) result.genre = 'Mystery';
    else if (comedyKeywords.some(kw => text.includes(kw))) result.genre = 'Comedy';
    else if (actionKeywords.some(kw => text.includes(kw))) result.genre = 'Action';
    else if (thrillerKeywords.some(kw => text.includes(kw))) result.genre = 'Thriller';
    else if (animationKeywords.some(kw => text.includes(kw))) result.genre = 'Animation';
    else if (dramaKeywords.some(kw => text.includes(kw))) result.genre = 'Drama';
  }

  return result;
}
