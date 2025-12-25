import { Search, Bell, ChevronDown } from 'lucide-react';

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-md">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Left */}
        <div className="flex items-center gap-8">
          <h1 className="text-3xl font-bold text-red-600">PrimeScene</h1>
          <ul className="hidden md:flex gap-6 text-white">
            <li className="hover:text-gray-300 cursor-pointer font-medium">Home</li>
            <li className="hover:text-gray-300 cursor-pointer">Movies</li>
            <li className="hover:text-gray-300 cursor-pointer">TV Shows</li>
            <li className="hover:text-gray-300 cursor-pointer">My List</li>
          </ul>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6 text-white">
          <Search className="w-6 h-6 cursor-pointer hover:text-gray-300" />
          <Bell className="w-6 h-6 cursor-pointer hover:text-gray-300" />
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-red-600 rounded" /> {/* Avatar placeholder */}
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;