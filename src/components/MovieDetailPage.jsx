import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Plus, Check, Star } from 'lucide-react';
import { useMyList } from '../context/MyListContext';
import Row from '../components/Row'; // Importing Row to show related movies

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const base = 'https://api.themoviedb.org/3';

function MovieDetailPage() {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [similar, setSimilar] = useState([]); // New state for similar movies
    const { addToMyList, removeFromMyList, isInMyList } = useMyList();
  
    useEffect(() => {
      // Fetch Movie Details + Cast (Credits)
      fetch(`${base}/${type}/${id}?api_key=${API_KEY}&append_to_response=credits`)
        .then(res => res.json())
        .then(data => setMovie(data));
  
      // Fetch Similar Movies
      fetch(`${base}/${type}/${id}/similar?api_key=${API_KEY}`)
        .then(res => res.json())
        .then(data => setSimilar(data.results?.slice(0, 6) || []));
  
      window.scrollTo(0, 0);
    }, [type, id]);
  
    if (!movie) return <div className="h-screen bg-black flex items-center justify-center text-white text-2xl font-bold">Loading Details...</div>;
  
    return (
      <div className="min-h-screen bg-black text-white pb-20">
        {/* Hero Section */}
        <div className="relative h-[70vh] w-full">
          <img 
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} 
            className="w-full h-full object-cover"
            alt={movie.title || movie.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <button onClick={() => navigate(-1)} className="absolute top-24 left-8 p-2 bg-black/60 rounded-full hover:bg-white/20 transition z-50">
             <ChevronLeft size={32} />
          </button>
  
          <div className="absolute bottom-10 left-8 md:left-16 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-2xl">{movie.title || movie.name}</h1>
            <div className="flex gap-4 mb-6">
              <button onClick={() => navigate(`/watch/${type}/${id}`)} className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded font-bold text-lg hover:bg-gray-200 transition">
                ▶ Play
              </button>
              <button onClick={() => isInMyList(movie.id) ? removeFromMyList(movie.id) : addToMyList(movie)} className="p-3 bg-gray-500/40 backdrop-blur-md rounded hover:bg-gray-500/60 transition">
                {isInMyList(movie.id) ? '✓ In List' : '+ My List'}
              </button>
            </div>
            <p className="text-lg text-gray-300 line-clamp-3">{movie.overview}</p>
          </div>
        </div>
        
        <div className="px-8 md:px-16 mt-10 space-y-12">
          {/* Description & Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
               <h3 className="text-2xl font-bold mb-4 text-red-600 uppercase tracking-widest text-sm">Description</h3>
               <p className="text-gray-300 text-lg leading-relaxed">{movie.overview}</p>
            </div>
            <div className="space-y-4 bg-gray-900/50 p-6 rounded-lg">
               <p><span className="text-gray-500">Rating:</span> <span className="text-green-500 font-bold">{movie.vote_average?.toFixed(1)}</span></p>
               <p><span className="text-gray-500">Release:</span> {movie.release_date || movie.first_air_date}</p>
               <p><span className="text-gray-500">Genres:</span> {movie.genres?.map(g => g.name).join(', ')}</p>
            </div>
          </div>
  
          {/* CAST SECTION */}
          <div>
            <h3 className="text-2xl font-bold mb-6">Top Cast</h3>
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {movie.credits?.cast?.slice(0, 10).map(person => (
                <div key={person.id} className="min-w-[120px] text-center">
                  <img 
                    src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : 'https://via.placeholder.com/185x278?text=No+Image'} 
                    className="w-full h-32 object-cover rounded-full mb-2 border-2 border-gray-800"
                    alt={person.name}
                  />
                  <p className="text-sm font-bold line-clamp-1">{person.name}</p>
                  <p className="text-xs text-gray-500 line-clamp-1">{person.character}</p>
                </div>
              ))}
            </div>
          </div>
  
          {/* SIMILAR MOVIES SECTION */}
          <div>
            <h3 className="text-2xl font-bold mb-6">More Like This</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {similar.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => navigate(`/details/${type}/${item.id}`)}
                  className="cursor-pointer hover:scale-105 transition transform duration-200"
                >
                  <img 
                    src={`https://image.tmdb.org/t/p/w342${item.poster_path}`} 
                    className="rounded-md"
                    alt={item.title}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

export default MovieDetailPage;