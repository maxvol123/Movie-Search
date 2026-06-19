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
    async movieSearch(movieName:string):Promise <MoviesResponse | null>{
        try {
            const cached = this.movieSearchCache.get(movieName)
            if (cached) {
                this.pushInHistory({message: `movieSearch ${movieName}`, fromCache: true})
                return cached
            }
            const response = await fetch(`${this.baseUrl}/search/movie?query=${encodeURIComponent(movieName)}`, {
            headers: this.headers
            })
            if (response.ok) {
                const answer:MoviesResponse = await response.json()
                this.movieSearchCache.set(movieName, answer)
                this.pushInHistory({message: `movieSearch ${movieName}`, fromCache: false})
                return answer
            }
            return handleError("movieSearch response is not okay")
        } catch (error) {
            return handleError("movieSearch try/catch error", error)
        }

    }
    async getMovieDetails(movieId: number): Promise<MovieDetails | null>{
        try {
        const cached = this.movieDetailsCache.get(movieId)
        if (cached) {
            this.pushInHistory({message: `getMovieDetails ${movieId}`, fromCache: true})
            return cached
        }
        const response = await fetch(`${this.baseUrl}/movie/${movieId}`, {
            headers: this.headers
            })
            if (response.ok) {
                const answer:MovieDetails = await response.json()
                this.movieDetailsCache.set(movieId, answer)
                this.pushInHistory({message: `getMovieDetails ${movieId}`, fromCache: false})

                return answer
            }
            return handleError("getMovieDetails response not ok error")
        } catch (error) {
            return handleError("getMovieDetails try/catch error", error)
        }
        

    }
    getHistory(){
        return this.history
    }
    async getFirstFromList(movieName:string):Promise <Movie | null>{
        const answer = await this.movieSearch(movieName)
        return answer?.results[0] ?? null;
    }
    async getMany(movieIds: number[]):Promise<(MovieDetails | null)[]>{
        const promises = movieIds.map(el=> this.getMovieDetails(el))
        return await Promise.all(promises)
    }
}

const explorer = new MovieExplorer()
const film1 =  await explorer.getFirstFromList("cat")
const film2 =  await explorer.getFirstFromList("iron man")

if (film1 && film2) {    
await explorer.getMovieDetails(film1.id)
await explorer.getMovieDetails(film1.id)
console.log(await explorer.getMany([film1.id, film2.id]));
console.log(explorer.getHistory());
}
