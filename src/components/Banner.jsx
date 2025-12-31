// src/components/Banner.jsx - WITH MUTE/UNMUTE BUTTON LIKE NETFLIX

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyList } from '../context/MyListContext';
import { Play, Volume2, VolumeX, Info, Plus, Check } from 'lucide-react';

function Banner() {
  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [isMuted, setIsMuted] = useState(true); // Start muted like Netflix
  const { addToMyList, removeFromMyList, myList = [] } = useMyList();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const isInMyList = (movieId) => myList.some(item => item.id === movieId);
  const inList = movie ? isInMyList(movie.id) : false;

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${import.meta.env.VITE_TMDB_API_KEY}`);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];
          
          const type = randomMovie.media_type || 'movie';
          const videoRes = await fetch(`https://api.themoviedb.org/3/${type}/${randomMovie.id}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY}`);
          const videoData = await videoRes.json();
          
          const trailer = videoData.results?.find(
            v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser') && v.official
          ) || videoData.results?.find(v => v.site === 'YouTube');

          setTrailerKey(trailer?.key || null);
          setMovie(randomMovie);
        }
      } catch (err) {
        console.error('Banner fetch error:', err);
        setMovie({
          id: 1,
          title: "The Running Man",
          overview: "A wrongly convicted man must survive a deadly game show.",
          vote_average: 8.2,
          backdrop_path: "/1ZSWM6qW4nRJcQ6n8X1l0Z0T9jU.jpg"
        });
      }
    };
    fetchBanner();
  }, []);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  if (!movie) {
    return <div className="h-[60vh] md:h-[80vh] bg-gradient-to-b from-zinc-900 to-black animate-pulse" />;
  }

  const title = movie.title || movie.name || 'Featured Title';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

  const handlePlay = () => {
    const type = movie.media_type || 'movie';
    navigate(`/watch/${type}/${movie.id}`);
  };

  const handleInfo = () => {
    const type = movie.media_type || 'movie';
    navigate(`/details/${type}/${movie.id}`);
  };

  const handleMyList = () => {
    if (inList) removeFromMyList(movie.id);
    else addToMyList(movie);
  };

  return (
    <div className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] overflow-hidden">
      {/* Trailer Video Background */}
      {trailerKey ? (
        <iframe
          ref={videoRef}
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${trailerKey}&controls=0&modestbranding=1&playsinline=1&iv_load_policy=3&rel=0&fs=0`}
          title="Trailer"
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      ) : (
        <img
          src={movie.backdrop_path 
            ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
            : 'https://via.placeholder.com/1920x1080/000000/FFFFFF?text=PrimeScene'}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 pb-10 sm:pb-12 md:pb-16 px-4 sm:px-6 md:px-10 lg:px-16">
        <p className="text-xs sm:text-sm md:text-base text-yellow-400 font-semibold mb-2 tracking-wider uppercase">
          Featured
        </p>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3 leading-tight"
            style={{ textShadow: '2px 2px 8px black' }}>
          {title}
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-yellow-400 font-semibold mb-4">
          ★ {rating} Rating
        </p>

        <p className="text-sm md:text-base text-white mb-8 max-w-2xl line-clamp-3 md:line-clamp-4"
            style={{ textShadow: '1px 1px 4px black' }}>
          {movie.overview || 'Discover this trending title on PrimeScene.'}
        </p>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={handlePlay}
            className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition shadow-xl"
          >
            ▶ Play
          </button>
          <button
            onClick={handleInfo}
            className="flex items-center gap-2 px-8 py-3 bg-gray-600/80 text-white font-bold rounded-lg hover:bg-gray-600 transition shadow-xl"
          >
            ℹ More Info
          </button>
          <button
            onClick={handleMyList}
            className="flex items-center gap-3 px-8 py-3 border-2 border-white/70 text-white font-bold rounded-lg hover:bg-white/10 transition shadow-xl"
          >
            {inList ? '− Remove' : '+ My List'}
          </button>
        </div>
      </div>

      {/* MUTE/UNMUTE BUTTON - NETFLIX STYLE */}
      <div className="absolute bottom-10 right-6 md:right-16 z-10">
        <button
          onClick={toggleMute}
          className="group flex items-center justify-center w-12 h-12 rounded-full bg-black/50 backdrop-blur border border-white/30 hover:bg-black/70 hover:border-white transition-all duration-300 shadow-2xl"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX size={24} className="text-white group-hover:scale-110 transition" />
          ) : (
            <Volume2 size={24} className="text-white group-hover:scale-110 transition" />
          )}
        </button>
      </div>
    </div>
  );
}

export default Banner;