import Banner from "./components/Banner";
import Row from "./components/Row";
import Navbar from './components/Navbar';


<Navbar />

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const base = `https://api.themoviedb.org/3`;

function App() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Banner />

      <section className="relative z-10 -mt-32 md:-mt-48 pb-20">
        <div className="bg-black/80 backdrop-blur-sm pt-8">
          <section className="relative z-20 -mt-8 md:-mt-16 lg:-mt-24 pb-20">  {/* Tiny overlap */}
            <div className="px-4 md:px-8 lg:px-12">
              <Row title="Trending Now" fetchUrl={`${base}/trending/all/week?api_key=${API_KEY}`} />
              <Row title="Popular Movies" fetchUrl={`${base}/movie/popular?api_key=${API_KEY}`} />
              <Row title="Top Rated Movies" fetchUrl={`${base}/movie/top_rated?api_key=${API_KEY}`} />
              <Row title="Now Playing in Theaters" fetchUrl={`${base}/movie/now_playing?api_key=${API_KEY}`} />
              <Row title="Popular TV Shows" fetchUrl={`${base}/tv/popular?api_key=${API_KEY}`} />
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

export default App;
