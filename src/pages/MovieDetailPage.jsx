import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Play, Plus, Check, Star, 
  Trash2, X, Youtube, Film, Building2,
  Users, Info, Award
} from 'lucide-react';
import { useMyList } from '../context/MyListContext';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const base = 'https://api.themoviedb.org/3';

function MovieDetailPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const recommendationsRef = useRef(null); 
  
  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('storyline');
  const [userReview, setUserReview] = useState("");
  const [userRating, setUserRating] = useState(10);
  const [localReviews, setLocalReviews] = useState([]);
  
  const [showTrailer, setShowTrailer] = useState(false);
  const [activeVideoKey, setActiveVideoKey] = useState(null);

  const { addToMyList, removeFromMyList, isInMyList } = useMyList();

  useEffect(() => {
    // Append release_dates and content_ratings for proper age certification
    fetch(`${base}/${type}/${id}?api_key=${API_KEY}&append_to_response=credits,videos,release_dates,content_ratings`)
      .then(res => res.json())
      .then(data => {
        setMovie(data);
        setVideos(data.videos?.results || []);
        const trailer = data.videos?.results?.find(v => v.type === "Trailer" && v.site === "YouTube");
        setActiveVideoKey(trailer?.key || data.videos?.results?.[0]?.key);
      });

    fetch(`${base}/${type}/${id}/similar?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => setSimilar(data.results?.slice(0, 12) || []));

    fetch(`${base}/${type}/${id}/reviews?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => setReviews(data.results?.slice(0, 5) || []));

    const saved = localStorage.getItem(`reviews-${id}`);
    if (saved) setLocalReviews(JSON.parse(saved));

    window.scrollTo(0, 0);
  }, [type, id]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!userReview.trim()) return;
    const newReview = {
      id: Date.now(),
      author: "You",
      content: userReview,
      author_details: { rating: userRating },
      isLocal: true
    };
    const updatedLocal = [newReview, ...localReviews];
    setLocalReviews(updatedLocal);
    localStorage.setItem(`reviews-${id}`, JSON.stringify(updatedLocal));
    setUserReview("");
  };

  const deleteReview = (reviewId) => {
    const updated = localReviews.filter(r => r.id !== reviewId);
    setLocalReviews(updated);
    localStorage.setItem(`reviews-${id}`, JSON.stringify(updated));
  };

  const playVideo = (key) => {
    setActiveVideoKey(key);
    setShowTrailer(true);
  };

  // FIXED AGE RATING HELPER
  const getRating = () => {
    if (!movie) return "";
    if (type === 'movie') {
      const release = movie.release_dates?.results?.find(r => r.iso_3166_1 === "US") || movie.release_dates?.results?.[0];
      return release?.release_dates?.[0]?.certification || "PG-13";
    } else {
      const rating = movie.content_ratings?.results?.find(r => r.iso_3166_1 === "US") || movie.content_ratings?.results?.[0];
      return rating?.rating || "TV-MA";
    }
  };

  // FIXED RUNTIME HELPER
  const formatRuntime = (n) => {
    if (!n) return null;
    const hours = Math.floor(n / 60);
    const mins = n % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (!movie) return (
    <div className="h-screen bg-[#141414] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans pb-20">
      
      {showTrailer && activeVideoKey && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.3)]">
            <button 
              onClick={() => setShowTrailer(false)} 
              className="absolute top-4 right-4 z-10 bg-black/60 p-3 rounded-full hover:bg-red-600 transition-all hover:rotate-90"
            >
              <X size={24} />
            </button>
            <iframe 
              src={`https://www.youtube.com/embed/${activeVideoKey}?autoplay=1&rel=0`}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        <img
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
          className="w-full h-full object-cover transform scale-105"
          alt={movie.title || movie.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-transparent to-transparent" />

        <button onClick={() => navigate(-1)} className="absolute top-24 left-6 md:left-12 p-3 bg-black/40 hover:bg-white/20 rounded-full z-50 transition">
          <ChevronLeft size={32} />
        </button>

        <div className="absolute bottom-16 left-6 md:left-12 right-6 z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-yellow-500 text-black px-2 py-0.5 rounded font-black text-xs uppercase italic tracking-tighter">IMDb {movie.vote_average?.toFixed(1)}</div>
            <div className="border border-white/40 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider">{getRating()}</div>
            <span className="text-green-500 font-bold uppercase text-xs tracking-widest">98% Match</span>
            <span className="text-gray-300 font-medium">{movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0]}</span>
            <span className="text-gray-400 text-xs font-bold">{formatRuntime(movie.runtime || movie.episode_run_time?.[0])}</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter uppercase italic drop-shadow-2xl">
            {movie.title || movie.name}
          </h1>

          <div className="flex flex-wrap gap-4">
            <button onClick={() => navigate(`/watch/${type}/${id}`)} className="flex items-center gap-3 px-12 py-4 bg-white text-black rounded-md font-black text-xl hover:bg-gray-200 transition active:scale-95">
              <Play fill="black" size={28} /> Play
            </button>
            
            <button onClick={() => isInMyList(movie.id) ? removeFromMyList(movie.id) : addToMyList(movie)} className="flex items-center justify-center w-14 h-14 rounded-full border-2 border-gray-400 bg-black/40 hover:border-white transition active:scale-90">
              {isInMyList(movie.id) ? <Check size={32} /> : <Plus size={32} />}
            </button>

            <button 
              onClick={() => setShowTrailer(true)} 
              className="flex items-center gap-3 px-10 py-4 bg-zinc-800/80 backdrop-blur-md rounded-md font-bold text-xl hover:bg-zinc-700 transition border border-white/10"
            >
              <Youtube size={24} className="text-red-600" /> Trailer
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 py-12">
        <div className="flex gap-10 border-b border-white/10 mb-10 overflow-x-auto scrollbar-hide">
          {['storyline', 'details', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-5 text-lg font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'text-red-600 border-b-4 border-red-600' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
          <div className="lg:col-span-3">
            {activeTab === 'storyline' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-gray-300 text-2xl leading-relaxed font-light max-w-5xl">{movie.overview}</p>
                
                {/* --- PROFESSIONAL CIRCULAR CAST SECTION --- */}
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xs font-bold text-red-600 uppercase tracking-[0.4em]">Featured Cast</h3>
                    <div className="h-[1px] flex-1 bg-zinc-800 ml-6"></div>
                  </div>
                  <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide">
                    {movie.credits?.cast?.slice(0, 15).map(person => (
                      <div key={person.id} className="min-w-[110px] text-center group cursor-pointer">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-zinc-800 group-hover:border-red-600 transition-all duration-500 shadow-2xl relative">
                          <img 
                            src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : 'https://via.placeholder.com/185'} 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-500 scale-100 group-hover:scale-110" 
                            alt={person.name} 
                          />
                        </div>
                        <p className="text-sm font-bold tracking-tight text-white group-hover:text-red-500 transition-colors line-clamp-1 italic">{person.name}</p>
                        <p className="text-[10px] font-bold text-zinc-500 line-clamp-1 tracking-tighter uppercase">{person.character}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="animate-in fade-in space-y-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 shadow-2xl">
                      <h4 className="text-red-600 font-bold uppercase text-xs tracking-[0.2em] mb-8 flex items-center gap-2"><Film size={16}/> Production Details</h4>
                      <div className="space-y-5">
                        <div className="flex justify-between border-b border-white/5 pb-3">
                          <span className="text-gray-500 font-medium">Original Title</span> 
                          <span className="font-bold text-sm italic">{movie.original_title || movie.original_name}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-3">
                          <span className="text-gray-500 font-medium">Studio</span> 
                          <span className="text-sm text-right w-1/2 line-clamp-1">{movie.production_companies?.[0]?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-3 uppercase">
                          <span className="text-gray-500 font-medium">Language</span> 
                          <span className="text-sm font-bold tracking-widest">{movie.original_language}</span>
                        </div>
                      </div>
                   </div>

                   <div className="flex flex-wrap items-center justify-center gap-12 p-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition duration-700">
                      {movie.production_companies?.slice(0, 3).map(company => company.logo_path && (
                        <img 
                          key={company.id}
                          src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                          className="h-10 object-contain"
                          alt={company.name}
                        />
                      ))}
                   </div>
                </div>

                <section>
                  <h3 className="text-xs font-bold text-red-600 uppercase tracking-[0.4em] mb-10">Trailers & Specials</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {videos.slice(0, 9).map(video => (
                      <div 
                        key={video.id}
                        onClick={() => playVideo(video.key)}
                        className="group relative cursor-pointer aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 hover:border-red-600/50 transition-all duration-500"
                      >
                        <img 
                          src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`}
                          className="w-full h-full object-cover opacity-40 group-hover:opacity-100 group-hover:scale-105 transition duration-700"
                          alt={video.name}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 bg-red-600/90 rounded-full flex items-center justify-center scale-75 group-hover:scale-100 transition duration-500 shadow-2xl">
                            <Play fill="white" size={28} className="ml-1" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-10 animate-in fade-in">
                <form onSubmit={handleReviewSubmit} className="bg-[#1a1a1a] p-10 rounded-3xl border border-white/5 shadow-2xl">
                  <h3 className="text-3xl font-black italic uppercase mb-8 tracking-tighter">Fan Feedback</h3>
                  <div className="flex items-center gap-6 mb-8">
                    <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Select Rating:</span>
                    <div className="flex gap-2">
                      {[10,8,6,4,2].map(n => (
                        <button key={n} type="button" onClick={() => setUserRating(n)} className={`w-10 h-10 rounded-lg font-black transition-all ${userRating === n ? 'bg-red-600 scale-110 shadow-lg shadow-red-600/40' : 'bg-zinc-900 border border-zinc-800 hover:border-red-600/50'}`}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea 
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-6 text-gray-200 focus:border-red-600 outline-none h-40 transition-all placeholder:text-zinc-600"
                    placeholder="Tell us what you loved..."
                  />
                  <button className="mt-8 px-12 py-4 bg-red-600 hover:bg-red-700 rounded-full font-black uppercase text-sm tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-red-600/20">Submit Review</button>
                </form>

                <div className="space-y-8">
                  {[...localReviews, ...reviews].map((review) => (
                    <div key={review.id} className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 relative group transition-all hover:bg-zinc-800/40">
                      <div className="flex items-center gap-5 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center font-black text-2xl italic shadow-lg">{review.author[0]}</div>
                        <div>
                          <h4 className="font-bold text-xl tracking-tight">{review.author}</h4>
                          <span className="text-yellow-500 font-black text-sm tracking-widest">★ {review.author_details?.rating || 'N/A'}/10</span>
                        </div>
                      </div>
                      <p className="text-zinc-400 text-lg leading-relaxed italic font-light">"{review.content}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <section ref={recommendationsRef} className="px-6 md:px-12 pt-20 border-t border-white/5">
        <div className="flex items-center gap-6 mb-12">
          <h3 className="text-5xl font-black italic uppercase tracking-tighter">You Might Like</h3>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-red-600 to-transparent opacity-30" />
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {similar.map(item => (
            <div key={item.id} onClick={() => navigate(`/details/${type}/${item.id}`)} className="group cursor-pointer">
              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl transition-all duration-700 group-hover:ring-4 group-hover:ring-red-600/50">
                <img src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" alt={item.title || item.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                   <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                     <Play fill="black" size={24} className="ml-1" />
                   </div>
                   <p className="font-black uppercase italic text-sm tracking-tighter line-clamp-2">{item.title || item.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default MovieDetailPage;