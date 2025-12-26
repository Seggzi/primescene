import { useEffect, useState } from 'react';
import MovieCard from './MovieCard';

function Row({ title, fetchUrl, onCardClick }) {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch(fetchUrl)
      .then(res => res.json())
      .then(data => setMovies(data.results || []));
  }, [fetchUrl]);

  return (
    <div className="my-12 px-4 md:px-8">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">{title}</h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} onClick={() => onCardClick(movie)} />
        ))}
      </div>
    </div>
  );
}

export default Row;