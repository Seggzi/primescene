import { useEffect, useState } from 'react';
import MovieCard from './MovieCard';

function Row({ title, fetchUrl, onCardClick }) {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch(fetchUrl);
        const data = await res.json();
        setMovies(data.results || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMovies();
  }, [fetchUrl]);

  return (
    <div className="my-8 sm:my-12 px-4 sm:px-6 md:px-8">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6">
        {title}
      </h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} onClick={onCardClick} />
        ))}
      </div>
    </div>
  );
}

export default Row;