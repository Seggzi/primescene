'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import {
  Users as UsersIcon,
  Search,
  ShieldCheck,
  Ban,
  UserCog,
  RefreshCw,
  Mail,
  Calendar,
  Clock,
  Plus,
  X,
  Trash2,
  Download,
  Eye,
  Copy
} from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [errorMsg, setErrorMsg] = useState(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Forms
  const [addForm, setAddForm] = useState({ email: '', password: '', username: '', role: 'user' });
  const [editForm, setEditForm] = useState({ username: '', role: 'user', banned: false });

  // Stats
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    banned: users.filter(u => u.banned === true).length,
    active: users.filter(u => !u.banned).length,
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, username, role, created_at, banned, last_sign_in_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setErrorMsg(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Filtering
  useEffect(() => {
    let result = users;

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(u =>
        u.email?.toLowerCase().includes(term) ||
        u.username?.toLowerCase().includes(term)
      );
    }

    if (roleFilter !== 'all') {
      result = result.filter(u => u.role === roleFilter);
    }

    if (statusFilter === 'banned') {
      result = result.filter(u => u.banned === true);
    } else if (statusFilter === 'active') {
      result = result.filter(u => !u.banned);
    }

    setFilteredUsers(result);
  }, [search, roleFilter, statusFilter, users]);

  // Add User
  const handleAddUser = async () => {
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: addForm.email,
        password: addForm.password,
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        await supabase.from('profiles').update({ username: addForm.username, role: addForm.role }).eq('id', data.user.id);
      }

      setShowAddModal(false);
      setAddForm({ email: '', password: '', username: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create user');
    }
  };

  // Edit User
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({ username: user.username || '', role: user.role || 'user', banned: user.banned || false });
    setShowEditModal(true);
  };

  const handleEditUser = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(editForm)
        .eq('id', selectedUser.id);

      if (error) throw error;

      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update user');
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', showDeleteConfirm.id);

      if (error) throw error;

      setShowDeleteConfirm(null);
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete user');
    }
  };

  // Force Password Reset
  const handlePasswordReset = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      alert('Password reset email sent!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send reset email');
    }
  };

  // CSV Export
  const exportCSV = () => {
    const headers = ['Email', 'Username', 'Role', 'Banned', 'Joined', 'Last Login'];
    const rows = users.map(u => [
      u.email,
      u.username || '',
      u.role || 'user',
      u.banned ? 'Yes' : 'No',
      new Date(u.created_at).toLocaleDateString(),
      formatDate(u.last_sign_in_at)
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'primescene_users.csv';
    a.click();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-6xl mx-auto p-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-3">
              <UsersIcon size={28} className="text-brand-mint" />
              PrimeScene Users
            </h1>
            <p className="text-gray-500 text-xs mt-1">Manage streamers and permissions</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 flex items-center gap-2 text-xs font-bold transition"
            >
              <Download size={16} />
              Export CSV
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-brand-mint text-black rounded-2xl hover:opacity-90 flex items-center gap-2 text-xs font-bold"
            >
              <Plus size={16} />
              Add User
            </button>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin text-brand-mint" : "text-gray-400"} />
            </button>
            <div className="bg-brand-mint/10 border border-brand-mint/20 px-5 py-2 rounded-2xl text-center">
              <p className="text-2xl font-black text-brand-mint leading-none">{stats.total}</p>
              <p className="text-[9px] uppercase font-bold text-brand-mint/60">Total</p>
            </div>
          </div>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs">
            <strong>Error:</strong> {errorMsg}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 text-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Admins</p>
            <p className="text-xl font-black text-purple-400 mt-1">{stats.admins}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 text-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Banned</p>
            <p className="text-xl font-black text-red-500 mt-1">{stats.banned}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 text-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Active</p>
            <p className="text-xl font-black text-brand-mint mt-1">{stats.active}</p>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col lg:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search email or username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] outline-none focus:border-brand-mint transition-all shadow-2xl text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm outline-none focus:border-brand-mint"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="user">Users</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm outline-none focus:border-brand-mint"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>

        {/* Showing count */}
        <div className="mb-4 text-center text-gray-500 text-xs">
          Showing <span className="font-bold text-brand-mint">{filteredUsers.length}</span> of <span className="font-bold">{stats.total}</span> users
        </div>

        {/* User Cards */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-white/5 rounded-[3rem] animate-pulse" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
            <UsersIcon size={56} className="mx-auto text-gray-700 mb-3" />
            <p className="text-lg font-bold text-gray-500">No users match current filters</p>
            <p className="text-xs text-gray-600 mt-1">Try clearing search or filters</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <div 
                key={user.id} 
                className={`group flex items-center gap-5 p-5 rounded-[3rem] border transition-all shadow-xl cursor-pointer ${
                  user.banned ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/5 hover:border-brand-mint/30 hover:bg-white/[0.07]'
                }`}
                onClick={() => {
                  setSelectedUser(user);
                  setShowDetailModal(true);
                }}
              >
                {/* Avatar */}
                <div className={`w-14 h-14 rounded-[2rem] flex items-center justify-center font-black text-xl ${
                  user.role === 'admin' ? 'bg-brand-mint text-black' : 'bg-white/10 text-white'
                }`}>
                  {(user.username || user.email || '?')[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h3 className={`text-lg font-bold truncate ${user.banned ? 'text-gray-500 line-through' : 'text-white'}`}>
                      {user.email}
                    </h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400'
                    }`}>
                      {user.role || 'User'}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-5 text-gray-500 text-xs">
                    {user.username && (
                      <span className="flex items-center gap-1">
                        <Mail size={14} /> @{user.username}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> Joined {formatDate(user.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> Last login: {formatDate(user.last_sign_in_at)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openEditModal(user)}
                    className="flex flex-col items-center gap-1 p-3 rounded-[2rem] bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <UserCog size={20} className="text-gray-400" />
                    <span className="text-[9px] font-bold uppercase text-gray-500">Edit</span>
                  </button>
                  
                  <button
                    onClick={() => setShowDeleteConfirm(user)}
                    className="flex flex-col items-center gap-1 p-3 rounded-[2rem] bg-red-500/10 hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 size={20} className="text-red-500" />
                    <span className="text-[9px] font-bold uppercase text-red-500">Delete</span>
                  </button>
                  
                  <button
                    onClick={() => toggleBan(user)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-[2rem] transition-all ${
                      user.banned 
                        ? 'bg-green-500/10 hover:bg-green-500/20' 
                        : 'bg-red-500/10 hover:bg-red-500/20'
                    }`}
                  >
                    {user.banned ? <ShieldCheck size={20} className="text-green-500" /> : <Ban size={20} className="text-red-500" />}
                    <span className="text-[9px] font-bold uppercase text-inherit">{user.banned ? 'Unban' : 'Ban'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] rounded-3xl p-6 max-w-md w-full border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold">User Details</h2>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <p className="text-gray-500 text-xs uppercase">Email</p>
                <div className="flex items-center gap-2">
                  <p className="font-bold">{selectedUser.email}</p>
                  <button onClick={() => navigator.clipboard.writeText(selectedUser.email)} className="text-gray-500 hover:text-brand-mint">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-500 text-xs uppercase">Username</p>
                <p className="font-bold">{selectedUser.username || 'Not set'}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-500 text-xs uppercase">User ID</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs">{selectedUser.id}</p>
                  <button onClick={() => navigator.clipboard.writeText(selectedUser.id)} className="text-gray-500 hover:text-brand-mint">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-500 text-xs uppercase">Role</p>
                <p className="font-bold">{selectedUser.role || 'user'}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-500 text-xs uppercase">Status</p>
                <p className="font-bold">{selectedUser.banned ? 'Banned' : 'Active'}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-500 text-xs uppercase">Joined</p>
                <p className="font-bold">{new Date(selectedUser.created_at).toLocaleString()}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-500 text-xs uppercase">Last Login</p>
                <p className="font-bold">{formatDate(selectedUser.last_sign_in_at)}</p>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => handlePasswordReset(selectedUser.email)}
                  className="w-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 py-3 rounded-2xl font-bold text-sm transition border border-yellow-500/20"
                >
                  Send Password Reset Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] rounded-3xl p-6 max-w-sm w-full border border-red-500/20 shadow-2xl text-center">
            <h2 className="text-lg font-bold text-red-400 mb-3">Delete User?</h2>
            <p className="text-sm text-gray-400 mb-6">{showDeleteConfirm.email}</p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteUser}
                className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-bold text-sm transition hover:bg-red-600"
              >
                Delete Permanently
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-white/5 py-3 rounded-2xl font-bold text-sm transition border border-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] rounded-3xl p-6 max-w-sm w-full border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold">Add New User</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-white/10 rounded-2xl text-sm outline-none focus:border-brand-mint"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-white/10 rounded-2xl text-sm outline-none focus:border-brand-mint"
                required
              />
              <input
                type="text"
                placeholder="Username (optional)"
                value={addForm.username}
                onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-white/10 rounded-2xl text-sm outline-none focus:border-brand-mint"
              />
              <select
                value={addForm.role}
                onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-white/10 rounded-2xl text-sm outline-none focus:border-brand-mint"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-3 pt-3">
                <button
                  onClick={handleAddUser}
                  className="flex-1 bg-brand-mint text-black py-3 rounded-2xl font-bold text-sm transition hover:opacity-90"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white/5 py-3 rounded-2xl font-bold text-sm transition border border-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] rounded-3xl p-6 max-w-sm w-full border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold">Edit User</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Username"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-white/10 rounded-2xl text-sm outline-none focus:border-brand-mint"
              />
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-white/10 rounded-2xl text-sm outline-none focus:border-brand-mint"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.banned}
                  onChange={(e) => setEditForm({ ...editForm, banned: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-sm">Banned</span>
              </label>
              <div className="flex gap-3 pt-3">
                <button
                  onClick={handleEditUser}
                  className="flex-1 bg-brand-mint text-black py-3 rounded-2xl font-bold text-sm transition hover:opacity-90"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-white/5 py-3 rounded-2xl font-bold text-sm transition border border-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}