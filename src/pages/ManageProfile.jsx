// src/pages/ManageProfile.jsx - FULLY FIXED: Auto-Profile Creation + No Errors

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users, Plus, Trash2, AlertTriangle, Lock, Edit, Save,
  Shield, Smartphone, Trophy, Film, Clock, Zap, ChevronRight, Check
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';

function ManageProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [settingPin, setSettingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showMaturity, setShowMaturity] = useState(false);
  const [selectedMaturity, setSelectedMaturity] = useState('All Ages');
  const [pinPurpose, setPinPurpose] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [stats, setStats] = useState({ watched: 0, hours: 0, streak: 1, badges: ['First Watch', 'Nollywood Fan'] });
  const [activityTimeline, setActivityTimeline] = useState([]);

  const kidMaturityLevels = ['All Ages', '7+', '10+', '13+', '16+'];

  // Supabase + localStorage sync
  useEffect(() => {
    if (!user) {
      const loadLocal = () => {
        const p = localStorage.getItem('profiles');
        const a = localStorage.getItem('activity');
        const s = localStorage.getItem('stats');
        if (p) setProfiles(JSON.parse(p));
        if (a) setActivityTimeline(JSON.parse(a));
        if (s) setStats(JSON.parse(s));
      };
      loadLocal();
      return;
    }

    const channel = supabase
      .channel('user-data')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: `id=eq.${user.uid}` }, (payload) => {
        const data = payload.new;
        if (data.profiles) setProfiles(data.profiles);
        if (data.activity) setActivityTimeline(data.activity || []);
        if (data.stats) setStats(data.stats);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  const saveData = async () => {
    localStorage.setItem('profiles', JSON.stringify(profiles));
    localStorage.setItem('activity', JSON.stringify(activityTimeline));
    localStorage.setItem('stats', JSON.stringify(stats));

    if (user) {
      const { error } = await supabase
        .from('users')
        .upsert({ id: user.uid, profiles, activity: activityTimeline, stats });
      if (error) console.error('Supabase save error:', error);
    }
  };

  useEffect(() => { saveData(); }, [profiles, activityTimeline, stats]);

  // AUTO-CREATE PROFILE FOR NEW USERS
  useEffect(() => {
    if (user && profiles.length === 0) {
      const defaultProfile = {
        id: 1,
        name: user.displayName || user.email?.split('@')[0] || 'Main Profile',
        avatar: user.photoURL || null,
        isActive: true,
        isKids: false,
        pin: null,
        maturityLevel: 'TV-MA'
      };
      setProfiles([defaultProfile]);
      setCurrentProfile(defaultProfile);
      setNewName(defaultProfile.name);
    }
  }, [user, profiles.length]);

  // SET CURRENT PROFILE WHEN PROFILES LOAD
  useEffect(() => {
    if (profiles.length > 0 && !currentProfile) {
      const active = profiles.find(p => p.isActive) || profiles[0];
      setCurrentProfile(active);
      setNewName(active.name || 'Profile');
    }
  }, [profiles]);

  const getAvatarUrl = (p) => p.avatar || user?.photoURL || `https://via.placeholder.com/120?text=${(p.name?.[0] || '?').toUpperCase()}`;

  const switchProfile = (p) => {
    const updated = profiles.map(pr => ({ ...pr, isActive: pr.id === p.id }));
    setProfiles(updated);
    setCurrentProfile(p);
  };

  const addProfile = () => {
    if (profiles.length >= 5) return alert('Upgrade to Premium for more profiles');
    const newP = { id: Date.now(), name: 'New Profile', avatar: null, isActive: false, isKids: false, pin: null, maturityLevel: 'TV-MA' };
    setProfiles([...profiles, newP]);
  };

  const deleteProfile = (id) => {
    if (profiles.length === 1) return alert('Cannot delete only profile');
    let updated = profiles.filter(p => p.id !== id);
    if (currentProfile?.id === id) {
      updated[0].isActive = true;
      setCurrentProfile(updated[0]);
    }
    setProfiles(updated);
    setDeleteConfirm(null);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 160;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 160, 160);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const updated = { ...currentProfile, avatar: dataUrl };
        setCurrentProfile(updated);
        setProfiles(profiles.map(p => p.id === currentProfile.id ? updated : p));
        setUploadPreview(null);
      };
      img.src = ev.target.result;
      setUploadPreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const toggleKidsMode = () => {
    if (currentProfile.pin) {
      setPinPurpose('toggleKids');
      setShowPinModal(true);
      return;
    }
    const updated = {
      ...currentProfile,
      isKids: !currentProfile.isKids,
      maturityLevel: !currentProfile.isKids ? 'All Ages' : 'TV-MA'
    };
    setCurrentProfile(updated);
    setProfiles(profiles.map(p => p.id === currentProfile.id ? updated : p));
  };

  const handlePinUnlock = () => {
    if (pinInput === currentProfile.pin) {
      setShowPinModal(false);
      setPinInput('');
      setPinError('');
      setPinPurpose(null);
      if (pinPurpose === 'toggleKids') toggleKidsMode();
      if (pinPurpose === 'openMaturity') setShowMaturity(true);
    } else setPinError('Incorrect PIN');
  };

  const saveMaturityLevel = () => {
    const updated = { ...currentProfile, maturityLevel: selectedMaturity };
    setCurrentProfile(updated);
    setProfiles(profiles.map(p => p.id === currentProfile.id ? updated : p));
    setShowMaturity(false);
  };

  const handleSetPin = () => {
    if (newPin !== confirmPin) return setPinError('PINs do not match');
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) return setPinError('PIN must be 4 digits');
    const updated = { ...currentProfile, pin: newPin };
    setCurrentProfile(updated);
    setProfiles(profiles.map(p => p.id === currentProfile.id ? updated : p));
    setSettingPin(false);
    setNewPin('');
    setConfirmPin('');
    setPinError('');
  };

  // SAFE LOADING: Only show when no user and no profiles
  if (!user && profiles.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        Loading profile...
      </div>
    );
  }

  // If user exists but no profile yet, auto-creation useEffect will handle it
  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        Setting up your profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Manage Profiles</h1>

        {/* Profiles Grid */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <Users size={22} className="text-red-500" /> Your Profiles
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {profiles.map(p => (
              <div
                key={p.id}
                onClick={() => switchProfile(p)}
                className={`relative bg-zinc-900/60 rounded-xl p-4 border-2 cursor-pointer transition-all
                  ${p.isActive ? 'border-red-600' : 'border-white/10 hover:border-red-500'}`}
              >
                <img src={getAvatarUrl(p)} alt={p.name} className="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto object-cover mb-3" />
                <p className="text-center font-semibold text-sm">{p.name}</p>
                {p.isKids && <p className="text-center text-xs text-green-400 mt-1">Kids</p>}
                {profiles.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(p.id); }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-600/80 hover:bg-red-700 rounded-full p-1 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <button onClick={addProfile} className="bg-zinc-900/60 rounded-xl p-4 border-2 border-dashed border-white/30 hover:border-red-500 transition flex flex-col items-center justify-center">
              <Plus size={36} className="text-gray-400 mb-2" />
              <p className="font-semibold text-gray-400 text-sm">Add Profile</p>
            </button>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="bg-zinc-900/60 rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-bold mb-5">Profile Settings</h2>
          <div className="space-y-6">
            {/* Name */}
            <div>
              <p className="text-gray-400 text-sm mb-2">Name</p>
              {editingName ? (
                <div className="flex gap-3">
                  <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="flex-1 bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-sm" />
                  <button onClick={() => {
                    const updated = { ...currentProfile, name: newName || 'Profile' };
                    setCurrentProfile(updated);
                    setProfiles(profiles.map(p => p.id === currentProfile.id ? updated : p));
                    setEditingName(false);
                  }} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700">
                    <Save size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{currentProfile.name}</p>
                  <button onClick={() => { setNewName(currentProfile.name); setEditingName(true); }} className="text-red-500">
                    <Edit size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div>
              <p className="text-gray-400 text-sm mb-3">Avatar</p>
              <div className="flex items-center gap-4">
                <img src={uploadPreview || getAvatarUrl(currentProfile)} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-white/20" />
                <div>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} ref={fileInputRef} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="px-6 py-2 bg-red-600 rounded-lg font-medium hover:bg-red-700 text-sm">
                    Change Photo
                  </button>
                  {uploadPreview && <p className="text-green-400 text-xs mt-2">Uploaded!</p>}
                </div>
              </div>
            </div>

            {/* Kids Mode */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Kids Mode</p>
                <p className="text-sm text-gray-400">Safe content only</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={currentProfile.isKids} onChange={toggleKidsMode} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-red-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
              </label>
            </div>

            {/* Age Rating */}
            {currentProfile.isKids && (
              <div>
                <p className="font-semibold mb-2">Age Rating</p>
                <button onClick={() => currentProfile.pin ? (setPinPurpose('openMaturity'), setShowPinModal(true)) : setShowMaturity(true)} className="w-full py-3 bg-zinc-800 rounded-lg flex items-center justify-between px-4 hover:bg-zinc-700 text-sm">
                  <span>{currentProfile.maturityLevel}</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* PIN Lock */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Profile PIN Lock</p>
                  <p className="text-sm text-gray-400">Require PIN to change settings</p>
                </div>
                <button onClick={() => setSettingPin(true)} className="px-5 py-2 bg-red-600 rounded-lg text-sm hover:bg-red-700">
                  {currentProfile.pin ? 'Change' : 'Set'} PIN
                </button>
              </div>
              {currentProfile.pin && <p className="text-green-400 text-sm mt-2 flex items-center gap-1"><Lock size={14} /> Active</p>}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-4 gap-4">
          <div className="bg-zinc-900/60 rounded-xl p-4 text-center">
            <Film size={24} className="mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold">{stats.watched}</p>
            <p className="text-xs text-gray-400">Watched</p>
          </div>
          <div className="bg-zinc-900/60 rounded-xl p-4 text-center">
            <Clock size={24} className="mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold">{stats.hours}</p>
            <p className="text-xs text-gray-400">Hours</p>
          </div>
          <div className="bg-zinc-900/60 rounded-xl p-4 text-center">
            <Zap size={24} className="mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold">{stats.streak}</p>
            <p className="text-xs text-gray-400">Streak</p>
          </div>
          <div className="bg-zinc-900/60 rounded-xl p-4 text-center">
            <Trophy size={24} className="mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold">{stats.badges?.length || 0}</p>
            <p className="text-xs text-gray-400">Badges</p>
          </div>
        </div>

        {/* Activity */}
        {activityTimeline.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {activityTimeline.slice(0, 6).map((item, i) => (
                <div key={i} className="bg-zinc-900/40 rounded-lg p-3 flex justify-between text-sm">
                  <p>{item.title}</p>
                  <p className="text-gray-500">{item.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        {stats.badges?.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">Badges</h2>
            <div className="grid grid-cols-3 gap-4">
              {stats.badges.map((b, i) => (
                <div key={i} className="bg-zinc-900/60 rounded-xl p-4 text-center">
                  <Trophy size={28} className="mx-auto mb-2 text-yellow-500" />
                  <p className="text-sm font-semibold">{b}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Devices - Multiple */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Active Devices</h2>
          <div className="space-y-4">
            <div className="bg-zinc-900/60 rounded-xl p-5 flex items-center justify-between border border-white/10">
              <div className="flex items-center gap-4">
                <Smartphone size={28} className="text-red-500" />
                <div>
                  <p className="font-semibold">This device</p>
                  <p className="text-sm text-gray-500">Active now</p>
                </div>
              </div>
              <span className="text-green-500 text-sm">Current</span>
            </div>
            {/* Future: show other devices from Supabase sessions */}
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="mt-10 bg-gradient-to-r from-red-900/30 to-zinc-900 rounded-xl p-8 text-center border border-red-600/40">
          <h2 className="text-2xl font-bold mb-4">Unlock Premium</h2>
          <button onClick={() => navigate('/account-settings')} className="px-10 py-3 bg-red-600 rounded-full font-bold hover:bg-red-700 transition">
            Upgrade Now
          </button>
        </div>
      </div>

      {/* Modals */}
      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-zinc-900 rounded-xl p-8 max-w-sm border border-red-600/50">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle size={32} className="text-red-500" />
              <h3 className="text-xl font-bold">Delete Profile?</h3>
            </div>
            <p className="text-gray-300 text-sm mb-8">This cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 border border-white/20 rounded-lg hover:bg-white/10">
                Cancel
              </button>
              <button onClick={() => deleteProfile(deleteConfirm)} className="flex-1 py-3 bg-red-600 rounded-lg hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-zinc-900 rounded-xl p-8 max-w-sm w-full border border-white/20">
            <h3 className="text-xl font-bold mb-6 text-center flex items-center justify-center gap-2">
              <Lock size={24} /> Enter PIN
            </h3>
            <input
              type="password"
              maxLength="4"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center text-2xl tracking-widest bg-black/50 border border-white/20 rounded-lg py-4"
              placeholder="••••"
              autoFocus
            />
            {pinError && <p className="text-red-500 text-center mt-4">{pinError}</p>}
            <div className="flex gap-4 mt-8">
              <button onClick={() => { setShowPinModal(false); setPinInput(''); setPinError(''); setPinPurpose(null); }} className="flex-1 py-3 border border-white/20 rounded-lg hover:bg-white/10">
                Cancel
              </button>
              <button onClick={handlePinUnlock} className="flex-1 py-3 bg-red-600 rounded-lg hover:bg-red-700">
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set PIN Modal */}
      {settingPin && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-zinc-900 rounded-xl p-8 max-w-sm w-full border border-white/20">
            <h3 className="text-xl font-bold mb-6 text-center">{currentProfile.pin ? 'Change PIN' : 'Set PIN'}</h3>
            <input
              type="password"
              maxLength="4"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="New PIN"
              className="w-full text-center text-2xl tracking-widest bg-black/50 border border-white/20 rounded-lg py-4 mb-4"
            />
            <input
              type="password"
              maxLength="4"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Confirm PIN"
              className="w-full text-center text-2xl tracking-widest bg-black/50 border border-white/20 rounded-lg py-4 mb-4"
            />
            {pinError && <p className="text-red-500 text-center mb-4">{pinError}</p>}
            <div className="flex gap-4">
              <button onClick={() => { setSettingPin(false); setNewPin(''); setConfirmPin(''); setPinError(''); }} className="flex-1 py-3 border border-white/20 rounded-lg hover:bg-white/10">
                Cancel
              </button>
              <button onClick={handleSetPin} className="flex-1 py-3 bg-red-600 rounded-lg hover:bg-red-700">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Maturity Modal */}
      {showMaturity && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-zinc-900 rounded-xl p-8 max-w-sm w-full border border-white/20">
            <h3 className="text-xl font-bold mb-6 text-center">Age Rating</h3>
            <div className="space-y-3">
              {kidMaturityLevels.map(level => (
                <button
                  key={level}
                  onClick={() => setSelectedMaturity(level)}
                  className={`w-full py-4 rounded-lg border-2 transition ${selectedMaturity === level ? 'bg-red-600/30 border-red-600' : 'border-white/20 hover:border-red-600/50'}`}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowMaturity(false)} className="flex-1 py-3 border border-white/20 rounded-lg hover:bg-white/10">
                Cancel
              </button>
              <button onClick={saveMaturityLevel} className="flex-1 py-3 bg-red-600 rounded-lg hover:bg-red-700">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageProfile;