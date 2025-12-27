const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const base = 'https://api.themoviedb.org/3';

const requests = {
  fetchTrending: `${base}/trending/all/week?api_key=${API_KEY}`,
  fetchNetflixOriginals: `${base}/discover/tv?api_key=${API_KEY}&with_networks=213`,
  fetchTopRated: `${base}/movie/top_rated?api_key=${API_KEY}`,
  fetchActionMovies: `${base}/discover/movie?api_key=${API_KEY}&with_genres=28`,
  fetchComedyMovies: `${base}/discover/movie?api_key=${API_KEY}&with_genres=35`,
  fetchHorrorMovies: `${base}/discover/movie?api_key=${API_KEY}&with_genres=27`,
  fetchRomanceMovies: `${base}/discover/movie?api_key=${API_KEY}&with_genres=10749`,
  fetchDocumentaries: `${base}/discover/movie?api_key=${API_KEY}&with_genres=99`,
  fetchSciFi: `${base}/discover/movie?api_key=${API_KEY}&with_genres=878`,
  fetchAfrican: `${base}/discover/movie?api_key=${API_KEY}&with_original_language=en|fr|ha|ig|yo&region=NG|ZA|KE`,
  fetchAnimation: `${base}/discover/movie?api_key=${API_KEY}&with_genres=16`,
  fetchMystery: `${base}/discover/movie?api_key=${API_KEY}&with_genres=9648`,
  fetchCrime: `${base}/discover/movie?api_key=${API_KEY}&with_genres=80`,
  fetchFamily: `${base}/discover/movie?api_key=${API_KEY}&with_genres=10751`,
  fetchWar: `${base}/discover/movie?api_key=${API_KEY}&with_genres=10752`,
  fetchHistory: `${base}/discover/movie?api_key=${API_KEY}&with_genres=36`,
  fetchWestern: `${base}/discover/movie?api_key=${API_KEY}&with_genres=37`,
  fetchThriller: `${base}/discover/movie?api_key=${API_KEY}&with_genres=53`,
  fetchMusic: `${base}/discover/movie?api_key=${API_KEY}&with_genres=10402`,
  fetchFantasy: `${base}/discover/movie?api_key=${API_KEY}&with_genres=14`,
};

export default requests;