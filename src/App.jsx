import { useState } from 'react';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import Row from './components/Row';
import Modal from './components/Modal';
import MovieDetail from './components/MovieDetail';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const base = 'https://api.themoviedb.org/3';

function App() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [playOpen, setPlayOpen] = useState(false);

  const openDetail = (movie) => {
    setSelectedMovie(movie);
    setDetailOpen(true);
  };

  const openPlay = (movie) => {
    setSelectedMovie(movie);
    setPlayOpen(true);
  };

  return (
    <div className="bg-black text-white">
      <Navbar />
      <Banner onPlay={openPlay} onInfo={openDetail} />

      <div className="pb-20">
        <Row title="Trending Now" fetchUrl={`${base}/trending/all/week?api_key=${API_KEY}`} onCardClick={openDetail} />
        <Row title="Popular Movies" fetchUrl={`${base}/movie/popular?api_key=${API_KEY}`} onCardClick={openDetail} />
        <Row title="Top Rated" fetchUrl={`${base}/movie/top_rated?api_key=${API_KEY}`} onCardClick={openDetail} />
        <Row title="Now Playing" fetchUrl={`${base}/movie/now_playing?api_key=${API_KEY}`} onCardClick={openDetail} />
      </div>

      {/* Play Modal - only trailer + fake full movie controls */}
      <Modal isOpen={playOpen} onClose={() => setPlayOpen(false)}>
        {selectedMovie && <MovieDetail movie={selectedMovie} showOnlyPlayer={true} />}
      </Modal>

      {/* More Info / Card Click Modal - full detail */}
      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)}>
        {selectedMovie && <MovieDetail movie={selectedMovie} showOnlyPlayer={false} />}
      </Modal>
    </div>
  );
}

export default App;