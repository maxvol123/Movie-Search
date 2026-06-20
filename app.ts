process.loadEnvFile()
interface Movie {
    adult: boolean
    id: number,
    title: string,
    original_language: string,
    original_title: string,
    overview:string,
    popularity: number,
    release_date: string,
    vote_average: number,
}
interface Genre {
    id: number;
    name: string;
}
interface ProductionCompany {
    iso_3166_1: string;
    name: string;
}
interface MovieDetails extends Movie {
    budget: number,
    genres: Genre[],
    origin_country: string,
    production_companies: ProductionCompany[]
    status: string
}
interface MoviesResponse {
    results: Movie[]
}
interface HistoryEntry {
    message: string
    fromCache: boolean
    date: Date
}
function handleError(title:string, error?: unknown):null {
    console.error(`error in ${title} `, error);
    return null
}
class MovieExplorer {
    private movieSearchCache = new Map<string, MoviesResponse>()
    private movieDetailsCache = new Map<number, MovieDetails>()
    private history: HistoryEntry[] = []
    private readonly token = process.env.TMDB_TOKEN;
    private readonly baseUrl = "https://api.themoviedb.org/3";
    private get headers() {
    return {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/json'
    };
}
    private pushInHistory(entry: Omit<HistoryEntry, "date">) {
        this.history.push({...entry, date: new Date()})
    }
    clearCache(): void {
    this.movieSearchCache.clear();
    this.movieDetailsCache.clear();
}
    private async fetchJson<T>(url: string): Promise<T | null>{
        try {
            const response = await fetch(url, {
                headers: this.headers
            })
            if (response.ok) {
                return await response.json() as T
            }
                return handleError(`fetchJson HTTP ${response.status} for ${url}`)
  
        } catch (error) {
            return handleError(`fetchJson error for ${url}`, error);
        }
    }
    async movieSearch(movieName:string):Promise <MoviesResponse | null>{
            const cached = this.movieSearchCache.get(movieName)
            if (cached) {
                this.pushInHistory({message: `movieSearch ${movieName}`, fromCache: true})
                return cached
            }
            const answer = await this.fetchJson<MoviesResponse>(`${this.baseUrl}/search/movie?query=${encodeURIComponent(movieName)}`)
                if (answer) {
                    this.movieSearchCache.set(movieName, answer)
                this.pushInHistory({message: `movieSearch ${movieName}`, fromCache: false})
                return answer
                }
                return null
    }
    async getMovieDetails(movieId: number): Promise<MovieDetails | null>{
        const cached = this.movieDetailsCache.get(movieId)
        if (cached) {
            this.pushInHistory({message: `getMovieDetails ${movieId}`, fromCache: true})
            return cached
        }
        const answer = await this.fetchJson<MovieDetails>(`${this.baseUrl}/movie/${movieId}`)
            if (answer) {
                this.movieDetailsCache.set(movieId, answer)
                this.pushInHistory({message: `getMovieDetails ${movieId}`, fromCache: false})
                return answer
            }
            return null
        

    }
    getHistory(){
        return this.history
    }
    async getFirstFromList(movieName:string):Promise <Movie | null>{
        const answer = await this.movieSearch(movieName)
        return answer?.results[0] ?? null;
    }
    async getMany(movieIds: number[]):Promise<(MovieDetails | null)[]>{
        return Promise.all(movieIds.map(id => this.getMovieDetails(id)))
    }
}

const explorer = new MovieExplorer()
const film1 =  await explorer.getFirstFromList("cat")
const film2 =  await explorer.getFirstFromList("iron man")