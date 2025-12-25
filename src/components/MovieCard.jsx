function MovieCard({ movie }) {
    const posterBase = 'https://image.tmdb.org/t/p/w500'; // Bigger, better quality
    const title = movie.title || movie.name || 'Untitled';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

    // Fallback if no poster
    if (!movie.poster_path) {
        return (
            <div className="flex-shrink-0 w-48 md:w-56 lg:w-64 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 text-center p-4">
                <p>No Poster Available</p>
            </div>
        );
    }

    return (
        <div className="flex-shrink-0 w-32 md:w-40 lg:w-48 transition-all duration-300 hover:scale-110 hover:z-50 group cursor-pointer">
            <img
                src={`${posterBase}${movie.poster_path}`}
                alt={title}
                className="rounded-md shadow-md object-cover w-full h-full"
                loading="lazy"
            />
            {/* Optional: small title/rating below on hover */}
            <div className="mt-2 text-sm opacity-0 group-hover:opacity-100 transition">
                <h3 className="font-medium truncate">{title}</h3>
                <p className="text-green-400 text-xs">★ {rating}</p>
            </div>
        </div>
    ); S
}

export default MovieCard;