// Trakt API Data Models & Expanded Semantic AI Catalog with Actor Filmographies

export const DEMO_GENRES = [
  { name: "Action", slug: "action" },
  { name: "Adventure", slug: "adventure" },
  { name: "Animation", slug: "animation" },
  { name: "Comedy", slug: "comedy" },
  { name: "Crime", slug: "crime" },
  { name: "Documentary", slug: "documentary" },
  { name: "Drama", slug: "drama" },
  { name: "Fantasy", slug: "fantasy" },
  { name: "Horror", slug: "horror" },
  { name: "Mystery", slug: "mystery" },
  { name: "Romance", slug: "romance" },
  { name: "Science Fiction", slug: "science-fiction" },
  { name: "Superhero", slug: "superhero" },
  { name: "Thriller", slug: "thriller" },
  { name: "Western", slug: "western" }
];

export const DEMO_USER_WATCHED = {
  movies: [
    {
      id: "blade-runner-2049",
      title: "Blade Runner 2049",
      year: 2017,
      type: "movie",
      genres: ["Science Fiction", "Drama", "Mystery", "Thriller"],
      themes: ["Cyberpunk", "AI & Androids", "Neo-Noir", "Dystopian", "Existential"],
      userRating: 9,
      traktRating: 8.5,
      watchedAt: "2024-02-14",
      plays: 3,
      poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
      overview: "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard."
    },
    {
      id: "interstellar",
      title: "Interstellar",
      year: 2014,
      type: "movie",
      genres: ["Science Fiction", "Drama", "Adventure"],
      themes: ["Deep Space", "Wormholes & Time Dilation", "Cosmic Survival", "Parental Bond"],
      userRating: 10,
      traktRating: 8.7,
      watchedAt: "2024-01-10",
      plays: 4,
      poster: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80",
      overview: "When Earth becomes uninhabitable, a team of ex-NASA pilots travels through a wormhole in search of a new home."
    }
  ],
  shows: []
};

export const DEMO_USER_LIKES = [
  { id: "arrival", title: "Arrival", type: "movie", year: 2016, genres: ["Science Fiction", "Drama", "Mystery"], themes: ["First Contact", "Linguistics"] }
];

export const DEMO_CATALOG_CANDIDATES = [
  {
    id: "fight-club",
    title: "Fight Club",
    year: 1999,
    type: "movie",
    genres: ["Drama", "Thriller"],
    themes: ["Dual Identity", "Anarchy", "Anti-Consumerism", "Psychological Thriller"],
    traktRating: 8.8,
    votes: 185000,
    runtime: 139,
    overview: "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.",
    director: "David Fincher",
    cast: ["Brad Pitt", "Edward Norton", "Helena Bonham Carter"]
  },
  {
    id: "se7en",
    title: "Se7en",
    year: 1995,
    type: "movie",
    genres: ["Crime", "Drama", "Mystery", "Thriller"],
    themes: ["Seven Deadly Sins", "Grim Detective", "Serial Killer", "Neo-Noir"],
    traktRating: 8.7,
    votes: 172000,
    runtime: 127,
    overview: "Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives.",
    director: "David Fincher",
    cast: ["Brad Pitt", "Morgan Freeman", "Gwyneth Paltrow"]
  },
  {
    id: "inglourious-basterds",
    title: "Inglourious Basterds",
    year: 2009,
    type: "movie",
    genres: ["Adventure", "Drama", "War", "Action"],
    themes: ["Alternative History", "WWII Revenge", "Cinema Culture", "Dark Comedy"],
    traktRating: 8.6,
    votes: 165000,
    runtime: 153,
    overview: "In Nazi-occupied France during WWII, a plan to assassinate Nazi leaders by a group of Jewish U.S. soldiers coincides with a theatre owner's vengeful plans.",
    director: "Quentin Tarantino",
    cast: ["Brad Pitt", "Christoph Waltz", "Mélanie Laurent", "Michael Fassbender"]
  },
  {
    id: "12-monkeys",
    title: "12 Monkeys",
    year: 1995,
    type: "movie",
    genres: ["Science Fiction", "Mystery", "Thriller"],
    themes: ["Time Travel", "Viral Apocalypse", "Mental Asylum", "Dystopian"],
    traktRating: 8.0,
    votes: 82000,
    runtime: 129,
    overview: "In a future world devastated by disease, a convict is sent back in time to gather information about the man-made virus that wiped out the human race.",
    director: "Terry Gilliam",
    cast: ["Bruce Willis", "Brad Pitt", "Madeleine Stowe"]
  },
  {
    id: "moneyball",
    title: "Moneyball",
    year: 2011,
    type: "movie",
    genres: ["Biography", "Drama", "Sport"],
    themes: ["Baseball Analytics", "Underdog Strategy", "Sports Management"],
    traktRating: 8.1,
    votes: 95000,
    runtime: 133,
    overview: "Oakland A's general manager Billy Beane's successful attempt to assemble a baseball team on a lean budget by employing computer-generated statistical analysis.",
    director: "Bennett Miller",
    cast: ["Brad Pitt", "Jonah Hill", "Philip Seymour Hoffman"]
  },
  {
    id: "bullet-train",
    title: "Bullet Train",
    year: 2022,
    type: "movie",
    genres: ["Action", "Comedy", "Thriller"],
    themes: ["High-Speed Train", "Interconnected Assassins", "Luck & Fate"],
    traktRating: 7.7,
    votes: 78000,
    runtime: 126,
    overview: "Five assassins aboard a swiftly-moving bullet train find out their missions have something in common.",
    director: "David Leitch",
    cast: ["Brad Pitt", "Joey King", "Aaron Taylor-Johnson"]
  },
  {
    id: "once-upon-a-time-in-hollywood",
    title: "Once Upon a Time in Hollywood",
    year: 2019,
    type: "movie",
    genres: ["Comedy", "Drama"],
    themes: ["1969 Hollywood", "Stuntman Loyalty", "Golden Age Cinema"],
    traktRating: 8.0,
    votes: 124000,
    runtime: 161,
    overview: "A faded television actor and his stunt double strive to achieve fame and success in the final years of Hollywood's Golden Age in 1969 Los Angeles.",
    director: "Quentin Tarantino",
    cast: ["Leonardo DiCaprio", "Brad Pitt", "Margot Robbie"]
  },
  {
    id: "prometheus",
    title: "Prometheus",
    year: 2012,
    type: "movie",
    genres: ["Science Fiction", "Horror", "Mystery", "Thriller"],
    themes: ["Deep Space", "Cosmic Horror", "Alien Prequel", "Engineers", "AI Android", "Claustrophobic Survival"],
    traktRating: 7.9,
    votes: 115000,
    runtime: 124,
    overview: "Following clues to the origin of mankind, a team finds a structure on a distant moon, but they soon realize they are not alone.",
    director: "Ridley Scott",
    cast: ["Noomi Rapace", "Michael Fassbender", "Charlize Theron"]
  },
  {
    id: "alien-romulus",
    title: "Alien: Romulus",
    year: 2024,
    type: "movie",
    genres: ["Science Fiction", "Horror", "Thriller"],
    themes: ["Alien Creature", "Deep Space", "Cosmic Horror", "Claustrophobic Survival"],
    traktRating: 8.1,
    votes: 29500,
    runtime: 119,
    overview: "While scavenging the deep ends of a derelict space station, a group of young space colonizers comes face to face with the most terrifying life form in the universe.",
    director: "Fede Álvarez",
    cast: ["Cailee Spaeny", "David Jonsson", "Archie Renaux"]
  },
  {
    id: "alien-1979",
    title: "Alien",
    year: 1979,
    type: "movie",
    genres: ["Science Fiction", "Horror"],
    themes: ["Alien Creature", "Deep Space", "Cosmic Horror", "Xenomorph", "Claustrophobic"],
    traktRating: 8.6,
    votes: 142000,
    runtime: 117,
    overview: "The crew of a commercial spacecraft encounter a deadly lifeform after investigating a mysterious transmission.",
    director: "Ridley Scott",
    cast: ["Sigourney Weaver", "Tom Skerritt", "John Hurt"]
  },
  {
    id: "the-thing-1982",
    title: "The Thing",
    year: 1982,
    type: "movie",
    genres: ["Science Fiction", "Horror", "Mystery"],
    themes: ["Parasitic Shapeshifter", "Isolation", "Paranoia", "Cosmic Horror"],
    traktRating: 8.6,
    votes: 110000,
    runtime: 109,
    overview: "A research team in Antarctica is hunted by a shape-shifting alien that assumes the appearance of its victims.",
    director: "John Carpenter",
    cast: ["Kurt Russell", "Wilford Brimley", "Keith David"]
  }
];
