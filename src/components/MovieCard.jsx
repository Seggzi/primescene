import React, { useState, useEffect } from 'react';
import { Play, Plus, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export const SkeletonCard = () => (
  <div className="relative w-full aspect-[2/3] bg-zinc-900 rounded-lg overflow-hidden animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
  </div>
);

const MovieCard = ({ movie, onClick }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [videoKey, setVideoKey] = useState(null);

  // Helper to determine if it's a movie or tv show
  const getMediaType = () => movie.media_type || (movie.title ? 'movie' : 'tv');

  const handlePlay = (e) => {
    e.stopPropagation(); // Prevents opening the modal
    navigate(`/watch/${getMediaType()}/${movie.id}`);
  };

  // NEW: Handle Plus icon to go to the full details page
  const handleGoToDetails = (e) => {
    e.stopPropagation(); // Prevents opening the modal
    navigate(`/details/${getMediaType()}/${movie.id}`);
  };

  useEffect(() => {
    let timer;
    if (isHovered) {
      timer = setTimeout(() => {
        fetch(`https://api.themoviedb.org/3/${getMediaType()}/${movie.id}/videos?api_key=${API_KEY}`)
          .then(res => res.json())
          .then(data => {
            const video = data.results?.find(v => v.type === "Trailer") || data.results?.[0];
            if (video) setVideoKey(video.key);
          });
      }, 800);
    }
    return () => {
      clearTimeout(timer);
      setVideoKey(null);
    };
  }, [isHovered, movie]);

  return (
    <div
      onClick={() => onClick(movie)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 hover:z-50"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-zinc-900 shadow-lg group-hover:shadow-2xl">
        
        {isHovered && videoKey ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0`}
            className="absolute inset-0 w-full h-full object-cover scale-[1.3]"
            frameBorder="0"
            allow="autoplay"
          />
        ) : (
          <img
            src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
            alt={movie.title || movie.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}

        {/* Overlay Layer */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <h4 className="text-white font-bold text-xs mb-2 line-clamp-2">
            {movie.title || movie.name}
          </h4>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePlay}
              className="p-1.5 bg-white rounded-full text-black hover:bg-gray-200 transition"
            >
              <Play size={14} fill="black" />
            </button>
            
            {/* UPDATED: Plus icon now calls handleGoToDetails */}
            <button 
              onClick={handleGoToDetails}
              className="p-1.5 border border-white/50 rounded-full text-white hover:border-white transition hover:bg-white/10"
              title="View Full Details"
            >
              <Plus size={14} />
            </button>

            <div className="ml-auto" onClick={handleGoToDetails}>
              <ChevronRight size={18} className="text-white/70 hover:text-white" />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 text-[9px] font-black tracking-tighter">
            <span className="text-green-500">{movie.vote_average?.toFixed(1)} Rating</span>
            <span className="text-white border border-white/40 px-1 rounded-sm">HD</span>
            <span className="text-gray-400">
              {(movie.release_date || movie.first_air_date)?.split('-')[0]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;