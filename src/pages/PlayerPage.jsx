import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const base = 'https://api.themoviedb.org/3';

function PlayerPage() {
  const { type = 'movie', id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [videoKey, setVideoKey] = useState('');
  const [posterPath, setPosterPath] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(`${base}/${type}/${id}?api_key=${API_KEY}&append_to_response=videos`);
      const data = await res.json();

      setTitle(data.title || data.name || 'Unknown Title');
      setPosterPath(data.poster_path);

      const trailer = data.videos?.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer')
        || data.videos?.results?.[0];

      if (trailer) {
        setVideoKey(trailer.key);
      }
      setLoading(false);
    };

    fetchData();
  }, [type, id]);

  const posterUrl = posterPath ? `https://image.tmdb.org/t/p/original${posterPath}` : null;

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 md:p-10 bg-gradient-to-b from-black/90 to-transparent z-20">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-4 text-white hover:text-gray-300 transition group"
          >
            <ChevronLeft size={40} className="group-hover:-translate-x-1 transition" />
            <p className="text-xl font-bold line-clamp-1 max-w-md">{title}</p>
          </button>

          {/* Quality Badges */}
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/30">Ultra HD 4K</span>
            <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/30">Dolby Vision</span>
            <span className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-xs font-bold">Dolby Atmos</span>
          </div>
        </div>
      </div>

      {/* Video or Custom Fallback/Loading */}
      <div className="flex-1 relative">
        {videoKey ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&fs=1&playsinline=1`}
            title="PrimeScene Player"
            allow="autoplay; fullscreen; accelerometer; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setLoading(false)}
          />
        ) : (
          /* Custom Fallback Screen */
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 bg-gradient-to-b from-black/80 to-black">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 drop-shadow-2xl">{title}</h1>
            <p className="text-2xl text-gray-400 mb-12">Trailer Unavailable</p>
            {posterUrl && (
              <img 
                src={posterUrl} 
                alt={title}
                className="max-w-md rounded-xl shadow-2xl border border-white/10"
              />
            )}
          </div>
        )}

        {/* Custom Loading Overlay */}
        {loading && videoKey && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10">
            <div className="w-20 h-20 border-4 border-white/30 border-t-red-600 rounded-full animate-spin mb-8"></div>
            <p className="text-xl text-white font-medium">Loading Trailer...</p>
            <p className="text-gray-400 mt-4">PrimeScene</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerPage;