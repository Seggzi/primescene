import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import MovieDetail from './MovieDetail.jsx';

function Banner({ onPlay, onInfo }) {
    const [movie, setMovie] = useState(null);
    const [playOpen, setPlayOpen] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const res = await fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${import.meta.env.VITE_TMDB_API_KEY}`);
                if (!res.ok) throw new Error('API error');
                const data = await res.json();
                if (data.results && data.results.length > 0) {
                    const random = data.results[Math.floor(Math.random() * data.results.length)];
                    setMovie(random);
                }
            } catch (err) {
                console.error(err);
                // Fallback so it never crashes
                setMovie({
                    title: "The Running Man",
                    name: "The Running Man",
                    overview: "A wrongly convicted man must survive a public game show where he is hunted for sport.",
                    vote_average: 8.2,
                    backdrop_path: "/1ZSWM6qW4nRJcQ6n8X1l0Z0T9jU.jpg"
                });
            }
        };
        fetchBanner();
    }, []);

    if (!movie) {
        return <div className="h-screen bg-slate-900 flex items-center justify-center text-white text-3xl">Loading...</div>;
    }

    const backdrop = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : 'https://via.placeholder.com/1920x1080/000000/FFFFFF?text=PrimeScene';

    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

    return (
        <div className="relative h-screen overflow-hidden">
            <img
                src={backdrop}
                alt={movie.title || movie.name}
                className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent"></div>

            <div className="absolute bottom-0 left-0 pb-20 px-8 md:px-16 lg:px-24 max-w-4xl">
                <p className="text-sm md:text-base text-yellow-400 font-semibold mb-4 tracking-wider uppercase">
                    Featured
                </p>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight"
                    style={{ textShadow: '0 0 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.8), 2px 2px 4px black' }}>
                    {movie.title || movie.name}
                </h1>

                <p className="text-lg md:text-xl text-yellow-400 font-semibold mb-6">
                    ★ {rating} Rating
                </p>

                <p className="text-base md:text-lg text-white mb-10 max-w-3xl leading-relaxed line-clamp-5"
                    style={{ textShadow: '2px 2px 4px black, 0 0 10px rgba(0,0,0,0.8)' }}>
                    {movie.overview || 'Discover this trending title on PrimeScene.'}
                </p>

                <div className="flex gap-8">
                    <button
                        onClick={() => onPlay(movie)}
                        className="px-10 py-3 bg-white text-black text-lg font-bold rounded-lg hover:bg-gray-200 transition flex items-center gap-3 shadow-2xl"
                    >
                        ▶ Play
                    </button>
                    <button
                        onClick={() => onInfo(movie)}
                        className="px-10 py-3 bg-gray-600/80 text-white text-lg font-bold rounded-lg hover:bg-gray-600 transition flex items-center gap-3 shadow-2xl"
                    >
                        ℹ More Info
                    </button>
                    <button className="px-10 py-3 bg-transparent border-2 border-white text-white text-lg font-bold rounded-lg hover:bg-white/10 transition flex items-center gap-3">
                        + Add to List
                    </button>
                </div>
            </div>

            {/* Modals - only render when open */}
            {playOpen && (
                <Modal isOpen={playOpen} onClose={() => setPlayOpen(false)}>
                    <MovieDetail movie={movie} />
                </Modal>
            )}

            {infoOpen && (
                <Modal isOpen={infoOpen} onClose={() => setInfoOpen(false)}>
                    <MovieDetail movie={movie} />
                </Modal>
            )}
        </div>
    );
}

export default Banner;