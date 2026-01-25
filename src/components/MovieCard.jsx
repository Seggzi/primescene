import { useState, useEffect, useCallback } from 'react';
import { Play, Plus, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export const SkeletonCard = () => (
  <div className="relative w-full aspect-[2/3] bg-zinc-900 rounded-xl overflow-hidden animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
  </div>
);

const MovieCard = ({ movie, onClick }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [videoKey, setVideoKey] = useState(null);

  const mediaType = useCallback(
    () => movie.media_type || (movie.title ? 'movie' : 'tv'),
    [movie]
  );

  useEffect(() => {
    if (!isHovered) {
      setVideoKey(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/${mediaType()}/${movie.id}/videos?api_key=${API_KEY}`
        );
        const { results } = await res.json();
        const trailer = results?.find(v => v.type === 'Trailer' && v.site === 'YouTube') ||
          results?.find(v => v.site === 'YouTube') ||
          null;
        setVideoKey(trailer?.key ?? null);
      } catch {
        // silent fail
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [isHovered, movie.id, mediaType]);

  const handlePlay = e => {
    e.stopPropagation();
    navigate(`/watch/${mediaType()}/${movie.id}`);
  };

  const handleDetails = e => {
    e.stopPropagation();
    navigate(`/details/${mediaType()}/${movie.id}`);
  };

  const year = (movie.release_date || movie.first_air_date || '').slice(0, 4) || '—';

  return (
    <div
      onClick={() => onClick?.(movie)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative cursor-pointer transition-all duration-300 hover:scale-[1.04] hover:z-10"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-900 shadow-lg ring-1 ring-zinc-800 group-hover:ring-red-600/50 transition-all duration-300">
        {isHovered && videoKey ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0`}
            className="absolute inset-0 w-full h-full object-cover scale-110"
            frameBorder="0"
            allow="autoplay"
          />
        ) : (
          <img
            src={movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500'}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500';
            }}
          />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <h4 className="text-white font-bold text-base mb-2 line-clamp-2 drop-shadow-md">
            {movie.title || movie.name}
          </h4>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePlay}
              className="p-3 bg-white rounded-full text-black hover:bg-gray-200 transition shadow-lg"
            >
              <Play size={20} fill="black" />
            </button>

            <button
              onClick={handleDetails}
              className="p-3 border border-white/50 rounded-full text-white hover:border-white hover:bg-white/10 transition"
              title="View Details"
            >
              <Plus size={20} />
            </button>

            <div className="ml-auto">
              <ChevronRight size={22} className="text-white/70" />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs font-medium">
            <span className="text-green-400">★ {movie.vote_average?.toFixed(1) || '—'}</span>
            <span className="text-white/80 border border-white/30 px-1.5 py-0.5 rounded text-[10px] uppercase">HD</span>
            <span className="text-gray-400">{year}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;