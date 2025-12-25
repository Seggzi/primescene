import { useEffect, useState } from 'react';

function Banner() {
    const [movie, setMovie] = useState(null);

    useEffect(() => {
        fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${import.meta.env.VITE_TMDB_API_KEY}&page=1`)
            .then(res => res.json())
            .then(data => {
                // Pick a random one so it changes sometimes (or keep data.results[0])
                const random = data.results[Math.floor(Math.random() * data.results.length)];
                setMovie(random);
            });
    }, []);

    if (!movie) return <div className="h-[60vh] md:h-[80vh] bg-slate-900 animate-pulse" />;

    const backdrop = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;

    return (
        <div
            className="relative h-[65vh] md:h-[80vh] lg:h-[90vh] flex items-end"
        >
            {/* Backdrop image fills everything */}
            <img
                src={backdrop}
                alt={movie.title}
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Strong dark overlay gradients for cool readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent/20"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent"></div>

            {/* Content: title, overview, buttons - cool & nice */}
            <div className="relative z-50 pb-16 md:pb-24 px-8 md:px-12 lg:px-20 max-w-5xl">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 leading-tight drop-shadow-2xl tracking-tight">
                    {movie.title || movie.name}
                </h1>
                <p className="text-lg md:text-2xl lg:text-3xl text-white/95 mb-10 max-w-3xl line-clamp-5 font-light drop-shadow-2xl leading-relaxed">
                    {movie.overview || 'No overview available.'}
                </p>
                <div className="flex flex-wrap gap-6">
                    <button className="px-12 py-4 bg-white text-black text-xl md:text-2xl font-bold rounded-md hover:bg-gray-200 transition shadow-2xl flex items-center gap-4">
                        ▶ Play
                    </button>
                    <button className="px-12 py-4 bg-white/20 backdrop-blur-md text-white text-xl md:text-2xl font-bold rounded-md hover:bg-white/30 transition shadow-2xl border border-white/30 flex items-center gap-4">
                        ℹ More Info
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Banner;