import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import Row from './components/Row';
import Modal from './components/Modal';
import MovieDetail from './components/MovieDetail';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const base = 'https://api.themoviedb.org/3';

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
        <Row 
          title="Trending Now" 
          fetchUrl={`${base}/trending/all/week?api_key=${API_KEY}`} 
          onCardClick={openModal} 
        />
        <Row 
          title="Popular Movies" 
          fetchUrl={`${base}/movie/popular?api_key=${API_KEY}`} 
          onCardClick={openModal} 
        />
        <Row 
          title="Top Rated" 
          fetchUrl={`${base}/movie/top_rated?api_key=${API_KEY}`} 
          onCardClick={openModal} 
        />
        <Row 
          title="Now Playing" 
          fetchUrl={`${base}/movie/now_playing?api_key=${API_KEY}`} 
          onCardClick={openModal} 
        />
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal}>
        {selectedMovie && <MovieDetail movie={selectedMovie} />}
      </Modal>
    </div>
  );
}

// Placeholder pages
const Placeholder = ({ name }) => (
  <div className="min-h-screen text-white flex items-center justify-center text-4xl bg-gray-900">
    {name} Page
  </div>
);

function App() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shows" element={<Placeholder name="TV Shows" />} />
        <Route path="/movies" element={<Placeholder name="Movies" />} />
        <Route path="/games" element={<Placeholder name="Games" />} />
        <Route path="/new-popular" element={<Placeholder name="New & Popular" />} />
        <Route path="/my-list" element={<Placeholder name="My List" />} />
        <Route path="/browse-languages" element={<Placeholder name="Browse by Languages" />} />
        <Route path="/manage-profiles" element={<Placeholder name="Manage Profiles" />} />
        <Route path="/account" element={<Placeholder name="Account" />} />
        <Route path="/help" element={<Placeholder name="Help Center" />} />
      </Routes>
    </div>
  );
}

export default App;