// Trakt API Data Models & Expanded Semantic AI Catalog with Farsi & World Cinema

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
  movies: [],
  shows: []
};

export const DEMO_USER_LIKES = [];

export const DEMO_CATALOG_CANDIDATES = [
  // Acclaimed Farsi / Iranian Cinema Masterpieces
  {
    id: "a-separation",
    title: "A Separation",
    year: 2011,
    type: "movie",
    language: "fa",
    genres: ["Drama", "Mystery"],
    themes: ["Family Divorce", "Moral Dilemma", "Iranian Society", "Oscar Winner"],
    traktRating: 8.7,
    votes: 112000,
    runtime: 123,
    overview: "A married couple faced with a difficult decision - to improve the life of their child by moving to another country or stay in Iran to look after a parent with Alzheimer's disease.",
    director: "Asghar Farhadi",
    cast: ["Payman Maadi", "Leila Hatami", "Sareh Bayat", "Shahab Hosseini"]
  },
  {
    id: "the-salesman",
    title: "The Salesman",
    year: 2016,
    type: "movie",
    genres: ["Drama", "Mystery", "Thriller"],
    language: "fa",
    themes: ["Assault Trauma", "Revenge", "Tehran Theatre", "Oscar Winner"],
    traktRating: 8.2,
    votes: 68000,
    runtime: 124,
    overview: "While participating in a production of Death of a Salesman, a young Iranian couple's relationship begins to turn sour after the wife is assaulted in their new apartment.",
    director: "Asghar Farhadi",
    cast: ["Taraneh Alidoosti", "Shahab Hosseini", "Babak Karimi"]
  },
  {
    id: "children-of-heaven",
    title: "Children of Heaven",
    year: 1997,
    type: "movie",
    genres: ["Drama", "Family", "Sport"],
    language: "fa",
    themes: ["Lost Shoes", "Brother Sister Bond", "Poverty & Dignity", "Footrace"],
    traktRating: 8.5,
    votes: 54000,
    runtime: 89,
    overview: "After a boy loses his sister's pair of shoes, he goes on a series of adventures in order to find them without his parents knowing.",
    director: "Majid Majidi",
    cast: ["Amir Farrokh Hashemian", "Bahare Seddiqi", "Reza Naji"]
  },
  {
    id: "taste-of-cherry",
    title: "Taste of Cherry",
    year: 1997,
    type: "movie",
    genres: ["Drama"],
    language: "fa",
    themes: ["Existence & Life", "Palme d'Or Winner", "Tehran Hills", "Philosophical Journey"],
    traktRating: 8.1,
    votes: 38000,
    runtime: 95,
    overview: "A middle-aged man drives through a city suburb looking for someone who can carry out the task of burying him after he commits suicide.",
    director: "Abbas Kiarostami",
    cast: ["Homayoun Ershadi", "Abdolhossein Bagheri", "Afshin Khorshid Bakhtiari"]
  },
  {
    id: "about-elly",
    title: "About Elly",
    year: 2009,
    type: "movie",
    genres: ["Drama", "Mystery", "Thriller"],
    language: "fa",
    themes: ["Caspian Sea Vacation", "Disappearance", "Secrets & Lies"],
    traktRating: 8.3,
    votes: 42000,
    runtime: 119,
    overview: "The mysterious disappearance of a kindergarten teacher during a weekend vacation in northern Iran drives a series of deceptions among a group of close friends.",
    director: "Asghar Farhadi",
    cast: ["Golshifteh Farahani", "Shahab Hosseini", "Taraneh Alidoosti"]
  },

  // Western & Hollywood Titles
  {
    id: "fight-club",
    title: "Fight Club",
    year: 1999,
    type: "movie",
    genres: ["Drama", "Thriller"],
    themes: ["Dual Identity", "Anarchy", "Anti-Consumerism"],
    traktRating: 8.8,
    votes: 185000,
    runtime: 139,
    overview: "An insomniac office worker and a devil-may-care soap maker form an underground fight club.",
    director: "David Fincher",
    cast: ["Brad Pitt", "Edward Norton", "Helena Bonham Carter"]
  },
  {
    id: "se7en",
    title: "Se7en",
    year: 1995,
    type: "movie",
    genres: ["Crime", "Drama", "Mystery", "Thriller"],
    themes: ["Seven Deadly Sins", "Grim Detective", "Serial Killer"],
    traktRating: 8.7,
    votes: 172000,
    runtime: 127,
    overview: "Two detectives hunt a serial killer who uses the seven deadly sins as his motives.",
    director: "David Fincher",
    cast: ["Brad Pitt", "Morgan Freeman", "Gwyneth Paltrow"]
  },
  {
    id: "prometheus",
    title: "Prometheus",
    year: 2012,
    type: "movie",
    genres: ["Science Fiction", "Horror", "Mystery", "Thriller"],
    themes: ["Deep Space", "Cosmic Horror", "Alien Prequel", "Engineers"],
    traktRating: 7.9,
    votes: 115000,
    runtime: 124,
    overview: "Following clues to the origin of mankind, a team finds a structure on a distant moon.",
    director: "Ridley Scott",
    cast: ["Noomi Rapace", "Michael Fassbender", "Charlize Theron"]
  },
  {
    id: "alien-1979",
    title: "Alien",
    year: 1979,
    type: "movie",
    genres: ["Science Fiction", "Horror"],
    themes: ["Alien Creature", "Deep Space", "Cosmic Horror"],
    traktRating: 8.6,
    votes: 142000,
    runtime: 117,
    overview: "The crew of a commercial spacecraft encounter a deadly lifeform after investigating a mysterious transmission.",
    director: "Ridley Scott",
    cast: ["Sigourney Weaver", "Tom Skerritt", "John Hurt"]
  }
];
