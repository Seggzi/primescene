import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Plus, Check } from 'lucide-react';
import { useMyList } from '../context/MyListContext';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const base = 'https://api.themoviedb.org/3';

function MovieDetailPage() {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [similar, setSimilar] = useState([]);
    const { addToMyList, removeFromMyList, isInMyList } = useMyList();
  
    useEffect(() => {
      fetch(`${base}/${type}/${id}?api_key=${API_KEY}&append_to_response=credits`)
        .then(res => res.json())
        .then(data => setMovie(data));
  
      fetch(`${base}/${type}/${id}/similar?api_key=${API_KEY}`)
        .then(res => res.json())
        .then(data => setSimilar(data.results?.slice(0, 6) || []));
  
      window.scrollTo(0, 0);
    }, [type, id]);
  
    if (!movie) return <div className="h-screen bg-black flex items-center justify-center text-white text-2xl font-bold">Loading Details...</div>;
  
    return (
      <div className="min-h-screen bg-black text-white pb-20">
        
        {/* --- HERO SECTION --- */}
        <div className="relative w-full flex flex-col justify-end min-h-[75vh] md:min-h-[85vh]">
          
          {/* Background Image */}
          <div className="absolute inset-0 w-full h-full">
            <img 
              src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} 
              className="w-full h-full object-cover"
              alt={movie.title || movie.name}
            />
            {/* Dark Gradients to prevent text clash */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          </div>

          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)} 
            className="absolute top-24 left-6 md:left-12 p-3 bg-black/50 backdrop-blur-md rounded-full hover:bg-white/20 transition z-50 border border-white/10"
          >
            <ChevronLeft size={28} />
          </button>
  
          {/* Content Wrapper (Title, Buttons, Overview) */}
          <div className="relative z-10 px-6 md:px-16 pb-12 w-full max-w-4xl">
            <h1 className="text-4xl md:text-7xl font-black mb-4 leading-tight drop-shadow-lg">
              {movie.title || movie.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-6">
               <span className="text-green-500 font-bold text-lg">{movie.vote_average?.toFixed(1)} Rating</span>
               <span className="text-gray-400">{(movie.release_date || movie.first_air_date)?.split('-')[0]}</span>
               <span className="border border-gray-500 px-2 text-xs py-0.5 rounded text-gray-400 uppercase">HD</span>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              <button 
                onClick={() => navigate(`/watch/${type}/${id}`)} 
                className="flex items-center gap-2 px-10 py-3 bg-white text-black rounded font-black text-lg hover:bg-gray-300 transition-all transform active:scale-95"
              >
                <Play size={24} fill="black" /> Play
              </button>
              
              <button 
                onClick={() => isInMyList(movie.id) ? removeFromMyList(movie.id) : addToMyList(movie)} 
                className={`flex items-center gap-2 px-6 py-3 rounded font-bold text-lg border transition-all ${
                  isInMyList(movie.id) 
                  ? 'bg-zinc-800 border-zinc-700 text-white' 
                  : 'bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20'
                }`}
              >
                {isInMyList(movie.id) ? <><Check size={20}/> In List</> : <><Plus size={20}/> My List</>}
              </button>
            </div>

            <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-2xl font-medium">
                {movie.overview}
            </p>
          </div>
        </div>
        
        {/* --- INFO & CAST SECTION --- */}
        <div className="px-6 md:px-16 mt-16 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-3">
               <h3 className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-4">Cast</h3>
               <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                 {movie.credits?.cast?.slice(0, 10).map(person => (
                   <div key={person.id} className="min-w-[110px] md:min-w-[130px] text-center group">
                     <div className="w-full aspect-square overflow-hidden rounded-full border-2 border-zinc-800 mb-3 group-hover:border-red-600 transition-colors">
                        <img 
                          src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : 'https://via.placeholder.com/185x185?text=N/A'} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          alt={person.name}
                        />
                     </div>
                     <p className="text-sm font-bold text-zinc-100">{person.name}</p>
                     <p className="text-xs text-zinc-500">{person.character}</p>
                   </div>
                 ))}
               </div>
            </div>

            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50 h-fit">
               <div className="space-y-4 text-sm">
                  <div><span className="text-zinc-500 block">Genres</span> {movie.genres?.map(g => g.name).join(', ')}</div>
                  <div className="pt-4 border-t border-zinc-800"><span className="text-zinc-500 block">Status</span> {movie.status}</div>
                  <div className="pt-4 border-t border-zinc-800"><span className="text-zinc-500 block">Revenue</span> ${movie.revenue?.toLocaleString()}</div>
               </div>
            </div>
          </div>
  
          {/* SIMILAR MOVIES SECTION */}
          <div>
            <h3 className="text-2xl font-bold mb-8">More Like This</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similar.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => navigate(`/details/${type}/${item.id}`)}
                  className="cursor-pointer group relative rounded-lg overflow-hidden aspect-[2/3]"
                >
                  <img 
                    src={`https://image.tmdb.org/t/p/w342${item.poster_path}`} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    alt={item.title}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
}

export default MovieDetailPage;