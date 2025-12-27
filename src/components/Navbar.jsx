import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isLandingPage = location.pathname === '/' && !user;

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const searchRef = useRef(null); 

  const toggleProfile = () => setProfileOpen(!profileOpen);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const toggleSearch = () => setSearchOpen(!searchOpen);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
        setQuery('');
        setResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced TMDB search
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
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const displayName = user 
    ? (user.displayName || user.email?.split('@')[0] || 'User')
    : 'Guest';

  // Minimal Netflix-style navbar for landing page only (when not logged in)
  if (isLandingPage) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-6 sm:px-12 lg:px-24 py-6">
          <Link to="/" className="text-3xl sm:text-4xl font-bold text-red-600">
            PrimeScene
          </Link>

          <Link 
            to="/login"
            className="px-6 py-2 bg-red-600 text-white text-sm sm:text-base font-medium rounded hover:bg-red-700 transition"
          >
            Sign In
          </Link>
        </div>
      </nav>
    );
  }

  // Full navbar for logged-in users and all other pages
  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-md' : 'bg-transparent'}`}>
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-12 py-4">
          {/* Left */}
          <div className="flex items-center gap-4 sm:gap-8">
            <Link to="/" className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-600 hover:text-red-400 transition">
              PrimeScene
            </Link>

            {/* Desktop menu */}
            <ul className="hidden lg:flex items-center gap-6 text-white text-base font-medium">
              <li><Link to="/" className="hover:text-gray-300 transition">Home</Link></li>
              <li><Link to="/shows" className="hover:text-gray-300 transition">Shows</Link></li>
              <li><Link to="/movies" className="hover:text-gray-300 transition">Movies</Link></li>
              <li><Link to="/games" className="hover:text-gray-300 transition">Games</Link></li>
              <li><Link to="/new-popular" className="hover:text-gray-300 transition">New & Popular</Link></li>
              <li><Link to="/my-list" className="hover:text-gray-300 transition">My List</Link></li>
              <li><Link to="/browse-languages" className="hover:text-gray-300 transition">Browse by Languages</Link></li>
            </ul>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4 sm:gap-6 text-white">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <Search 
                className="w-6 h-6 cursor-pointer hover:text-gray-300 transition hidden sm:block"
                onClick={toggleSearch}
              />
              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 sm:w-80 bg-black/95 backdrop-blur-md rounded-lg shadow-2xl border border-white/10 overflow-hidden">
                  <input
                    type="text"
                    placeholder="Titles, people, genres..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
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

            <Bell className="w-6 h-6 cursor-pointer hover:text-gray-300 transition hidden sm:block" />

            {/* Desktop Profile */}
            <div className="relative hidden sm:block">
              <button 
                onClick={toggleProfile}
                className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-red-400 transition"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-black/95 backdrop-blur-md rounded-lg shadow-2xl border border-white/10 py-2 z-50">
                  <div className="px-4 py-2 text-white text-sm border-b border-white/10">
                    {displayName}
                  </div>
                  <Link to="/manage-profiles" onClick={toggleProfile} className="block px-4 py-2 text-white hover:bg-white/10 transition text-sm">
                    Manage Profiles
                  </Link>
                  <Link to="/account" onClick={toggleProfile} className="block px-4 py-2 text-white hover:bg-white/10 transition text-sm">
                    Account
                  </Link>
                  <Link to="/help" onClick={toggleProfile} className="block px-4 py-2 text-white hover:bg-white/10 transition text-sm">
                    Help Center
                  </Link>
                  <button 
                    onClick={async () => {
                      await logout();
                      toggleProfile();
                    }} 
                    className="block w-full text-left px-4 py-2 text-white hover:bg-white/10 transition text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button onClick={toggleMobileMenu} className="lg:hidden">
              {mobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Side Menu */}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-black/95 backdrop-blur-lg transform transition-transform duration-300 lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full pt-20 px-6">
          <ul className="space-y-6 text-white text-lg font-medium">
            <li><Link to="/" onClick={closeMobileMenu} className="block hover:text-gray-300 transition">Home</Link></li>
            <li><Link to="/shows" onClick={closeMobileMenu} className="block hover:text-gray-300 transition">Shows</Link></li>
            <li><Link to="/movies" onClick={closeMobileMenu} className="block hover:text-gray-300 transition">Movies</Link></li>
            <li><Link to="/games" onClick={closeMobileMenu} className="block hover:text-gray-300 transition">Games</Link></li>
            <li><Link to="/new-popular" onClick={closeMobileMenu} className="block hover:text-gray-300 transition">New & Popular</Link></li>
            <li><Link to="/my-list" onClick={closeMobileMenu} className="block hover:text-gray-300 transition">My List</Link></li>
            <li><Link to="/browse-languages" onClick={closeMobileMenu} className="block hover:text-gray-300 transition">Browse by Languages</Link></li>
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
              <Link to="/account" onClick={closeMobileMenu} className="block hover:text-white transition">Account</Link>
              <Link to="/help" onClick={closeMobileMenu} className="block hover:text-white transition">Help Center</Link>
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