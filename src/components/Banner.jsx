import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Added for page navigation
import Modal from './Modal.jsx';
import MovieDetail from './MovieDetail.jsx';
import { useMyList } from '../context/MyListContext';

function Banner({ onPlay, onInfo }) {
    const [movie, setMovie] = useState(null);
    const [playOpen, setPlayOpen] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    const { addToMyList, removeFromMyList, isInMyList } = useMyList();
    const navigate = useNavigate(); // Hook for navigating to new pages

    const inList = isInMyList(movie?.id);

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
                    id: 1, // Added ID for routing
                    media_type: "movie",
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
        return <div className="h-[60vh] md:h-[80vh] bg-slate-900 flex items-center justify-center text-white text-2xl">Loading...</div>;
    }

    // Helper to handle the navigation to the dedicated Play Page
    const handlePlayClick = () => {
        const type = movie.media_type || 'movie';
        navigate(`/watch/${type}/${movie.id}`);
        if (onPlay) onPlay(movie); // Keep original prop functionality
    };

    // Helper to handle the navigation to the dedicated Details Page
    const handleInfoClick = () => {
        const type = movie.media_type || 'movie';
        navigate(`/details/${type}/${movie.id}`);
        if (onInfo) onInfo(movie); // Keep original prop functionality
    };

    const backdrop = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : 'https://via.placeholder.com/1920x1080/000000/FFFFFF?text=PrimeScene';

    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

    return (
        <div className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] overflow-hidden">
            <img
                src={backdrop}
                alt={movie.title || movie.name}
                className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent"></div>

            <div className="absolute bottom-0 left-0 pb-10 sm:pb-12 md:pb-16 px-4 sm:px-6 md:px-10 lg:px-16 max-w-full">
                <p className="text-xs sm:text-sm md:text-base text-yellow-400 font-semibold mb-2 sm:mb-4 tracking-wider uppercase">
                    Featured
                </p>

                {/* Title - smaller, fixed size, no overflow */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3 sm:mb-4 leading-tight truncate"
                    style={{ textShadow: '0 0 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.8), 2px 2px 4px black' }}>
                    {movie.title || movie.name}
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-yellow-400 font-semibold mb-3 sm:mb-4">
                    ★ {rating} Rating
                </p>

                {/* Overview - smaller, responsive */}
                <p className="text-xs sm:text-sm md:text-base text-white mb-6 sm:mb-8 max-w-full sm:max-w-2xl leading-relaxed line-clamp-3 sm:line-clamp-4"
                    style={{ textShadow: '2px 2px 4px black, 0 0 10px rgba(0,0,0,0.8)' }}>
                    {movie.overview || 'Discover this trending title on PrimeScene.'}
                </p>

                {/* Buttons - smaller on mobile, rounded */}
                <div className="flex flex-wrap gap-4 sm:gap-6">
                    <button
                        onClick={handlePlayClick}
                        className="px-6 sm:px-8 md:px-10 py-2 sm:py-3 bg-white text-black text-base sm:text-lg font-bold rounded-lg hover:bg-gray-200 transition flex items-center gap-2 shadow-2xl"
                    >
                        ▶ Play
                    </button>
                    <button
                        onClick={handleInfoClick}
                        className="px-6 sm:px-8 md:px-10 py-2 sm:py-3 bg-gray-600/80 text-white text-base sm:text-lg font-bold rounded-lg hover:bg-gray-600 transition flex items-center gap-2 shadow-2xl"
                    >
                        ℹ More Info
                    </button>
                    <button
                        onClick={() => inList ? removeFromMyList(movie.id) : addToMyList(movie)}
                        className="px-6 sm:px-8 md:px-10 py-2 sm:py-3 bg-transparent border-2 border-white text-white text-base sm:text-lg font-bold rounded-lg hover:bg-white/10 transition flex items-center gap-3 shadow-2xl"
                    >
                        {inList ? '− Remove from List' : '+ Add to List'}
                    </button>
                </div>
            </div>

            {/* Modals - Kept exactly as requested */}
            {playOpen && (
                <Modal isOpen={playOpen} onClose={() => setPlayOpen(false)}>
                    <MovieDetail movie={movie} showOnlyPlayer={true} />
                </Modal>
            )}

            {infoOpen && (
                <Modal isOpen={infoOpen} onClose={() => setInfoOpen(false)}>
                    <MovieDetail movie={movie} showOnlyPlayer={false} />
                </Modal>
            )}
        </div>
    );
}

export default Banner;