import { useEffect, useState } from 'react';

function Banner() {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${import.meta.env.VITE_TMDB_API_KEY}&page=1`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setMovie(data.results[0] || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBanner();
  }, []);

  if (loading) return <div className="h-[60vh] md:h-[80vh] bg-slate-900 animate-pulse" />;
  if (error || !movie) return <div className="h-[60vh] md:h-[80vh] bg-slate-900 flex items-center justify-center text-white">Error loading banner</div>;

  const backdrop = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;

  return (
    <div className="relative h-[60vh] md:h-[75vh] lg:h-[85vh]">
      {/* Full bleed image */}
      <img 
        src={backdrop} 
        alt={movie.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent/10"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent"></div>

      {/* Left-aligned compact content */}
      <div className="absolute bottom-0 left-0 pb-12 md:pb-16 px-8 md:px-12 lg:px-16 max-w-xl z-50">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-4 leading-none drop-shadow-xl">
          {movie.title || movie.name}
        </h1>
        <p className="text-base md:text-lg text-white/90 mb-8 line-clamp-4 leading-relaxed max-w-lg">
          {movie.overview || 'No overview available.'}
        </p>
        <div className="flex gap-6">
          <button className="px-10 py-4 bg-white/90 text-black text-lg md:text-xl font-bold rounded-full hover:bg-white transition flex items-center gap-3 shadow-xl">
            ▶ Watch Now
          </button>
          <button className="px-10 py-4 bg-white/20 backdrop-blur-md text-white text-lg md:text-xl font-bold rounded-full hover:bg-white/30 transition flex items-center gap-3 border border-white/40 shadow-xl">
            + Add to List
          </button>
        </div>
      </div>
    </div>
  );
}

export default Banner;