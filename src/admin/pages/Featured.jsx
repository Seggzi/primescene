'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../supabase';
import {
  Star,
  Search,
  RefreshCw,
  Film,
  Check,
  X,
  ArrowUpDown,
  GripVertical
} from 'lucide-react';

export default function Featured() {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [sortBy, setSortBy] = useState('position');
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // Drag refs
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const stats = {
    total: movies.length,
    featured: movies.filter(m => m.is_featured).length
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('id, title, poster_url, is_featured, release_year, description, featured_position')
        .order('featured_position', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMovies(data || []);
      applyFiltersAndSort(data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setErrorMsg(err.message || 'Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = (movieList) => {
    let result = [...movieList];

    if (onlyFeatured) {
      result = result.filter(m => m.is_featured);
    }

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(m =>
        m.title?.toLowerCase().includes(term) ||
        m.description?.toLowerCase().includes(term)
      );
    }

    // Sort
    if (sortBy === 'position') {
      result.sort((a, b) => {
        const posA = a.featured_position ?? Infinity;
        const posB = b.featured_position ?? Infinity;
        return posA - posB;
      });
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'year') {
      result.sort((a, b) => (b.release_year || 0) - (a.release_year || 0));
    }

    setFilteredMovies(result);
  };

  useEffect(() => {
    applyFiltersAndSort(movies);
  }, [search, onlyFeatured, sortBy, movies]);

  // Toggle featured
  const toggleFeatured = async (movie) => {
    try {
      const newFeatured = !movie.is_featured;
      const updateData = { is_featured: newFeatured };

      if (newFeatured && !movie.featured_position) {
        const maxPos = Math.max(...movies.map(m => m.featured_position || 0), 0);
        updateData.featured_position = maxPos + 1;
      } else if (!newFeatured) {
        updateData.featured_position = null;
      }

      const { error } = await supabase
        .from('movies')
        .update(updateData)
        .eq('id', movie.id);

      if (error) throw error;

      fetchMovies();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update featured');
    }
  };

  // Bulk feature/unfeature
  const bulkFeature = async (feature = true) => {
    if (selectedIds.length === 0) return;

    setErrorMsg(null);
    try {
      for (const id of selectedIds) {
        const movie = movies.find(m => m.id === id);
        if (!movie) continue;

        const updateData = { is_featured: feature };
        if (feature && !movie.featured_position) {
          const maxPos = Math.max(...movies.map(m => m.featured_position || 0), 0);
          updateData.featured_position = maxPos + 1;
        } else if (!feature) {
          updateData.featured_position = null;
        }

        const { error } = await supabase
          .from('movies')
          .update(updateData)
          .eq('id', id);

        if (error) throw error;
      }

      setSelectedIds([]);
      fetchMovies();
    } catch (err) {
      setErrorMsg(err.message || 'Bulk action failed');
    }
  };

  // Drag handlers
  const handleDragStart = (e, index) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;

    const list = [...filteredMovies];
    const draggedItem = list.splice(dragItem.current, 1)[0];
    list.splice(dragOverItem.current, 0, draggedItem);

    // Update positions one-by-one
    for (let i = 0; i < list.length; i++) {
      const movie = list[i];
      if (!movie.is_featured) continue;

      const newPosition = i + 1;
      try {
        const { error } = await supabase
          .from('movies')
          .update({ featured_position: newPosition })
          .eq('id', movie.id);

        if (error) {
          console.error(`Position update failed for ${movie.title}:`, error);
          setErrorMsg(`Reorder failed for ${movie.title}`);
          return;
        }
      } catch (err) {
        console.error('Drag update error:', err);
        setErrorMsg('Reorder failed');
        return;
      }
    }

    fetchMovies();
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // Promote to Hero (position 1)
  const promoteToHero = async (movie) => {
    try {
      // Set this one to position 1
      await supabase
        .from('movies')
        .update({ 
          is_featured: true,
          featured_position: 1
        })
        .eq('id', movie.id);

      // Shift others down
      const others = movies
        .filter(m => m.id !== movie.id && m.is_featured && m.featured_position)
        .map(m => ({
          id: m.id,
          featured_position: m.featured_position + 1
        }));

      if (others.length > 0) {
        for (const other of others) {
          await supabase
            .from('movies')
            .update({ featured_position: other.featured_position })
            .eq('id', other.id);
        }
      }

      fetchMovies();
    } catch (err) {
      setErrorMsg('Promote to hero failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-6xl mx-auto p-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-3">
              <Star size={28} className="text-brand-mint" />
              Featured Content
            </h1>
            <p className="text-gray-500 text-xs mt-1">Curate homepage hero & spotlight</p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {selectedIds.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => bulkFeature(true)}
                  className="px-4 py-2 bg-brand-mint text-black rounded-2xl text-xs font-bold hover:opacity-90"
                >
                  Feature Selected ({selectedIds.length})
                </button>
                <button
                  onClick={() => bulkFeature(false)}
                  className="px-4 py-2 bg-red-500/10 text-red-400 rounded-2xl text-xs font-bold hover:bg-red-500/20"
                >
                  Unfeature Selected
                </button>
              </div>
            )}
            <button
              onClick={fetchMovies}
              disabled={loading}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin text-brand-mint" : "text-gray-400"} />
            </button>
            <div className="bg-brand-mint/10 border border-brand-mint/20 px-5 py-2 rounded-2xl text-center">
              <p className="text-2xl font-black text-brand-mint leading-none">{stats.featured}</p>
              <p className="text-[9px] uppercase font-bold text-brand-mint/60">Featured</p>
            </div>
          </div>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs">
            <strong>Error:</strong> {errorMsg}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 text-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Total Movies</p>
            <p className="text-xl font-black text-white mt-1">{stats.total}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 text-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Featured Now</p>
            <p className="text-xl font-black text-brand-mint mt-1">{stats.featured}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-3 mb-8 flex-wrap">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] outline-none focus:border-brand-mint transition-all shadow-2xl text-sm"
            />
          </div>
          <label className="flex items-center gap-2 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={onlyFeatured}
              onChange={(e) => setOnlyFeatured(e.target.checked)}
              className="w-4 h-4 text-brand-mint rounded"
            />
            Only Featured
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm outline-none focus:border-brand-mint"
          >
            <option value="position">Sort by Position</option>
            <option value="title">Sort by Title</option>
            <option value="year">Sort by Year</option>
          </select>
        </div>

        {/* Showing count */}
        <div className="mb-4 text-center text-gray-500 text-xs">
          Showing <span className="font-bold text-brand-mint">{filteredMovies.length}</span> of <span className="font-bold">{stats.total}</span> movies
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-white/5 rounded-[3rem] animate-pulse" />
            ))}
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
            <Film size={56} className="mx-auto text-gray-700 mb-3" />
            <p className="text-lg font-bold text-gray-500">No movies found</p>
            <p className="text-xs text-gray-600 mt-1">
              {search || onlyFeatured ? 'Adjust filters' : 'Add movies first'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMovies.map((movie, index) => (
              <div 
                key={movie.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                className={`group flex items-center gap-4 p-5 rounded-[2.5rem] border transition-all shadow-xl cursor-grab active:cursor-grabbing ${
                  movie.is_featured 
                    ? 'bg-brand-mint/5 border-brand-mint/20' 
                    : 'bg-white/5 border-white/5 hover:border-white/20'
                }`}
              >
                {/* Drag handle */}
                <GripVertical size={16} className="text-gray-500 cursor-grab" />

                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedIds.includes(movie.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds([...selectedIds, movie.id]);
                    } else {
                      setSelectedIds(selectedIds.filter(id => id !== movie.id));
                    }
                  }}
                  className="w-4 h-4 text-brand-mint rounded"
                />

                {/* Poster */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black flex-shrink-0 border border-white/10">
                  {movie.poster_url ? (
                    <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film size={24} className="text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className={`text-base font-bold truncate ${movie.is_featured ? 'text-brand-mint' : 'text-white'}`}>
                    {movie.title}
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {movie.release_year || 'N/A'} • {movie.is_featured ? 'Featured' : 'Not Featured'}
                  </p>
                  {movie.featured_position && (
                    <p className="text-[9px] text-gray-600 mt-1">Position: {movie.featured_position}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleFeatured(movie)}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                      movie.is_featured 
                        ? 'bg-brand-mint text-black hover:bg-brand-mint/80' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {movie.is_featured ? <X size={18} /> : <Star size={18} />}
                  </button>

                  <button
                    onClick={() => promoteToHero(movie)}
                    className="w-10 h-10 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 flex items-center justify-center"
                    title="Promote to Hero (Position 1)"
                  >
                    <ArrowUpDown size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}