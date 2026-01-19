// src/components/Banner.jsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyList } from '../context/MyListContext';
import { Play, Volume2, VolumeX, Info, Plus, Check } from 'lucide-react';

// --- CONFIGURATION ---
const CACHE_KEY = 'prime_scene_banner_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 Minutes (in milliseconds)

// --- HELPER: Map Genre IDs ---
const getGenreNames = (ids) => {
  if (!ids) return [];
  const genres = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
    99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
    27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
    10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
  };
  return ids.slice(0, 3).map(id => genres[id]).filter(Boolean).join(" • ");
};

function Banner() {
  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [categoryName, setCategoryName] = useState("Featured");
  
  const { addToMyList, removeFromMyList, myList = [] } = useMyList();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  const isInMyList = (movieId) => myList.some(item => item.id === movieId);
  const inList = movie ? isInMyList(movie.id) : false;

  // --- MAIN FETCH LOGIC ---
  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        // 1. CHECK CACHE FIRST
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { movie: cachedMovie, trailerKey: cachedKey, categoryName: cachedCat, timestamp } = JSON.parse(cachedData);
          const now = Date.now();

          // If the cache is younger than 5 minutes, use it and STOP here.
          if (now - timestamp < CACHE_DURATION) {
            setMovie(cachedMovie);
            setTrailerKey(cachedKey);
            setCategoryName(cachedCat);
            return; 
          }
        }

        // 2. IF NO CACHE OR EXPIRED, FETCH NEW DATA
        const sources = [
          { id: 'trending', name: 'Trending', type: 'movie', url: `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}` },
          { id: 'nollywood', name: 'Nollywood', type: 'movie', url: `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_origin_country=NG&sort_by=primary_release_date.desc&vote_count.gte=1` },
          { id: 'anime', name: 'Anime', type: 'tv', url: `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=16&with_origin_country=JP&sort_by=popularity.desc` },
          { id: 'action', name: 'Action', type: 'movie', url: `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=28&sort_by=popularity.desc` },
          { id: 'kdrama', name: 'K-Drama', type: 'tv', url: `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_original_language=ko&sort_by=popularity.desc` },
          { id: 'sci-fi', name: 'Sci-Fi', type: 'movie', url: `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=878&sort_by=popularity.desc` }
        ];

        const randomSource = sources[Math.floor(Math.random() * sources.length)];
        const res = await fetch(randomSource.url);
        const data = await res.json();

        if (data.results && data.results.length > 0) {
          const topResults = data.results.slice(0, 15);
          const randomMovie = topResults[Math.floor(Math.random() * topResults.length)];
          
          randomMovie.media_type = randomMovie.media_type || randomSource.type;

          // Fetch Logo
          const imgRes = await fetch(`https://api.themoviedb.org/3/${randomMovie.media_type}/${randomMovie.id}/images?api_key=${API_KEY}&include_image_language=en,null`);
          const imgData = await imgRes.json();
          randomMovie.logoPath = imgData.logos?.find(img => img.iso_639_1 === 'en')?.file_path;

          // Fetch Trailer
          const vidRes = await fetch(`https://api.themoviedb.org/3/${randomMovie.media_type}/${randomMovie.id}/videos?api_key=${API_KEY}`);
          const vidData = await vidRes.json();
          const trailer = vidData.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer') || vidData.results?.find(v => v.site === 'YouTube');
          
          const newKey = trailer?.key || null;

          // 3. SET STATE & SAVE TO CACHE
          setCategoryName(randomSource.name);
          setMovie(randomMovie);
          setTrailerKey(newKey);

          localStorage.setItem(CACHE_KEY, JSON.stringify({
            movie: randomMovie,
            trailerKey: newKey,
            categoryName: randomSource.name,
            timestamp: Date.now()
          }));
        }
      } catch (err) {
        console.error("Banner Error:", err);
      }
    };

    fetchBannerData();
  }, []);

  // --- TRAILER CONTROL ---
  useEffect(() => {
    if (videoRef.current && trailerKey) {
      const command = isMuted ? 'mute' : 'unMute';
      videoRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: command, args: [] }), '*'
      );
    }
  }, [isMuted, trailerKey]);

  const toggleMute = () => setIsMuted(prev => !prev);
  const handleMyList = () => inList ? removeFromMyList(movie.id) : addToMyList(movie);

  if (!movie) return <div className="h-[80vh] bg-black animate-pulse" />;

  const title = movie.title || movie.name;
  const year = (movie.release_date || movie.first_air_date || "").split('-')[0];

  return (
    <div className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] overflow-hidden group">
      
      {/* Background Image */}
      <img
        src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Video Background (Only renders if key exists) */}
      {trailerKey && (
        <iframe
          ref={videoRef}
          onLoad={() => setVideoLoaded(true)}
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&loop=1&playlist=${trailerKey}&controls=0&modestbranding=1&playsinline=1&iv_load_policy=3&rel=0&fs=0&enablejsapi=1`}
          title="Trailer"
          allow="autoplay; encrypted-media"
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none scale-[1.35] group-hover:scale-110 transition-all duration-[20s] ease-linear 
            ${videoLoaded ? 'opacity-100' : 'opacity-0'}`} 
        />
      )}

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

      {/* Main Content */}
      <div className="absolute bottom-0 left-0 pb-12 px-4 md:px-12 w-full lg:w-[60%] z-10">
        
        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-4 animate-fade-in-up">
           <span className="text-yellow-500 font-bold tracking-widest text-xs uppercase bg-black/40 px-2 py-1 border-l-2 border-yellow-500 backdrop-blur-md">
             {categoryName === "Trending" ? "Trending Now" : `Featured ${categoryName}`}
           </span>
        </div>

        {/* Logo or Title Text */}
        {movie.logoPath ? (
          <img 
            src={`https://image.tmdb.org/t/p/w500${movie.logoPath}`} 
            alt={title} 
            className="w-48 sm:w-64 md:w-80 lg:w-96 mb-6 object-contain drop-shadow-2xl origin-bottom-left transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg leading-tight">
            {title}
          </h1>
        )}

        {/* Info Row (Match %, Age, HD) */}
        <div className="flex items-center flex-wrap gap-4 text-white/90 font-medium mb-5 text-sm md:text-base">
          <span className="text-green-400 font-bold">{Math.round(movie.vote_average * 10)}% Match</span>
          <span>{year}</span>
          <span className="border border-white/40 px-2 py-[1px] text-xs rounded uppercase">HD</span>
          <span className="border border-white/40 px-2 py-[1px] text-xs rounded uppercase">
             {movie.adult ? "18+" : "13+"}
          </span>
        </div>

        {/* Genre Tags */}
        <div className="text-gray-300 text-sm font-semibold mb-4 drop-shadow-md">
           {getGenreNames(movie.genre_ids)}
        </div>

        {/* Overview */}
        <p className="text-white/80 text-sm md:text-lg mb-8 line-clamp-3 md:line-clamp-4 max-w-2xl drop-shadow-md leading-relaxed">
          {movie.overview}
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => navigate(`/watch/${movie.media_type}/${movie.id}`)}
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-white/90 transition shadow-lg hover:scale-105 active:scale-95"
          >
            <Play size={24} fill="black" /> Play
          </button>
          
          <button 
            onClick={() => navigate(`/details/${movie.media_type}/${movie.id}`)}
            className="flex items-center gap-2 bg-gray-500/40 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-500/60 transition shadow-lg hover:scale-105 active:scale-95"
          >
            <Info size={24} /> More Info
          </button>

           <button 
            onClick={handleMyList}
            className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-white/50 bg-black/20 text-white hover:bg-white/10 hover:border-white transition backdrop-blur-sm"
            title={inList ? "Remove from My List" : "Add to My List"}
          >
            {inList ? <Check size={20} /> : <Plus size={20} />}
          </button>
        </div>
      </div>

      {/* Mute Toggle */}
      <div className="absolute bottom-32 right-8 z-20 hidden md:block">
         <button
          onClick={toggleMute}
          className="p-3 rounded-full border border-white/50 bg-black/30 text-white hover:bg-white/20 transition backdrop-blur-md"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>
    </div>
  );
}

export default Banner;