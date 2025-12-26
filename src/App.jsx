import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center text-2xl">Loading...</div>;
  }

  return user ? children : <Login />;
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
    <ProtectedRoute>
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
    </ProtectedRoute>
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
        <Route path="/" element={<Home />} />
        <Route path="/shows" element={<Placeholder name="TV Shows" />} />
        <Route path="/movies" element={<Placeholder name="Movies" />} />
        <Route path="/games" element={<Placeholder name="Games" />} />
        <Route path="/new-popular" element={<Placeholder name="New & Popular" />} />
        <Route path="/my-list" element={<MyListPage />} />
        <Route path="/browse-languages" element={<Placeholder name="Browse by Languages" />} />
        <Route path="/manage-profiles" element={<Placeholder name="Manage Profiles" />} />
        <Route path="/account" element={<Placeholder name="Account" />} />
        <Route path="/help" element={<Placeholder name="Help Center" />} />
      </Routes>
    </div>
  );
}

export default App;