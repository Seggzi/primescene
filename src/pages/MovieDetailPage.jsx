// src/pages/MovieDetailPage.jsx - FINAL FIXED VERSION
// Real-time delete + like/unlike + nested replies + no console warnings

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Play, Plus, Check, Star, 
  Trash2, X, Youtube, Film, Info, Award, Clock, Calendar, Globe, Users, 
  MessageSquare, Heart, Reply, Send
} from 'lucide-react';
import { useMyList } from '../context/MyListContext';
import { createClient } from '@supabase/supabase-js';

// ────────────────────────────────────────────────
// Supabase client created ONCE outside the component
// This fixes the "Multiple GoTrueClient instances" warning
// ────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

function MovieDetailPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const recommendationsRef = useRef(null);

  const [movie, setMovie] = useState(null);
  const [omdbData, setOmdbData] = useState({});
  const [similar, setSimilar] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsError, setReviewsError] = useState(null);
  const [videos, setVideos] = useState([]);
  const [castBios, setCastBios] = useState({});
  const [selectedCast, setSelectedCast] = useState(null);
  const [activeTab, setActiveTab] = useState('storyline');
  const [userReview, setUserReview] = useState("");
  const [userRating, setUserRating] = useState(10);
  const [replyTo, setReplyTo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showTrailer, setShowTrailer] = useState(false);
  const [activeVideoKey, setActiveVideoKey] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      console.log("Current Supabase user:", user ? user.id : "Not logged in");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      console.log("Auth state changed:", session?.user ? "Logged in" : "Logged out");
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const { addToMyList, removeFromMyList, isInMyList } = useMyList();

  // Fetch TMDB data
  useEffect(() => {
    const fetchMovieData = async () => {
      if (!API_KEY) {
        setError("TMDB API key is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const detailsRes = await fetch(
          `${BASE_URL}/${type}/${id}?api_key=${API_KEY}&append_to_response=credits,videos,images,release_dates,content_ratings,external_ids,keywords`
        );
        if (!detailsRes.ok) throw new Error('TMDB details failed');
        const data = await detailsRes.json();
        setMovie(data);

        const videoResults = data.videos?.results || [];
        setVideos(videoResults);
        const trailer = videoResults.find(v => v.type === "Trailer" && v.site === "YouTube");
        setActiveVideoKey(trailer?.key || videoResults[0]?.key);

        const similarRes = await fetch(`${BASE_URL}/${type}/${id}/similar?api_key=${API_KEY}`);
        if (similarRes.ok) {
          const similarData = await similarRes.json();
          setSimilar(similarData.results?.slice(0, 12) || []);
        }

        if (data.imdb_id) {
          const omdbRes = await fetch(`http://www.omdbapi.com/?i=tt${data.imdb_id}&apikey=d92401b9`);
          if (omdbRes.ok) {
            const omdb = await omdbRes.json();
            setOmdbData(omdb);
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to load details");
      } finally {
        setIsLoading(false);
      }

      window.scrollTo(0, 0);
    };

    fetchMovieData();
  }, [type, id]);

  // Single stable fetchReviews function (no branching issues)
  const fetchReviews = useCallback(async () => {
    try {
      const movieIdToQuery = String(id).trim();

      const { data: reviewsData, error: revErr } = await supabase
        .from('reviews')
        .select('*, replies:reviews!parent_id(*)')
        .eq('movie_id', movieIdToQuery)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (revErr) throw revErr;

      let likedSet = new Set();
      if (user) {
        const { data: likedData } = await supabase
          .from('review_likes')
          .select('review_id')
          .eq('user_id', user.id);
        likedSet = new Set(likedData?.map(l => l.review_id) || []);
      }

      const enriched = reviewsData.map(r => ({
        ...r,
        liked_by_current_user: likedSet.has(r.id),
        replies: r.replies?.map(reply => ({
          ...reply,
          liked_by_current_user: likedSet.has(reply.id)
        })) || []
      }));

      const sorted = enriched.map(r => ({
        ...r,
        replies: r.replies?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) || []
      }));

      setReviews(sorted);
      setReviewsError(null);
    } catch (err) {
      console.error("[fetchReviews] Error:", err);
      setReviewsError(err.message || 'Failed to load reviews');
    }
  }, [id, user]); // stable dependencies: id + user

  useEffect(() => {
    fetchReviews();

    const channel = supabase
      .channel(`reviews:${id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'reviews', 
        filter: `movie_id=eq.${id}` 
      }, () => {
        console.log('Real-time review change detected');
        fetchReviews();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'review_likes' 
      }, () => {
        console.log('Real-time like change detected');
        fetchReviews();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [id, fetchReviews]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert("Please login to post a review");
      return;
    }

    if (!userReview.trim()) return;

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([
          {
            movie_id: String(id),
            user_id: user.id,
            author: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
            content: userReview,
            rating: replyTo ? null : parseInt(userRating, 10),
            likes: 0,
            parent_id: replyTo || null
          }
        ])
        .select()
        .single();

      if (error) throw error;

      if (replyTo) {
        setReviews(prev => prev.map(r => {
          if (r.id === replyTo) {
            return { ...r, replies: [...(r.replies || []), data] };
          }
          return r;
        }));
      } else {
        setReviews(prev => [data, ...prev]);
      }

      setUserReview("");
      setUserRating(10);
      setReplyTo(null);
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to post: " + (err.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = async (reviewId, currentlyLiked, currentLikes) => {
    if (!user) {
      alert("Please login to like/unlike");
      return;
    }

    try {
      if (currentlyLiked) {
        await supabase
          .from('review_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('review_id', reviewId);

        await supabase
          .from('reviews')
          .update({ likes: Math.max(0, currentLikes - 1) })
          .eq('id', reviewId);
      } else {
        await supabase
          .from('review_likes')
          .insert({ user_id: user.id, review_id: reviewId });

        await supabase
          .from('reviews')
          .update({ likes: currentLikes + 1 })
          .eq('id', reviewId);
      }

      await fetchReviews();
    } catch (err) {
      console.error("Toggle like failed:", err);
      alert("Failed to update like");
    }
  };

  const handleDelete = async (reviewId) => {
    if (!user) {
      alert("Please login to delete");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this review/reply? This cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);  // Only owner can delete

      if (error) throw error;

      // No manual state update needed — real-time subscription calls fetchReviews()
      console.log("Delete successful:", reviewId);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete: " + (err.message || "You may not have permission"));
    }
  };

  const fetchCastBio = async (personId) => {
    if (castBios[personId]) return;

    try {
      const res = await fetch(`${BASE_URL}/person/${personId}?api_key=${API_KEY}`);
      const data = await res.json();
      setCastBios(prev => ({ ...prev, [personId]: data.biography || "No biography available." }));
    } catch (err) {
      console.error('Cast bio error:', err);
    }
  };

  const playVideo = (key) => {
    setActiveVideoKey(key);
    setShowTrailer(true);
  };

  const getRating = () => {
    if (!movie) return "Rated N/A";
    
    let certification = "N/A";
    
    if (type === 'movie') {
      const us = movie.release_dates?.results?.find(r => r.iso_3166_1 === "US");
      certification = us?.release_dates?.[0]?.certification || "N/A";
    } else {
      const us = movie.content_ratings?.results?.find(r => r.iso_3166_1 === "US");
      certification = us?.rating || "N/A";
    }

    certification = certification.replace(/^TV-/, '');
    return certification === "N/A" ? "Rated N/A" : `Rated ${certification}`;
  };

  const formatRuntime = (runtime, episodeRunTime) => {
    const n = runtime || episodeRunTime?.[0] || 0;
    if (!n) return "N/A";
    const h = Math.floor(n / 60);
    const m = n % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="h-screen bg-[#141414] flex flex-col items-center justify-center text-center px-6">
        <X size={64} className="text-red-600 mb-6" />
        <h2 className="text-3xl font-bold text-white mb-4">Error Loading Content</h2>
        <p className="text-lg text-gray-400 mb-8 max-w-md">{error || "Movie/TV details not found"}</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-8 py-4 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#141414] to-black text-white font-sans pb-20">
      {/* Trailer Modal */}
      {showTrailer && activeVideoKey && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl">
          <div className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-red-600/30">
            <button 
              onClick={() => setShowTrailer(false)} 
              className="absolute top-4 right-4 z-10 bg-black/70 p-3 rounded-full hover:bg-red-600 transition"
            >
              <X size={24} />
            </button>
            <iframe 
              src={`https://www.youtube.com/embed/${activeVideoKey}?autoplay=1&rel=0&modestbranding=1`}
              className="w-full h-full"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Cast Bio Modal */}
      {selectedCast && (
        <div className="fixed inset-0 z-[998] flex items-center justify-center bg-black/90 p-6 backdrop-blur-xl">
          <div className="relative w-full max-w-4xl bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedCast(null)}
              className="absolute top-6 right-6 z-10 p-4 bg-black/60 rounded-full hover:bg-red-600 transition"
            >
              <X size={28} />
            </button>

            <div className="p-8 md:p-10">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3">
                  <img
                    src={selectedCast.profile_path 
                      ? `https://image.tmdb.org/t/p/w500${selectedCast.profile_path}`
                      : "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500"}
                    alt={selectedCast.name}
                    className="w-full rounded-xl shadow-xl object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500";
                    }}
                  />
                </div>
                <div className="md:w-2/3">
                  <h2 className="text-3xl font-black mb-4">{selectedCast.name}</h2>
                  <p className="text-lg text-gray-400 mb-6">
                    {selectedCast.known_for_department || 'Actor'} • {selectedCast.birthday ? new Date(selectedCast.birthday).getFullYear() : 'N/A'} - {selectedCast.deathday ? new Date(selectedCast.deathday).getFullYear() : 'Present'}
                  </p>
                  <p className="text-gray-300 leading-relaxed text-base whitespace-pre-line">
                    {castBios[selectedCast.id] || "Loading biography..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative h-[80vh] w-full overflow-hidden">
        <img
          src={movie.backdrop_path 
            ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
            : "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1920"}
          alt={movie.title || movie.name}
          className="w-full h-full object-cover transform scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1920";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-transparent to-transparent" />

        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-20 left-6 md:left-10 p-3 bg-black/50 rounded-full hover:bg-red-600 transition backdrop-blur-sm z-50"
        >
          <ChevronLeft size={32} />
        </button>

        <div className="absolute bottom-12 left-6 md:left-10 right-6 z-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="bg-yellow-500 text-black px-3 py-1 rounded font-bold text-sm uppercase italic flex items-center gap-2">
              <Star size={14} className="fill-black" />
              {movie.vote_average?.toFixed(1) || '—'}
              {omdbData?.imdbRating && (
                <span className="text-xs opacity-80">(IMDb {omdbData.imdbRating})</span>
              )}
            </div>

            <div className="border border-white/40 px-3 py-1 rounded text-sm font-bold uppercase">
              {getRating()}
            </div>

            <span className="text-green-400 font-bold uppercase text-xs tracking-wider">98% Match</span>
            <span className="text-gray-300 font-medium text-sm">
              {movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0] || 'N/A'}
            </span>

            <span className="text-gray-400 text-sm font-medium">
              {movie.runtime 
                ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
                : movie.episode_run_time?.[0] 
                  ? `${movie.episode_run_time[0]}m/ep`
                  : 'N/A'}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-8 tracking-tight uppercase italic drop-shadow-2xl">
            {movie.title || movie.name || 'Untitled'}
          </h1>

          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => navigate(`/watch/${type}/${id}`)}
              className="flex items-center gap-3 px-10 py-4 bg-white text-black rounded-lg font-bold text-lg hover:bg-gray-200 transition active:scale-95 shadow-lg"
            >
              <Play fill="black" size={24} /> Play
            </button>
            
            <button 
              onClick={() => isInMyList(movie.id) ? removeFromMyList(movie.id) : addToMyList(movie)}
              className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-400 bg-black/40 hover:border-white transition active:scale-95 backdrop-blur-sm"
            >
              {isInMyList(movie.id) ? <Check size={24} /> : <Plus size={24} />}
            </button>

            {videos.length > 0 && (
              <button 
                onClick={() => setShowTrailer(true)}
                className="flex items-center gap-3 px-8 py-4 bg-zinc-800/80 backdrop-blur-md rounded-lg font-bold text-lg hover:bg-zinc-700 transition border border-white/10"
              >
                <Youtube size={20} className="text-red-600" /> Trailer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 md:px-12 py-10">
        <div className="flex gap-8 border-b border-white/10 mb-8 overflow-x-auto scrollbar-hide">
          {['storyline', 'details', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-base font-bold uppercase tracking-wide transition-all ${
                activeTab === tab 
                  ? 'text-red-600 border-b-4 border-red-600' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* STORYLINE */}
        {activeTab === 'storyline' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-gray-300 text-xl leading-relaxed font-light max-w-5xl">
              {movie.overview || "No overview available."}
            </p>

            <section>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Users size={24} className="text-red-600" /> Featured Cast
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {movie.credits?.cast?.slice(0, 12).map(person => (
                  <div 
                    key={person.id} 
                    className="group cursor-pointer text-center"
                    onClick={() => {
                      fetchCastBio(person.id);
                      setSelectedCast(person);
                    }}
                  >
                    <div className="w-full aspect-square rounded-full overflow-hidden border-4 border-zinc-800 group-hover:border-red-600 transition-all duration-500 shadow-xl">
                      <img 
                        src={person.profile_path 
                          ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
                          : "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500"}
                        alt={person.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-500 scale-100 group-hover:scale-110"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500";
                        }}
                      />
                    </div>
                    <p className="mt-3 font-bold text-white text-sm group-hover:text-red-500 transition">
                      {person.name}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {person.character}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* DETAILS */}
        {activeTab === 'details' && (
          <div className="animate-in fade-in space-y-12">
            <section className="bg-zinc-900/50 backdrop-blur-xl p-8 rounded-2xl border border-zinc-800 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Info size={24} className="text-red-600" /> Story & Details
              </h3>
              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <p className="text-gray-300 leading-relaxed text-base">
                    {movie.overview || "No detailed overview available."}
                  </p>
                </div>
                <div className="space-y-6 text-gray-300 text-base">
                  <div className="flex items-center gap-4">
                    <Calendar size={20} />
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wider">Release</p>
                      <p className="font-medium">{movie.release_date || movie.first_air_date || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Clock size={20} />
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wider">Runtime</p>
                      <p className="font-medium">{formatRuntime(movie.runtime, movie.episode_run_time)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Globe size={20} />
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wider">Status</p>
                      <p className="font-medium">{movie.status || 'Released'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Award size={20} />
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wider">Rating</p>
                      <p className="font-medium">{getRating()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {movie.keywords?.keywords?.length > 0 && (
              <section>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <Award size={24} className="text-red-600" /> Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {movie.keywords.keywords.slice(0, 15).map(kw => (
                    <span 
                      key={kw.id} 
                      className="px-4 py-1.5 bg-zinc-800 rounded-full text-sm text-gray-300 hover:bg-zinc-700 transition"
                    >
                      {kw.name}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="animate-in fade-in space-y-12">
            <section className="bg-zinc-900/70 backdrop-blur-xl p-8 rounded-2xl border border-zinc-800 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <MessageSquare size={24} className="text-red-600" /> Your Review
              </h3>

              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {!replyTo && (
                    <>
                      <label className="text-gray-300 font-medium min-w-[120px]">Rating</label>
                      <div className="flex gap-2 flex-wrap">
                        {[1,2,3,4,5,6,7,8,9,10].map(r => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setUserRating(r)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold transition-all ${
                              userRating === r 
                                ? 'bg-red-600 text-white scale-110 shadow-lg' 
                                : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:scale-105'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-2">
                    {replyTo ? 'Reply to comment' : 'Write a review'}
                  </label>
                  <textarea
                    value={userReview}
                    onChange={e => setUserReview(e.target.value)}
                    className="w-full h-32 p-4 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/30 resize-none placeholder:text-gray-500 text-base"
                    placeholder={replyTo ? "Write your reply..." : "Share your thoughts..."}
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || !user || !userReview.trim()}
                    className={`px-8 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-xl active:scale-95 flex items-center gap-3 ${
                      isSubmitting || !user || !userReview.trim() ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Send size={20} /> {isSubmitting ? 'Submitting...' : (replyTo ? 'Reply' : 'Post')}
                  </button>
                  {replyTo && (
                    <button
                      type="button"
                      onClick={() => setReplyTo(null)}
                      className="px-8 py-4 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section>
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <MessageSquare size={24} className="text-red-600" /> Reviews ({reviews.length})
              </h3>

              {reviewsError ? (
                <div className="bg-red-900/30 p-6 rounded-2xl text-center border border-red-800">
                  <p className="text-lg text-red-300">Reviews failed to load</p>
                  <p className="text-sm text-red-400 mt-2">{reviewsError}</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="bg-zinc-900/50 p-10 rounded-2xl text-center border border-zinc-800">
                  <p className="text-xl text-gray-400">No reviews yet</p>
                  <p className="text-gray-500 mt-3">Be the first to review!</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {reviews.map(review => (
                    <ReviewItem 
                      key={review.id}
                      review={review}
                      currentUser={user}
                      onToggleLike={handleToggleLike}
                      onReply={(parentId) => setReplyTo(parentId)}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <section ref={recommendationsRef} className="px-6 md:px-12 pt-16 border-t border-white/5">
        <div className="flex items-center gap-6 mb-10">
          <h3 className="text-4xl font-black italic uppercase tracking-tighter">You Might Like</h3>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-red-600 to-transparent opacity-30" />
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {similar.map(item => (
            <div 
              key={item.id} 
              onClick={() => navigate(`/details/${type}/${item.id}`)} 
              className="group cursor-pointer"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-900 shadow-xl transition-all duration-500 group-hover:ring-2 group-hover:ring-red-600/50">
                <img 
                  src={item.poster_path 
                    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                    : "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500"}
                  alt={item.title || item.name}
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4">
                  <p className="font-bold text-white text-sm line-clamp-2">
                    {item.title || item.name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// Reusable Review Item with delete button for owner only
function ReviewItem({ review, currentUser, onToggleLike, onReply, onDelete }) {
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const isOwner = currentUser && review.user_id === currentUser.id;
  const hasLiked = review.liked_by_current_user || false;

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([
          {
            movie_id: review.movie_id,
            user_id: currentUser.id,
            author: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Anonymous',
            content: replyText,
            rating: null,
            likes: 0,
            parent_id: review.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      onReply(review.id);
      setReplyText("");
      setIsReplying(false);
    } catch (err) {
      console.error("Reply error:", err);
      alert("Failed to reply");
    }
  };

  return (
    <div className="bg-zinc-900/70 backdrop-blur-xl p-6 rounded-2xl border border-zinc-800 shadow-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-400 flex items-center justify-center font-black text-xl text-white shadow-lg">
            {review.author[0].toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-lg text-white">{review.author}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {review.rating && (
            <div className="flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-full">
              <Star size={18} className="text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-base">{review.rating}</span>
            </div>
          )}

          {isOwner && (
            <button
              onClick={() => onDelete(review.id)}
              className="text-red-500 hover:text-red-400 transition p-1 rounded hover:bg-red-900/20"
              title="Delete this review"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      <p className="text-gray-200 leading-relaxed text-base mb-4">
        {review.content}
      </p>

      <div className="flex items-center gap-6 text-gray-400 text-sm">
        <button 
          onClick={() => onToggleLike(review.id, hasLiked, review.likes || 0)}
          className="flex items-center gap-2 hover:text-red-400 transition"
        >
          <Heart 
            size={18} 
            fill={hasLiked ? "#dc2626" : "none"} 
            color={hasLiked ? "#dc2626" : "#9ca3af"}
          /> 
          {review.likes || 0}
        </button>
        <button 
          onClick={() => setIsReplying(!isReplying)}
          className="flex items-center gap-2 hover:text-red-400 transition"
        >
          <Reply size={18} /> {isReplying ? 'Cancel' : 'Reply'}
        </button>
      </div>

      {isReplying && (
        <form onSubmit={handleReplySubmit} className="mt-4 pl-10">
          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            className="w-full h-24 p-4 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-600 resize-none placeholder:text-gray-500 text-base"
            placeholder="Write your reply..."
          />
          <div className="flex gap-4 mt-2">
            <button
              type="submit"
              disabled={!replyText.trim()}
              className={`px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition ${!replyText.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Send Reply
            </button>
            <button
              type="button"
              onClick={() => setIsReplying(false)}
              className="px-6 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {review.replies?.length > 0 && (
        <div className="mt-6 pl-10 border-l-2 border-zinc-700 space-y-6">
          {review.replies.map(reply => (
            <ReviewItem 
              key={reply.id}
              review={reply}
              currentUser={currentUser}
              onToggleLike={onToggleLike}
              onReply={() => setIsReplying(true)}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MovieDetailPage;