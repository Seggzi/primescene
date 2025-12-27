import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Tv, Download, Globe, Users } from 'lucide-react';
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

// Netflix-Style Landing Page (Full & Perfect)
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
      {/* Hero Section with Background Image */}
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

      {/* Trending Now with Real Images */}
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

      {/* More Reasons to Join - Realistic & Cool Icons */}
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

      {/* FAQ - Detailed & Cool */}
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
              Watch anywhere, anytime. Sign in with your PrimeScene account to watch instantly on the web at primescene.com from your personal computer or on any internet-connected device that offers the PrimeScene app, including smart TVs, smartphones, tablets, streaming media players and game consoles.
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
            Sign In to Start Watching
          </Link>
        </div>
      </div>

      {/* Footer */}
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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-3xl">
        Loading...
      </div>
    );
  }

  return user ? children : <Landing />;
}

function Home() {
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
    <div>
      <Banner onPlay={openModal} onInfo={openModal} />

      <div className="pb-20">
        <Row title="Trending Now" fetchUrl={`${base}/trending/all/week?api_key=${API_KEY}`} onCardClick={openModal} />
        <Row title="Popular Movies" fetchUrl={`${base}/movie/popular?api_key=${API_KEY}`} onCardClick={openModal} />
        <Row title="Top Rated" fetchUrl={`${base}/movie/top_rated?api_key=${API_KEY}`} onCardClick={openModal} />
        <Row title="Now Playing" fetchUrl={`${base}/movie/now_playing?api_key=${API_KEY}`} onCardClick={openModal} />
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal}>
        {selectedMovie && <MovieDetail movie={selectedMovie} />}
      </Modal>
    </div>
  );
}

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
      <div className="pt-24 pb-20 px-4 sm:px-6 md:px-8 lg:px-12">
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

const Placeholder = ({ name }) => (
  <ProtectedRoute>
    <div className="min-h-screen pt-24 text-white flex items-center justify-center text-4xl bg-gray-900">
      {name} Page
    </div>
  </ProtectedRoute>
);

function App() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/shows" element={<ProtectedRoute><Placeholder name="TV Shows" /></ProtectedRoute>} />
        <Route path="/movies" element={<ProtectedRoute><Placeholder name="Movies" /></ProtectedRoute>} />
        <Route path="/games" element={<ProtectedRoute><Placeholder name="Games" /></ProtectedRoute>} />
        <Route path="/new-popular" element={<ProtectedRoute><Placeholder name="New & Popular" /></ProtectedRoute>} />
        <Route path="/my-list" element={<MyListPage />} />
        <Route path="/browse-languages" element={<ProtectedRoute><Placeholder name="Browse by Languages" /></ProtectedRoute>} />
        <Route path="/manage-profiles" element={<ProtectedRoute><Placeholder name="Manage Profiles" /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Placeholder name="Account" /></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><Placeholder name="Help Center" /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;