import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Volume2, 
  Play, 
  RotateCcw, 
  Maximize, 
  List, 
  Settings, 
  SkipForward 
} from 'lucide-react';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const base = 'https://api.themoviedb.org/3';

function PlayerPage() {
  const { type = 'movie', id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [videoKey, setVideoKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUI, setShowUI] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  
  const uiTimer = useRef(null);

  // --- UI AUTO-HIDE LOGIC ---
  const resetUITimer = () => {
    setShowUI(true);
    if (uiTimer.current) clearTimeout(uiTimer.current);
    uiTimer.current = setTimeout(() => {
      if (!isPaused) setShowUI(false);
    }, 3000);
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/${type}/${id}?api_key=${API_KEY}&append_to_response=videos,recommendations`);
        const data = await res.json();
        
        setTitle(data.title || data.name || 'Unknown Title');
        setRecommendations(data.recommendations?.results?.slice(0, 10) || []);
        
        const trailer = data.videos?.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer') 
                      || data.videos?.results?.[0];
        
        if (trailer) setVideoKey(trailer.key);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [type, id]);

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPaused(prev => !prev);
      }
      if (e.code === 'Escape') {
        navigate(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div 
      className="fixed inset-0 bg-black z-[9999] flex flex-col overflow-hidden transition-colors duration-500"
      style={{ cursor: showUI || isPaused ? 'default' : 'none' }}
      onMouseMove={resetUITimer}
      onClick={() => setIsPaused(!isPaused)}
    >
      {/* --- CINEMATIC TOP BAR --- */}
      <div className={`absolute top-0 left-0 right-0 p-8 bg-gradient-to-b from-black/90 via-black/40 to-transparent z-[70] transition-all duration-700 ease-in-out ${showUI || isPaused ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
        <div className="flex items-center gap-6 max-w-[98%] mx-auto">
          <button 
            onClick={(e) => { e.stopPropagation(); navigate(-1); }} 
            className="p-3 hover:bg-white/10 rounded-full transition-colors group"
          >
            <ChevronLeft size={32} className="text-white group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="h-10 w-[1px] bg-white/20 ml-2" />
          <div>
            <h1 className="text-xl md:text-2xl font-medium text-white tracking-tight">{title}</h1>
            <p className="text-xs text-zinc-400 uppercase tracking-[0.3em] font-bold mt-1 italic">
               Streaming in 4K Ultra HD • Dolby Atmos
            </p>
          </div>
        </div>
      </div>

      {/* --- PAUSE OVERLAY (RECOMMENDATIONS) --- */}
      <div className={`absolute inset-0 z-[60] bg-zinc-950/80 backdrop-blur-md transition-opacity duration-500 flex flex-col justify-end pb-24 px-12 ${isPaused ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2 text-yellow-500 mb-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest">Paused</span>
              </div>
              <h2 className="text-4xl font-bold text-white tracking-tight font-sans">More to Explore</h2>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsPaused(false); }}
              className="bg-white text-black px-10 py-4 rounded-full font-black text-sm tracking-widest hover:bg-yellow-500 transition-all duration-300 active:scale-95 shadow-2xl"
            >
              RESUME PLAYING
            </button>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
            {recommendations.map((item) => (
              <div 
                key={item.id} 
                onClick={(e) => { e.stopPropagation(); navigate(`/watch/${type}/${item.id}`); }}
                className="min-w-[300px] group cursor-pointer"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 border border-white/5 group-hover:border-yellow-500/50 transition-all duration-500 shadow-lg">
                  <img 
                    src={`https://image.tmdb.org/t/p/w500${item.backdrop_path}`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-70 group-hover:opacity-100"
                    alt={item.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center">
                       <Play fill="white" size={24} className="ml-1" />
                    </div>
                  </div>
                </div>
                <h3 className="text-white text-sm font-semibold truncate group-hover:text-yellow-500 transition-colors uppercase tracking-wider">{item.title || item.name}</h3>
                <p className="text-zinc-500 text-[10px] font-bold mt-1">{(item.release_date || item.first_air_date || '').slice(0,4)} • {item.vote_average} Rating</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- MAIN VIDEO ENGINE --- */}
      <div className={`flex-1 relative transition-all duration-1000 ease-[cubic-bezier(0.2,1,0.3,1)] ${isPaused ? 'scale-[0.88] translate-y-[-8%]' : 'scale-105'}`}>
        {loading ? (
           <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
              <div className="w-16 h-16 border-4 border-white/10 border-t-yellow-500 rounded-full animate-spin" />
           </div>
        ) : (
          <iframe
            className="absolute inset-0 w-full h-full pointer-events-none"
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1&controls=0&showinfo=0&iv_load_policy=3&enablejsapi=1`}
            title={title}
            allow="autoplay; fullscreen"
          />
        )}
      </div>

      {/* --- MINIMALIST BOTTOM CONTROLS --- */}
      <div className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent z-[70] transition-all duration-700 ease-in-out ${showUI || isPaused ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}>
        <div className="max-w-[95%] mx-auto flex items-center justify-between h-full pt-8">
            <div className="flex items-center gap-8">
               <button onClick={(e) => e.stopPropagation()} className="text-white/60 hover:text-white transition"><RotateCcw size={24} /></button>
               <button onClick={(e) => e.stopPropagation()} className="text-white/60 hover:text-white transition"><Volume2 size={24} /></button>
               
               {/* Custom Scrubbing Bar */}
               <div className="group relative w-64 md:w-[500px] h-1.5 bg-white/20 rounded-full cursor-pointer transition-all hover:h-2">
                  <div className="absolute top-0 left-0 h-full w-[35%] bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                  <div className="absolute top-1/2 left-[35%] -translate-y-1/2 w-4 h-4 bg-white rounded-full scale-0 group-hover:scale-100 transition-transform shadow-lg" />
               </div>
            </div>

            <div className="flex items-center gap-6">
               <button onClick={(e) => {
                 e.stopPropagation();
                 if(recommendations.length > 0) navigate(`/watch/${type}/${recommendations[0].id}`);
               }} className="text-white/60 hover:text-white transition flex items-center gap-2 group">
                  <span className="text-[10px] font-black tracking-[.2em] uppercase opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">Next</span>
                  <SkipForward size={22} />
               </button>
               <button onClick={(e) => e.stopPropagation()} className="text-white/60 hover:text-white transition flex items-center gap-2">
                  <List size={22} />
               </button>
               <button onClick={(e) => e.stopPropagation()} className="text-white/60 hover:text-white transition"><Settings size={22} /></button>
               <button onClick={(e) => e.stopPropagation()} className="text-white/60 hover:text-white transition"><Maximize size={22} /></button>
            </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default PlayerPage;