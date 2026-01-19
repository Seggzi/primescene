// src/App.jsx

import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useParams, useNavigate } from 'react-router-dom';
import { Tv, Download, Globe, Users, ChevronLeft, Play, Plus, Check, Search, X } from 'lucide-react';

import Navbar from './components/Navbar';
import Banner from './components/Banner';
import Row from './components/Row';
import Modal from './components/Modal';
import MovieDetail from './components/MovieDetail';
import MovieCard from './components/MovieCard';

import { useAuth } from './context/AuthContext';
import { useMyList } from './context/MyListContext';

import Login from './pages/Login';
import ManageProfile from './pages/ManageProfile';
import AccountSettings from './pages/AccountSettings';
import HelpCenter from './pages/HelpCenter';
import MovieDetailPage from './pages/MovieDetailPage';
import PlayerPage from './pages/PlayerPage';
import Notifications from './pages/Notifications';

import { supabase } from './supabase';


const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const base = 'https://api.themoviedb.org/3';

// --- GENRE BAR COMPONENT ---
function GenreBar({ activeGenre, onGenreSelect }) {
  const genres = [
    "All", "African", "Horror", "Romantic", "Action", "Comedy", "Sci-Fi", "Documentary", "Mystery", "Crime"
  ];

  return (
    <div className="flex gap-4 overflow-x-auto py-6 scrollbar-hide px-4 md:px-16 bg-black 
                   md:sticky md:top-16 md:z-40 border-b border-white/10">
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
            <p className="text-gray-600 mt-4">Try different keywords or browse our categories.</p>
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

// --- LANDING PAGE ---
function Landing() {
  const [trending, setTrending] = useState([]);

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
          <p className="text-base sm:text-lg md:text-xl mb-10 text-align:center text-white/80 max-w-2xl">
            Ready to watch? Sign Up to access your personal cinema.
          </p>

          <Link
            to="/login"
            className="inline-block px-8 py-4 bg-red-600 text-white text-lg sm:text-xl font-bold rounded hover:bg-red-700 transition"
          >
            Sign Up to Start Watching
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
            <summary className="text-lg font-bold">What is PrimeScene?</summary>
            <p className="mt-4 text-white/80 leading-relaxed">
              PrimeScene is a streaming service that offers a wide variety of award-winning TV shows, movies, anime, documentaries, and more on thousands of internet-connected devices. You can watch as much as you want, whenever you want without a single commercial — all for one low monthly price.
            </p>
          </details>
          <details className="bg-gray-900 rounded-lg p-6 cursor-pointer hover:bg-gray-800 transition">
            <summary className="text-lg font-bold">How much does PrimeScene cost?</summary>
            <p className="mt-4 text-white/80 leading-relaxed">
              Watch PrimeScene on all your devices for one low monthly price. Plans are flexible and you can cancel anytime with no contracts or hidden fees.
            </p>
          </details>
          <details className="bg-gray-900 rounded-lg p-6 cursor-pointer hover:bg-gray-800 transition">
            <summary className="text-lg font-bold">Where can I watch?</summary>
            <p className="mt-4 text-white/80 leading-relaxed">
              Watch anywhere, anytime. Sign Up with your PrimeScene account to watch instantly on the web at primescene.com from your personal computer or on any internet-connected device that offers the PrimeScene app, including smart TVs, smartphones, tablets, streaming media players and game consoles.
            </p>
          </details>
          <details className="bg-gray-900 rounded-lg p-6 cursor-pointer hover:bg-gray-800 transition">
            <summary className="text-lg font-bold">How do I cancel?</summary>
            <p className="mt-4 text-white/80 leading-relaxed">
              PrimeScene is flexible. There are no pesky contracts and no commitments. You can easily cancel your account online with just two clicks. There are no cancellation fees – start or stop your account anytime.
            </p>
          </details>
          <details className="bg-gray-900 rounded-lg p-6 cursor-pointer hover:bg-gray-800 transition">
            <summary className="text-lg font-bold">What can I watch on PrimeScene?</summary>
            <p className="mt-4 text-white/80 leading-relaxed">
              PrimeScene has an extensive library of feature films, documentaries, TV shows, anime, award-winning PrimeScene originals, and more. Watch as much as you want, anytime you want.
            </p>
          </details>
          <details className="bg-gray-900 rounded-lg p-6 cursor-pointer hover:bg-gray-800 transition">
            <summary className="text-lg font-bold">Is PrimeScene good for kids?</summary>
            <p className="mt-4 text-white/80 leading-relaxed">
              The PrimeScene Kids experience is included in your membership to give parents control while kids enjoy family-friendly TV shows and movies in their own space. Kids profiles come with PIN-protected parental controls that let you restrict the maturity rating of content kids can watch and block specific titles you don’t want them to see.
            </p>
          </details>
        </div>

        <div className="text-center mt-12">
          <Link
            to="/login"
            className="inline-block px-8 py-4 bg-red-600 text-white text-lg font-bold rounded hover:bg-red-700 transition"
          >
            Sign Up to Start Watching
          </Link>
        </div>
      </div>

      <footer className="bg-black border-t border-gray-800 py-12 px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-white/60 mb-8">Questions? Contact us.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
            <div>
              <a href="#" className="block text-white/70 hover:underline mb-4 text-sm">FAQ</a>
              <a href="#" className="block text-white/70 hover:underline mb-4 text-sm">Investor Relations</a>
              <a href="#" className="block text-white/70 hover:underline mb-4 text-sm">Privacy</a>
              <a href="#" className="block text-white/70 hover:underline text-sm">Speed Test</a>
            </div>
            <div>
              <a href="#" className="block text-white/70 hover:underline mb-4 text-sm">Help Center</a>
              <a href="#" className="block text-white/70 hover:underline mb-4 text-sm">Jobs</a>
              <a href="#" className="block text-white/70 hover:underline mb-4 text-sm">Cookie Preferences</a>
              <a href="#" className="block text-white/70 hover:underline text-sm">Legal Notices</a>
            </div>
            <div>
              <a href="#" className="block text-white/70 hover:underline mb-4 text-sm">Account</a>
              <a href="#" className="block text-white/70 hover:underline mb-4 text-sm">Ways to Watch</a>
              <a href="#" className="block text-white/70 hover:underline mb-4 text-sm">Corporate Information</a>
              <a href="#" className="block text-white/70 hover:underline text-sm">Only on PrimeScene</a>
            </div>
            <div>
              <a href="#" className="block text-white/70 hover:underline mb-4 text-sm">Media Center</a>
              <a href="#" className="block text-white/70 hover:underline mb-4 text-sm">Terms of Use</a>
              <a href="#" className="block text-white/70 hover:underline text-sm">Contact Us</a>
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

// Improved ProtectedRoute
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-2xl">Loading...</p>
      </div>
    );
  }

  // If not logged in and not on public pages → go to login
  if (!user && !['/', '/login'].includes(location.pathname)) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If logged in and on login or root → go to home
  if (user && ['/', '/login'].includes(location.pathname)) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

// --- HOME PAGE ---
function Home() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [genreMovies, setGenreMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { myList } = useMyList();

  const openModal = (movie) => {
    setSelectedMovie(movie);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMovie(null);
  };

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
    let url;

    if (selectedGenre === "African") {
      url = `${base}/discover/movie?api_key=${API_KEY}&with_origin_country=NG|ZA|GH|KE|EG&page=${pageNum}`;
    } else {
      url = `${base}/discover/movie?api_key=${API_KEY}&with_genres=${genreMap[selectedGenre]}&page=${pageNum}`;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      setGenreMovies(prev => isNewGenre ? data.results : [...prev, ...data.results]);
      setHasMore(data.page < data.total_pages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

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
      <div>
        <Banner onPlay={openModal} onInfo={openModal} />

        <GenreBar activeGenre={selectedGenre} onGenreSelect={setSelectedGenre} />

        <div className="pb-20 px-4 sm:px-6 lg:px-12 space-y-12 mt-4 relative z-10">
          {selectedGenre === "All" && (
            <>
              <Row
                title="Top 10 Movies This Week"
                fetchUrl={`${base}/discover/tv?api_key=${API_KEY}&with_networks=213`}
                onCardClick={openModal}
                isNumbered={true}
              />

              <Row
                title="Top 10 TV Shows This Week"
                fetchUrl={`${base}/trending/tv/week?api_key=${API_KEY}`}
                onCardClick={openModal}
                isNumbered={true}
              />
              <Row
                title="Streaming on Netflix"
                fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_watch_providers=8&watch_region=NG&sort_by=popularity.desc`}
                onCardClick={openModal}
              />
              {myList.length > 0 && (
                <Row title="Continue Watching" isMyList={true} movies={myList} onCardClick={openModal} />
              )}
              <Row title="Trending Now" fetchUrl={`${base}/trending/all/week?api_key=${API_KEY}`} onCardClick={openModal} />
              <Row title="Top 10 Movies This Week" fetchUrl={`${base}/trending/movie/week?api_key=${API_KEY}`} onCardClick={openModal} />
              <Row title="Top 10 TV Shows This Week" fetchUrl={`${base}/trending/tv/week?api_key=${API_KEY}`} onCardClick={openModal} />
              <Row title="Popular on PrimeScene" fetchUrl={`${base}/movie/popular?api_key=${API_KEY}`} onCardClick={openModal} />
              <Row title="Yoruba Movies" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_original_language=yo&sort_by=popularity.desc`} onCardClick={openModal} />
              <Row title="Nollywood Classics" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_keywords=284361&sort_by=vote_average.desc&vote_count.gte=10`} onCardClick={openModal} />
              <Row title="New Releases" fetchUrl={`${base}/movie/now_playing?api_key=${API_KEY}`} onCardClick={openModal} />
              <Row title="Coming Soon" fetchUrl={`${base}/movie/upcoming?api_key=${API_KEY}`} onCardClick={openModal} />
              <Row title="Critically Acclaimed Movies" fetchUrl={`${base}/movie/top_rated?api_key=${API_KEY}`} onCardClick={openModal} />
              <Row title="Blockbuster Action" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=28&sort_by=popularity.desc`} onCardClick={openModal} />
              <Row title="Sci-Fi & Fantasy" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=878,14`} onCardClick={openModal} />
              <Row title="Heartfelt Dramas" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=18&sort_by=vote_average.desc&vote_count.gte=100`} onCardClick={openModal} />
              <Row title="Romantic Movies" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=10749`} onCardClick={openModal} />
              <Row title="Comedy Movies" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=35`} onCardClick={openModal} />
              <Row title="Horror Movies" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=27`} onCardClick={openModal} />
              <Row title="Edge-of-Your-Seat Thrillers" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=53`} onCardClick={openModal} />
              <Row title="Documentaries" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=99`} onCardClick={openModal} />
              <Row title="Animated Movies" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=16`} onCardClick={openModal} />
              <Row title="Family Movies" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=10751`} onCardClick={openModal} />
              <Row title="Trending in Nollywood" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_keywords=284361&sort_by=popularity.desc`} onCardClick={openModal} />
              <Row title="Hollywood Hits" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_origin_country=US&sort_by=popularity.desc&vote_count.gte=300`} onCardClick={openModal} />
              <Row title="African Cinema" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_origin_country=NG|ZA|GH|KE|EG&sort_by=popularity.desc`} onCardClick={openModal} />
              <Row title="Binge-Worthy TV Shows" fetchUrl={`${base}/tv/popular?api_key=${API_KEY}`} onCardClick={openModal} />
              <Row title="Critically Acclaimed TV" fetchUrl={`${base}/tv/top_rated?api_key=${API_KEY}`} onCardClick={openModal} />
              <Row title="TV Dramas" fetchUrl={`${base}/discover/tv?api_key=${API_KEY}&with_genres=18`} onCardClick={openModal} />
              <Row title="Reality TV" fetchUrl={`${base}/discover/tv?api_key=${API_KEY}&with_genres=10764`} onCardClick={openModal} />
              <Row title="Anime Series" fetchUrl={`${base}/discover/tv?api_key=${API_KEY}&with_genres=16&with_original_language=ja`} onCardClick={openModal} />
              <Row title="Kids TV Shows" fetchUrl={`${base}/discover/tv?api_key=${API_KEY}&with_genres=10762`} onCardClick={openModal} />
              <Row title="Crime TV Shows" fetchUrl={`${base}/discover/tv?api_key=${API_KEY}&with_genres=80`} onCardClick={openModal} />
              <Row title="Comedy TV Shows" fetchUrl={`${base}/discover/tv?api_key=${API_KEY}&with_genres=35`} onCardClick={openModal} />
              <Row title="Award-Winning Movies" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&sort_by=vote_average.desc&vote_count.gte=1000`} onCardClick={openModal} />
            </>
          )}

          {selectedGenre === "African" && (
            <div className="pt-10 space-y-16">
              <div className="border-l-8 border-red-600 pl-6 mb-12">
                <h1 className="text-5xl font-black tracking-tight">AFRICAN CINEMA</h1>
                <p className="text-gray-500 text-xl mt-2">Authentic stories from Nigeria, South Africa, Ghana, Kenya, and beyond.</p>
              </div>
              <Row title="Yoruba Movies" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_original_language=yo&sort_by=popularity.desc`} onCardClick={openModal} />
              <Row title="Trending in Nollywood 🔥" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_keywords=284361&sort_by=popularity.desc`} onCardClick={openModal} />
              <Row title="Nollywood Classics" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_keywords=284361&sort_by=vote_average.desc&vote_count.gte=10`} onCardClick={openModal} />
              <Row title="South African Hits 🇿🇦" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_origin_country=ZA`} onCardClick={openModal} />
              <Row title="Ghanaian Cinema 🇬🇭" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_origin_country=GH`} onCardClick={openModal} />
              <Row title="East African Stories" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_origin_country=KE`} onCardClick={openModal} />
            </div>
          )}

          {selectedGenre === "Horror" && (
            <div className="pt-10 space-y-16">
              <div className="border-l-8 border-red-600 pl-6 mb-12">
                <h1 className="text-5xl font-black tracking-tight">PURE HORROR</h1>
                <p className="text-gray-500 text-xl mt-2">Slasher, supernatural, psychological — enter if you dare.</p>
              </div>
              <Row title="Supernatural Horror" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=27&with_keywords=ghost|demon|haunted`} onCardClick={openModal} isLargeRow />
              <Row title="Slasher & Gore" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=27&with_keywords=slasher|gore`} onCardClick={openModal} />
              <Row title="Horror Comedy" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_genres=27,35`} onCardClick={openModal} />
              <Row title="Found Footage" fetchUrl={`${base}/discover/movie?api_key=${API_KEY}&with_keywords=found+footage`} onCardClick={openModal} />
            </div>
          )}

          {selectedGenre !== "All" && selectedGenre !== "African" && selectedGenre !== "Horror" && (
            <div className="pt-10 space-y-12">
              <div className="border-l-8 border-red-600 pl-6 mb-12">
                <h1 className="text-5xl font-black tracking-tight uppercase">{selectedGenre.toUpperCase()}</h1>
                <p className="text-gray-500 text-xl mt-2">The best {selectedGenre} titles hand-picked for you.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
                {genreMovies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} onClick={openModal} />
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center pt-10">
                  <button
                    onClick={loadMore}
                    disabled={isLoading}
                    className="px-16 py-4 bg-white text-black text-xl font-black rounded-full hover:bg-red-600 hover:text-white transition-all transform hover:scale-105 disabled:opacity-50"
                  >
                    {isLoading ? "LOADING..." : "LOAD MORE"}
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

// --- MY LIST PAGE ---
function MyListPage() {
  const { myList } = useMyList();
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (movie) => {
    setSelectedMovie(movie);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMovie(null);
  };

  return (
    <ProtectedRoute>
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8 md:mb-12">
          My List ({myList.length})
        </h1>

        {myList.length === 0 ? (
          <div className="text-center text-white/70 py-20">
            <p className="text-2xl">Your list is empty</p>
            <p className="text-lg mt-4">Add movies by clicking the + button!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
            {myList.map(movie => (
              <MovieCard key={movie.id} movie={movie} onClick={openModal} />
            ))}
          </div>
        )}

        <Modal isOpen={modalOpen} onClose={closeModal}>
          {selectedMovie && <MovieDetail movie={selectedMovie} />}
        </Modal>
      </div>
    </ProtectedRoute>
  );
}

// --- CATEGORY PAGE ---
function CategoryPage({ title, rows }) {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (movie) => {
    setSelectedMovie(movie);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMovie(null);
  };

  return (
    <ProtectedRoute>
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-12">
          {title}
        </h1>

        <div className="space-y-12">
          {rows.map((row, index) => (
            <Row
              key={index}
              title={row.title}
              fetchUrl={row.fetchUrl}
              onCardClick={openModal}
            />
          ))}
        </div>

        <Modal isOpen={modalOpen} onClose={closeModal}>
          {selectedMovie && <MovieDetail movie={selectedMovie} />}
        </Modal>
      </div>
    </ProtectedRoute>
  );
}

// --- APP COMPONENT ---
function App() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={user ? <Home /> : <Landing />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        
        {/* NEW DETAIL ROUTES - both formats supported */}
        <Route path="/details/:type/:id" element={<ProtectedRoute><MovieDetailPage /></ProtectedRoute>} />
        <Route path="/movie/:id" element={<ProtectedRoute><MovieDetailPage /></ProtectedRoute>} />
        <Route path="/tv/:id" element={<ProtectedRoute><MovieDetailPage /></ProtectedRoute>} />

        <Route path="/watch/:type/:id" element={<ProtectedRoute><PlayerPage /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/my-list" element={<ProtectedRoute><MyListPage /></ProtectedRoute>} />
        <Route path="/manage-profile" element={<ProtectedRoute><ManageProfile /></ProtectedRoute>} />
        <Route path="/account-settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/notifications" element={<Notifications />} />
        
        {/* Category routes - all protected */}
        <Route path="/tv-shows" element={<ProtectedRoute><CategoryPage
          title="TV Shows"
          rows={[
            { title: "Popular TV Shows", fetchUrl: `${base}/tv/popular?api_key=${API_KEY}` },
            { title: "Top Rated TV Shows", fetchUrl: `${base}/tv/top_rated?api_key=${API_KEY}` },
            { title: "Airing Today", fetchUrl: `${base}/tv/airing_today?api_key=${API_KEY}` },
            { title: "On The Air", fetchUrl: `${base}/tv/on_the_air?api_key=${API_KEY}` },
          ]}
        /></ProtectedRoute>} />
        <Route path="/movies" element={<ProtectedRoute><CategoryPage
          title="Movies"
          rows={[
            { title: "Popular Movies", fetchUrl: `${base}/movie/popular?api_key=${API_KEY}` },
            { title: "Top Rated Movies", fetchUrl: `${base}/movie/top_rated?api_key=${API_KEY}` },
            { title: "Now Playing", fetchUrl: `${base}/movie/now_playing?api_key=${API_KEY}` },
            { title: "Upcoming Movies", fetchUrl: `${base}/movie/upcoming?api_key=${API_KEY}` },
          ]}
        /></ProtectedRoute>} />
        <Route path="/animation" element={<ProtectedRoute><CategoryPage
          title="Animation"
          rows={[
            { title: "Animated Movies", fetchUrl: `${base}/discover/movie?api_key=${API_KEY}&with_genres=16` },
            { title: "Family Movies", fetchUrl: `${base}/discover/movie?api_key=${API_KEY}&with_genres=10751` },
            { title: "Animated TV Shows", fetchUrl: `${base}/discover/tv?api_key=${API_KEY}&with_genres=16` },
          ]}
        /></ProtectedRoute>} />
        <Route path="/novels" element={<ProtectedRoute><CategoryPage
          title="Novels"
          rows={[
            { title: "Drama Movies", fetchUrl: `${base}/discover/movie?api_key=${API_KEY}&with_genres=18` },
            { title: "Romance Movies", fetchUrl: `${base}/discover/movie?api_key=${API_KEY}&with_genres=10749` },
            { title: "Historical Movies", fetchUrl: `${base}/discover/movie?api_key=${API_KEY}&with_genres=36` },
          ]}
        /></ProtectedRoute>} />
        <Route path="/most-watched" element={<ProtectedRoute><CategoryPage
          title="Most Watched"
          rows={[
            { title: "Trending This Week", fetchUrl: `${base}/trending/all/week?api_key=${API_KEY}` },
            { title: "Trending Today", fetchUrl: `${base}/trending/all/day?api_key=${API_KEY}` },
            { title: "Popular Overall", fetchUrl: `${base}/movie/popular?api_key=${API_KEY}` },
          ]}
        /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;