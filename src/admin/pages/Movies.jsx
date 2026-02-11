// src/admin/pages/Movies.jsx - UPDATED WITH BANNER HERO FEATURE
import { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { Film, Plus, Edit2, Trash2, Search, Save, X, Play, Filter, Star, AlertCircle, Crown } from 'lucide-react';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music',
  'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'
];

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [tmdbResults, setTmdbResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [error, setError] = useState('');
  const [tmdbSearch, setTmdbSearch] = useState('');
  const [curatedSearch, setCuratedSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    featured: false,
    fullWatch: false,
    bannerHero: false,
    genres: [],
    yearFrom: '',
    yearTo: '',
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    poster_url: '',
    full_video_url: '',
    release_year: '',
    genres: [],
    is_featured: false,
    can_watch_fully: false,
    is_banner_hero: false,
  });

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*, is_banner_hero')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMovies(data || []);
      applyFilters(data || []);
    } catch (err) {
      setError('Failed to load movies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (movieList) => {
    let filtered = movieList;

    if (curatedSearch) {
      const term = curatedSearch.toLowerCase();
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(term) ||
        (m.description && m.description.toLowerCase().includes(term))
      );
    }

    if (filters.featured) {
      filtered = filtered.filter(m => m.is_featured);
    }

    if (filters.fullWatch) {
      filtered = filtered.filter(m => m.can_watch_fully);
    }

    if (filters.bannerHero) {
      filtered = filtered.filter(m => m.is_banner_hero);
    }

    if (filters.genres.length > 0) {
      filtered = filtered.filter(m => 
        m.genres && filters.genres.some(g => m.genres.includes(g))
      );
    }

    if (filters.yearFrom) {
      filtered = filtered.filter(m => m.release_year >= parseInt(filters.yearFrom));
    }
    if (filters.yearTo) {
      filtered = filtered.filter(m => m.release_year <= parseInt(filters.yearTo));
    }

    setFilteredMovies(filtered);
  };

  useEffect(() => {
    applyFilters(movies);
  }, [filters, curatedSearch, movies]);

  const searchTMDB = async () => {
    if (!tmdbSearch.trim()) {
      setTmdbResults([]);
      return;
    }

    setTmdbLoading(true);
    setError('');

    try {
      const res = await fetch(`${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(tmdbSearch)}`);
      const data = await res.json();

      setTmdbResults(data.results || []);
    } catch (err) {
      setError('TMDB search failed');
    } finally {
      setTmdbLoading(false);
    }
  };

  const addFromTMDB = async (tmdbMovie) => {
    try {
      const poster = tmdbMovie.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}` : null;

      const { error } = await supabase
        .from('movies')
        .insert({
          title: tmdbMovie.title,
          description: tmdbMovie.overview || '',
          poster_url: poster,
          release_year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : null,
          genres: [],
          is_featured: false,
          can_watch_fully: false,
          is_banner_hero: false,
        });

      if (error) throw error;

      setTmdbSearch('');
      setTmdbResults([]);
      fetchMovies();
    } catch (err) {
      setError(err.message || 'Failed to add movie');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const saveData = {
        ...formData,
        release_year: formData.release_year ? parseInt(formData.release_year) : null,
        genres: formData.genres,
      };

      // If setting as banner hero, unset all others first
      if (saveData.is_banner_hero) {
        await supabase
          .from('movies')
          .update({ is_banner_hero: false })
          .neq('id', editingMovie?.id || ''); // exclude current movie
      }

      if (editingMovie) {
        const { error } = await supabase
          .from('movies')
          .update(saveData)
          .eq('id', editingMovie.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('movies')
          .insert(saveData);

        if (error) throw error;
      }

      resetForm();
      setShowAddForm(false);
      setEditingMovie(null);
      fetchMovies();
    } catch (err) {
      setError(err.message || 'Failed to save movie');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', deleteConfirm.id);

      if (error) throw error;

      setDeleteConfirm(null);
      fetchMovies();
    } catch (err) {
      setError(err.message || 'Failed to delete');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      poster_url: '',
      full_video_url: '',
      release_year: '',
      genres: [],
      is_featured: false,
      can_watch_fully: false,
      is_banner_hero: false,
    });
  };

  const startEdit = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description || '',
      poster_url: movie.poster_url || '',
      full_video_url: movie.full_video_url || '',
      release_year: movie.release_year || '',
      genres: movie.genres || [],
      is_featured: movie.is_featured,
      can_watch_fully: movie.can_watch_fully,
      is_banner_hero: movie.is_banner_hero || false,
    });
  };

  const toggleGenre = (genre) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const toggleFilterGenre = (genre) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  return (
    <div className="min-h-screen bg-black text-slate-200">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
          <h1 className="text-xl font-bold flex items-center gap-3">
            <Film size={24} className="text-red-600" />
            Movie Management
          </h1>
          <div className="text-right">
            <p className="text-lg font-mono font-bold leading-none">{filteredMovies.length}</p>
            <p className="text-[10px] uppercase tracking-widest text-gray-500">Total Titles</p>
          </div>
        </div>

        {/* Add Custom Movie Button */}
        <div className="mb-8 text-right">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-white text-black hover:bg-gray-200 px-5 py-2 rounded-lg font-bold text-xs transition flex items-center gap-2 inline-flex"
          >
            <Plus size={14} />
            Add Custom Movie
          </button>
        </div>

        {/* Filters Bar */}
        <div className="bg-[#111] rounded-xl p-5 mb-8 border border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Filter size={16} />
              Filter Tools
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-gray-500 hover:text-white text-xs transition"
            >
              {showFilters ? 'Collapse' : 'Expand Filters'}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2">Featured Only</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.featured}
                    onChange={(e) => setFilters({ ...filters, featured: e.target.checked })}
                    className="w-4 h-4 bg-black border-white/10 rounded text-red-600 focus:ring-0"
                  />
                  <span className="text-xs">Yes</span>
                </label>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2">Full Watch</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.fullWatch}
                    onChange={(e) => setFilters({ ...filters, fullWatch: e.target.checked })}
                    className="w-4 h-4 bg-black border-white/10 rounded text-red-600 focus:ring-0"
                  />
                  <span className="text-xs">Yes</span>
                </label>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2">Banner Hero</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.bannerHero}
                    onChange={(e) => setFilters({ ...filters, bannerHero: e.target.checked })}
                    className="w-4 h-4 bg-black border-white/10 rounded text-red-600 focus:ring-0"
                  />
                  <span className="text-xs">Yes</span>
                </label>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2">From Year</label>
                <input
                  type="number"
                  placeholder="2010"
                  value={filters.yearFrom}
                  onChange={(e) => setFilters({ ...filters, yearFrom: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-white/10 rounded text-xs outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2">To Year</label>
                <input
                  type="number"
                  placeholder="2026"
                  value={filters.yearTo}
                  onChange={(e) => setFilters({ ...filters, yearTo: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-white/10 rounded text-xs outline-none focus:border-red-600"
                />
              </div>

              <div className="md:col-span-4 mt-2">
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-3 tracking-widest">Genre Selection</label>
                <div className="flex flex-wrap gap-2">
                  {GENRE_OPTIONS.map(genre => (
                    <label key={genre} className={`px-2 py-1 border rounded cursor-pointer text-[10px] transition ${filters.genres.includes(genre) ? 'bg-red-600 border-red-600 text-white' : 'border-white/10 text-gray-400'}`}>
                      <input
                        type="checkbox"
                        checked={filters.genres.includes(genre)}
                        onChange={() => toggleFilterGenre(genre)}
                        className="hidden"
                      />
                      <span>{genre}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Curated Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={curatedSearch}
              onChange={(e) => setCuratedSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#111] border border-white/10 rounded-xl text-xs outline-none focus:border-red-600 transition shadow-inner"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-800/50 text-red-400 p-4 rounded-xl mb-8 flex items-center gap-3 max-w-2xl mx-auto">
            <AlertCircle size={20} />
            <span className="text-xs font-bold uppercase tracking-wider">{error}</span>
          </div>
        )}

        {/* TMDB Search Section */}
        <div className="bg-[#111] rounded-xl p-6 mb-12 border border-white/5 shadow-2xl">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-center text-gray-500">Import from TMDB</h2>
          <div className="flex gap-3 mb-8 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search TMDB database..."
              value={tmdbSearch}
              onChange={(e) => setTmdbSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchTMDB()}
              className="flex-1 px-4 py-2 bg-black border border-white/10 rounded-lg text-xs outline-none focus:border-red-600 transition"
            />
            <button
              onClick={searchTMDB}
              disabled={tmdbLoading}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50 text-xs font-bold"
            >
              <Search size={14} /> Search
            </button>
          </div>

          {tmdbLoading && (
            <div className="text-center py-6">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-red-600 rounded-full border-t-transparent"></div>
            </div>
          )}

          {tmdbResults.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {tmdbResults.map((movie) => (
                <div key={movie.id} className="min-w-[140px] max-w-[140px] bg-black rounded-lg overflow-hidden border border-white/10 group relative">
                  {movie.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} className="w-full h-40 object-cover opacity-80 group-hover:opacity-100 transition" />
                  ) : (
                    <div className="w-full h-40 bg-gray-900 flex items-center justify-center"><Film size={24} className="text-gray-700" /></div>
                  )}
                  <div className="p-2">
                    <h3 className="font-bold text-[10px] truncate mb-1">{movie.title}</h3>
                    <button
                      onClick={() => addFromTMDB(movie)}
                      className="w-full bg-green-600 hover:bg-green-700 py-1.5 rounded text-[9px] font-black uppercase tracking-tighter transition"
                    >
                      Add to PrimeScene
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Curated Collection Header */}
        <div className="mb-6 text-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Curated Collection</h2>
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#111] rounded-xl overflow-hidden border border-white/5 flex h-48 animate-pulse">
                <div className="w-32 bg-gray-800/30"></div>
                <div className="flex-1 p-4 space-y-3">
                  <div className="h-4 bg-gray-800/30 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-800/30 rounded w-full"></div>
                  <div className="h-3 bg-gray-800/30 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-20">
            <Film size={80} className="mx-auto text-gray-700 mb-6" />
            <p className="text-sm font-bold text-gray-500">No movies found</p>
            <p className="text-xs text-gray-600 mt-2">
              {curatedSearch || Object.values(filters).some(v => v) 
                ? 'Try adjusting your filters or search term'
                : 'Start by importing movies from TMDB above'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMovies.map((movie) => (
              <div key={movie.id} className="bg-[#111] rounded-xl overflow-hidden border border-white/5 flex h-48 hover:border-white/20 transition group shadow-lg">
                <div className="w-32 flex-shrink-0 relative overflow-hidden">
                  {movie.poster_url ? (
                    <img src={movie.poster_url} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center"><Film size={32} className="text-gray-700" /></div>
                  )}
                </div>

                <div className="flex-1 p-4 flex flex-col justify-between overflow-hidden">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm font-bold truncate pr-4 text-white">{movie.title}</h3>
                      <span className="text-[10px] font-mono text-gray-500">{movie.release_year || 'N/A'}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                      {movie.description || 'No description provided.'}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {movie.is_featured && (
                        <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded text-[9px] font-bold uppercase">Featured</span>
                      )}
                      {movie.can_watch_fully && (
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded text-[9px] font-bold uppercase">Full Watch</span>
                      )}
                      {movie.is_banner_hero && (
                        <span className="px-2 py-0.5 bg-brand-mint/10 text-brand-mint border border-brand-mint/20 rounded text-[9px] font-bold uppercase flex items-center gap-1">
                          <Crown size={12} /> Banner Hero
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-white/5">
                    <button onClick={() => startEdit(movie)} className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-2">
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={() => setDeleteConfirm(movie)} className="flex-1 bg-red-600/10 hover:bg-red-600/20 text-red-500 py-2 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-2">
                      <Trash2 size={12} /> Delete
                    </button>
                    {movie.can_watch_fully && movie.full_video_url && (
                      <button onClick={() => setPreviewVideo(movie.full_video_url)} className="px-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg transition flex items-center">
                        <Play size={12} fill="currentColor" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddForm || editingMovie) && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl">
            <h2 className="text-sm font-bold mb-6 uppercase tracking-widest text-center">
              {editingMovie ? 'Update Movie' : 'New Entry'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Title" className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-xs outline-none focus:border-red-600" required />
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description" rows={4} className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-xs outline-none focus:border-red-600 resize-none" />
              <input value={formData.poster_url} onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })} placeholder="Poster URL" className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-xs outline-none focus:border-red-600" />
              <input value={formData.full_video_url} onChange={(e) => setFormData({ ...formData, full_video_url: e.target.value })} placeholder="Video URL" className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-xs outline-none focus:border-red-600" />
              
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer bg-black p-2 rounded border border-white/5">
                  <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="w-3.5 h-3.5 text-red-600 bg-transparent border-white/20" />
                  <span className="text-[10px] text-gray-400">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-black p-2 rounded border border-white/5">
                  <input type="checkbox" checked={formData.can_watch_fully} onChange={(e) => setFormData({ ...formData, can_watch_fully: e.target.checked })} className="w-3.5 h-3.5 text-red-600 bg-transparent border-white/20" />
                  <span className="text-[10px] text-gray-400">Full Watch</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-black p-2 rounded border border-white/5">
                  <input type="checkbox" checked={formData.is_banner_hero} onChange={(e) => setFormData({ ...formData, is_banner_hero: e.target.checked })} className="w-3.5 h-3.5 text-brand-mint bg-transparent border-white/20" />
                  <span className="text-[10px] text-gray-400">Banner Hero</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-white text-black py-2 rounded-lg font-bold text-xs hover:bg-gray-200 transition flex items-center justify-center gap-2">
                  <Save size={14} /> Save
                </button>
                <button type="button" onClick={() => { setShowAddForm(false); setEditingMovie(null); resetForm(); }} className="flex-1 bg-white/5 text-white py-2 rounded-lg font-bold text-xs transition border border-white/10">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] rounded-2xl p-6 max-w-xs w-full text-center border border-red-900/30">
            <h2 className="text-sm font-bold text-red-500 mb-2">Delete Movie?</h2>
            <p className="text-[11px] text-gray-400 mb-6 italic">"{deleteConfirm.title}"</p>
            <div className="flex gap-2">
              <button onClick={handleDelete} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-[10px] font-bold">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-white/5 text-gray-400 py-2 rounded-lg text-[10px] font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Video Preview */}
      {previewVideo && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="p-4 flex justify-between items-center border-b border-white/10">
            <h2 className="text-xs font-bold uppercase tracking-widest">Preview Mode</h2>
            <button onClick={() => setPreviewVideo(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <video controls autoPlay className="max-h-full max-w-full"><source src={previewVideo} type="video/mp4" /></video>
          </div>
        </div>
      )}
    </div>
  );
}