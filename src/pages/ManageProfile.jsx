// src/pages/ManageProfile.jsx - FULLY SYNCED & COMPLETE

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { 
  Check, Users, Shield, Clock, Film, Trophy, 
  Smartphone, Zap, Calendar, ChevronRight, Edit, Save, Plus, 
  Trash2, AlertTriangle, Lock 
} from 'lucide-react';
import { supabase } from '../supabase';

function ManageProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  // === UI STATES ===
  const [profiles, setProfiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // === MODAL & PIN STATES ===
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [settingPin, setSettingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showMaturity, setShowMaturity] = useState(false);
  const [selectedMaturity, setSelectedMaturity] = useState('All Ages');
  const [pinPurpose, setPinPurpose] = useState(null);

  // === DATA STATES (Stats, Activity, etc.) ===
  const [activityTimeline, setActivityTimeline] = useState([]);
  const [stats, setStats] = useState({
    watched: 0,
    hours: 0,
    favoriteGenre: 'Drama',
    streak: 1,
    badges: ['First Watch', 'Nollywood Fan']
  });
  const [badges, setBadges] = useState(stats.badges);

  const [devices, setDevices] = useState(() => {
    const userAgent = navigator.userAgent;
    let deviceType = 'Unknown Device';
    if (/mobile/i.test(userAgent)) deviceType = 'Mobile Phone';
    if (/tablet/i.test(userAgent)) deviceType = 'Tablet';
    if (/windows/i.test(userAgent)) deviceType = 'Windows PC';
    if (/mac/i.test(userAgent)) deviceType = 'MacBook';
    if (/android/i.test(userAgent)) deviceType = 'Android Device';

    return [{
      name: deviceType,
      lastActive: new Date().toLocaleString(),
      location: 'Current Location'
    }];
  });

  const kidMaturityLevels = [
    { rating: 'All Ages', desc: 'Suitable for everyone (0+)' },
    { rating: '7+', desc: 'Recommended for ages 7 and up' },
    { rating: '10+', desc: 'Recommended for ages 10 and up' },
    { rating: '13+', desc: 'Recommended for ages 13 and up' },
    { rating: '16+', desc: 'Recommended for ages 16 and up' }
  ];

  // === 1. HELPER: SAVE TO SUPABASE ===
  // We use this manual function instead of useEffect to prevent infinite loops
  const saveToSupabase = async (updatedProfiles, updatedActivity, updatedStats) => {
    if (!user?.id) return;

    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        profiles: updatedProfiles || profiles,
        activity: updatedActivity || activityTimeline,
        stats: updatedStats || stats
      });

    if (error) console.error('Save error:', error);
  };

  // === 2. TRUE REAL-TIME SYNC ===
  useEffect(() => {
    if (!user?.id) {
      // Guest Mode: Load from local storage
      const p = localStorage.getItem('profiles');
      const a = localStorage.getItem('activity');
      const s = localStorage.getItem('stats');
      if (p) setProfiles(JSON.parse(p));
      if (a) setActivityTimeline(JSON.parse(a));
      if (s) setStats(JSON.parse(s));
      return;
    }

    // A. Subscribe to Database Changes
    const channel = supabase
      .channel(`profile-sync-${user.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'users', 
        filter: `id=eq.${user.id}` 
      }, (payload) => {
        const data = payload.new;
        if (data) {
          // Update local state when DB changes
          if (data.profiles) setProfiles(data.profiles);
          if (data.activity) setActivityTimeline(data.activity);
          if (data.stats) {
            setStats(data.stats);
            setBadges(data.stats.badges || []);
          }
        }
      })
      .subscribe();

    // B. Initial Fetch
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('profiles, activity, stats')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfiles(data.profiles || []);
        setActivityTimeline(data.activity || []);
        setStats(data.stats || stats);
        setBadges(data.stats?.badges || []);
      }
    };

    fetchData();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // === 3. CRITICAL FIX: SYNC CURRENT PROFILE ===
  // This ensures the profile you are looking at updates instantly
  // when the background list changes (e.g. PIN update on phone).
  useEffect(() => {
    if (currentProfile && profiles.length > 0) {
      const updatedVersion = profiles.find(p => p.id === currentProfile.id);
      
      // If the profile data has changed, update the view
      if (updatedVersion && JSON.stringify(updatedVersion) !== JSON.stringify(currentProfile)) {
        setCurrentProfile(updatedVersion);
        
        // Update editing name state if needed
        if (!editingName) setNewName(updatedVersion.name);
      }
    } else if (!currentProfile && profiles.length > 0) {
      // Set initial active profile
      const active = profiles.find(p => p.isActive) || profiles[0];
      setCurrentProfile(active);
      setNewName(active.name);
    }
  }, [profiles]);

  // === 4. AUTO-CREATE DEFAULT PROFILE ===
  useEffect(() => {
    if (user?.id && profiles.length === 0) {
      const defaultProfile = {
        id: 1,
        name: user.email?.split('@')[0] || 'Main Profile',
        isActive: true,
        isKids: false,
        pin: null,
        maturityLevel: 'All Ages',
        dailyLimit: null
      };
      const newProfiles = [defaultProfile];
      setProfiles(newProfiles);
      saveToSupabase(newProfiles);
    }
  }, [user, profiles.length]);

  const getAvatarLetter = (name) => name?.[0]?.toUpperCase() || '?';

  // === ACTIONS ===

  const handleNameChange = () => {
    if (!currentProfile || !newName.trim()) return;
    const updatedProfiles = profiles.map(p => 
      p.id === currentProfile.id ? { ...p, name: newName.trim() } : p
    );
    setProfiles(updatedProfiles);
    setEditingName(false);
    addNotification('Profile name updated!', 'success');
    saveToSupabase(updatedProfiles); // Sync
  };

  const switchProfile = (profile) => {
    const updatedProfiles = profiles.map(p => ({
      ...p,
      isActive: p.id === profile.id
    }));
    setProfiles(updatedProfiles);
    setCurrentProfile(profile);
    addNotification(`Switched to ${profile.name}`, 'success');
    saveToSupabase(updatedProfiles); // Sync
  };

  const addProfile = () => {
    if (profiles.length >= 5) {
      alert('Upgrade to Premium for more than 5 profiles!');
      return;
    }
    const newProfile = {
      id: Date.now(),
      name: 'New Profile',
      isActive: false,
      isKids: false,
      pin: null,
      maturityLevel: 'All Ages',
      dailyLimit: null
    };
    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);
    addNotification('New profile created!', 'success');
    saveToSupabase(updatedProfiles); // Sync
  };

  const deleteProfile = (profileId) => {
    if (profiles.length === 1) {
      alert('You cannot delete your only profile!');
      setDeleteConfirm(null);
      return;
    }

    let updatedProfiles = profiles.filter(p => p.id !== profileId);
    if (currentProfile?.id === profileId) {
      updatedProfiles[0].isActive = true;
      setCurrentProfile(updatedProfiles[0]);
    }
    setProfiles(updatedProfiles);
    setDeleteConfirm(null);
    addNotification('Profile deleted', 'success');
    saveToSupabase(updatedProfiles); // Sync
  };

  // === KIDS MODE & PIN LOGIC ===

  const handleMaturityClick = () => {
    if (currentProfile.pin) {
      setPinPurpose('openMaturity');
      setShowPinModal(true);
    } else {
      setShowMaturity(true);
    }
  };

  const toggleKidsMode = () => {
    if (currentProfile.pin && pinPurpose !== 'toggleKids') {
      setPinPurpose('toggleKids');
      setShowPinModal(true);
      return;
    }

    const updated = { ...currentProfile, isKids: !currentProfile.isKids };
    updated.maturityLevel = updated.isKids ? 'All Ages' : 'TV-MA';
    
    // Optimistic Update
    setCurrentProfile(updated);
    const updatedProfiles = profiles.map(p => p.id === currentProfile.id ? updated : p);
    setProfiles(updatedProfiles);
    addNotification(updated.isKids ? 'Kids Mode enabled' : 'Kids Mode disabled', 'success');
    saveToSupabase(updatedProfiles); // Sync
  };

  const handlePinUnlock = () => {
    if (pinInput === currentProfile.pin) {
      setShowPinModal(false);
      setPinInput('');
      setPinError('');
      
      if (pinPurpose === 'toggleKids') toggleKidsMode();
      if (pinPurpose === 'openMaturity') setShowMaturity(true);
      
      setPinPurpose(null);
    } else {
      setPinError('Incorrect PIN');
    }
  };

  const saveMaturityLevel = () => {
    const updated = { ...currentProfile, maturityLevel: selectedMaturity };
    const updatedProfiles = profiles.map(p => p.id === currentProfile.id ? updated : p);
    
    setProfiles(updatedProfiles);
    setShowMaturity(false);
    addNotification(`Content rating set to ${selectedMaturity}`, 'success');
    saveToSupabase(updatedProfiles); // Sync
  };

  const handleSetPin = () => {
    if (newPin !== confirmPin) {
      setPinError('PINs do not match');
      return;
    }
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setPinError('PIN must be 4 digits');
      return;
    }

    const updated = { ...currentProfile, pin: newPin };
    setCurrentProfile(updated);
    const updatedProfiles = profiles.map(p => p.id === currentProfile.id ? updated : p);
    setProfiles(updatedProfiles);
    setSettingPin(false);
    setNewPin('');
    setConfirmPin('');
    setPinError('');
    addNotification(currentProfile.pin ? 'PIN changed successfully' : 'PIN set successfully', 'success');
    saveToSupabase(updatedProfiles); // Sync
  };

  // === LOADING STATES ===
  if (profiles.length === 0 && !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-2xl text-gray-400">Loading profile...</p>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-2xl text-gray-400">Setting up your profile...</p>
      </div>
    );
  }

  // === RENDER ===
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-4 md:px-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black mb-12">Manage Profile</h1>

        {/* Profile Switcher Preview */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Users size={24} className="text-red-500" /> Your Profiles
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {profiles.map(profile => (
              <div 
                key={profile.id} 
                className={`relative bg-zinc-900/70 rounded-2xl p-6 border ${profile.isActive ? 'border-red-600' : 'border-white/10'} cursor-pointer hover:border-red-500 transition-all group`}
                onClick={() => switchProfile(profile)}
              >
                <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-red-600 flex items-center justify-center text-4xl font-bold">
                  {getAvatarLetter(profile.name)}
                </div>
                <p className="text-center font-bold">{profile.name}</p>
                {profile.isKids && <span className="block text-center text-sm text-green-400 mt-2">Kids Mode</span>}
                
                {profiles.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(profile.id);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/80 hover:bg-red-700 rounded-full p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button 
              onClick={addProfile}
              className="bg-zinc-900/70 rounded-2xl p-6 border border-dashed border-white/30 hover:border-red-500 transition-all flex flex-col justify-center items-center"
            >
              <Plus size={48} className="text-gray-400 mb-2" />
              <p className="font-bold text-gray-400">Add Profile</p>
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
            <div className="bg-zinc-900 rounded-2xl p-8 max-w-md border border-red-600/50 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <AlertTriangle size={40} className="text-red-500" />
                <h3 className="text-2xl font-bold">Delete Profile?</h3>
              </div>
              <p className="text-gray-300 mb-8 leading-relaxed">
                This action cannot be undone. All preferences, watch history, and My List for this profile will be permanently deleted.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 border border-white/20 rounded-lg hover:bg-white/10 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteProfile(deleteConfirm)}
                  className="flex-1 py-3 bg-red-600 rounded-lg font-bold hover:bg-red-700 transition"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Customization */}
        <div className="bg-zinc-900/70 rounded-3xl p-10 border border-white/10 mb-12">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <Edit size={24} className="text-red-500" /> Customize Profile
          </h2>
          <div className="space-y-8">
            {/* Name */}
            <div>
              <label className="block text-gray-300 mb-2">Profile Name</label>
              {editingName ? (
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 bg-black border border-white/20 p-4 rounded-lg text-white"
                  />
                  <button 
                    onClick={handleNameChange}
                    className="px-6 py-4 bg-red-600 rounded-lg font-bold hover:bg-red-700 transition"
                  >
                    <Save size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center bg-black border border-white/20 p-4 rounded-lg">
                  <p>{currentProfile.name}</p>
                  <button 
                    onClick={() => {
                      setNewName(currentProfile.name);
                      setEditingName(true);
                    }}
                    className="text-red-500 hover:text-red-400"
                  >
                    <Edit size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Kids Mode Toggle */}
            <div className="flex items-center justify-between py-4">
              <div>
                <span className="text-lg font-medium">Kids Mode</span>
                <p className="text-gray-400 text-sm">Safe content • Restricted access</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={currentProfile.isKids}
                  onChange={toggleKidsMode}
                  className="sr-only peer"
                  // If pin is active, the wrapper handles it, but let's prevent direct toggle visually if we wanted
                  readOnly={!!currentProfile.pin} 
                />
                <div className="w-14 h-8 bg-gray-700 rounded-full peer peer-checked:bg-red-600 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-6"></div>
              </label>
            </div>

            {currentProfile.isKids && (
              <div className="bg-green-900/30 rounded-2xl p-6 border border-green-600/40">
                <p className="text-green-400 font-bold mb-2">Kids Mode Active</p>
                <p className="text-gray-300 text-sm">Only age-appropriate content shown</p>
              </div>
            )}

            {currentProfile.isKids && (
              <div>
                <label className="block text-gray-300 mb-4">Recommended Age</label>
                <button 
                  onClick={handleMaturityClick}
                  className="w-full py-4 bg-zinc-800 rounded-lg text-left px-6 flex items-center justify-between hover:bg-zinc-700 transition"
                >
                  <span className="text-xl font-medium">{currentProfile.maturityLevel || 'All Ages'}</span>
                  <ChevronRight size={24} />
                </button>
              </div>
            )}

            {/* PIN Protection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-lg font-medium">Profile PIN Lock</span>
                  <p className="text-gray-400 text-sm">Require PIN to change settings</p>
                </div>
                <button 
                  onClick={() => setSettingPin(true)}
                  className="px-6 py-3 bg-red-600 rounded-lg font-medium hover:bg-red-700 transition"
                >
                  {currentProfile.pin ? 'Change PIN' : 'Set PIN'}
                </button>
              </div>
              {currentProfile.pin && (
                <p className="text-green-400 text-sm flex items-center gap-2">
                  <Lock size={16} /> PIN protection active
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Your Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-zinc-900/70 rounded-2xl p-6 text-center">
              <Film size={32} className="mx-auto mb-2 text-red-500" />
              <p className="text-3xl font-black">{stats.watched}</p>
              <p className="text-gray-400">Watched</p>
            </div>
            <div className="bg-zinc-900/70 rounded-2xl p-6 text-center">
              <Clock size={32} className="mx-auto mb-2 text-red-500" />
              <p className="text-3xl font-black">{stats.hours}</p>
              <p className="text-gray-400">Hours</p>
            </div>
            <div className="bg-zinc-900/70 rounded-2xl p-6 text-center">
              <Zap size={32} className="mx-auto mb-2 text-red-500" />
              <p className="text-3xl font-black">{stats.streak}</p>
              <p className="text-gray-400">Day Streak</p>
            </div>
            <div className="bg-zinc-900/70 rounded-2xl p-6 text-center">
              <Trophy size={32} className="mx-auto mb-2 text-red-500" />
              <p className="text-3xl font-black">{badges.length}</p>
              <p className="text-gray-400">Badges</p>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Activity Timeline</h2>
          <div className="space-y-6 max-h-80 overflow-y-auto">
            {activityTimeline.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <Calendar size={24} className="text-red-500" />
                  <p>{item.title}</p>
                </div>
                <p className="text-gray-500 text-sm">{item.time}</p>
              </div>
            ))}
            {activityTimeline.length === 0 && (
              <p className="text-center text-gray-500 py-8">No recent activity. Start watching!</p>
            )}
          </div>
        </div>

        {/* Achievements/Badges */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Achievements & Badges</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {badges.map((badge, i) => (
              <div key={i} className="bg-zinc-900/70 rounded-2xl p-6 text-center">
                <Trophy size={32} className="mx-auto mb-2 text-yellow-500" />
                <p className="font-bold">{badge}</p>
              </div>
            ))}
          </div>
          {badges.length === 0 && (
            <p className="text-center text-gray-500 py-8">No badges yet. Watch more to earn!</p>
          )}
        </div>

        {/* Devices */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Device Management</h2>
          <div className="space-y-6">
            {devices.map((device, i) => (
              <div key={i} className="flex items-center justify-between bg-zinc-900/70 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-4">
                  <Smartphone size={32} className="text-red-500" />
                  <div>
                    <p className="font-bold">{device.name}</p>
                    <p className="text-gray-500 text-sm">{device.lastActive}</p>
                  </div>
                </div>
                <button 
                  onClick={() => alert('Device removed!')}
                  className="text-red-500 hover:text-red-400 font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="bg-gradient-to-br from-red-900/30 to-zinc-900 rounded-3xl p-12 text-center border border-red-600/40">
          <h2 className="text-3xl font-bold mb-6">Unlock Premium Features</h2>
          <p className="text-lg text-gray-300 mb-10">
            Get multiple profiles, offline downloads, and more.
          </p>
          <button 
            onClick={() => navigate('/account-settings')}
            className="px-12 py-4 bg-red-600 rounded-full font-bold hover:bg-red-700 transition"
          >
            Upgrade Now
          </button>
        </div>

        {/* PIN Modal */}
        {showPinModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
            <div className="bg-zinc-900 rounded-2xl p-8 max-w-sm w-full border border-white/20">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Lock size={28} className="text-red-500" /> Enter PIN
              </h3>
              <input 
                type="password"
                maxLength="4"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-3xl tracking-widest bg-black border border-white/20 rounded-lg py-4 mb-4"
                placeholder="••••"
                autoFocus
              />
              {pinError && <p className="text-red-500 text-center mb-4">{pinError}</p>}
              <div className="flex gap-4">
                <button onClick={() => {
                  setShowPinModal(false);
                  setPinInput('');
                  setPinError('');
                  setPinPurpose(null);
                }} className="flex-1 py-3 border border-white/20 rounded-lg hover:bg-white/10 transition font-medium">
                  Cancel
                </button>
                <button onClick={handlePinUnlock} className="flex-1 py-3 bg-red-600 rounded-lg font-bold hover:bg-red-700 transition">
                  Unlock
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Set PIN Modal */}
        {settingPin && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
            <div className="bg-zinc-900 rounded-2xl p-8 max-w-sm w-full border border-white/20">
              <h3 className="text-2xl font-bold mb-6">{currentProfile.pin ? 'Change PIN' : 'Set PIN'}</h3>
              <input 
                type="password"
                maxLength="4"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="New 4-digit PIN"
                className="w-full text-center text-2xl tracking-widest bg-black border border-white/20 rounded-lg py-4 mb-4"
              />
              <input 
                type="password"
                maxLength="4"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Confirm PIN"
                className="w-full text-center text-2xl tracking-widest bg-black border border-white/20 rounded-lg py-4 mb-4"
              />
              {pinError && <p className="text-red-500 text-center mb-4">{pinError}</p>}
              <div className="flex gap-4">
                <button onClick={() => {
                  setSettingPin(false);
                  setNewPin('');
                  setConfirmPin('');
                  setPinError('');
                }} className="flex-1 py-3 border border-white/20 rounded-lg hover:bg-white/10 transition">
                  Cancel
                </button>
                <button onClick={handleSetPin} className="flex-1 py-3 bg-red-600 rounded-lg font-bold hover:bg-red-700 transition">
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Age Rating Selector Modal */}
        {showMaturity && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center px-4 overflow-y-auto py-8">
            <div className="bg-zinc-900 rounded-3xl w-full max-w-lg border border-zinc-800 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-10">
                <h2 className="text-3xl font-bold text-center mb-4">Content Rating</h2>
                <p className="text-gray-400 text-center mb-10 text-lg">
                  Select the highest age rating allowed for this profile
                </p>

                <div className="space-y-5">
                  {kidMaturityLevels.map((level) => (
                    <button
                      key={level.rating}
                      onClick={() => setSelectedMaturity(level.rating)}
                      className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                        selectedMaturity === level.rating
                          ? 'bg-red-600/20 border-red-600 shadow-lg shadow-red-600/20'
                          : 'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold mb-1">{level.rating}</p>
                          <p className="text-gray-300">{level.desc}</p>
                        </div>
                        {selectedMaturity === level.rating && (
                          <Check size={32} className="text-red-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 p-6 -mx-10 mt-8">
                <div className="flex gap-4 max-w-md mx-auto">
                  <button
                    onClick={() => setShowMaturity(false)}
                    className="flex-1 py-4 border border-zinc-600 rounded-xl font-semibold text-lg hover:bg-zinc-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveMaturityLevel}
                    className="flex-1 py-4 bg-red-600 rounded-xl font-bold text-lg hover:bg-red-700 transition shadow-lg"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageProfile;