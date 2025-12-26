function MovieCard({ movie, onClick }) {
  const poster = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : 'https://via.placeholder.com/342x513?text=No+Image';

  return (
    <div 
      className="flex-shrink-0 w-40 md:w-48 cursor-pointer transition-transform hover:scale-110 hover:z-10"
      onClick={onClick}
    >
      <img src={poster} alt={movie.title || movie.name} className="rounded-lg shadow-lg" />
    </div>
  );
}

export default MovieCard;