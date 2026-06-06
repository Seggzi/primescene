import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, SkipForward, SkipBack,
  Maximize, Minimize, Play, Pause,
  RotateCcw, List, X, Layers, Loader2
} from 'lucide-react';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE    = 'https://api.themoviedb.org/3';

export default function PlayerPage() {
  const { type = 'movie', id } = useParams();
  const navigate    = useNavigate();
  const playerRef   = useRef(null);   // YouTube player instance (YT.Player)
  const containerRef= useRef(null);   // div the YT player mounts into
  const wrapperRef  = useRef(null);   // fullscreen wrapper
  const uiTimer     = useRef(null);

  // ── META ──────────────────────────────────────────────────────────────────
  const [meta,            setMeta]            = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [videoKey,        setVideoKey]        = useState('');
  const [recommendations, setRecommendations] = useState([]);

  // ── TV ────────────────────────────────────────────────────────────────────
  const [seasons,       setSeasons]       = useState([]);
  const [episodes,      setEpisodes]      = useState([]);
  const [activeSeason,  setActiveSeason]  = useState(1);
  const [activeEpisode, setActiveEpisode] = useState(1);
  const [loadingEps,    setLoadingEps]    = useState(false);

  // ── PLAYER ────────────────────────────────────────────────────────────────
  const [isPlaying,    setIsPlaying]    = useState(false);
  const [isPaused,     setIsPaused]     = useState(false);
  const [showUI,       setShowUI]       = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ytReady,      setYtReady]      = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [currentTime,  setCurrentTime]  = useState(0);
  const progressTimer  = useRef(null);

  // ── PANELS ────────────────────────────────────────────────────────────────
  const [panel, setPanel] = useState(null);

  // ── FETCH META + TRAILER ─────────────────────────────────────────────────
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setVideoKey('');
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(0);
      try {
        const res  = await fetch(
          `${BASE}/${type}/${id}?api_key=${API_KEY}&append_to_response=videos,recommendations`
        );
        const data = await res.json();
        setMeta(data);
        setRecommendations(data.recommendations?.results?.slice(0, 12) || []);

        if (type === 'tv' && data.seasons)
          setSeasons(data.seasons.filter(s => s.season_number > 0));

        // Pick best trailer
        const videos = data.videos?.results || [];
        const trailer =
          videos.find(v => v.site === 'YouTube' && v.type === 'Trailer') ||
          videos.find(v => v.site === 'YouTube' && v.type === 'Teaser')  ||
          videos.find(v => v.site === 'YouTube');

        if (trailer) setVideoKey(trailer.key);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    run();
  }, [type, id]);

  // ── FETCH EPISODES ────────────────────────────────────────────────────────
  useEffect(() => {
    if (type !== 'tv') return;
    const run = async () => {
      setLoadingEps(true);
      try {
        const res  = await fetch(`${BASE}/tv/${id}/season/${activeSeason}?api_key=${API_KEY}`);
        const data = await res.json();
        setEpisodes(data.episodes || []);
      } catch (e) { console.error(e); }
      finally { setLoadingEps(false); }
    };
    run();
  }, [type, id, activeSeason]);

  // ── LOAD YOUTUBE IFRAME API ───────────────────────────────────────────────
  useEffect(() => {
    if (!videoKey) return;

    const initPlayer = () => {
      if (!containerRef.current) return;
      // Destroy old instance if exists
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch(_) {}
        playerRef.current = null;
      }

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: videoKey,
        playerVars: {
          autoplay:       1,
          controls:       0,   // hide YouTube controls — we use our own
          rel:            0,
          modestbranding: 1,
          showinfo:       0,
          iv_load_policy: 3,
          disablekb:      0,
          fs:             0,
          playsinline:    1,
        },
        events: {
          onReady: (e) => {
            setYtReady(true);
            e.target.playVideo();
            setIsPlaying(true);
            setDuration(e.target.getDuration());
          },
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setIsPaused(false);
              startProgressTimer();
            } else if (e.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              setIsPaused(true);
              stopProgressTimer();
            } else if (e.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              setIsPaused(false);
              stopProgressTimer();
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Load the API script once
      if (!document.getElementById('yt-api')) {
        const s = document.createElement('script');
        s.id  = 'yt-api';
        s.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(s);
      }
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      stopProgressTimer();
    };
  }, [videoKey]);

  // ── PROGRESS TIMER ────────────────────────────────────────────────────────
  const startProgressTimer = () => {
    stopProgressTimer();
    progressTimer.current = setInterval(() => {
      if (!playerRef.current) return;
      try {
        const t = playerRef.current.getCurrentTime();
        const d = playerRef.current.getDuration();
        setCurrentTime(t);
        setDuration(d);
        setProgress(d > 0 ? (t / d) * 100 : 0);
      } catch(_) {}
    }, 500);
  };

  const stopProgressTimer = () => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  };

  // ── PLAY / PAUSE ──────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    if (!playerRef.current || !ytReady) return;
    try {
      const state = playerRef.current.getPlayerState();
      if (state === window.YT.PlayerState.PLAYING) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch(_) {}
  }, [ytReady]);

  // ── SEEK ON PROGRESS BAR CLICK ────────────────────────────────────────────
  const seekTo = (e) => {
    if (!playerRef.current || !ytReady || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    playerRef.current.seekTo(pct * duration, true);
    setProgress(pct * 100);
  };

  // ── UI AUTO-HIDE ──────────────────────────────────────────────────────────
  const resetTimer = useCallback(() => {
    setShowUI(true);
    clearTimeout(uiTimer.current);
    uiTimer.current = setTimeout(() => {
      if (!panel) setShowUI(false);
    }, 3500);
  }, [panel]);

  useEffect(() => { resetTimer(); return () => clearTimeout(uiTimer.current); }, []);
  useEffect(() => { panel ? setShowUI(true) : resetTimer(); }, [panel]);

  // ── FULLSCREEN ────────────────────────────────────────────────────────────
  const toggleFS = useCallback(() => {
    if (!document.fullscreenElement) wrapperRef.current?.requestFullscreen();
    else document.exitFullscreen();
  }, []);

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  // ── NEXT / PREV ───────────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    if (type === 'tv') {
      if (activeEpisode < episodes.length) setActiveEpisode(e => e + 1);
      else if (activeSeason < seasons.length) { setActiveSeason(s => s + 1); setActiveEpisode(1); }
    } else {
      if (recommendations[0]) navigate(`/watch/movie/${recommendations[0].id}`);
    }
  }, [type, activeEpisode, episodes.length, activeSeason, seasons.length, recommendations, navigate]);

  const goPrev = useCallback(() => {
    if (type === 'tv' && activeEpisode > 1) setActiveEpisode(e => e - 1);
  }, [type, activeEpisode]);

  // ── KEYBOARD ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch (e.code) {
        case 'Space':      e.preventDefault(); togglePlay(); resetTimer(); break;
        case 'KeyF':       e.preventDefault(); toggleFS(); break;
        case 'ArrowRight': e.preventDefault(); goNext(); resetTimer(); break;
        case 'ArrowLeft':  e.preventDefault(); goPrev(); resetTimer(); break;
        case 'KeyE':       if (type === 'tv') { e.preventDefault(); setPanel(p => p === 'episodes' ? null : 'episodes'); } break;
        case 'KeyM':       e.preventDefault(); setPanel(p => p === 'recs' ? null : 'recs'); break;
        case 'Escape':     e.preventDefault(); if (panel) setPanel(null); else navigate(-1); break;
        default: break;
      }
      resetTimer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, toggleFS, goNext, goPrev, panel, navigate, resetTimer, type]);

  // ── FORMAT TIME ───────────────────────────────────────────────────────────
  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const title     = meta?.title || meta?.name || '...';
  const year      = (meta?.release_date || meta?.first_air_date || '').slice(0, 4);
  const currentEp = episodes.find(e => e.episode_number === activeEpisode);
  const toggleP   = (p) => setPanel(prev => prev === p ? null : p);

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
        <Loader2 size={36} className="text-white/30 animate-spin" />
      </div>
    );
  }

  // ── NO TRAILER ────────────────────────────────────────────────────────────
  if (!videoKey && !loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-white/40 text-sm">No trailer available for this title.</p>
        <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white text-sm underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 bg-black z-[9999] flex flex-col select-none"
      style={{ cursor: showUI ? 'default' : 'none' }}
      onMouseMove={resetTimer}
    >
      {/* ── YOUTUBE PLAYER DIV ── */}
      <div className="absolute inset-0 z-0" onClick={togglePlay}>
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* ── PAUSE OVERLAY ── */}
      {isPaused && (
        <div className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <Pause size={28} fill="white" className="text-white" />
          </div>
        </div>
      )}

      {/* ── TOP GRADIENT ── */}
      <div className={`absolute top-0 inset-x-0 z-10 pointer-events-none
        bg-gradient-to-b from-black/80 via-black/20 to-transparent h-32
        transition-opacity duration-300 ${showUI ? 'opacity-100' : 'opacity-0'}`} />

      {/* ── TOP BAR ── */}
      <div className={`absolute top-0 inset-x-0 z-20 px-4 md:px-6 pt-4
        transition-all duration-300
        ${showUI ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-white/80 hover:text-white transition"
          >
            <ChevronLeft size={20} />
            <span className="text-sm hidden md:block">Back</span>
          </button>
          <div className="flex-1 min-w-0 ml-1">
            <p className="text-white font-semibold text-sm md:text-base truncate">{title}</p>
            <p className="text-white/40 text-[11px] font-mono">
              {year}
              {type === 'tv' && ` · S${String(activeSeason).padStart(2,'0')} E${String(activeEpisode).padStart(2,'0')}`}
              {currentEp && ` · ${currentEp.name}`}
              <span className="ml-2 text-white/25 uppercase tracking-wider">Trailer</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── BOTTOM GRADIENT ── */}
      <div className={`absolute bottom-0 inset-x-0 z-10 pointer-events-none
        bg-gradient-to-t from-black/90 via-black/40 to-transparent h-36
        transition-opacity duration-300 ${showUI ? 'opacity-100' : 'opacity-0'}`} />

      {/* ── BOTTOM CONTROLS ── */}
      <div className={`absolute bottom-0 inset-x-0 z-20 px-4 md:px-6 pb-5
        transition-all duration-300
        ${showUI ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>

        {/* Progress bar — real scrubbing via YT API */}
        <div
          className="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer group relative"
          style={{ height: '3px' }}
          onClick={seekTo}
          onMouseEnter={e => e.currentTarget.style.height = '5px'}
          onMouseLeave={e => e.currentTarget.style.height = '3px'}
        >
          <div
            className="h-full bg-white rounded-full transition-none relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full
                            shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            {type === 'tv' && (
              <button onClick={goPrev} disabled={activeEpisode <= 1}
                className="text-white/60 hover:text-white transition disabled:opacity-30">
                <SkipBack size={19} />
              </button>
            )}

            {/* Play / Pause button */}
            <button
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center
                         hover:scale-110 active:scale-95 transition-transform shadow-lg"
            >
              {isPlaying
                ? <Pause size={16} fill="black" className="text-black" />
                : <Play  size={16} fill="black" className="text-black ml-0.5" />
              }
            </button>

            <button onClick={goNext} className="text-white/60 hover:text-white transition">
              <SkipForward size={19} />
            </button>

            {/* Time */}
            <span className="text-white/40 text-xs font-mono tabular-nums hidden md:block">
              {fmt(currentTime)} / {fmt(duration)}
            </span>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 md:gap-3">
            {type === 'tv' && (
              <CtrlBtn icon={<List size={14} />} label="Episodes"
                active={panel === 'episodes'} onClick={() => toggleP('episodes')} />
            )}
            <CtrlBtn icon={<Layers size={14} />} label="More"
              active={panel === 'recs'} onClick={() => toggleP('recs')} />
            <button onClick={toggleFS} className="text-white/60 hover:text-white transition ml-1">
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* ══ PANELS ══ */}
      {panel && <div className="absolute inset-0 z-[25]" onClick={() => setPanel(null)} />}

      {/* EPISODES PANEL */}
      {type === 'tv' && (
        <SidePanel open={panel === 'episodes'} onClose={() => setPanel(null)}
          title={title} subtitle={`Season ${activeSeason}`} wide>
          <div className="flex gap-2 flex-wrap mb-4">
            {seasons.map(s => (
              <button key={s.id} onClick={() => setActiveSeason(s.season_number)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition
                  ${activeSeason === s.season_number ? 'bg-white text-black' : 'bg-white/8 text-white/40 hover:bg-white/15 hover:text-white'}`}>
                S{String(s.season_number).padStart(2,'0')}
              </button>
            ))}
          </div>
          {loadingEps
            ? <div className="flex justify-center py-10"><Loader2 size={22} className="text-white/30 animate-spin" /></div>
            : (
              <div className="space-y-1 max-h-[58vh] overflow-y-auto pr-1 custom-scrollbar">
                {episodes.map(ep => {
                  const active = ep.episode_number === activeEpisode;
                  return (
                    <button key={ep.id}
                      onClick={() => { setActiveEpisode(ep.episode_number); setPanel(null); }}
                      className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition
                        ${active ? 'bg-white/15 ring-1 ring-white/20' : 'hover:bg-white/7'}`}>
                      <div className="relative w-[88px] flex-shrink-0 aspect-video rounded-md overflow-hidden bg-white/5">
                        {ep.still_path
                          ? <img src={`https://image.tmdb.org/t/p/w200${ep.still_path}`} className="w-full h-full object-cover" alt="" />
                          : <div className="absolute inset-0 flex items-center justify-center"><Play size={12} className="text-white/20" /></div>
                        }
                        {active && <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        </div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-semibold truncate">
                          <span className="text-white/35 mr-1">E{String(ep.episode_number).padStart(2,'0')}</span>
                          {ep.name}
                        </p>
                        <p className="text-white/30 text-[10px] mt-0.5 line-clamp-2 leading-relaxed">
                          {ep.overview || '—'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )
          }
        </SidePanel>
      )}

      {/* RECOMMENDATIONS PANEL */}
      <SidePanel open={panel === 'recs'} onClose={() => setPanel(null)}
        title="More Like This" subtitle={title} wide>
        <div className="grid grid-cols-2 gap-2.5 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
          {recommendations.map(item => (
            <button key={item.id}
              onClick={() => { navigate(`/watch/${type}/${item.id}`); setPanel(null); }}
              className="text-left group">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-white/5 mb-1.5">
                {item.backdrop_path
                  ? <img src={`https://image.tmdb.org/t/p/w300${item.backdrop_path}`}
                      className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" alt="" />
                  : <div className="absolute inset-0 flex items-center justify-center"><Play size={16} className="text-white/15" /></div>
                }
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play size={12} fill="white" className="text-white ml-0.5" />
                  </div>
                </div>
              </div>
              <p className="text-white/75 text-xs font-medium truncate group-hover:text-white transition-colors">
                {item.title || item.name}
              </p>
              <p className="text-white/25 text-[10px] font-mono">
                {(item.release_date || item.first_air_date || '').slice(0,4)}
                {item.vote_average > 0 && ` · ★ ${item.vote_average.toFixed(1)}`}
              </p>
            </button>
          ))}
        </div>
      </SidePanel>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 99px; }
        /* Make YouTube iframe fill its container */
        #${containerRef.current?.id} iframe,
        [data-yt] iframe { width: 100% !important; height: 100% !important; }
      `}</style>
    </div>
  );
}

function CtrlBtn({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold transition
        ${active ? 'bg-white text-black' : 'bg-white/10 text-white/60 hover:bg-white/18 hover:text-white'}`}>
      {icon}
      <span className="hidden md:block">{label}</span>
    </button>
  );
}

function SidePanel({ open, onClose, title, subtitle, children, wide = false }) {
  return (
    <div className={`absolute right-0 top-0 bottom-0 z-30 flex flex-col
      bg-[#0f0f0f]/97 backdrop-blur-2xl border-l border-white/8
      transition-all duration-300 ease-out
      ${wide ? 'w-full md:w-[400px]' : 'w-full md:w-[300px]'}
      ${open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
      <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/8 flex-shrink-0">
        <div>
          <h3 className="text-white font-semibold text-sm">{title}</h3>
          {subtitle && <p className="text-white/30 text-xs mt-0.5">{subtitle}</p>}
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white transition p-1 -mr-1 -mt-1">
          <X size={17} />
        </button>
      </div>
      <div className="flex-1 overflow-hidden px-5 py-4">{children}</div>
    </div>
  );
}