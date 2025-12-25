import Banner from "./components/Banner";
import Row from "./components/Row";
import Navbar from './components/Navbar';


<Navbar />

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const base = `https://api.themoviedb.org/3`;

function App() {
  return (
    <div className="relative h-[60vh] md:h-[75vh] lg:h-[85vh]">
      {/* Full bleed backdrop image */}
      <img
        src={backdrop}
        alt={movie.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent/10"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent"></div>

      {/* Content container - left-aligned, compact like NetMirror */}
      <div className="absolute bottom-0 left-0 pb-12 md:pb-16 px-8 md:px-12 lg:px-16 max-w-xl z-50">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-4 leading-none drop-shadow-xl">
          {movie.title || movie.name}
        </h1>

        {/* Small overview text - compact and left */}
        <p className="text-base md:text-lg text-white/90 mb-8 line-clamp-4 leading-relaxed max-w-lg">
          {movie.overview || 'No overview available.'}
        </p>

        {/* Buttons - Watch Now primary, + secondary like NetMirror */}
        <div className="flex gap-6">
          <button className="px-10 py-4 bg-white/90 text-black text-lg md:text-xl font-bold rounded-full hover:bg-white transition flex items-center gap-3 shadow-xl">
            ▶ Watch Now
          </button>
          <button className="px-10 py-4 bg-white/20 backdrop-blur-md text-white text-lg md:text-xl font-bold rounded-full hover:bg-white/30 transition flex items-center gap-3 border border-white/40 shadow-xl">
            + Add to List
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
