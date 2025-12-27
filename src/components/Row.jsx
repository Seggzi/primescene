import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

const Row = ({ title, fetchUrl, onCardClick }) => {
  const [movies, setMovies] = useState([]);
  const rowRef = useRef(null);

  useEffect(() => {
    fetch(fetchUrl)
      .then((res) => res.json())
      .then((data) => setMovies(data.results || []));
  }, [fetchUrl]);

  const slide = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4 group/row">
      <h2 className="text-xl md:text-2xl font-semibold text-white/90 px-4 sm:px-0">
        {title}
      </h2>

      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => slide('left')}
          className="absolute left-0 top-0 bottom-0 z-40 bg-black/50 px-2 opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronLeft size={40} />
        </button>

        {/* The Row container */}
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-4 sm:px-0 pb-6"
        >
          {movies.map((movie) => (
            <div key={movie.id} className="min-w-[160px] sm:min-w-[200px] md:min-w-[240px]">
              <MovieCard movie={movie} onClick={onCardClick} />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => slide('right')}
          className="absolute right-0 top-0 bottom-0 z-40 bg-black/50 px-2 opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronRight size={40} />
        </button>
      </div>
    </div>
  );
};

export default Row;