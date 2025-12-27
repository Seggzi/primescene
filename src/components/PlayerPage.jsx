import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function PlayerPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [videoKey, setVideoKey] = useState(null);

  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        const trailer = data.results?.find(v => v.type === "Trailer") || data.results?.[0];
        setVideoKey(trailer?.key);
      });
  }, [type, id]);

  return (
    <div className="fixed inset-0 bg-black z-[999] flex flex-col">
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="text-white flex items-center gap-2">
          <ChevronLeft size={40} /> <span className="text-xl font-bold">Back</span>
        </button>
      </div>
      {videoKey ? (
        <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoKey}?autoplay=1`} allow="autoplay; fullscreen" />
      ) : (
        <div className="flex-1 flex items-center justify-center text-white text-xl">Trailer not available</div>
      )}
    </div>
  );
}
export default PlayerPage;