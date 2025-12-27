import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useParams, useNavigate } from 'react-router-dom';
import { Tv, Download, Globe, Users, ChevronLeft, Play, Info, Plus, Check, Search, X } from 'lucide-react';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import Row from './components/Row';
import Modal from './components/Modal';
import MovieDetail from './components/MovieDetail';
import MovieCard from './components/MovieCard';
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';
import { useMyList } from './context/MyListContext';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const base = 'https://api.themoviedb.org/3';

// --- GENRE BAR COMPONENT ---
function GenreBar({ activeGenre, onGenreSelect }) {
  const genres = [
    "All", "African", "Horror", "Romantic", "Action", "Comedy", "Sci-Fi", "Documentary", "Mystery", "Crime"
  ];

  return (
    <div className="flex gap-4 overflow-x-auto py-6 scrollbar-hide px-4 md:px-16 bg-black sticky top-16 z-40 border-b border-white/10">
      {genres.map((genre) => (
        <button
          key={genre}
          onClick={() => onGenreSelect(genre)}
          className={`px-6 py-1.5 border rounded-full transition text-sm font-semibold whitespace-nowrap ${activeGenre === genre
              ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
              : 'border-white/30 text-white hover:bg-white/10 hover:border-white'
            }`}
        >
          {genre}
        </button>
      ))}
    </div>
  );
}

// --- MOVIE DETAIL PAGE (FULL) ---
function MovieDetailPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const { addToMyList, removeFromMyList, isInMyList } = useMyList();

  useEffect(() => {
    // Fetch Movie Details + Credits
    fetch(`${base}/${type}/${id}?api_key=${API_KEY}&append_to_response=credits,videos`)
      .then(res => res.json())
      .then(data => setMovie(data));

    // Fetch Similar Movies
    fetch(`${base}/${type}/${id}/similar?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => setSimilar(data.results?.slice(0, 12) || []));

    window.scrollTo(0, 0);
  }, [type, id]);

  if (!movie) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-white">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mb-4"></div>
      <p className="text-xl font-bold">Loading Cinematic Experience...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="relative h-[85vh] w-full">
        <img
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
          className="w-full h-full object-cover"
          alt={movie.title || movie.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-24 left-8 p-3 bg-black/60 rounded-full hover:bg-white hover:text-black transition-all z-50 shadow-lg"
        >
          <ChevronLeft size={32} />
        </button>

        <div className="absolute bottom-20 left-8 md:left-16 max-w-4xl z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-red-600 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-widest">Featured</span>
            <span className="text-green-500 font-bold">{movie.vote_average?.toFixed(1)} Rating</span>
            <span className="text-gray-300">{movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0]}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-2xl">{movie.title || movie.name}</h1>

          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={() => navigate(`/watch/${type}/${id}`)}
              className="flex items-center gap-2 px-10 py-4 bg-white text-black rounded font-bold text-xl hover:bg-gray-200 transition transform hover:scale-105"
            >
              <Play fill="black" /> Play Now
            </button>
            <button
              onClick={() => isInMyList(movie.id) ? removeFromMyList(movie.id) : addToMyList(movie)}
              className="flex items-center gap-2 px-10 py-4 bg-gray-500/40 backdrop-blur-md text-white rounded font-bold text-xl hover:bg-gray-500/60 transition"
            >
              {isInMyList(movie.id) ? <><Check /> In List</> : <><Plus /> My List</>}
            </button>
          </div>
          <p className="text-xl text-gray-200 leading-relaxed max-w-2xl drop-shadow-lg">{movie.overview}</p>
        </div>
      </div>

      <div className="px-8 md:px-16 mt-16 space-y-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <h3 className="text-3xl font-bold mb-6 border-b border-red-600 pb-2 inline-block">Storyline</h3>
            <p className="text-gray-400 text-xl leading-relaxed">{movie.overview}</p>

            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-8">Top Billed Cast</h3>
              <div className="flex gap-8 overflow-x-auto pb-6 scrollbar-hide">
                {movie.credits?.cast?.slice(0, 12).map(person => (
                  <div key={person.id} className="min-w-[150px] group cursor-pointer">
                    <div className="relative overflow-hidden rounded-xl mb-4">
                      <img
                        src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : 'https://via.placeholder.com/185x278?text=No+Image'}
                        className="w-full h-48 object-cover transition duration-300 group-hover:scale-110"
                        alt={person.name}
                      />
                    </div>
                    <p className="text-lg font-bold line-clamp-1">{person.name}</p>
                    <p className="text-sm text-gray-500 line-clamp-1">{person.character}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-zinc-900/80 p-8 rounded-2xl border border-white/5">
              <h4 className="text-xl font-bold mb-6 text-red-600">Movie Details</h4>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">Status</span>
                  <span>{movie.status}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">Runtime</span>
                  <span>{movie.runtime} mins</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">Budget</span>
                  <span>${movie.budget?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">Genres</span>
                  <span className="text-right">{movie.genres?.map(g => g.name).join(', ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-bold mb-10">Recommended For You</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {similar.map(item => (
              <div
                key={item.id}
                onClick={() => navigate(`/details/${type}/${item.id}`)}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-lg transition transform duration-300 group-hover:scale-105 group-hover:z-10 shadow-xl">
                  <img
                    src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                    className="w-full h-full object-cover"
                    alt={item.title || item.name}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play fill="white" size={40} />
                  </div>
                </div>
                <p className="mt-3 font-semibold text-sm line-clamp-1 group-hover:text-red-500">{item.title || item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- PLAYER PAGE ---
function PlayerPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [videoKey, setVideoKey] = useState(null);

  useEffect(() => {
    fetch(`${base}/${type}/${id}/videos?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        const trailer = data.results?.find(v => v.type === "Trailer" && v.site === "YouTube") || data.results?.[0];
        setVideoKey(trailer?.key);
      });
  }, [type, id]);

  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col">
      <div className="absolute top-0 w-full p-6 z-10 bg-gradient-to-b from-black to-transparent flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="text-white flex items-center gap-3 hover:text-red-600 transition group">
          <ChevronLeft size={44} className="group-hover:-translate-x-2 transition-transform" />
          <span className="font-black text-2xl tracking-tighter uppercase">Exit Player</span>
        </button>
        <div className="text-white/40 text-sm hidden md:block">Streaming in Ultra HD 4K</div>
      </div>

      <div className="flex-1 w-full bg-black">
        {videoKey ? (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&controls=1&modestbranding=1&iv_load_policy=3`}
            allow="autoplay; fullscreen; picture-in-picture"
            title="PrimeScene Player"
          ></iframe>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-white space-y-6">
            <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center">
              <X size={48} className="text-red-600" />
            </div>
            <h2 className="text-3xl font-bold">Preview Unavailable</h2>
            <p className="text-gray-400 max-w-md text-center">We couldn't find a video for this title. Please try another selection.</p>
            <button onClick={() => navigate(-1)} className="px-10 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-300">Return to Home</button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- SEARCH PAGE ---
function SearchPage() {
  const [results, setResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    if (!query) return;
    const fetchSearch = async () => {
      try {
        const res = await fetch(`${base}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) { console.error(err); }
    };
    const timer = setTimeout(() => { fetchSearch(); }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <ProtectedRoute>
      <div className="pt-28 pb-20 px-4 sm:px-12 bg-black min-h-screen">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white">Search results for: <span className="text-red-600 italic">"{query}"</span></h1>
          <p className="text-gray-500 mt-2">Found {results.length} titles matching your query</p>
        </div>

        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search size={80} className="text-gray-800 mb-6" />
            <p className="text-2xl text-gray-500 font-bold">No matches found.</p>
            <p className="text-gray-600 mt-2">Try different keywords or browse our categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {results.map(movie => movie.poster_path && (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={(m) => { setSelectedMovie(m); setModalOpen(true); }}
              />
            ))}
          </div>
        )}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          {selectedMovie && <MovieDetail movie={selectedMovie} />}
        </Modal>
      </div>
    </ProtectedRoute>
  );
}

// --- LANDING PAGE (FULL UNABRIDGED VERSION) ---
function Landing() {
  const { user } = useAuth();
  const [trending, setTrending] = useState([]);

  if (user) return <Navigate to="/home" replace />;

  useEffect(() => {
    fetch(`${base}/trending/all/week?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => setTrending(data.results?.slice(0, 10) || []));
  }, []);

  return (
    <div className="bg-black text-white font-sans">
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://files.catbox.moe/843del.png"
            alt="Cinematic Background"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70"></div>
        </div>

        <div className="relative z-10 max-w-5xl px-6">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-tight drop-shadow-2xl">
            THE STORIES YOU <br /><span className="text-red-600">LOVE</span> LIVE HERE.
          </h1>
          <p className="text-xl sm:text-3xl mb-12 text-white/90 font-light max-w-3xl mx-auto">
            Experience the best of Nollywood, Hollywood, and global cinema. <br />Unlimited access. Anywhere.
          </p>
          <Link
            to="/login"
            className="px-12 py-5 bg-red-600 text-white text-2xl font-black rounded-full hover:bg-red-700 transition transform hover:scale-110 shadow-[0_0_30px_rgba(220,38,38,0.5)]"
          >
            GET STARTED NOW
          </Link>
        </div>
      </div>

      {/* Trending Section */}
      <div className="py-24 px-8 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-black mb-12 flex items-center gap-4">
            <span className="w-2 h-10 bg-red-600 rounded-full"></span>
            TRENDING THIS WEEK
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-8">
            {trending.map((item, index) => (
              <div key={item.id} className="relative group cursor-pointer transition transform hover:-translate-y-2">
                <div className="absolute -top-4 -left-4 text-8xl font-black text-white/10 z-0 select-none group-hover:text-red-600/20 transition">
                  {index + 1}
                </div>
                <img
                  src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                  className="w-full rounded-2xl shadow-2xl relative z-10 border border-white/10"
                  alt="poster"
                />
                <div className="mt-4 relative z-10">
                  <p className="font-bold line-clamp-1">{item.title || item.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-8 bg-zinc-950 border-y border-white/5">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="text-5xl font-black mb-4">MORE REASONS TO JOIN</h2>
          <p className="text-gray-500 text-xl">We provide the best streaming experience for all your devices.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto">
          <div className="bg-zinc-900 p-10 rounded-3xl border border-white/5 hover:border-red-600/50 transition group">
            <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 transition">
              <Tv className="w-8 h-8 text-red-600 group-hover:text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Watch on TV</h3>
            <p className="text-gray-400">Smart TVs, PlayStation, Xbox, Chromecast, Apple TV, Blu-ray players and more.</p>
          </div>
          <div className="bg-zinc-900 p-10 rounded-3xl border border-white/5 hover:border-red-600/50 transition group">
            <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 transition">
              <Download className="w-8 h-8 text-red-600 group-hover:text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Offline Access</h3>
            <p className="text-gray-400">Save your titles easily and always have something to watch when you're on the go.</p>
          </div>
          <div className="bg-zinc-900 p-10 rounded-3xl border border-white/5 hover:border-red-600/50 transition group">
            <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 transition">
              <Globe className="w-8 h-8 text-red-600 group-hover:text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Watch Everywhere</h3>
            <p className="text-gray-400">Stream unlimited movies and TV shows on your phone, tablet, laptop, and TV.</p>
          </div>
          <div className="bg-zinc-900 p-10 rounded-3xl border border-white/5 hover:border-red-600/50 transition group">
            <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 transition">
              <Users className="w-8 h-8 text-red-600 group-hover:text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Profiles for Kids</h3>
            <p className="text-gray-400">Send kids on adventures with their favorite characters in a space made just for them.</p>
          </div>
        </div>
        </div>

{/* FAQ Section */}
<div className="py-24 px-8 bg-black">
  <h2 className="text-5xl font-black mb-16 text-center tracking-tighter uppercase">Frequently Asked Questions</h2>
  <div className="max-w-4xl mx-auto space-y-6">
    <details className="group bg-zinc-900 rounded-2xl border border-white/5 overflow-hidden transition-all duration-300">
      <summary className="flex items-center justify-between p-8 text-2xl font-bold cursor-pointer list-none hover:bg-zinc-800 transition">
        What is PrimeScene?
        <Plus className="group-open:rotate-45 transition-transform" />
      </summary>
      <div className="p-8 pt-0 text-xl text-gray-400 border-t border-white/5 leading-relaxed">
        PrimeScene is a premier streaming service designed for global audiences. We host a massive collection of Nollywood blockbusters, African originals, Hollywood hits, Anime, and more.
      </div>
    </details>
    <details className="group bg-zinc-900 rounded-2xl border border-white/5 overflow-hidden transition-all duration-300">
      <summary className="flex items-center justify-between p-8 text-2xl font-bold cursor-pointer list-none hover:bg-zinc-800 transition">
        How much does PrimeScene cost?
        <Plus className="group-open:rotate-45 transition-transform" />
      </summary>
      <div className="p-8 pt-0 text-xl text-gray-400 border-t border-white/5 leading-relaxed">
        Watch PrimeScene on your smartphone, tablet, Smart TV, laptop, or streaming device, all for one fixed monthly fee. Plans range from ₦1,200 to ₦4,400 a month. No extra costs, no contracts.
      </div>
    </details>
    <details className="group bg-zinc-900 rounded-2xl border border-white/5 overflow-hidden transition-all duration-300">
      <summary className="flex items-center justify-between p-8 text-2xl font-bold cursor-pointer list-none hover:bg-zinc-800 transition">
        Is it good for kids?
        <Plus className="group-open:rotate-45 transition-transform" />
      </summary>
      <div className="p-8 pt-0 text-xl text-gray-400 border-t border-white/5 leading-relaxed">
        Absolutely. The PrimeScene Kids experience is included in your membership to give parents control while kids enjoy family-friendly TV shows and movies in their own space.
      </div>
    </details>
  </div>
  <div className="text-center mt-20">
    <Link to="/login" className="px-12 py-5 bg-red-600 text-white text-2xl font-black rounded hover:bg-red-700 transition shadow-2xl">JOIN THE SCENE</Link>
  </div>
</div>

{/* Full Footer */}
<footer className="bg-black border-t border-zinc-800 py-24 px-8 text-zinc-500">
  <div className="max-w-6xl mx-auto">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
      <div className="space-y-4">
        <h4 className="text-white font-bold mb-6">Company</h4>
        <a href="#" className="block hover:underline text-sm">FAQ</a>
        <a href="#" className="block hover:underline text-sm">Investor Relations</a>
        <a href="#" className="block hover:underline text-sm">Privacy</a>
        <a href="#" className="block hover:underline text-sm">Speed Test</a>
      </div>
      <div className="space-y-4">
        <h4 className="text-white font-bold mb-6">Help</h4>
        <a href="#" className="block hover:underline text-sm">Help Center</a>
        <a href="#" className="block hover:underline text-sm">Jobs</a>
        <a href="#" className="block hover:underline text-sm">Cookie Preferences</a>
        <a href="#" className="block hover:underline text-sm">Legal Notices</a>
      </div>
      <div className="space-y-4">
        <h4 className="text-white font-bold mb-6">Account</h4>
        <a href="#" className="block hover:underline text-sm">Ways to Watch</a>
        <a href="#" className="block hover:underline text-sm">Terms of Use</a>
        <a href="#" className="block hover:underline text-sm">Contact Us</a>
        <a href="#" className="block hover:underline text-sm">PrimeScene Originals</a>
      </div>
      <div className="space-y-4">
        <h4 className="text-white font-bold mb-6">Social</h4>
        <a href="#" className="block hover:underline text-sm">Facebook</a>
        <a href="#" className="block hover:underline text-sm">Instagram</a>
        <a href="#" className="block hover:underline text-sm">Twitter (X)</a>
        <a href="#" className="block hover:underline text-sm">YouTube</a>
      </div>
    </div>
    <div className="border-t border-white/5 pt-12 text-center">
      <p className="text-lg mb-4">PrimeScene Nigeria / West Africa</p>
      <p className="text-xs uppercase tracking-widest font-black">
        Developed by <span className="text-red-600">QodecTech</span> &copy; 2025. All Rights Reserved.
      </p>
    </div>
  </div>
</footer>
</div>
);
}

function ProtectedRoute({ children }) {
const { user, loading } = useAuth();
if (loading) return (
<div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-red-600 mb-4"></div>
<p className="text-3xl font-black animate-pulse">PRIME SCENE</p>
</div>
);
return user ? children : <Navigate to="/" replace />;
}

// --- HOME PAGE (EXPANDED TO 20+ ROWS + DYNAMIC FILTERS) ---
function Home() {
const [selectedMovie, setSelectedMovie] = useState(null);
const [selectedGenre, setSelectedGenre] = useState("All");
const [modalOpen, setModalOpen] = useState(false);

// Modal Handlers
const openModal = (movie) => { setSelectedMovie(movie); setModalOpen(true); };
const closeModal = () => { setSelectedMovie(null); setModalOpen(false); };

// New states for Load More functionality
const [genreMovies, setGenreMovies] = useState([]);
const [page, setPage] = useState(1);
const [isLoading, setIsLoading] = useState(false);
const [hasMore, setHasMore] = useState(true);

const genreMap = {
"Horror": "27",
"Romantic": "10749",
"Action": "28",
"Comedy": "35",
"Sci-Fi": "878",
"Documentary": "99",
"Mystery": "9648",
"Crime": "80"
};

const fetchGenreData = async (pageNum, isNewGenre = false) => {
setIsLoading(true);
let url = "";

if (selectedGenre === "African") {
url = `${base}/discover/movie?api_key=${API_KEY}&with_original_language=en|ha|ig|yo&region=NG&page=${pageNum}`;
} else {
url = `${base}/discover/movie?api_key=${API_KEY}&with_genres=${genreMap[selectedGenre]}&page=${pageNum}`;
}

try {
const res = await fetch(url);
const data = await res.json();
setGenreMovies(prev => isNewGenre ? data.results : [...prev, ...data.results]);
setHasMore(data.page < data.total_pages);
} catch (err) {
console.error("Error fetching more movies:", err);
} finally {
setIsLoading(false);
}
};

// Trigger fetch on Genre Change
useEffect(() => {
if (selectedGenre !== "All") {
setPage(1);
fetchGenreData(1, true);
}
}, [selectedGenre]);

const loadMore = () => {
const nextPage = page + 1;
setPage(nextPage);
fetchGenreData(nextPage);
};

return (
<ProtectedRoute>
<div className="bg-black min-h-screen">
  <Banner onPlay={openModal} onInfo={openModal} />
  <GenreBar activeGenre={selectedGenre} onGenreSelect={setSelectedGenre} />

  <div className="pb-32 px-4 sm:px-6 lg:px-16 space-y-16">

    {/* SCENARIO 1: THE "ALL" DASHBOARD (20+ CATEGORIES) */}
    {selectedGenre === "All" && (
      <div className="mt-8">
        <Row title="African Cinema Highlights" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_original_language=en|fr|ha|ig|yo&region=NG|ZA|KE`} onCardClick={openModal} isLargeRow />
        <Row title="Trending Worldwide" fetchUrl={`${base}/trending/all/week?api_key=${API_KEY}`} onCardClick={openModal} />
        <Row title="Top Rated Masterpieces" fetchUrl={`${base}/movie/top_rated?api_key=${API_KEY}`} onCardClick={openModal} />
        <Row title="Horror: Creatures & Supernatural" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=27`} onCardClick={openModal} />
        <Row title="Romance: Heartfelt Stories" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=10749`} onCardClick={openModal} />
        <Row title="Action: High Octane" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=28`} onCardClick={openModal} />
        <Row title="Sci-Fi & Cyberpunk" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=878`} onCardClick={openModal} />
        <Row title="Currently Popular" fetchUrl={`${base}/movie/popular?api_key=${API_KEY}`} onCardClick={openModal} />
        <Row title="Laughter: Comedy Hits" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=35`} onCardClick={openModal} />
        <Row title="Mystery & Puzzles" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=9648`} onCardClick={openModal} />
        <Row title="Crime: Heists & Underworld" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=80`} onCardClick={openModal} />
        <Row title="Family Movie Night" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=10751`} onCardClick={openModal} />
        <Row title="Anime & Animation" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=16`} onCardClick={openModal} />
        <Row title="Global Documentaries" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=99`} onCardClick={openModal} />
        <Row title="War & Heroism" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=10752`} onCardClick={openModal} />
        <Row title="Fantasy & Magic" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=14`} onCardClick={openModal} />
        <Row title="Music & Stage" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=10402`} onCardClick={openModal} />
        <Row title="Now in Theaters" fetchUrl={`${base}/movie/now_playing?api_key=${API_KEY}`} onCardClick={openModal} />
        <Row title="Prime TV Series" fetchUrl={`${base}/tv/popular?api_key=${API_KEY}`} onCardClick={openModal} />
        <Row title="Deep Dramas" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=18`} onCardClick={openModal} />
        <Row title="Adventure & Exploration" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=12`} onCardClick={openModal} />
        <Row title="History: Past Untold" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=36`} onCardClick={openModal} />
      </div>
    )}

    {/* SCENARIO 2: AFRICAN CINEMA (DETAILED ROWS) */}
    {selectedGenre === "African" && (
      <div className="pt-10 space-y-16">
        <div className="border-l-8 border-red-600 pl-6 mb-12">
          <h1 className="text-5xl font-black tracking-tight">AFRICAN CINEMA</h1>
          <p className="text-gray-500 text-xl mt-2">Authentic stories from Nigeria, South Africa, and beyond.</p>
        </div>
        <Row title="Nollywood: Nigeria's Best" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_original_language=en|ha|ig|yo&region=NG`} onCardClick={openModal} isLargeRow />
        <Row title="South African Feature Films" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&region=ZA`} onCardClick={openModal} />
        <Row title="East African & Kenyan Scene" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&region=KE`} onCardClick={openModal} />
        <Row title="North African & Egyptian Cinema" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&region=EG`} onCardClick={openModal} />
        <Row title="Ghollywood Hits (Ghana)" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&region=GH`} onCardClick={openModal} />
      </div>
    )}

    {/* SCENARIO 3: HORROR COLLECTIONS */}
    {selectedGenre === "Horror" && (
      <div className="pt-10 space-y-16">
        <div className="border-l-8 border-red-600 pl-6 mb-12">
          <h1 className="text-5xl font-black tracking-tight">PURE HORROR</h1>
          <p className="text-gray-500 text-xl mt-2">Enter at your own risk. Slasher, Supernatural, and More.</p>
        </div>
        <Row title="Supernatural & Haunted" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=27&sort_by=popularity.desc`} onCardClick={openModal} isLargeRow />
        <Row title="Slasher & Gore" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=27&with_keywords=slasher`} onCardClick={openModal} />
        <Row title="Horror Comedy" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=27,35`} onCardClick={openModal} />
        <Row title="Sci-Fi Horror" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=27,878`} onCardClick={openModal} />
      </div>
    )}

    {/* SCENARIO 4: OTHER SPECIFIC GENRES + GRID WITH LOAD MORE */}
    {selectedGenre !== "All" && (
      <div className="pt-10 space-y-12">
        {selectedGenre !== "African" && selectedGenre !== "Horror" && (
          <div className="border-l-8 border-red-600 pl-6 mb-12">
            <h1 className="text-5xl font-black tracking-tight uppercase">{selectedGenre} COLLECTION</h1>
            <p className="text-gray-500 text-xl mt-2">The best of {selectedGenre} curated specifically for you.</p>
          </div>
        )}
        
        {/* The Dynamic Grid for Infinite Loading */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {genreMovies.map(movie => (
            <MovieCard key={`${movie.id}-${Math.random()}`} movie={movie} onClick={openModal} />
          ))}
        </div>

        {/* The Load More Button UI */}
        {hasMore && (
          <div className="flex justify-center pt-10">
            <button 
              onClick={loadMore}
              disabled={isLoading}
              className="px-16 py-4 bg-white text-black text-xl font-black rounded-full hover:bg-red-600 hover:text-white transition-all transform hover:scale-105 disabled:opacity-50"
            >
              {isLoading ? "LOADING MORE..." : "EXPLORE MORE TITLES"}
            </button>
          </div>
        )}
      </div>
    )}
  </div>

  <Modal isOpen={modalOpen} onClose={closeModal}>
    {selectedMovie && <MovieDetail movie={selectedMovie} />}
  </Modal>
</div>
</ProtectedRoute>
);
}

// --- MY LIST PAGE (FULL) ---
function MyListPage() {
const { myList } = useMyList();
const [selectedMovie, setSelectedMovie] = useState(null);
const [modalOpen, setModalOpen] = useState(false);
const openModal = (m) => { setSelectedMovie(m); setModalOpen(true); };

return (
<ProtectedRoute>
<div className="pt-32 pb-20 px-4 sm:px-16 min-h-screen bg-black">
  <h1 className="text-5xl font-black text-white mb-12 flex items-center gap-4">
    MY CINEMA LIST <span className="text-red-600 bg-red-600/10 px-4 py-1 rounded-full text-2xl">{myList.length}</span>
  </h1>
  {myList.length === 0 ? (
    <div className="text-center py-40 bg-zinc-900/50 rounded-3xl border border-white/5">
      <Plus size={80} className="mx-auto text-gray-700 mb-6" />
      <p className="text-3xl font-bold text-gray-500">Your list is currently empty.</p>
      <Link to="/home" className="mt-8 inline-block px-10 py-3 bg-red-600 rounded-full font-bold">Start Exploring</Link>
    </div>
  ) : (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
      {myList.map(movie => (<MovieCard key={movie.id} movie={movie} onClick={openModal} />))}
    </div>
  )}
  <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>{selectedMovie && <MovieDetail movie={selectedMovie} />}</Modal>
</div>
</ProtectedRoute>
);
}

// --- CATEGORY PAGE (FULL) ---
function CategoryPage({ title, rows }) {
const [selectedMovie, setSelectedMovie] = useState(null);
const [modalOpen, setModalOpen] = useState(false);
const openModal = (m) => { setSelectedMovie(m); setModalOpen(true); };

return (
<ProtectedRoute>
<div className="pt-32 pb-20 px-4 sm:px-16 min-h-screen bg-black">
  <h1 className="text-5xl font-black text-white mb-16 tracking-tighter uppercase">{title}</h1>
  <div className="space-y-20">
    {rows.map((row, index) => (
      <Row key={index} title={row.title} fetchUrl={row.fetchUrl} onCardClick={openModal} isLargeRow={index === 0} />
    ))}
  </div>
  <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>{selectedMovie && <MovieDetail movie={selectedMovie} />}</Modal>
</div>
</ProtectedRoute>
);
}

// --- MAIN APP ROUTING (FULL) ---
function App() {
return (
<div className="bg-black text-white min-h-screen selection:bg-red-600 selection:text-white">
<Navbar />
<Routes>
  <Route path="/watch/:type/:id" element={<PlayerPage />} />
  <Route path="/details/:type/:id" element={<MovieDetailPage />} />
  <Route path="/login" element={<Login />} />
  <Route path="/" element={<Landing />} />
  <Route path="/home" element={<Home />} />
  <Route path="/search" element={<SearchPage />} />

  {/* Category Routes */}
  <Route path="/tv-shows" element={
    <CategoryPage title="TV Series" rows={[
      { title: "Trending TV Shows", fetchUrl: `${base}/trending/tv/week?api_key=${API_KEY}` },
      { title: "Popular Global Hits", fetchUrl: `${base}/tv/popular?api_key=${API_KEY}` },
      { title: "Top Rated Classics", fetchUrl: `${base}/tv/top_rated?api_key=${API_KEY}` },
      { title: "Sci-Fi & Fantasy Series", fetchUrl: `${base}/discover/tv?api_key=${API_KEY}&with_genres=10765` }
    ]} />
  } />

  <Route path="/movies" element={
    <CategoryPage title="Feature Films" rows={[
      { title: "Now Playing In Nigeria", fetchUrl: `${base}/movie/now_playing?api_key=${API_KEY}&region=NG` },
      { title: "Most Popular Right Now", fetchUrl: `${base}/movie/popular?api_key=${API_KEY}` },
      { title: "Upcoming Blockbusters", fetchUrl: `${base}/movie/upcoming?api_key=${API_KEY}` },
      { title: "Historical Masterpieces", fetchUrl: `${base}/discover/movie?api_key=${API_KEY}&with_genres=36` }
    ]} />
  } />

  <Route path="/animation" element={
    <CategoryPage title="Animation & Anime" rows={[
      { title: "Must Watch Anime", fetchUrl: `${base}/discover/movie?api_key=${API_KEY}&with_genres=16&with_original_language=ja` },
      { title: "Family Animation", fetchUrl: `${base}/discover/movie?api_key=${API_KEY}&with_genres=16,10751` },
      { title: "Adult Animation", fetchUrl: `${base}/discover/movie?api_key=${API_KEY}&with_genres=16&certification_country=US&certification=R` }
    ]} />
  } />

  <Route path="/novels" element={
    <CategoryPage title="Novels & Dramas" rows={[
      { title: "Book-to-Movie Adaptations", fetchUrl: `${base}/discover/movie?api_key=${API_KEY}&with_keywords=818` },
      { title: "Heavy Dramas", fetchUrl: `${base}/discover/movie?api_key=${API_KEY}&with_genres=18` }
    ]} />
  } />

  <Route path="/most-watched" element={
    <CategoryPage title="All-Time Most Watched" rows={[
      { title: "Box Office Legends", fetchUrl: `${base}/discover/movie?api_key=${API_KEY}&sort_by=revenue.desc` },
      { title: "Trending This Month", fetchUrl: `${base}/trending/all/day?api_key=${API_KEY}` }
    ]} />
  } />

  <Route path="/my-list" element={<MyListPage />} />
</Routes>
</div>
);
}

export default App;