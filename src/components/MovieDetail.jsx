import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Play, Plus, Check, Star, 
  Trash2, X, Youtube, Film, Building2,
  Users, Info, Award
} from 'lucide-react';
import { useMyList } from '../context/MyListContext';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

function MovieDetail({ movie, showOnlyPlayer = false, onClose }) {
  const [trailerKey, setTrailerKey] = useState(null);
  const [details, setDetails] = useState(null);
  const [cast, setCast] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { addToMyList, removeFromMyList, isInMyList } = useMyList();

  useEffect(() => {
    if (!movie?.id) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const mediaType = movie.media_type || (movie.title ? 'movie' : 'tv');
        const id = movie.id;

        const [detailRes, creditRes, similarRes] = await Promise.all([
          fetch(`${BASE_URL}/${mediaType}/${id}?api_key=${API_KEY}&append_to_response=videos`),
          fetch(`${BASE_URL}/${mediaType}/${id}/credits?api_key=${API_KEY}`),
          fetch(`${BASE_URL}/${mediaType}/${id}/similar?api_key=${API_KEY}`),
        ]);

        if (!detailRes.ok || !creditRes.ok || !similarRes.ok) {
          throw new Error('One or more TMDB requests failed');
        }

        const [detailData, creditData, similarData] = await Promise.all([
          detailRes.json(),
          creditRes.json(),
          similarRes.json(),
        ]);

        if (!isMounted) return;

        setDetails(detailData);

        // Trailer priority: official YouTube trailer > any trailer > first video
        const videos = detailData.videos?.results || [];
        const trailer =
          videos.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ||
          videos.find(v => v.site === 'YouTube' && v.type === 'Trailer') ||
          videos[0];

        setTrailerKey(trailer?.key ?? null);

        setCast(creditData.cast?.slice(0, 10) || []);
        setSimilar(similarData.results?.slice(0, 8) || []);
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load movie details');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [movie]);

  if (!movie) return null;

  // Computed values with fallbacks
  const runtime = details?.runtime
    ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
    : movie.runtime
      ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
      : '';

  const genres = useMemo(() => {
    const genreList = details?.genres?.map(g => g.name) ||
                      movie.genre_ids?.map(id => {
                        const map = {
                          28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
                          80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
                          14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
                          9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
                          53: "Thriller", 10752: "War", 37: "Western"
                        };
                        return map[id];
                      }).filter(Boolean);
    return genreList?.join(', ') || 'N/A';
  }, [details, movie]);

  const year = (details?.release_date || details?.first_air_date ||
                movie.release_date || movie.first_air_date || '').slice(0, 4) || 'N/A';

  // Player-only mode (embedded trailer/full player)
  if (showOnlyPlayer) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
        {trailerKey ? (
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=1&rel=0&modestbranding=1`}
            title="Trailer"
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white text-xl bg-gradient-to-br from-zinc-900 to-black">
            Trailer not available • Loading full movie...
          </div>
        )}

        {/* Player controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent pointer-events-none">
          <div className="flex items-center justify-between text-white pointer-events-auto">
            <button className="px-8 py-3 bg-white/90 text-black font-bold rounded-lg hover:bg-white transition flex items-center gap-3 shadow-lg">
              <Play size={20} fill="black" /> Continue Playing
            </button>
            <select className="bg-black/70 text-white px-4 py-2 rounded border border-white/30 text-sm">
              <option>1080p</option>
              <option>720p</option>
              <option>480p</option>
            </select>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-3 bg-black/60 rounded-full hover:bg-red-600 transition"
          >
            <X size={20} />
          </button>
        )}
      </div>
    );
  }

  // Full detail view
  return (
    <div className="fixed inset-0 z-50 bg-black/95 overflow-y-auto">
      <div className="relative min-h-screen pb-20">
        {/* Close button */}
        <button
          onClick={() => navigate(-1)}
          className="fixed top-6 left-6 z-50 p-4 bg-black/50 rounded-full hover:bg-red-600/80 transition backdrop-blur-sm"
        >
          <ChevronLeft size={28} />
        </button>

        {/* Hero / Trailer Section */}
        <div className="relative h-[70vh] min-h-[500px]">
          {trailerKey ? (
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&playsinline=1`}
              className="absolute inset-0 w-full h-full object-cover"
              allow="autoplay; fullscreen; encrypted-media"
              allowFullScreen
            />
          ) : (
            <img
              src={`https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path || ''}`}
              alt={movie.title || movie.name}
              className="absolute inset-0 w-full h-full object-cover"
              onError={e => e.target.src = 'https://via.placeholder.com/1920x1080?text=No+Backdrop'}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        {/* Main Content */}
        <div className="relative px-6 md:px-16 pb-16 -mt-32">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
              {movie.title || movie.name || 'Untitled'}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-lg text-gray-300 mb-6">
              <div className="flex items-center gap-2">
                <Star size={20} className="text-yellow-400 fill-yellow-400" />
                <span className="font-bold">{movie.vote_average?.toFixed(1) || '—'}</span>
              </div>
              <span>{year}</span>
              <span>{runtime}</span>
              <span className="text-sm">{genres}</span>
            </div>

            <p className="text-lg text-gray-200 leading-relaxed max-w-3xl mb-10">
              {movie.overview || 'No overview available.'}
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate(`/watch/${movie.media_type || 'movie'}/${movie.id}`)}
                className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition active:scale-95 shadow-xl"
              >
                <Play size={24} fill="black" /> Play
              </button>

              <button
                onClick={() => isInMyList(movie.id) ? removeFromMyList(movie.id) : addToMyList(movie)}
                className="flex items-center gap-3 border-2 border-white/60 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition active:scale-95"
              >
                {isInMyList(movie.id) ? (
                  <>
                    <Check size={20} /> In My List
                  </>
                ) : (
                  <>
                    <Plus size={20} /> My List
                  </>
                )}
              </button>
            </div>

            {/* Cast Section */}
            {cast.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-white mb-6">Top Cast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {cast.map(actor => (
                    <div key={actor.id} className="text-center">
                      <div className="w-full aspect-square rounded-full overflow-hidden bg-zinc-800 mb-3 shadow-lg">
                        <img
                          src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 'https://via.placeholder.com/185?text=' + actor.name[0]}
                          alt={actor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="font-medium text-white text-sm">{actor.name}</p>
                      <p className="text-xs text-gray-400">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Similar Movies */}
            {similar.length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-white mb-6">Similar Titles</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {similar.map(item => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/details/${movie.media_type || 'movie'}/${item.id}`)}
                      className="group cursor-pointer"
                    >
                      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-900 shadow-lg ring-1 ring-zinc-800 group-hover:ring-red-600/50 transition-all">
                        <img
                          src={`https://image.tmdb.org/t/p/w500${item.poster_path || item.backdrop_path}`}
                          alt={item.title || item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={e => e.target.src = 'https://via.placeholder.com/500x750?text=No+Poster'}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                          <p className="font-bold text-white text-sm line-clamp-2">
                            {item.title || item.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;