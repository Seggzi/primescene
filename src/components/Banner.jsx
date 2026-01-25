// src/components/Banner.jsx - FULL PROFESSIONAL VERSION (Fanart API completely removed + shorter 1-minute cache)

import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyList } from '../context/MyListContext';
import { Play, Volume2, VolumeX, Info, Plus, Check } from 'lucide-react';

// --- CONFIGURATION ---
const CACHE_KEY = 'prime_scene_banner_cache';
const CACHE_DURATION = 1 * 60 * 1000; // 1 minute

const TMDB_READ_TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN; // ← Must be in .env!
const OMDB_KEY = 'd92401b9';

// --- GENRE MAPPER ---
const GENRE_MAP = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

const getGenreNames = (ids = []) => {
  if (!ids?.length) return 'N/A';
  return ids
    .slice(0, 3)
    .map(id => GENRE_MAP[id])
    .filter(Boolean)
    .join(" • ");
};

function Banner() {
  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [omdbData, setOmdbData] = useState({});
  const [starring, setStarring] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const [categoryName, setCategoryName] = useState("Featured");
  const [isLoading, setIsLoading] = useState(true);
  const [showOverview, setShowOverview] = useState(true);
  const [showCategory, setShowCategory] = useState(false);

  const { addToMyList, removeFromMyList, myList = [] } = useMyList();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const bannerRef = useRef(null);

  let hideTimer = null;

  const startHideTimer = () => {
    if (hideTimer) clearTimeout(hideTimer);

    hideTimer = setTimeout(() => {
      setShowOverview(false);
      setShowCategory(true);
    }, 4000);
  };

  const inList = useMemo(() => movie && myList.some(item => item.id === movie.id), [movie, myList]);

  // TMDB Bearer fetch helper
  const tmdbFetch = async (endpoint) => {
    if (!TMDB_READ_TOKEN) throw new Error("Missing VITE_TMDB_READ_TOKEN in .env");
    const res = await fetch(`https://api.themoviedb.org/3/${endpoint}`, {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_READ_TOKEN}`
      }
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`TMDB error ${res.status}: ${errText}`);
    }
    return res.json();
  };

  // --- FETCH DATA ---
  useEffect(() => {
    const loadBanner = async () => {
      setIsLoading(true);

      // Cache check
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { movie: cMovie, trailerKey: cKey, categoryName: cCat, omdbData: cOmdb, starring: cStarring, ts } = JSON.parse(cached);
          if (Date.now() - ts < CACHE_DURATION) {
            setMovie(cMovie);
            setTrailerKey(cKey);
            setCategoryName(cCat);
            setOmdbData(cOmdb || {});
            setStarring(cStarring || '');
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Cache parse failed:', e);
        }
      }

      const categories = [
        { name: 'Trending', type: 'movie', url: `trending/movie/week` },
        { name: 'Nollywood', type: 'movie', url: `discover/movie?with_origin_country=NG&sort_by=primary_release_date.desc&vote_count.gte=1` },
        { name: 'Anime', type: 'tv', url: `discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc` },
        { name: 'Action', type: 'movie', url: `discover/movie?with_genres=28&sort_by=popularity.desc` },
        { name: 'K-Drama', type: 'tv', url: `discover/tv?with_original_language=ko&sort_by=popularity.desc` },
        { name: 'Sci-Fi', type: 'movie', url: `discover/movie?with_genres=878&sort_by=popularity.desc` },
      ];

      let selected = null;
      let catName = "Popular";

      const randomCat = categories[Math.floor(Math.random() * categories.length)];
      try {
        const data = await tmdbFetch(randomCat.url);
        if (data.results?.length) {
          const candidates = data.results.slice(0, 15);
          selected = candidates[Math.floor(Math.random() * candidates.length)];
          selected.media_type = selected.media_type || randomCat.type;
          catName = randomCat.name;
        }
      } catch (err) {
        console.warn(`Random category ${randomCat.name} failed:`, err);
      }

      if (!selected) {
        try {
          const data = await tmdbFetch(`movie/popular`);
          if (data.results?.length) {
            const candidates = data.results.slice(0, 15);
            selected = candidates[Math.floor(Math.random() * candidates.length)];
            selected.media_type = 'movie';
            catName = "Popular";
          }
        } catch (err) {
          console.error("Fallback popular failed:", err);
        }
      }

      if (!selected) {
        setIsLoading(false);
        return;
      }

      try {
        const [extData, imgData, vidData, creditsData] = await Promise.all([
          tmdbFetch(`${selected.media_type}/${selected.id}/external_ids`),
          tmdbFetch(`${selected.media_type}/${selected.id}/images?include_image_language=en,null`),
          tmdbFetch(`${selected.media_type}/${selected.id}/videos`),
          tmdbFetch(`${selected.media_type}/${selected.id}/credits`)
        ]);

        const imdbId = extData.imdb_id;
        selected.logoPath = imgData.logos?.find(l => l.iso_639_1 === 'en')?.file_path;

        const primaryTrailer = vidData.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer') ||
                               vidData.results?.find(v => v.site === 'YouTube');
        setTrailerKey(primaryTrailer?.key ?? null);

        const starringNames = creditsData.cast?.slice(0, 3).map(actor => actor.name).join(', ') || '';
        setStarring(starringNames);

        let omdbFetched = {};
        if (imdbId) {
          const omdbRes = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_KEY}`);
          if (omdbRes.ok) {
            const omdb = await omdbRes.json();
            omdbFetched = {
              imdbRating: omdb.imdbRating || null,
              runtime: omdb.Runtime && omdb.Runtime !== 'N/A' ? omdb.Runtime : null,
              rated: omdb.Rated && omdb.Rated !== 'N/A' ? omdb.Rated : null
            };
            setOmdbData(omdbFetched);
          }
        }

        setCategoryName(catName);
        setMovie(selected);

        // Cache (no Fanart data)
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          movie: selected,
          trailerKey: primaryTrailer?.key ?? null,
          categoryName: catName,
          omdbData: omdbFetched,
          starring: starringNames,
          ts: Date.now()
        }));
      } catch (err) {
        console.error("Processing error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadBanner();
  }, []);

  // Mute control
  useEffect(() => {
    if (!videoRef.current || !trailerKey) return;
    const player = videoRef.current.contentWindow;
    const cmd = isMuted ? 'mute' : 'unMute';
    player?.postMessage(JSON.stringify({ event: 'command', func: cmd, args: [] }), '*');
  }, [isMuted, trailerKey]);

  // Overview & category control
  useEffect(() => {
    if (!bannerRef.current) return;
    setShowOverview(true);
    setShowCategory(false);
    startHideTimer();

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShowOverview(true);
          setShowCategory(false);
          startHideTimer();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(bannerRef.current);

    return () => {
      observer.disconnect();
      clearTimeout(hideTimer);
    };
  }, [movie]);

  if (isLoading) {
    return <div className="h-[80vh] bg-gradient-to-b from-zinc-950 to-black animate-pulse" />;
  }

  if (!movie) {
    return (
      <div className="h-[80vh] bg-gradient-to-b from-zinc-950 to-black flex items-center justify-center text-white text-xl">
        No featured content available
      </div>
    );
  }

  const title = movie.title || movie.name || 'Featured';
  const year = (movie.release_date || movie.first_air_date || '').slice(0, 4) || '—';
  const genres = getGenreNames(movie.genre_ids);
  const rating = omdbData.imdbRating || movie.vote_average?.toFixed(1) || '—';
  const ageRating = omdbData.rated;
  const runtime = omdbData.runtime;

  const categoryDisplay = categoryName === "Trending" 
    ? "Trending Now" 
    : categoryName === "Popular" 
      ? (genres !== 'N/A' ? `Popular in ${genres}` : "Popular Now")
      : `Featured ${categoryName}`;

  return (
    <div ref={bannerRef} className="relative h-[70vh] sm:h-[75vh] md:h-[85vh] lg:h-[95vh] overflow-hidden group">
      {/* Background - now only TMDB backdrop */}
      <img
        src={`https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}`}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover brightness-[0.6]"
        onError={e => e.target.src = 'https://via.placeholder.com/1920x1080?text=Featured+Banner'}
      />

      {/* Trailer */}
      {trailerKey && (
        <iframe
          ref={videoRef}
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&loop=1&playlist=${trailerKey}&controls=0&modestbranding=1&playsinline=1&iv_load_policy=3&rel=0&fs=0&enablejsapi=1`}
          title="Trailer"
          allow="autoplay; encrypted-media; fullscreen"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none scale-110 group-hover:scale-120 transition-transform duration-[30s] ease-linear"
        />
      )}

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 pb-6 sm:pb-8 md:pb-10 lg:pb-12 pl-4 sm:pl-6 md:pl-10 lg:pl-16 max-w-4xl z-10">
        {/* Category */}
        <div className={`overflow-hidden transition-all duration-1000 ease-in-out ${showCategory ? 'max-h-32 opacity-100 mb-3 sm:mb-4' : 'max-h-0 opacity-0 mb-0'}`}>
          <span className="inline-block px-3 py-0.5 sm:px-4 sm:py-1 bg-black/60 backdrop-blur-md border-l-4 border-yellow-500 text-yellow-400 text-xs sm:text-sm font-semibold tracking-wide">
            {categoryDisplay}
          </span>
        </div>

        {/* Logo or Title - now only TMDB logo */}
        {movie.logoPath ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.logoPath}`}
            alt={title}
            className="w-[110px] sm:w-[140px] md:w-[180px] lg:w-[220px] xl:w-[260px] h-auto object-contain drop-shadow-2xl mb-3 sm:mb-4"
            onError={e => e.target.src = 'https://via.placeholder.com/500x200?text=' + encodeURIComponent(title)}
          />
        ) : (
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3 sm:mb-4 tracking-tight drop-shadow-2xl leading-tight">
            {title}
          </h1>
        )}

        {/* Meta Row */}
        <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 text-white/90 text-xs sm:text-sm mb-4 sm:mb-6">
          <span className="text-green-400 font-semibold">★ {rating}</span>
          <span>{year}</span>
          {ageRating && <span className="border border-white/30 px-2.5 py-0.5 text-xs rounded font-medium">{ageRating}</span>}
          {runtime && <span>{runtime}</span>}
          <span className="border border-white/30 px-2.5 py-0.5 text-xs rounded font-medium uppercase">HD</span>
          <span className="text-gray-200">{genres}</span>
        </div>

        {/* Starring line */}
        {starring && (
          <div className="text-white/80 text-sm mb-4 sm:mb-6">
            Starring: {starring}
          </div>
        )}

        {/* Overview */}
        <div className={`overflow-hidden transition-all duration-1000 ease-in-out ${showOverview ? 'max-h-96 opacity-100 mb-6 sm:mb-8' : 'max-h-0 opacity-0 mb-0'}`}>
          <p className="text-sm sm:text-base md:text-lg text-white/90 leading-relaxed drop-shadow-lg">
            {movie.overview || 'No overview available.'}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <button
            onClick={() => navigate(`/watch/${movie.media_type || 'movie'}/${movie.id}`)}
            className="flex items-center gap-3 bg-white text-black px-6 py-3 rounded font-semibold text-base hover:bg-gray-100 transition shadow-lg active:scale-95"
          >
            <Play className="w-6 h-6" fill="black" /> Play
          </button>

          <button
            onClick={() => navigate(`/details/${movie.media_type || 'movie'}/${movie.id}`)}
            className="flex items-center gap-3 bg-gray-700/70 backdrop-blur text-white px-6 py-3 rounded font-semibold text-base hover:bg-gray-700 transition shadow-lg active:scale-95 border border-white/20"
          >
            <Info className="w-6 h-6" /> More Info
          </button>

          <button
            onClick={() => inList ? removeFromMyList(movie.id) : addToMyList(movie)}
            className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-white/50 bg-black/40 hover:bg-white/10 hover:border-white transition backdrop-blur active:scale-95"
            title={inList ? "Remove from My List" : "Add to My List"}
          >
            {inList ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mute Toggle */}
      {trailerKey && (
        <div className="absolute bottom-5 right-5 z-20 block">
          <button
            onClick={() => setIsMuted(p => !p)}
            className="p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/30 hover:bg-black/80 hover:border-white transition shadow-xl"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        </div>
      )}
    </div>
  );
}

export default Banner;