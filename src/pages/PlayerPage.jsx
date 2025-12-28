import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Settings, Volume2, SkipForward, Play, Info } from 'lucide-react';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const base = 'https://api.themoviedb.org/3';

function PlayerPage() {
  const { type = 'movie', id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [videoKey, setVideoKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUI, setShowUI] = useState(true);
  const [isPaused, setIsPaused] = useState(false); // New state for pause
  const [recommendations, setRecommendations] = useState([]);
  
  const uiTimer = useRef(null);

  const handleMouseMove = () => {
    setShowUI(true);
    if (uiTimer.current) clearTimeout(uiTimer.current);
    uiTimer.current = setTimeout(() => setShowUI(false), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Video and Details
        const res = await fetch(`${base}/${type}/${id}?api_key=${API_KEY}&append_to_response=videos,recommendations`);
        const data = await res.json();

        setTitle(data.title || data.name || 'Unknown Title');
        setRecommendations(data.recommendations?.results?.slice(0, 6) || []);

        const trailer = data.videos?.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer')
          || data.videos?.results?.[0];

        if (trailer) setVideoKey(trailer.key);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, id]);

  // Mock Pause Toggle (In a real setup, you'd use the YouTube IFrame API to detect this)
  const togglePause = () => setIsPaused(!isPaused);

  return (
    <div 
      className="fixed inset-0 bg-black z-[9999] flex flex-col overflow-hidden"
      onMouseMove={handleMouseMove}
      onClick={togglePause} // Click the background to toggle pause feel
    >
      {/* --- TOP UI BAR --- */}
      <div className={`absolute top-0 left-0 right-0 p-10 bg-gradient-to-b from-black/90 to-transparent z-50 transition-all duration-500 ${showUI || isPaused ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        <div className="flex items-center justify-between max-w-[95%] mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-4 text-white group">
            <ChevronLeft size={48} className="group-hover:-translate-x-1 transition" />
            <div>
              <p className="text-2xl md:text-3xl font-black">{title}</p>
            </div>
          </button>
        </div>
      </div>

      {/* --- PAUSE OVERLAY (Sidebar) --- */}
      <div className={`absolute inset-0 z-[60] bg-black/40 backdrop-blur-md transition-all duration-500 flex justify-end ${isPaused ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`w-full max-w-md bg-gradient-to-l from-black via-black/90 to-transparent h-full p-12 flex flex-col justify-center transform transition-transform duration-500 ${isPaused ? 'translate-x-0' : 'translate-x-full'}`}>
          
          <div className="mb-10 text-white">
            <div className="flex items-center gap-3 text-red-600 mb-2">
               <Play fill="currentColor" size={20} />
               <span className="font-bold tracking-widest uppercase text-sm">Paused</span>
            </div>
            <h2 className="text-4xl font-black mb-2">More Like This</h2>
            <p className="text-gray-400">Because you're watching {title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {recommendations.map((item) => (
              <div 
                key={item.id} 
                onClick={() => navigate(`/watch/${type}/${item.id}`)}
                className="relative aspect-video rounded-md overflow-hidden cursor-pointer group border border-white/10 hover:border-white transition-all"
              >
                <img 
                  src={`https://image.tmdb.org/t/p/w300${item.backdrop_path}`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-70 group-hover:opacity-100"
                  alt={item.title}
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Play fill="white" size={30} />
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setIsPaused(false)}
            className="mt-12 flex items-center justify-center gap-3 bg-white text-black font-bold py-4 rounded-md hover:bg-gray-200 transition"
          >
            <Play fill="black" /> RESUME PLAYING
          </button>
        </div>
      </div>

      {/* --- VIDEO ENGINE --- */}
      <div className={`flex-1 relative transition-all duration-700 ${isPaused ? 'scale-95 opacity-50' : 'scale-100'}`}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1&controls=1`}
          title="PrimeScene Cinema"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      </div>

      {/* --- BOTTOM CONTROLS --- */}
      <div className={`absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent z-50 transition-opacity duration-500 ${showUI ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-10 flex items-center justify-between h-full">
            <div className="flex items-center gap-6">
                <Volume2 className="text-white w-6 h-6" />
                <div className="w-48 h-1 bg-white/30 rounded-full">
                    <div className="w-[60%] h-full bg-red-600 rounded-full"></div>
                </div>
            </div>
            <div className="text-white/50 font-mono text-sm tracking-widest">
                PRIME-SCENE-ENGINE // 4K_HDR_ATMOS
            </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerPage;