function MovieCard({ movie, onClick }) {
  const poster = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : 'https://via.placeholder.com/342x513?text=No+Image';

  return (
    <div 
      className="flex-shrink-0 w-36 sm:w-40 md:w-44 lg:w-48 cursor-pointer transition-transform duration-300 hover:scale-110 hover:z-10"
      onClick={() => onClick(movie)}
    >
      <img 
        src={poster} 
        alt={movie.title || movie.name}
        className="w-full rounded-lg shadow-lg"
        loading="lazy"
      />
      <p className="text-white text-center mt-2 text-sm line-clamp-2">
        {movie.title || movie.name}
      </p>
    </div>
  );
}

export default MovieCard;