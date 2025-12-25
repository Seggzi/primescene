import { useEffect, useState } from 'react';

function Banner() {
    const [movie, setMovie] = useState(null);

    useEffect(() => {
        fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${import.meta.env.VITE_TMDB_API_KEY}`)
            .then(res => res.json())
            .then(data => {
                if (data.results && data.results.length > 0) {
                    const random = data.results[Math.floor(Math.random() * data.results.length)];
                    setMovie(random);
                }
            });
    }, []);

    if (!movie) {
        return <div className="h-screen bg-slate-900 flex items-center justify-center text-white text-4xl">Loading banner...</div>;
    }

    const backdrop = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : 'https://via.placeholder.com/1920x1080?text=No+Image';

    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

    return (
        <div className="relative h-screen">
            {/* Full backdrop */}
            <img
                src={backdrop}
                alt={movie.title || movie.name}
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent"></div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 pb-20 px-8 md:px-16 lg:px-24 max-w-4xl">
                {/* Featured tag */}
                <p className="text-sm md:text-base text-yellow-400 font-semibold mb-4 tracking-wider uppercase">
                    Featured
                </p>

                {/* Title - smaller */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 drop-shadow-2xl leading-tight">
                    {movie.title || movie.name}
                </h1>

                {/* Rating */}
                <p className="text-lg md:text-xl text-yellow-400 font-semibold mb-6">
                    ★ {rating} Rating
                </p>

                {/* Overview - smaller */}
                <p className="text-base md:text-lg text-white/90 mb-10 max-w-3xl leading-relaxed line-clamp-5">
                    {movie.overview || 'Discover this trending title on PrimeScene.'}
                </p>

                {/* Buttons - shorter height, rounded */}
                <div className="flex gap-8">
                    <button className="px-10 py-3 bg-white text-black text-lg font-bold rounded-lg hover:bg-gray-200 transition flex items-center gap-3">
                        ▶ Play
                    </button>
                    <button className="px-10 py-3 bg-gray-600/80 text-white text-lg font-bold rounded-lg hover:bg-gray-600 transition flex items-center gap-3">
                        ℹ More Info
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Banner;