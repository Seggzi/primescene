import { useMyList } from '../context/MyListContext';

function MovieCard({ movie, onClick }) {
  const { isInMyList, toggleMyList } = useMyList();
  const inList = isInMyList(movie.id);

  const handleAddToList = (e) => {
    e.stopPropagation(); // prevent opening modal
    toggleMyList(movie);
  };

  const poster = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : 'https://via.placeholder.com/342x513?text=No+Image';

  return (
    <div 
      className="flex-shrink-0 relative group cursor-pointer w-36 sm:w-40 md:w-44 lg:w-48"
      onClick={() => onClick(movie)}
    >
      <img 
        src={poster} 
        alt={movie.title || movie.name}
        className="w-full rounded-lg shadow-lg transition-transform group-hover:scale-110"
      />
      <p className="text-white text-center mt-2 text-sm line-clamp-2">
        {movie.title || movie.name}
      </p>

      {/* + / - Button on hover */}
      <button 
        onClick={handleAddToList}
        className="absolute top-2 right-2 w-10 h-10 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
      >
        <span className="text-white text-2xl font-bold">
          {inList ? '−' : '+'}
        </span>
      </button>
    </div>
  );
}

export default MovieCard;