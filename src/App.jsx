import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useParams, useNavigate } from 'react-router-dom';
import { Tv, Download, Globe, Users, ChevronLeft } from 'lucide-react';
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

// --- NEW GENRE FILTER COMPONENT ---
function GenreBar() {
  const genres = [
    "All", "African", "Horror", "Romantic", "Action", "Comedy", "Sci-Fi", "Documentary", "Mystery", "Crime"
  ];

  return (
    <div className="flex gap-4 overflow-x-auto py-6 scrollbar-hide px-4 md:px-16 bg-black sticky top-16 z-40 border-b border-white/10">
      {genres.map((genre) => (
        <button
          key={genre}
          className="px-6 py-1.5 border border-white/30 rounded-full hover:bg-white hover:text-black transition text-sm font-semibold whitespace-nowrap"
        >
          {genre}
        </button>
      ))}
    </div>
  );
}

// --- NEW MOVIE DETAIL PAGE (NETFLIX STYLE) WITH CAST & SIMILAR ---
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
          <p className="text-lg text-gray-300 line-clamp-3 drop-shadow-lg">{movie.overview}</p>
        </div>
      </div>
      
      <div className="px-8 md:px-16 mt-10 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
             <h3 className="text-2xl font-bold mb-4">Description</h3>
             <p className="text-gray-400 text-lg leading-relaxed">{movie.overview}</p>
          </div>
          <div className="space-y-4 bg-gray-900/50 p-6 rounded-lg">
             <p><span className="text-gray-500">Rating:</span> <span className="text-green-500 font-bold">{movie.vote_average?.toFixed(1)}</span></p>
             <p><span className="text-gray-500">Release Date:</span> {movie.release_date || movie.first_air_date}</p>
             <p><span className="text-gray-500">Genres:</span> {movie.genres?.map(g => g.name).join(', ')}</p>
          </div>
        </div>

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
                  className="rounded-md w-full h-auto"
                  alt={item.title || item.name}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- NEW PLAYER PAGE (MOVIEBOX STYLE) ---
function PlayerPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [videoKey, setVideoKey] = useState(null);

  useEffect(() => {
    fetch(`${base}/${type}/${id}/videos?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        const trailer = data.results?.find(v => v.type === "Trailer") || data.results?.[0];
        setVideoKey(trailer?.key);
      });
  }, [type, id]);

  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col">
      <div className="absolute top-0 w-full p-6 z-10 bg-gradient-to-b from-black/90 to-transparent">
        <button onClick={() => navigate(-1)} className="text-white flex items-center gap-2 hover:text-red-600 transition group">
          <ChevronLeft size={40} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-lg">Exit Player</span>
        </button>
      </div>
      {videoKey ? (
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&showinfo=0&modestbranding=1`}
          allow="autoplay; fullscreen"
          title="Video Player"
        ></iframe>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-white space-y-4">
          <p className="text-2xl font-bold">Preview not available for this title.</p>
          <button onClick={() => navigate(-1)} className="px-6 py-2 bg-red-600 rounded">Go Back</button>
        </div>
      )}
    </div>
  );
}

// --- SEARCH PAGE COMPONENT ---
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
        const res = await fetch(
          `${base}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`
        );
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error(err);
      }
    };

    const timer = setTimeout(() => {
      fetchSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const openModal = (movie) => {
    setSelectedMovie(movie);
    setModalOpen(true);
  };

  return (
    <ProtectedRoute>
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-12 bg-black min-h-screen">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">
          Results for: <span className="text-red-600">"{query}"</span>
        </h1>

        {results.length === 0 ? (
          <div className="text-white/60 text-lg">No results found for your search.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {results.map(movie => (
              movie.poster_path && (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={openModal}
                />
              )
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

// Netflix-Style Landing Page
function Landing() {
  const { user } = useAuth();
  const [trending, setTrending] = useState([]);

  if (user) {
    return <Navigate to="/home" replace />;
  }

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(`${base}/trending/all/week?api_key=${API_KEY}`);
        const data = await res.json();
        setTrending(data.results?.slice(0, 10) || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div className="bg-black text-white">
      <div className="relative min-h-screen flex flex-col justify-center items-center text-center px-4">
        <div className="absolute inset-0">
          <img
            src="https://files.catbox.moe/843del.png"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Unlimited movies, TV shows, and more
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-6 text-white/90">
            Watch anywhere. Cancel anytime.
          </p>
          <p className="text-base sm:text-lg md:text-xl mb-10 text-white/80 max-w-2xl">
            Ready to watch? Sign in to access your personal cinema.
          </p>

          <Link
            to="/login"
            className="inline-block px-8 py-4 bg-red-600 text-white text-lg sm:text-xl font-bold rounded hover:bg-red-700 transition"
          >
            Sign In to Start Watching
          </Link>
        </div>
      </div>

      <div className="py-16 px-8 bg-black border-t border-gray-800">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">Trending Now</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {trending.map((item, index) => (
            <div key={item.id} className="relative group">
              <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-white z-10 drop-shadow-2xl">
                {index + 1}
              </div>
              <img
                src={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : 'https://via.placeholder.com/342x513?text=No+Image'}
                alt={item.title || item.name}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="py-16 px-8 bg-black border-t border-gray-800">
        <h2 className="text-2xl sm:text-3xl font-bold mb-12 text-center">More Reasons to Join</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-2xl">
              <Tv className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-3">Enjoy on your TV</h3>
            <p className="text-white/80 text-sm">Watch on smart TVs, PlayStation, Xbox, Chromecast, Apple TV, Blu-ray players and more.</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl flex items-center justify-center shadow-2xl">
              <Download className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-3">Download your shows to watch offline</h3>
            <p className="text-white/80 text-sm">Save your favorites easily and always have something to watch.</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-2xl">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-3">Watch everywhere</h3>
            <p className="text-white/80 text-sm">Stream unlimited movies and TV shows on your phone, tablet, laptop, and TV.</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-3">Create profiles for kids</h3>
            <p className="text-white/80 text-sm">Send kids on adventures with their favorite characters in a space made just for them.</p>
          </div>
        </div>
      </div>

      <div className="py-16 px-8 bg-black border-t border-gray-800">
        <h2 className="text-2xl sm:text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
        <div className="max-w-4xl mx-auto space-y-4">
          <details className="bg-gray-900 rounded-lg p-6 cursor-pointer hover:bg-gray-800 transition">
            <summary className="text-lg font-bold text-white">What is PrimeScene?</summary>
            <p className="mt-4 text-white/80 leading-relaxed">
              PrimeScene is a streaming service that offers a wide variety of award-winning TV shows, movies, anime, documentaries, and more on thousands of internet-connected devices. You can watch as much as you want, whenever you want without a single commercial — all for one low monthly price.
            </p>
          </details>
          <details className="bg-gray-900 rounded-lg p-6 cursor-pointer hover:bg-gray-800 transition">
            <summary className="text-lg font-bold text-white">How much does PrimeScene cost?</summary>
            <p className="mt-4 text-white/80 leading-relaxed">
              Watch PrimeScene on all your devices for one low monthly price. Plans are flexible and you can cancel anytime with no contracts or hidden fees.
            </p>
          </details>
          <details className="bg-gray-900 rounded-lg p-6 cursor-pointer hover:bg-gray-800 transition">
            <summary className="text-lg font-bold text-white">Where can I watch?</summary>
            <p className="mt-4 text-white/80 leading-relaxed">
              Watch anywhere, anytime. Sign in with your PrimeScene account to watch instantly on the web at primescene.com from your personal computer or on any internet-connected device that offers the PrimeScene app.
            </p>
          </details>
          <details className="bg-gray-900 rounded-lg p-6 cursor-pointer hover:bg-gray-800 transition">
            <summary className="text-lg font-bold text-white">How do I cancel?</summary>
            <p className="mt-4 text-white/80 leading-relaxed">
              PrimeScene is flexible. There are no pesky contracts and no commitments. You can easily cancel your account online with just two clicks. There are no cancellation fees – start or stop your account anytime.
            </p>
          </details>
          <details className="bg-gray-900 rounded-lg p-6 cursor-pointer hover:bg-gray-800 transition">
            <summary className="text-lg font-bold text-white">What can I watch on PrimeScene?</summary>
            <p className="mt-4 text-white/80 leading-relaxed">
              PrimeScene has an extensive library of feature films, documentaries, TV shows, anime, award-winning PrimeScene originals, and more. Watch as much as you want, anytime you want.
            </p>
          </details>
          <details className="bg-gray-900 rounded-lg p-6 cursor-pointer hover:bg-gray-800 transition">
            <summary className="text-lg font-bold text-white">Is PrimeScene good for kids?</summary>
            <p className="mt-4 text-white/80 leading-relaxed">
              The PrimeScene Kids experience is included in your membership to give parents control while kids enjoy family-friendly TV shows and movies in their own space.
            </p>
          </details>
        </div>

        <div className="text-center mt-12">
          <Link
            to="/login"
            className="inline-block px-8 py-4 bg-red-600 text-white text-lg font-bold rounded hover:bg-red-700 transition"
          >
            Sign In to Start Watching
          </Link>
        </div>
      </div>

      <footer className="bg-black border-t border-gray-800 py-12 px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-white/60 mb-8">Questions? Contact us.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
            <div>
              <a href="#" className="block text-white/70 hover:underline mb-4 text-sm font-light">FAQ</a>
              <a href="#" className="block text-white/70 hover:underline mb-4 text-sm font-light">Investor Relations</a>
              <a href="#" className="block text-white/70 hover:underline mb-4 text-sm font-light">Privacy</a>
              <a href="#" className="block text-white/70 hover:underline text-sm font-light">Speed Test</a>
            </div>
            <div>
              <a href="#" className="block text-white/70 hover:underline mb-4 text-sm font-light">Help Center</a>
              <a href="#" className="block text-white/70 hover:underline mb-4 text-sm font-light">Jobs</a>
              <a href="#" className="block text-white/70 hover:underline mb-4 text-sm font-light">Cookie Preferences</a>
              <a href="#" className="block text-white/70 hover:underline text-sm font-light">Legal Notices</a>
            </div>
            <div>
              <a href="#" className="block text-white/70 hover:underline mb-4 text-sm font-light">Account</a>
              <a href="#" className="block text-white/70 hover:underline mb-4 text-sm font-light">Ways to Watch</a>
              <a href="#" className="block text-white/70 hover:underline mb-4 text-sm font-light">Corporate Information</a>
              <a href="#" className="block text-white/70 hover:underline text-sm font-light">Only on PrimeScene</a>
            </div>
            <div>
              <a href="#" className="block text-white/70 hover:underline mb-4 text-sm font-light">Media Center</a>
              <a href="#" className="block text-white/70 hover:underline mb-4 text-sm font-light">Terms of Use</a>
              <a href="#" className="block text-white/70 hover:underline text-sm font-light">Contact Us</a>
            </div>
          </div>
          <p className="text-white/60 text-center text-sm">
            Developed by <span className="text-red-600 font-bold">QodecTech</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center text-3xl font-bold">Loading...</div>;
  return user ? children : <Navigate to="/" replace />;
}

// Home Page
function Home() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = (movie) => { setSelectedMovie(movie); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setSelectedMovie(null); };

  return (
    <ProtectedRoute>
      <div>
        <Banner onPlay={openModal} onInfo={openModal} />
        <GenreBar />
        <div className="pb-20 px-4 sm:px-6 lg:px-12 space-y-12">
          {/* African Section */}
          <Row title="African Cinema" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_original_language=en|fr|ha|ig|yo&region=NG|ZA|KE`} onCardClick={openModal} />
          
          <Row title="Trending Now" fetchUrl={`${base}/trending/all/week?api_key=${API_KEY}`} onCardClick={openModal} />
          
          {/* Horror Section */}
          <Row title="Horror Movies" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=27`} onCardClick={openModal} />
          
          {/* Romantic Section */}
          <Row title="Romantic Movies" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=10749`} onCardClick={openModal} />
          
          <Row title="Action Packed" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=28`} onCardClick={openModal} />
          <Row title="Science Fiction" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=878`} onCardClick={openModal} />
          <Row title="Popular Movies" fetchUrl={`${base}/movie/popular?api_key=${API_KEY}`} onCardClick={openModal} />
          <Row title="Top Rated" fetchUrl={`${base}/movie/top_rated?api_key=${API_KEY}`} onCardClick={openModal} />
          
          {/* Comedy Section */}
          <Row title="Comedy Movies" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=35`} onCardClick={openModal} />
          
          <Row title="Mystery & Thriller" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=9648`} onCardClick={openModal} />
          <Row title="Crime Stories" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=80`} onCardClick={openModal} />
          <Row title="Family Favorites" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=10751`} onCardClick={openModal} />
          <Row title="Animated Hits" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=16`} onCardClick={openModal} />
          <Row title="Documentaries" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=99`} onCardClick={openModal} />
          <Row title="War & History" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=10752`} onCardClick={openModal} />
          <Row title="Fantasy Worlds" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=14`} onCardClick={openModal} />
          <Row title="Music & Musicals" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=10402`} onCardClick={openModal} />
          <Row title="Now Playing" fetchUrl={`${base}/movie/now_playing?api_key=${API_KEY}`} onCardClick={openModal} />
          <Row title="Popular TV Shows" fetchUrl={`${base}/tv/popular?api_key=${API_KEY}`} onCardClick={openModal} />
          <Row title="Drama Series" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=18`} onCardClick={openModal} />
        </div>
        <Modal isOpen={modalOpen} onClose={closeModal}>
          {selectedMovie && <MovieDetail movie={selectedMovie} />}
        </Modal>
      </div>
    </ProtectedRoute>
  );
}

// My List Page
function MyListPage() {
  const { myList } = useMyList();
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = (movie) => { setSelectedMovie(movie); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setSelectedMovie(null); };

  return (
    <ProtectedRoute>
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8">My List ({myList.length})</h1>
        {myList.length === 0 ? (
          <div className="text-center text-white/70 py-20"><p className="text-2xl">Your list is empty</p></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {myList.map(movie => (<MovieCard key={movie.id} movie={movie} onClick={openModal} />))}
          </div>
        )}
        <Modal isOpen={modalOpen} onClose={closeModal}>{selectedMovie && <MovieDetail movie={selectedMovie} />}</Modal>
      </div>
    </ProtectedRoute>
  );
}

// Category Page
function CategoryPage({ title, rows }) {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = (movie) => { setSelectedMovie(movie); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setSelectedMovie(null); };

  return (
    <ProtectedRoute>
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-12">
        <h1 className="text-4xl font-bold text-white mb-12">{title}</h1>
        <div className="space-y-12">
          {rows.map((row, index) => (
            <Row key={index} title={row.title} fetchUrl={row.fetchUrl} onCardClick={openModal} />
          ))}
        </div>
        <Modal isOpen={modalOpen} onClose={closeModal}>{selectedMovie && <MovieDetail movie={selectedMovie} />}</Modal>
      </div>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/watch/:type/:id" element={<PlayerPage />} />
        <Route path="/details/:type/:id" element={<MovieDetailPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/tv-shows" element={<CategoryPage title="TV Shows" rows={[{ title: "Popular", fetchUrl: `${base}/tv/popular?api_key=${API_KEY}` },{ title: "Top Rated", fetchUrl: `${base}/tv/top_rated?api_key=${API_KEY}` }]} />} />
        <Route path="/movies" element={<CategoryPage title="Movies" rows={[{ title: "Popular", fetchUrl: `${base}/movie/popular?api_key=${API_KEY}` },{ title: "Upcoming", fetchUrl: `${base}/movie/upcoming?api_key=${API_KEY}` }]} />} />
        <Route path="/animation" element={<CategoryPage title="Animation" rows={[{ title: "Anime", fetchUrl: `${base}/discover/movie?api_key=${API_KEY}&with_genres=16` }]} />} />
        <Route path="/novels" element={<CategoryPage title="Novels" rows={[{ title: "Drama", fetchUrl: `${base}/discover/movie?api_key=${API_KEY}&with_genres=18` }]} />} />
        <Route path="/most-watched" element={<CategoryPage title="Most Watched" rows={[{ title: "Trending", fetchUrl: `${base}/trending/all/week?api_key=${API_KEY}` }]} />} />
        <Route path="/my-list" element={<MyListPage />} />
      </Routes>
    </div>
  );
}

export default App;