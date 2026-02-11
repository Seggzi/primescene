// src/admin/AdminLayout.jsx
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Film, Users, Star, LayoutDashboard, Menu, X, ChevronRight, User } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/admin/login', { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Movies', path: '/admin/movies', icon: Film },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Featured Content', path: '/admin/featured', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 flex font-sans">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-white/5 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/20">
                  <Film size={18} className="text-white" />
                </div>
                <h1 className="text-sm font-black tracking-tighter text-white uppercase italic">
                  Prime<span className="text-red-600">Scene</span>
                </h1>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation Label */}
          <div className="px-6 mb-2">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Main Menu</p>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.includes(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-white/5 text-white' 
                      : 'hover:bg-white/[0.02] hover:text-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className={isActive ? 'text-red-500' : 'text-gray-500 group-hover:text-gray-300'} />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </div>
                  {isActive && (
                    <div className="absolute left-0 w-1 h-5 bg-red-600 rounded-r-full" />
                  )}
                  {isActive && <ChevronRight size={14} className="text-gray-600" />}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout Section */}
          <div className="p-4 border-t border-white/5 bg-black/20">
            <div className="flex items-center gap-3 px-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center border border-white/10">
                <User size={14} className="text-gray-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-white truncate">Admin User</p>
                <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors text-xs font-bold"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-[#0a0a0a] border-b border-white/5">
           <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
              <Film size={14} className="text-white" />
            </div>
            <span className="text-xs font-bold tracking-tighter text-white uppercase italic">PrimeScene</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 bg-white/5 rounded-lg border border-white/10"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 p-4 lg:p-8 lg:ml-64 overflow-y-auto">
          {/* Glass Card Container for Content */}
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}