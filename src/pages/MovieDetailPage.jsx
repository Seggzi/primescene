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
  const { type, id } = useParams(); // type = "movie" or "tv"
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
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { addToMyList, removeFromMyList, isInMyList } = useMyList();

  useEffect(() => {
    const fetchMovieData = async () => {
      if (!API_KEY) {
        setError("TMDB API key is missing. Please check your .env file.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Main details with extra data
        const detailsRes = await fetch(
          `${base}/${type}/${id}?api_key=${API_KEY}&append_to_response=credits,videos,images,release_dates,content_ratings,external_ids`
        );

        if (!detailsRes.ok) {
          const errData = await detailsRes.json();
          throw new Error(errData.status_message || `Error ${detailsRes.status}`);
        }

        const data = await detailsRes.json();
        setMovie(data);

        // Set videos & trailer
        const videoResults = data.videos?.results || [];
        setVideos(videoResults);
        const trailer = videoResults.find(v => v.type === "Trailer" && v.site === "YouTube");
        setActiveVideoKey(trailer?.key || videoResults[0]?.key);

        // Similar items
        const similarRes = await fetch(`${base}/${type}/${id}/similar?api_key=${API_KEY}`);
        if (similarRes.ok) {
          const similarData = await similarRes.json();
          setSimilar(similarData.results?.slice(0, 12) || []);
        }

        // Reviews
        const reviewsRes = await fetch(`${base}/${type}/${id}/reviews?api_key=${API_KEY}`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData.results?.slice(0, 5) || []);
        }

      } catch (err) {
        console.error("Movie/TV fetch error:", err);
        setError(err.message || "Failed to load movie details");
      } finally {
        setIsLoading(false);
      }

      // Local saved reviews
      const saved = localStorage.getItem(`reviews-${id}`);
      if (saved) setLocalReviews(JSON.parse(saved));

      window.scrollTo(0, 0);
    };

    fetchMovieData();
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

    const updated = [newReview, ...localReviews];
    setLocalReviews(updated);
    localStorage.setItem(`reviews-${id}`, JSON.stringify(updated));
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

  // Get age rating
  const getRating = () => {
    if (!movie) return "N/A";
    if (type === 'movie') {
      const usRelease = movie.release_dates?.results?.find(r => r.iso_3166_1 === "US");
      return usRelease?.release_dates?.[0]?.certification || "PG-13";
    } else {
      const usRating = movie.content_ratings?.results?.find(r => r.iso_3166_1 === "US");
      return usRating?.rating || "TV-MA";
    }
  };

  // Format runtime
  const formatRuntime = (n) => {
    if (!n) return "N/A";
    const hours = Math.floor(n / 60);
    const mins = n % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="h-screen bg-[#141414] flex flex-col items-center justify-center text-center px-6">
        <X size={64} className="text-red-600 mb-6" />
        <h2 className="text-3xl font-bold text-white mb-4">Error Loading Content</h2>
        <p className="text-xl text-gray-400 mb-8 max-w-md">{error || "Movie/TV details not found"}</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-8 py-4 bg-red-600 rounded-lg font-bold hover:bg-red-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans pb-20">
      {/* Trailer Modal */}
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
          src={movie.backdrop_path 
            ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
            : 'https://via.placeholder.com/1920x1080?text=No+Backdrop+Available'}
          className="w-full h-full object-cover transform scale-105"
          alt={movie.title || movie.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-transparent to-transparent" />

        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-24 left-6 md:left-12 p-3 bg-black/40 hover:bg-white/20 rounded-full z-50 transition"
        >
          <ChevronLeft size={32} />
        </button>

        <div className="absolute bottom-16 left-6 md:left-12 right-6 z-10">
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div className="bg-yellow-500 text-black px-2 py-0.5 rounded font-black text-xs uppercase italic tracking-tighter">
              IMDb {movie.vote_average?.toFixed(1) || 'N/A'}
            </div>
            <div className="border border-white/40 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider">
              {getRating()}
            </div>
            <span className="text-green-500 font-bold uppercase text-xs tracking-widest">98% Match</span>
            <span className="text-gray-300 font-medium">
              {movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0] || 'N/A'}
            </span>
            <span className="text-gray-400 text-xs font-bold">
              {formatRuntime(movie.runtime || movie.episode_run_time?.[0])}
            </span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter uppercase italic drop-shadow-2xl">
            {movie.title || movie.name || 'Untitled'}
          </h1>

          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => navigate(`/watch/${type}/${id}`)}
              className="flex items-center gap-3 px-12 py-4 bg-white text-black rounded-md font-black text-xl hover:bg-gray-200 transition active:scale-95"
            >
              <Play fill="black" size={28} /> Play
            </button>
            
            <button 
              onClick={() => isInMyList(movie.id) ? removeFromMyList(movie.id) : addToMyList(movie)}
              className="flex items-center justify-center w-14 h-14 rounded-full border-2 border-gray-400 bg-black/40 hover:border-white transition active:scale-90"
            >
              {isInMyList(movie.id) ? <Check size={32} /> : <Plus size={32} />}
            </button>

            {videos.length > 0 && (
              <button 
                onClick={() => setShowTrailer(true)}
                className="flex items-center gap-3 px-10 py-4 bg-zinc-800/80 backdrop-blur-md rounded-md font-bold text-xl hover:bg-zinc-700 transition border border-white/10"
              >
                <Youtube size={24} className="text-red-600" /> Trailer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs & Content */}
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
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
          <div className="lg:col-span-3">
            {activeTab === 'storyline' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-gray-300 text-2xl leading-relaxed font-light max-w-5xl">
                  {movie.overview || "No overview available."}
                </p>

                {/* Cast Section */}
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
                            src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : 'https://via.placeholder.com/185?text=' + person.name[0]}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-500 scale-100 group-hover:scale-110"
                            alt={person.name}
                          />
                        </div>
                        <p className="text-sm font-bold tracking-tight text-white group-hover:text-red-500 transition-colors line-clamp-1 italic">
                          {person.name}
                        </p>
                        <p className="text-[10px] font-bold text-zinc-500 line-clamp-1 tracking-tighter uppercase">
                          {person.character}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="animate-in fade-in space-y-16">
                {/* Your existing details content remains unchanged */}
                {/* ... (keep all your details tab code here) ... */}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-10 animate-in fade-in">
                {/* Your existing reviews form and list */}
                {/* ... (keep all your reviews code here) ... */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <section ref={recommendationsRef} className="px-6 md:px-12 pt-20 border-t border-white/5">
        <div className="flex items-center gap-6 mb-12">
          <h3 className="text-5xl font-black italic uppercase tracking-tighter">You Might Like</h3>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-red-600 to-transparent opacity-30" />
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {similar.map(item => (
            <div 
              key={item.id} 
              onClick={() => navigate(`/details/${type}/${item.id}`)} 
              className="group cursor-pointer"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl transition-all duration-700 group-hover:ring-4 group-hover:ring-red-600/50">
                <img 
                  src={item.poster_path 
                    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                    : 'https://via.placeholder.com/500x750?text=No+Poster'}
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                  alt={item.title || item.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                    <Play fill="black" size={24} className="ml-1" />
                  </div>
                  <p className="font-black uppercase italic text-sm tracking-tighter line-clamp-2">
                    {item.title || item.name}
                  </p>
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