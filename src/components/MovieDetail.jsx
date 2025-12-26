import { useEffect, useState } from 'react';

function MovieDetail({ movie, showOnlyPlayer = false }) {
  const [trailerKey, setTrailerKey] = useState(null);
  const [details, setDetails] = useState(null);
  const [cast, setCast] = useState([]);
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      if (!movie || !movie.id) return;

      try {
        const type = movie.media_type || (movie.title ? 'movie' : 'tv');
        const id = movie.id;

        const [detailRes, creditRes, similarRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&append_to_response=videos`),
          fetch(`https://api.themoviedb.org/3/${type}/${id}/credits?api_key=${import.meta.env.VITE_TMDB_API_KEY}`),
          fetch(`https://api.themoviedb.org/3/${type}/${id}/similar?api_key=${import.meta.env.VITE_TMDB_API_KEY}`)
        ]);

        const detailData = await detailRes.json();
        const creditData = await creditRes.json();
        const similarData = await similarRes.json();

        setDetails(detailData);

        // Find official trailer
        const videos = detailData.videos?.results || [];
        const trailer = videos.find(v => v.type === 'Trailer' && v.official) ||
                        videos.find(v => v.type === 'Trailer') ||
                        videos[0];
        if (trailer) setTrailerKey(trailer.key);

        // Top 10 cast
        setCast(creditData.cast?.slice(0, 10) || []);

        // Top 8 similar
        setSimilar(similarData.results?.slice(0, 8) || []);
      } catch (err) {
        console.error('Detail fetch error:', err);
      }
    };

    fetchAll();
  }, [movie]);

  if (!movie) return null;

  const runtime = details?.runtime 
    ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m` 
    : '';
  const genres = details?.genres?.map(g => g.name).join(', ') || 'N/A';
  const year = details?.release_date?.slice(0, 4) || details?.first_air_date?.slice(0, 4) || 'N/A';

  // Player-only mode (for Play button)
  if (showOnlyPlayer) {
    return (
      <div className="aspect-video bg-black relative">
        {trailerKey ? (
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=1&rel=0`}
            title="Trailer"
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-lg sm:text-xl md:text-2xl bg-gray-900 px-4 text-center">
            Playing full movie...
          </div>
        )}

        {/* Fake full movie controls - responsive */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black to-transparent">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition flex items-center justify-center gap-2 text-sm sm:text-base">
                ▶ Continue Playing
              </button>
              <select className="w-full sm:w-auto bg-black/70 text-white px-4 py-2 rounded text-sm sm:text-base">
                <option>1080p</option>
                <option>720p</option>
                <option>480p</option>
              </select>
            </div>
            <button className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-gray-600 text-white font-bold rounded hover:bg-gray-500 transition text-sm sm:text-base">
              Download
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full detail mode (More Info or card click)
  return (
    <div className="max-h-[90vh] overflow-y-auto">
      {/* Trailer */}
      <div className="aspect-video bg-black">
        {trailerKey ? (
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=1`}
            title="Trailer"
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-lg sm:text-xl md:text-2xl bg-gray-900 px-4 text-center">
            Trailer not available
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 sm:p-6 md:p-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
          {movie.title || movie.name}
        </h1>
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-white/80 mb-6 text-sm sm:text-base">
          <p className="text-base sm:text-lg md:text-xl text-green-400">★ {movie.vote_average?.toFixed(1) || 'N/A'}</p>
          <p>{year}</p>
          <p>{runtime}</p>
          <p className="max-w-full break-words">{genres}</p>
        </div>
        <p className="text-sm sm:text-base md:text-lg text-white/90 leading-relaxed mb-8 max-w-full">
          {movie.overview}
        </p>

        {/* Cast Carousel */}
        {cast.length > 0 && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Cast</h2>
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {cast.map(actor => (
                <div key={actor.id} className="flex-shrink-0 text-center w-24 sm:w-28 md:w-32">
                  <img 
                    src={actor.profile_path 
                      ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` 
                      : 'https://via.placeholder.com/185x278?text=No+Image'}
                    alt={actor.name}
                    className="w-full h-36 sm:h-40 md:h-48 object-cover rounded-lg mb-2 shadow-lg"
                  />
                  <p className="text-white text-xs sm:text-sm font-medium line-clamp-1">{actor.name}</p>
                  <p className="text-white/70 text-xs line-clamp-2">{actor.character}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Similar Movies */}
        {similar.length > 0 && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-10 sm:mt-12 mb-4">Similar Titles</h2>
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {similar.map(sim => (
                <div key={sim.id} className="flex-shrink-0 w-32 sm:w-40 md:w-48">
                  <img 
                    src={`https://image.tmdb.org/t/p/w342${sim.poster_path || sim.backdrop_path}`}
                    alt={sim.title || sim.name}
                    className="w-full rounded-lg shadow-lg"
                  />
                  <p className="text-white text-center mt-2 text-xs sm:text-sm line-clamp-2">{sim.title || sim.name}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MovieDetail;