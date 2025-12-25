import { Search, Bell, ChevronDown } from 'lucide-react';

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 md:px-12 py-4">
        {/* Left: Red Netflix logo + long menu */}
        <div className="flex items-center gap-6 md:gap-10">
          <h1 className="text-3xl md:text-4xl font-bold text-red-600">PrimeScene</h1>
          <ul className="hidden lg:flex items-center gap-6 text-white text-sm md:text-base font-medium">
            <li className="hover:text-gray-300 cursor-pointer transition">Home</li>
            <li className="hover:text-gray-300 cursor-pointer transition">Shows</li>
            <li className="hover:text-gray-300 cursor-pointer transition">Movies</li>
            <li className="hover:text-gray-300 cursor-pointer transition">Games</li>
            <li className="hover:text-gray-300 cursor-pointer transition">New & Popular</li>
            <li className="hover:text-gray-300 cursor-pointer transition">My List</li>
            <li className="hover:text-gray-300 cursor-pointer transition">Browse by Languages</li>
          </ul>
        </div>

        {/* Right: Search, Bell, Profile */}
        <div className="flex items-center gap-4 md:gap-6 text-white">
          <Search className="w-6 h-6 cursor-pointer hover:text-gray-300 transition" />
          <Bell className="w-6 h-6 cursor-pointer hover:text-gray-300 transition" />
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 bg-red-600 rounded" /> {/* Avatar */}
            <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition" />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;