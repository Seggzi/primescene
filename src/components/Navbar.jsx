import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, ChevronDown } from 'lucide-react';

function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleProfile = () => setProfileOpen(!profileOpen);

  // Scroll effect (darkens navbar)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="flex items-center justify-between px-6 md:px-12 py-4">
        {/* Left: Clickable logo + menu */}
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/" className="text-3xl md:text-4xl font-bold text-red-600 hover:text-red-400 transition">
            PrimeScene
          </Link>
          <ul className="hidden lg:flex items-center gap-6 text-white text-base font-medium">
            <li className="hover:text-gray-300 cursor-pointer transition">Home</li>
            <li className="hover:text-gray-300 cursor-pointer transition">Shows</li>
            <li className="hover:text-gray-300 cursor-pointer transition">Movies</li>
            <li className="hover:text-gray-300 cursor-pointer transition">Games</li>
            <li className="hover:text-gray-300 cursor-pointer transition">New & Popular</li>
            <li className="hover:text-gray-300 cursor-pointer transition">My List</li>
            <li className="hover:text-gray-300 cursor-pointer transition">Browse by Languages</li>
          </ul>
        </div>

        {/* Right: Search, Bell, Profile dropdown */}
        <div className="flex items-center gap-4 md:gap-6 text-white">
          <Search className="w-6 h-6 cursor-pointer hover:text-gray-300 transition" />
          <Bell className="w-6 h-6 cursor-pointer hover:text-gray-300 transition" />
          <div className="relative">
            <button 
              onClick={toggleProfile}
              className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-red-400 transition relative"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-black/95 backdrop-blur-md rounded-lg shadow-2xl border border-white/10 py-2 z-50">
                <div className="px-4 py-2 text-white text-sm border-b border-white/10">
                  Current User
                </div>
                <Link to="/manage-profiles" className="block px-4 py-2 text-white hover:bg-white/10 transition text-sm">
                  Manage Profiles
                </Link>
                <Link to="/account" className="block px-4 py-2 text-white hover:bg-white/10 transition text-sm">
                  Account
                </Link>
                <Link to="/help" className="block px-4 py-2 text-white hover:bg-white/10 transition text-sm">
                  Help Center
                </Link>
                <button className="block w-full text-left px-4 py-2 text-white hover:bg-white/10 transition text-sm">
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;