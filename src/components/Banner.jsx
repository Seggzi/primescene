import { useEffect, useState } from 'react';

function Banner() {
    const [movie, setMovie] = useState(null);

    useEffect(() => {
        fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${import.meta.env.VITE_TMDB_API_KEY}`)
            .then(res => res.json())
            .then(data => {
                // Pick a random trending item for variety
                const randomIndex = Math.floor(Math.random() * data.results.length);
                setMovie(data.results[randomIndex]);
            });
    }, []);

    if (!movie) {
        return <div className="h-[70vh] bg-slate-900 animate-pulse" />;
    }

    const backdrop = `https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}`;

    return (
        <div className="relative h-[60vh] md:h-[75vh] lg:h-[85vh] overflow-hidden">
            {/* Backdrop image - full fill */}
            <img
                src={backdrop}
                alt={movie.title || movie.name}
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent"></div>


            <div className="absolute bottom-0 left-0 pb-16 md:pb-24 px-8 md:px-12 lg:px-20 max-w-4xl z-50">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 drop-shadow-2xl leading-tight">
                    {movie.title || movie.name}
                </h1>

                <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-10 max-w-3xl line-clamp-4 leading-relaxed">
                    {movie.overview || 'Discover this trending title on PrimeScene.'}
                </p>

                <div className="flex gap-6">
                    <button className="px-10 py-4 bg-white text-black text-xl font-bold rounded hover:bg-gray-200 transition flex items-center gap-3">
                        ▶ Play
                    </button>
                    <button className="px-10 py-4 bg-gray-600/80 text-white text-xl font-bold rounded hover:bg-gray-600 transition flex items-center gap-3">
                        ℹ More Info
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Banner;