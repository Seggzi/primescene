import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard, { SkeletonCard } from './MovieCard';

const Row = ({ title, fetchUrl, onCardClick }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const rowRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetch(fetchUrl)
      .then((res) => res.json())
      .then((data) => {
        setMovies(data.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
      <h2 className="text-xl md:text-2xl font-bold text-white/90 px-4 sm:px-0 tracking-tight">
        {title}
      </h2>

      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => slide('left')}
          className="absolute left-0 top-0 bottom-0 z-40 bg-black/60 px-2 opacity-0 group-hover/row:opacity-100 transition-opacity hidden md:block"
        >
          <ChevronLeft size={40} className="text-white" />
        </button>

        {/* The Row container - Adjusted widths for smaller cards */}
        <div
          ref={rowRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-4 sm:px-0 pb-6"
        >
          {loading
            ? // Loading Skeletons - Now matches the smaller width
              [...Array(8)].map((_, i) => (
                <div key={i} className="min-w-[130px] sm:min-w-[150px] md:min-w-[180px]">
                  <SkeletonCard />
                </div>
              ))
            : movies.map((movie) => (
                <div key={movie.id} className="min-w-[130px] sm:min-w-[150px] md:min-w-[180px]">
                  <MovieCard movie={movie} onClick={onCardClick} />
                </div>
              ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => slide('right')}
          className="absolute right-0 top-0 bottom-0 z-40 bg-black/60 px-2 opacity-0 group-hover/row:opacity-100 transition-opacity hidden md:block"
        >
          <ChevronRight size={40} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default Row;