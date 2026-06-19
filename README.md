# Movie Explorer

TypeScript class for fetching movie data from TMDB API with in-memory caching and request history.

## Features
- Search movies by name
- Get full movie details by ID
- Get first match from search results (helper method)
- Parallel batch loading for multiple movies via `Promise.all`
- In-memory caching for both search results and movie details
- Request history tracking with cache hit/miss info
- Full TypeScript types with interface inheritance

## Stack
- TypeScript
- TMDB API v4 (https://www.themoviedb.org/documentation/api)
- Node.js

## Setup

```bash
npm install
```

Create `.env` file in the project root:
Put TMDB_TOKEN=your_tmdb_v4_read_access_token_here inside

Get a free API Read Access Token (v4) at https://www.themoviedb.org/settings/api

Run:

```bash
npx ts-node app.ts
```

## Usage

```typescript
const explorer = new MovieExplorer();

// Search for movies
const results = await explorer.movieSearch("iron man");

// Get full details by movie ID
const details = await explorer.getMovieDetails(1726);

// Get first result from search (helper)
const firstMatch = await explorer.getFirstFromList("inception");

// Get multiple movies in parallel
const movies = await explorer.getMany([1726, 27205, 155]);

// Check request history
console.log(explorer.getHistory());
```

## Concepts demonstrated

- TypeScript classes with private fields and methods
- Interface inheritance via `extends`
- Generic Map for type-safe caching (number and string keys)
- Utility types (`Omit`) for parameter shaping
- Parallel async operations via Promise.all
- Bearer token authentication via headers
- `readonly` properties for class configuration
- Early return pattern for null handling
- URL encoding for query parameters (`encodeURIComponent`)

## Author
maxvol123
