import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const tmdb = axios.create({
  baseURL: TMDB_BASE_URL,
  params: { api_key: API_KEY },
});

export const getTrending = (mediaType = 'all', timeWindow = 'week') =>
  tmdb.get(`/trending/${mediaType}/${timeWindow}`);

export const getPopularMovies = () => tmdb.get('/movie/popular');
export const getPopularTV = () => tmdb.get('/tv/popular');

export const searchMulti = (query) =>
  tmdb.get('/search/multi', { params: { query } });

export const getDetails = (mediaType, id) =>
  tmdb.get(`/${mediaType}/${id}`);

export const getNowPlayingMovies = () => tmdb.get('/movie/now_playing');
