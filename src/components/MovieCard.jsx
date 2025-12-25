function MovieCard({ movie }) {
  const posterBase = 'https://image.tmdb.org/t/p/w500'; // Bigger, better quality
  const title = movie.title || movie.name || 'Untitled';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

  // Fallback if no poster
  if (!movie.poster_path) {
    return (
      <div className="flex-shrink-0 w-48 md:w-64 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
        <p className="text-center">No Image</p>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-48 md:w-56 lg:w-64 transition-all duration-500 hover:scale-110 hover:z-50 group cursor-pointer">
      <img 
        src={`${posterBase}${movie.poster_path}`} 
        alt={title}
        className="rounded-lg shadow-lg object-cover w-full h-full"
        loading="lazy"
      />
      <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <h3 className="font-bold text-lg truncate">{title}</h3>
        <p className="text-green-400">★ {rating}</p>
      </div>
    </div>
  );
}

export default MovieCard;