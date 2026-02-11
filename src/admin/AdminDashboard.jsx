// src/admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { 
  Film, Users, Star, TrendingUp, UserPlus, 
  PlayCircle, Activity, ArrowUpRight, Database, 
  ShieldAlert, ShieldCheck, UserCog, Search, ChevronRight 
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    totalMovies: 0,
    fullWatchMovies: 0,
    featuredMovies: 0,
    dbSizeMB: 0,
    tmdbAvailable: '500k+',
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState('');

  const DB_LIMIT_MB = 500;

  useEffect(() => {
    fetchStats();
  }, [showAll]); // Refetch when toggling "View All"

  const fetchStats = async () => {
    try {
      // 1. Fetch Stats
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: newToday } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('updated_at', today.toISOString());
      const { count: movieCount } = await supabase.from('movies').select('*', { count: 'exact', head: true });
      const { count: fullWatchCount } = await supabase.from('movies').select('*', { count: 'exact', head: true }).eq('can_watch_fully', true);
      const { count: featuredCount } = await supabase.from('movies').select('*', { count: 'exact', head: true }).eq('is_featured', true);

      // 2. Fetch Users - LIMIT 5 if summary, else fetch more
      let query = supabase.from('profiles').select('id, email, role, updated_at, banned').order('updated_at', { ascending: false });
      if (!showAll) query = query.limit(5);
      
      const { data: users } = await query;
      const { data: sizeData } = await supabase.rpc('get_database_size');

      setStats({
        totalUsers: userCount || 0,
        newUsersToday: newToday || 0,
        totalMovies: movieCount || 0,
        fullWatchMovies: fullWatchCount || 0,
        featuredMovies: featuredCount || 0,
        dbSizeMB: sizeData ? Math.round(sizeData * 10) / 10 : 0,
        tmdbAvailable: '500k+',
      });
      setRecentUsers(users || []);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = async (user) => {
    await supabase.from('profiles').update({ banned: !user.banned }).eq('id', user.id);
    fetchStats();
  };

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    await supabase.from('profiles').update({ role: newRole }).eq('id', user.id);
    fetchStats();
  };

  // FIXED: Added ?. to prevent null email crash
  const filteredUsers = (recentUsers || []).filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const dbPercentage = Math.min(Math.round((stats.dbSizeMB / DB_LIMIT_MB) * 100), 100);

  if (loading && !showAll) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Overview</h1>
          <p className="text-gray-500 text-sm">Real-time performance and user management.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard icon={<Users size={20} />} title="Total Users" value={stats.totalUsers} trend={`+${stats.newUsersToday} today`} accent="blue" />
        <StatCard icon={<Film size={20} />} title="Library" value={stats.totalMovies} trend="Curated" accent="red" />
        <StatCard icon={<PlayCircle size={20} />} title="Streams" value={stats.fullWatchMovies} trend="Full Access" accent="green" />
        <StatCard icon={<Star size={20} />} title="Featured" value={stats.featuredMovies} trend="Hero Slot" accent="yellow" />
        <StatCard icon={<Activity size={20} />} title="TMDB API" value={stats.tmdbAvailable} trend="Live Sync" accent="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus size={18} className="text-red-500" /> 
              {showAll ? 'User Directory' : 'Recent Activity'}
            </h2>
            
            <div className="flex items-center gap-3">
              {showAll && (
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-white/5 border border-white/10 text-[10px] text-white rounded-lg py-1.5 pl-8 pr-3 focus:outline-none focus:border-red-500"
                  />
                </div>
              )}
              <button 
                onClick={() => setShowAll(!showAll)}
                className="text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-white transition-colors flex items-center gap-1"
              >
                {showAll ? 'Show Less' : 'View All'} <ChevronRight size={12} />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-gray-500 bg-white/[0.02]">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Last Activity</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold ${user.banned ? 'text-gray-500 line-through' : 'text-white'}`}>
                          {user.email || 'No Email'}
                        </span>
                        {user.banned && <span className="text-[9px] text-red-500 font-bold uppercase tracking-tighter">Suspended</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] px-2 py-0.5 rounded border uppercase font-bold ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] text-gray-400 font-mono">{new Date(user.updated_at).toLocaleDateString()}</span>
                        <span className="text-[9px] text-gray-600">{new Date(user.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => toggleRole(user)} className="p-1.5 rounded bg-white/5 text-gray-400 hover:text-white transition-colors"><UserCog size={14} /></button>
                        <button onClick={() => toggleBan(user)} className={`p-1.5 rounded transition-colors ${user.banned ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}>
                          {user.banned ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl">
            <h3 className="text-white font-bold text-sm mb-6 flex items-center gap-2">
              <Database size={16} className="text-red-500" /> Database Health
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Storage</span>
                <span className="text-xs text-white font-mono">{stats.dbSizeMB}MB / {DB_LIMIT_MB}MB</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 transition-all duration-1000" style={{ width: `${dbPercentage}%` }}></div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-600 to-red-900 p-6 rounded-2xl group cursor-pointer overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-white font-bold text-lg mb-1">Sync Metadata</h3>
              <p className="text-red-100 text-xs mb-4 opacity-70">Refresh global movie IDs.</p>
              <div className="inline-flex items-center gap-2 bg-black/20 px-3 py-1 rounded-lg text-white text-[10px] font-bold uppercase">Run Task <ArrowUpRight size={12} /></div>
            </div>
            <Activity size={80} className="absolute -bottom-4 -right-4 text-black/10 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, trend, accent }) {
  const accents = {
    blue: 'text-blue-500 border-blue-500/20',
    red: 'text-red-500 border-red-500/20',
    green: 'text-green-500 border-green-500/20',
    yellow: 'text-yellow-500 border-yellow-500/20',
    purple: 'text-purple-500 border-purple-500/20',
  };
  return (
    <div className="bg-[#0a0a0a] border border-white/5 p-5 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg bg-white/[0.03] border ${accents[accent]}`}>{icon}</div>
        <TrendingUp size={14} className="text-gray-800" />
      </div>
      <div><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{title}</p><div className="flex items-baseline gap-2"><p className="text-2xl font-bold text-white tracking-tight">{value.toLocaleString()}</p><span className={`text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 ${accents[accent]}`}>{trend}</span></div></div>
    </div>
  );
}