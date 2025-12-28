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

  useEffect(() => {
    const fetchTrailer = async () => {
      const res = await fetch(`${base}/${type}/${id}?api_key=${API_KEY}&append_to_response=videos`);
      const data = await res.json();
      setTitle(data.title || data.name || 'Unknown Title');

      const trailer = data.videos?.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer')
        || data.videos?.results?.[0];

      if (trailer) {
        setVideoKey(trailer.key);
      }
    };

    fetchTrailer();
  }, [type, id]);

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col">
      {/* Top Bar with Back Button */}
      <div className="absolute top-0 left-0 right-0 p-6 md:p-10 bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex items-center gap-4 max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-4 text-white hover:text-gray-300 transition group"
          >
            <ChevronLeft size={40} className="group-hover:-translate-x-1 transition" />
            <p className="text-xl font-bold line-clamp-1">{title}</p>
          </button>
        </div>
      </div>

      {/* YouTube Video with Default Controls */}
      <div className="flex-1 relative">
        {videoKey ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`}
            title="PrimeScene Player"
            allow="autoplay; fullscreen; accelerometer; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-center px-8">
            <div>
              <h1 className="text-6xl md:text-8xl font-black text-gray-600 mb-8">PrimeScene</h1>
              <p className="text-2xl text-gray-400">Preview Unavailable</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerPage;