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
        <div className="relative h-[60vh] md:h-[80vh] flex items-end pb-32 md:pb-48"style={{backgroundImage: `url(${backdrop})`, backgroundSize: 'cover',backgroundPosition: 'center',}}>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-transparent to-transparent"></div>

            <div className="relative z-40 pb-12 px-8 md:px-12 max-w-4xl">  {/* z-40 to beat everything */}
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-2xl">
                    {movie.title || movie.name}
                </h1>
                <p className="text-lg md:text-2xl text-white mb-8 max-w-2xl line-clamp-4 drop-shadow-2xl">
                    {movie.overview || 'No overview available.'}
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