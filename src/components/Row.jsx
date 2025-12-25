import { useEffect, useState, useRef } from 'react';
import MovieCard from './MovieCard';

function Row({ title, fetchUrl }) {
    const [movies, setMovies] = useState([]);
    const rowRef = useRef(null);

    useEffect(() => {
        fetch(fetchUrl)
            .then(res => res.json())
            .then(data => setMovies(data.results));
    }, [fetchUrl]);

    const scrollLeft = () => rowRef.current.scrollBy({ left: -800, behavior: 'smooth' });
    const scrollRight = () => rowRef.current.scrollBy({ left: 800, behavior: 'smooth' });

    return (

        <div className="pt-12 md:pt-16 group relative">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 px-4 md:px-0">{title}</h2>
            <div className="relative group">
                {/* Left Arrow - always semi-visible, full on hover */}
                <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-0 bottom-0 z-30 w-20 bg-gradient-to-r from-black via-black/80 to-transparent flex items-center justify-start pl-4 text-5xl text-white/70 hover:text-white transition-all opacity-60 group-hover:opacity-100"
                >
                    ‹
                </button>

                {/* Right Arrow */}
                <button
                    onClick={scrollRight}
                    className="absolute right-0 top-0 bottom-0 z-30 w-20 bg-gradient-to-l from-black via-black/80 to-transparent flex items-center justify-end pr-4 text-5xl text-white/70 hover:text-white transition-all opacity-60 group-hover:opacity-100"
                >
                    ›
                </button>

                <div ref={rowRef} className="flex overflow-x-auto gap-4 py-6 scroll-smooth scrollbar-hide">
                    {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
                </div>
            </div>
        </div>

    );
}

export default Row;