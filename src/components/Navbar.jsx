// src/components/Navbar.jsx - BELL ICON NOW GOES TO /notifications

import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isMinimalPage = (location.pathname === '/' || location.pathname === '/login') && !user;

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const searchRef = useRef(null);
  const profileRef = useRef(null);

  const toggleProfile = () => setProfileOpen(!profileOpen);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const toggleSearch = () => setSearchOpen(!searchOpen);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length > 0) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    } else {
      navigate(user ? '/home' : '/');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setSearchOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
        setQuery('');
        setResults([]);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?api_key=${import.meta.env.VITE_TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`
        );
        const data = await res.json();
        setResults(data.results?.slice(0, 8) || []);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll); // ← FIXED
  }, []);

  const displayName = user
    ? (user.displayName || user.email?.split('@')[0] || 'User')
    : 'Guest';

  const logoLink = user ? '/home' : '/';

  if (isMinimalPage) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-6 sm:px-12 lg:px-24 py-6">
          <Link to={logoLink} className="text-3xl sm:text-4xl font-bold text-red-600">
            PrimeScene
          </Link>
          {location.pathname !== '/login' && (
            <Link
              to="/login"
              className="px-6 py-2 bg-red-600 text-white text-sm sm:text-base font-medium rounded hover:bg-red-700 transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black' : 'bg-transparent'}`}>
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-12 py-4">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link to={logoLink} className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-600 hover:text-red-400 transition">
              PrimeScene
            </Link>

            <ul className="hidden lg:flex items-center gap-6 text-white text-sm font-medium">
              <li><Link to="/home" className="hover:text-gray-300 transition">Home</Link></li>
              <li><Link to="/tv-shows" className="hover:text-gray-300 transition">TV Shows</Link></li>
              <li><Link to="/movies" className="hover:text-gray-300 transition">Movies</Link></li>
              <li><Link to="/animation" className="hover:text-gray-300 transition">Animation</Link></li>
              <li><Link to="/novels" className="hover:text-gray-300 transition">Novels</Link></li>
              <li><Link to="/most-watched" className="hover:text-gray-300 transition">Most Watched</Link></li>
              <li><Link to="/my-list" className="hover:text-gray-300 transition">My List</Link></li>
            </ul>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-white">
            <div className="relative" ref={searchRef}>
              <Search
                className="w-6 h-6 cursor-pointer hover:text-gray-300 transition"
                onClick={toggleSearch}
              />
              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 sm:w-80 bg-black/95 backdrop-blur-md rounded-lg shadow-2xl border border-white/10 overflow-hidden">
                  <input
                    type="text"
                    placeholder="Start typing to search..."
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="w-full px-4 py-3 bg-transparent text-white placeholder-white/60 focus:outline-none"
                    autoFocus
                  />
                  <div className="max-h-96 overflow-y-auto">
                    {loading && (
                      <p className="px-4 py-3 text-white/60 text-sm">Searching...</p>
                    )}
                    {results.length > 0 ? (
                      results.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 px-4 py-3 hover:bg-white/10 transition cursor-pointer"
                          onClick={() => {
                            setSearchOpen(false);
                            setQuery('');
                            window.dispatchEvent(new CustomEvent('openMovieModal', { detail: item }));
                          }}
                        >
                          <img
                            src={item.poster_path || item.profile_path
                              ? `https://image.tmdb.org/t/p/w92${item.poster_path || item.profile_path}`
                              : 'https://via.placeholder.com/92x138?text=No+Image'}
                            alt={item.title || item.name}
                            className="w-12 h-18 object-cover rounded"
                          />
                          <div>
                            <p className="text-white font-medium text-sm">
                              {item.title || item.name}
                            </p>
                            <p className="text-white/60 text-xs capitalize">
                              {item.media_type}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      !loading && query && <p className="px-4 py-3 text-white/60 text-sm">No results found</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* RED BELL ICON - NOW GOES TO /notifications */}
            <button
              onClick={() => navigate('/notifications')} // ← CHANGED TO /notifications
              className="relative p-3 rounded-full hover:bg-white/10 transition group hidden md:block"
            >
              <Bell size={24} className="text-white group-hover:text-red-500 transition" />
            </button>

            <div className="relative" ref={profileRef}>
              <button
                onClick={toggleProfile}
                className="flex items-center gap-2 hover:opacity-80 transition"
              >
                <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold text-sm">
                  {displayName[0].toUpperCase()}
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-3 w-56 bg-black border border-white/20 rounded-lg shadow-2xl overflow-hidden z-50">
                  <div className="py-3 border-b border-white/10">
                    <div className="px-4 py-2 flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center text-white font-bold">
                        {displayName[0].toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{displayName}</span>
                    </div>
                  </div>
                  <div className="py-2">
                    <Link to="/manage-profile" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-white hover:bg-white/10 transition text-sm">
                      Manage Profile
                    </Link>
                    <Link to="/account-settings" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-white hover:bg-white/10 transition text-sm">
                      Account Settings
                    </Link>
                    <Link to="/help-center" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-white hover:bg-white/10 transition text-sm">
                      Help Center
                    </Link>
                  </div>
                  <div className="py-2 border-t border-white/10">
                    <button
                      onClick={async () => {
                        await logout();
                        setProfileOpen(false);
                        navigate('/');
                      }}
                      className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition text-sm font-medium"
                    >
                      Sign out of PrimeScene
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={toggleMobileMenu} className="lg:hidden">
              {mobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-black/95 backdrop-blur-lg transform transition-transform duration-300 lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full pt-20 px-6">
          <ul className="space-y-6 text-white text-lg font-medium">
            <li><Link to="/home" onClick={closeMobileMenu} className="block hover:text-gray-300 transition">Home</Link></li>
            <li><Link to="/tv-shows" onClick={closeMobileMenu} className="block hover:text-gray-300 transition">TV Shows</Link></li>
            <li><Link to="/movies" onClick={closeMobileMenu} className="block hover:text-gray-300 transition">Movies</Link></li>
            <li><Link to="/animation" onClick={closeMobileMenu} className="block hover:text-gray-300 transition">Animation</Link></li>
            <li><Link to="/novels" onClick={closeMobileMenu} className="block hover:text-gray-300 transition">Novels</Link></li>
            <li><Link to="/most-watched" onClick={closeMobileMenu} className="block hover:text-gray-300 transition">Most Watched</Link></li>
            <li><Link to="/my-list" onClick={closeMobileMenu} className="block hover:text-gray-300 transition">My List</Link></li>
            <li><Link to="/notifications" onClick={closeMobileMenu} className="block hover:text-gray-300 transition">Notifications</Link></li> {/* ← Added for mobile */}
          </ul>

          <div className="mt-auto mb-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                {user ? displayName[0].toUpperCase() : 'G'}
              </div>
              <div>
                <p className="text-white font-medium">{displayName}</p>
                <p className="text-white/70 text-sm">Switch Profile</p>
              </div>
            </div>
            <div className="space-y-3 text-white/80 text-sm">
              <Link to="/manage-profile" onClick={closeMobileMenu} className="block hover:text-white transition">Manage Profile</Link>
              <Link to="/account-settings" onClick={closeMobileMenu} className="block hover:text-white transition">Account Settings</Link>
              <Link to="/help-center" onClick={closeMobileMenu} className="block hover:text-white transition">Help Center</Link>
              <Link to="/notifications" onClick={closeMobileMenu} className="block hover:text-white transition">Notifications</Link>
              <button
                onClick={async () => {
                  await logout();
                  closeMobileMenu();
                }}
                className="block w-full text-left hover:text-white transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/70 z-30 lg:hidden" onClick={closeMobileMenu} />
      )}
    </>
  );
}

export default Navbar;