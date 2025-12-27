import React from 'react';
import { Play, Plus, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MovieCard = ({ movie, onClick }) => {
  const navigate = useNavigate();
  const imageUrl = movie.backdrop_path || movie.poster_path;

  // Handles clicking the play button directly on the card
  const handlePlay = (e) => {
    e.stopPropagation();
    const type = movie.media_type || (movie.title ? 'movie' : 'tv');
    navigate(`/watch/${type}/${movie.id}`);
  };

  return (
    <div 
      onClick={() => onClick(movie)}
      className="relative group cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110 hover:z-50"
    >
      {/* Poster Image */}
      <img
        src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
        alt={movie.title || movie.name}
        className="rounded-sm object-cover w-full h-auto shadow-md group-hover:shadow-2xl"
      />

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-sm flex flex-col justify-end p-4">
        <h4 className="text-white font-bold text-sm mb-2 truncate">
          {movie.title || movie.name}
        </h4>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePlay}
            className="p-2 bg-white rounded-full text-black hover:bg-gray-200"
          >
            <Play size={16} fill="black" />
          </button>
          <button className="p-2 border border-white/50 rounded-full text-white hover:border-white">
            <Plus size={16} />
          </button>
          <div className="ml-auto">
            <ChevronRight className="text-white/70" />
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2 text-[10px] font-bold">
          <span className="text-green-500">{movie.vote_average?.toFixed(1)} Rating</span>
          <span className="text-white border border-white/40 px-1 px-0.5">HD</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;