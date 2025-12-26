import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, ChevronDown, Menu, X } from 'lucide-react';

function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleProfile = () => setProfileOpen(!profileOpen);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-md' : 'bg-transparent'}`}>
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-12 py-4">
          {/* Left side */}
          <div className="flex items-center gap-4 sm:gap-8">
            <Link 
              to="/" 
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-600 hover:text-red-400 transition"
            >
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

          {/* Right side */}
          <div className="flex items-center gap-4 sm:gap-6 text-white">
            <Search className="w-6 h-6 cursor-pointer hover:text-gray-300 transition hidden sm:block" />
            <Bell className="w-6 h-6 cursor-pointer hover:text-gray-300 transition hidden sm:block" />

            {/* Profile button (desktop) */}
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
                    Current User
                  </div>
                  <Link 
                    to="/manage-profiles" 
                    onClick={toggleProfile}
                    className="block px-4 py-2 text-white hover:bg-white/10 transition text-sm"
                  >
                    Manage Profiles
                  </Link>
                  <Link 
                    to="/account" 
                    onClick={toggleProfile}
                    className="block px-4 py-2 text-white hover:bg-white/10 transition text-sm"
                  >
                    Account
                  </Link>
                  <Link 
                    to="/help" 
                    onClick={toggleProfile}
                    className="block px-4 py-2 text-white hover:bg-white/10 transition text-sm"
                  >
                    Help Center
                  </Link>
                  <button 
                    className="block w-full text-left px-4 py-2 text-white hover:bg-white/10 transition text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button 
              onClick={toggleMobileMenu}
              className="lg:hidden text-white"
            >
              {mobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile side menu */}
      <div 
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-black/95 backdrop-blur-lg transform transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-20 px-6">
          <ul className="space-y-6 text-white text-lg font-medium">
            <li>
              <Link to="/" onClick={closeMobileMenu} className="block hover:text-gray-300 transition">
                Home
              </Link>
            </li>
            <li>
              <Link to="/shows" onClick={closeMobileMenu} className="block hover:text-gray-300 transition">
                Shows
              </Link>
            </li>
            <li>
              <Link to="/movies" onClick={closeMobileMenu} className="block hover:text-gray-300 transition">
                Movies
              </Link>
            </li>
            <li>
              <Link to="/games" onClick={closeMobileMenu} className="block hover:text-gray-300 transition">
                Games
              </Link>
            </li>
            <li>
              <Link to="/new-popular" onClick={closeMobileMenu} className="block hover:text-gray-300 transition">
                New & Popular
              </Link>
            </li>
            <li>
              <Link to="/my-list" onClick={closeMobileMenu} className="block hover:text-gray-300 transition">
                My List
              </Link>
            </li>
            <li>
              <Link to="/browse-languages" onClick={closeMobileMenu} className="block hover:text-gray-300 transition">
                Browse by Languages
              </Link>
            </li>
          </ul>

          {/* Profile section at bottom of mobile menu */}
          <div className="mt-auto mb-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-600 rounded-full" />
              <div>
                <p className="text-white font-medium">Current User</p>
                <p className="text-white/70 text-sm">Switch Profile</p>
              </div>
            </div>
            <div className="space-y-3 text-white/80 text-sm">
              <Link to="/account" onClick={closeMobileMenu} className="block hover:text-white transition">
                Account
              </Link>
              <Link to="/help" onClick={closeMobileMenu} className="block hover:text-white transition">
                Help Center
              </Link>
              <button className="block hover:text-white transition">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay when mobile menu is open */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-30 lg:hidden" 
          onClick={closeMobileMenu}
        />
      )}
    </>
  );
}

export default Navbar;