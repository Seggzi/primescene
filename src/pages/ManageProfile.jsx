import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import {
  Check, Users, Shield, Clock, Film, Trophy,
  Smartphone, Zap, Calendar, ChevronRight, Edit, Save, Plus,
  Trash2, AlertTriangle, Lock, Eye, EyeOff, Settings,
  Download, Globe, Volume2, Monitor, HardDrive, Info
} from 'lucide-react';
import { supabase } from '../supabase';

function ManageProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  // ==========================================
  // 1. COMPREHENSIVE STATE INITIALIZATION
  // ==========================================
  const [profiles, setProfiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Security & PIN States
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [settingPin, setSettingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPinVisibility, setShowPinVisibility] = useState(false);
  
  // Maturity & Kids States
  const [showMaturity, setShowMaturity] = useState(false);
  const [selectedMaturity, setSelectedMaturity] = useState('All Ages');
  const [pinPurpose, setPinPurpose] = useState(null);

  // Stats & Activity States
  const [activityTimeline, setActivityTimeline] = useState([]);
  const [stats, setStats] = useState({
    watched: 0,
    hours: 0,
    favoriteGenre: 'N/A',
    streak: 0,
    badges: []
  });

  // Device & App States
  const [devices, setDevices] = useState([]);
  const [appSettings, setAppSettings] = useState({
    quality: 'Auto',
    downloadWifiOnly: true,
    autoplayNext: true,
    autoplayPreviews: true,
    language: 'English',
    subtitleStyle: 'Default',
    audioDescription: false,
    pipMode: true
  });

  const kidMaturityLevels = [
    { rating: 'All Ages', desc: 'Suitable for all ages. Standard G-rated content.' },
    { rating: '7+', desc: 'May contain mild fantasy violence or themes.' },
    { rating: '10+', desc: 'May contain mild language or crude humor.' },
    { rating: '13+', desc: 'May contain moderate violence or suggestive themes.' },
    { rating: '16+', desc: 'Contains strong language, violence, or mature themes.' }
  ];

  // ==========================================
  // 2. DATA SYNC & CLOUD LOGIC
  // ==========================================
  
  const pushToCloud = async (newData) => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from('users')
        .update(newData)
        .eq('id', user.id);
      if (error) throw error;
    } catch (err) {
      console.error("Cloud Sync Failed:", err.message);
      addNotification("Sync failed: " + err.message, "error");
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    // Real-time Database Listener
    const channel = supabase
      .channel(`full-profile-sync-${user.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'users', 
        filter: `id=eq.${user.id}` 
      }, (payload) => {
        const data = payload.new;
        if (data.profiles) setProfiles(data.profiles);
        if (data.activity) setActivityTimeline(data.activity);
        if (data.stats) setStats(data.stats);
        if (data.app_settings) setAppSettings(data.app_settings);
      })
      .subscribe();

    const fetchAllUserData = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfiles(data.profiles || []);
        setActivityTimeline(data.activity || []);
        setStats(data.stats || stats);
        setAppSettings(data.app_settings || appSettings);
        
        // Populate devices from Browser API if empty
        if (!data.devices || data.devices.length === 0) {
          const currentDevice = {
            id: Date.now(),
            name: navigator.platform + " (" + navigator.vendor + ")",
            lastActive: new Date().toISOString(),
            ip: 'Detecting...',
            isCurrent: true
          };
          setDevices([currentDevice]);
          pushToCloud({ devices: [currentDevice] });
        } else {
          setDevices(data.devices);
        }
      }
    };

    fetchAllUserData();
    return () => supabase.removeChannel(channel);
  }, [user]);

  // Handle Profile Selection
  useEffect(() => {
    if (profiles.length > 0) {
      const active = profiles.find(p => p.isActive) || profiles[0];
      setCurrentProfile(active);
      setNewName(active.name);
      setSelectedMaturity(active.maturityLevel || 'All Ages');
    }
  }, [profiles]);

  // ==========================================
  // 3. HANDLERS & CORE ACTIONS
  // ==========================================

  const handleNameChange = async () => {
    if (!newName.trim()) return;
    const updated = profiles.map(p => 
      p.id === currentProfile.id ? { ...p, name: newName.trim() } : p
    );
    setProfiles(updated);
    setEditingName(false);
    await pushToCloud({ profiles: updated });
    addNotification("Profile name updated", "success");
  };

  const switchProfile = async (targetProfile) => {
    const updated = profiles.map(p => ({
      ...p,
      isActive: p.id === targetProfile.id
    }));
    setProfiles(updated);
    await pushToCloud({ profiles: updated });
    addNotification(`Switched to ${targetProfile.name}`, "success");
  };

  const addProfile = async () => {
    if (profiles.length >= 5) {
      addNotification("Maximum of 5 profiles reached", "error");
      return;
    }
    const newP = {
      id: Date.now(),
      name: `User ${profiles.length + 1}`,
      isActive: false,
      isKids: false,
      pin: null,
      maturityLevel: 'All Ages',
      avatarColor: 'bg-red-600'
    };
    const updated = [...profiles, newP];
    setProfiles(updated);
    await pushToCloud({ profiles: updated });
    addNotification("New profile created", "success");
  };

  const confirmDelete = async () => {
    if (profiles.length <= 1) return;
    const updated = profiles.filter(p => p.id !== deleteConfirm);
    if (currentProfile.id === deleteConfirm) {
      updated[0].isActive = true;
    }
    setProfiles(updated);
    setDeleteConfirm(null);
    await pushToCloud({ profiles: updated });
    addNotification("Profile deleted", "info");
  };

  const saveMaturityLevel = async () => {
    const updatedProfiles = profiles.map(p => 
      p.id === currentProfile.id ? { ...p, maturityLevel: selectedMaturity } : p
    );
    setProfiles(updatedProfiles);
    setShowMaturity(false);
    await pushToCloud({ profiles: updatedProfiles });
    addNotification(`Maturity level set to ${selectedMaturity}`, "success");
  };

  const deleteActivityItem = async (indexToDelete) => {
    const updatedActivity = activityTimeline.filter((_, index) => index !== indexToDelete);
    setActivityTimeline(updatedActivity);
    await pushToCloud({ activity: updatedActivity });
    addNotification("Item removed from history", "info");
  };

  const clearAllActivity = async () => {
    setActivityTimeline([]);
    await pushToCloud({ activity: [] });
    addNotification("Viewing activity cleared", "success");
  };

  // Security Handlers
  const handlePinUnlock = () => {
    if (pinInput === currentProfile.pin) {
      setShowPinModal(false);
      setPinInput('');
      setPinError('');
      if (pinPurpose === 'toggleKids') finalizeKidsToggle();
      if (pinPurpose === 'openMaturity') setShowMaturity(true);
      setPinPurpose(null);
    } else {
      setPinError("Incorrect PIN. Please try again.");
      setPinInput('');
    }
  };

  const finalizeKidsToggle = async () => {
    const updated = profiles.map(p => {
      if (p.id === currentProfile.id) {
        const nextMode = !p.isKids;
        return { 
          ...p, 
          isKids: nextMode, 
          maturityLevel: nextMode ? 'All Ages' : '16+' 
        };
      }
      return p;
    });
    setProfiles(updated);
    await pushToCloud({ profiles: updated });
  };

  const handleSetPin = async () => {
    if (newPin !== confirmPin) {
      setPinError("PINs do not match");
      return;
    }
    if (newPin.length < 4) {
      setPinError("PIN must be 4 digits");
      return;
    }
    const updated = profiles.map(p => 
      p.id === currentProfile.id ? { ...p, pin: newPin } : p
    );
    setProfiles(updated);
    setSettingPin(false);
    setNewPin('');
    setConfirmPin('');
    await pushToCloud({ profiles: updated });
    addNotification("Profile PIN updated", "success");
  };

  const updateAppSettings = async (key, value) => {
    const newSettings = { ...appSettings, [key]: value };
    setAppSettings(newSettings);
    await pushToCloud({ app_settings: newSettings });
    addNotification(`${key.replace(/([A-Z])/g, ' $1')} Updated`, "success");
  };

  if (!currentProfile) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600">Loading Configuration...</div>;

  // ==========================================
  // 4. UI RENDER (FULL PAGE)
  // ==========================================
  return (
    <div className="min-h-screen bg-black text-white pt-24 md:pt-28 pb-20 px-4 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2">MANAGE PROFILE</h1>
            <p className="text-zinc-500 font-medium tracking-wide text-sm md:text-base">Customize your experience and viewing preferences.</p>
          </div>
          <div className="flex items-center gap-3 md:gap-4 bg-zinc-900/50 p-2 rounded-2xl border border-white/5 self-start md:self-auto">
            <button onClick={() => navigate('/settings')} className="p-3 hover:bg-white/10 rounded-xl transition-all">
              <Settings size={22} className="text-zinc-400" />
            </button>
            <button className="p-3 hover:bg-white/10 rounded-xl transition-all">
              <Info size={22} className="text-zinc-400" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Profile Selector & Stats */}
          <div className="lg:col-span-4 space-y-6 md:space-y-8">
            
            {/* Profile Grid */}
            <section className="bg-zinc-900/40 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8">
              <h3 className="text-[10px] md:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6 md:mb-8">Switch Profile</h3>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {profiles.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => switchProfile(p)}
                    className={`relative p-3 md:p-4 rounded-2xl md:rounded-3xl border transition-all cursor-pointer group ${p.isActive ? 'bg-red-600 border-red-500 shadow-xl shadow-red-900/20' : 'bg-black/40 border-white/5 hover:border-white/20'}`}
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/20 flex items-center justify-center text-lg md:text-xl font-bold mb-2 md:mb-3">
                      {p.name[0]}
                    </div>
                    <p className={`font-bold truncate text-sm md:text-base ${p.isActive ? 'text-white' : 'text-zinc-400'}`}>{p.name}</p>
                    {p.isKids && <Shield size={14} className="mt-1 text-white/60" />}
                    {profiles.length > 1 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(p.id); }}
                        className="absolute top-2 right-2 md:top-3 md:right-3 opacity-0 group-hover:opacity-100 p-2 bg-black/50 rounded-lg hover:bg-red-500 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  onClick={addProfile}
                  className="p-3 md:p-4 rounded-2xl md:rounded-3xl border border-dashed border-white/20 hover:border-red-500 flex flex-col items-center justify-center gap-1 md:gap-2 group transition-all"
                >
                  <Plus size={24} className="text-zinc-500 group-hover:text-red-500" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">New</span>
                </button>
              </div>
            </section>

            {/* Quick Stats Card */}
            <section className="bg-gradient-to-br from-zinc-900 to-black border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8">
              <h3 className="text-[10px] md:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6 md:mb-8">Personal Insights</h3>
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-500"><Film size={20} /></div>
                    <span className="text-zinc-400 font-medium text-sm">Watched</span>
                  </div>
                  <span className="text-lg md:text-xl font-black">{stats.watched}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500"><Clock size={20} /></div>
                    <span className="text-zinc-400 font-medium text-sm">Hours</span>
                  </div>
                  <span className="text-lg md:text-xl font-black">{stats.hours}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-yellow-600/10 flex items-center justify-center text-yellow-500"><Zap size={20} /></div>
                    <span className="text-zinc-400 font-medium text-sm">Streak</span>
                  </div>
                  <span className="text-lg md:text-xl font-black">{stats.streak} Days</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Settings, Timeline, Security */}
          <div className="lg:col-span-8 space-y-6 md:space-y-8">
            
            {/* Main Settings Card */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden">
              <div className="p-6 md:p-10 border-b border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-[2rem] bg-red-600 flex items-center justify-center text-2xl md:text-4xl font-black shadow-2xl shadow-red-600/20">
                      {currentProfile.name[0]}
                    </div>
                    <div>
                      {editingName ? (
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={newName} 
                            onChange={e => setNewName(e.target.value)}
                            className="bg-black border border-red-600/50 rounded-xl px-3 py-1.5 md:px-4 md:py-2 text-sm focus:outline-none focus:ring-2 ring-red-600/20 w-32 md:w-auto"
                          />
                          <button onClick={handleNameChange} className="p-2 bg-red-600 rounded-xl hover:bg-red-700"><Save size={20} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 md:gap-3">
                          <h2 className="text-xl md:text-3xl font-black">{currentProfile.name}</h2>
                          <button onClick={() => setEditingName(true)} className="text-zinc-500 hover:text-white"><Edit size={18} /></button>
                        </div>
                      )}
                      <p className="text-zinc-500 font-bold text-[10px] md:text-sm mt-1 uppercase tracking-widest">{currentProfile.isKids ? 'Kids Profile' : 'Adult Profile'}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setSettingPin(true)}
                      className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Lock size={16} /> {currentProfile.pin ? 'Change PIN' : 'Add PIN'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-10 space-y-8 md:space-y-10">
                {/* Kids Mode Toggle */}
                <div className="flex items-center justify-between group">
                  <div className="space-y-1">
                    <h4 className="text-base md:text-lg font-bold flex items-center gap-2">
                      Kids Experience
                      {currentProfile.isKids && <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full uppercase">Active</span>}
                    </h4>
                    <p className="text-zinc-500 text-xs md:text-sm max-w-md">Restricts content and simplifies UI.</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (currentProfile.pin) { setPinPurpose('toggleKids'); setShowPinModal(true); }
                      else { finalizeKidsToggle(); }
                    }}
                    className={`w-14 h-8 md:w-16 md:h-9 rounded-full relative transition-all ${currentProfile.isKids ? 'bg-red-600' : 'bg-zinc-800'}`}
                  >
                    <div className={`absolute top-1 md:top-1.5 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${currentProfile.isKids ? 'right-1 md:right-1.5' : 'left-1 md:left-1.5'}`} />
                  </button>
                </div>

                {/* Maturity Rating */}
                <div className="flex items-center justify-between group">
                  <div className="space-y-1">
                    <h4 className="text-base md:text-lg font-bold">Maturity Rating</h4>
                    <p className="text-zinc-500 text-xs md:text-sm">Showing titles rated <span className="text-white font-bold">{currentProfile.maturityLevel}</span> and below.</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (currentProfile.pin) { setPinPurpose('openMaturity'); setShowPinModal(true); }
                      else { setShowMaturity(true); }
                    }}
                    className="flex items-center gap-1 text-red-500 font-bold text-sm hover:underline"
                  >
                    Edit <ChevronRight size={18} />
                  </button>
                </div>

                {/* Playback Settings - NEW INTERNAL FEATURES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2"><Monitor size={14} /> Playback Options</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">Autoplay Next Episode</span>
                        <input type="checkbox" checked={appSettings.autoplayNext} onChange={e => updateAppSettings('autoplayNext', e.target.checked)} className="accent-red-600 w-4 h-4" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">Autoplay Previews</span>
                        <input type="checkbox" checked={appSettings.autoplayPreviews} onChange={e => updateAppSettings('autoplayPreviews', e.target.checked)} className="accent-red-600 w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2"><Globe size={14} /> Regional & Data</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">Language</span>
                        <select 
                          className="bg-black border-none text-red-500 font-bold text-[10px] focus:ring-0 cursor-pointer"
                          value={appSettings.language}
                          onChange={e => updateAppSettings('language', e.target.value)}
                        >
                          <option>English</option>
                          <option>Spanish</option>
                          <option>French</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">Data Usage</span>
                        <select 
                          className="bg-black border-none text-red-500 font-bold text-[10px] focus:ring-0 cursor-pointer"
                          value={appSettings.quality}
                          onChange={e => updateAppSettings('quality', e.target.value)}
                        >
                          <option>Auto</option>
                          <option>High (4K)</option>
                          <option>Saver</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Timeline Section */}
            <section className="bg-zinc-900/40 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-base md:text-lg font-bold flex items-center gap-3">
                  <Calendar size={20} className="text-red-500" /> Viewing Activity
                </h3>
                <button 
                  onClick={clearAllActivity}
                  className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-6">
                {activityTimeline.length > 0 ? activityTimeline.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                      <div>
                        <p className="font-bold text-sm group-hover:text-red-500 transition-colors">{item.title}</p>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">{item.date || 'Today'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteActivityItem(i)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )) : (
                  <div className="text-center py-6 md:py-10">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Film size={24} className="text-zinc-700" />
                    </div>
                    <p className="text-zinc-500 text-xs md:text-sm font-medium">No recent activity detected.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* ==========================================
            5. MODALS & OVERLAYS (PART 2 INTEGRATION)
        ========================================== */}

        {/* PIN Entry Modal */}
        {showPinModal && (
          <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-zinc-900 w-full max-w-sm rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 border border-white/10 text-center shadow-2xl">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-red-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Lock size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl md:text-2xl font-black mb-2">Profile Locked</h3>
              <p className="text-zinc-500 text-xs md:text-sm mb-8">Enter the 4-digit PIN for {currentProfile.name} to continue.</p>
              
              <div className="relative mb-8">
                <input 
                  type={showPinVisibility ? "text" : "password"}
                  maxLength="4"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-black border-2 border-white/5 rounded-2xl py-4 text-center text-3xl md:text-4xl font-black tracking-[0.5em] focus:border-red-600 focus:outline-none transition-all"
                  autoFocus
                />
                <button 
                  onClick={() => setShowPinVisibility(!showPinVisibility)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
                >
                  {showPinVisibility ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {pinError && <p className="text-red-500 text-[10px] font-bold mb-6">{pinError}</p>}
              
              <div className="flex gap-4">
                <button onClick={() => { setShowPinModal(false); setPinInput(''); setPinError(''); }} className="flex-1 py-4 font-bold text-zinc-500 hover:text-white transition-colors text-sm">Cancel</button>
                <button onClick={handlePinUnlock} className="flex-1 py-4 bg-red-600 rounded-2xl font-black hover:bg-red-700 shadow-lg shadow-red-900/20 transition-all text-sm">Unlock</button>
              </div>
            </div>
          </div>
        )}

        {/* Set/Change PIN Modal */}
        {settingPin && (
          <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-zinc-900 w-full max-w-md rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 border border-white/10 shadow-2xl">
              <h3 className="text-xl md:text-2xl font-black mb-8">Profile Lock Settings</h3>
              <div className="space-y-6 mb-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">New 4-Digit PIN</label>
                  <input 
                    type="password" 
                    maxLength="4" 
                    value={newPin}
                    onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-black border border-white/5 rounded-xl py-3 md:py-4 text-center text-2xl font-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Confirm PIN</label>
                  <input 
                    type="password" 
                    maxLength="4" 
                    value={confirmPin}
                    onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-black border border-white/5 rounded-xl py-3 md:py-4 text-center text-2xl font-black"
                  />
                </div>
              </div>
              {pinError && <p className="text-red-500 text-center text-[10px] font-bold mb-6">{pinError}</p>}
              <div className="flex gap-4">
                <button onClick={() => { setSettingPin(false); setNewPin(''); setConfirmPin(''); }} className="flex-1 py-4 font-bold text-zinc-500 text-sm">Cancel</button>
                <button onClick={handleSetPin} className="flex-1 py-4 bg-red-600 rounded-2xl font-black hover:bg-red-700 text-sm">Save PIN</button>
              </div>
            </div>
          </div>
        )}

        {/* Maturity Selection Modal */}
        {showMaturity && (
          <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 md:p-10">
            <div className="bg-zinc-900 w-full max-w-3xl rounded-[2.5rem] md:rounded-[3rem] border border-white/10 flex flex-col max-h-[90vh]">
              <div className="p-8 md:p-10 border-b border-white/5">
                <h3 className="text-2xl md:text-3xl font-black">Content Restrictions</h3>
                <p className="text-zinc-500 mt-2 font-medium text-xs md:text-sm">Select the highest maturity level allowed for this profile.</p>
              </div>
              <div className="p-6 md:p-10 overflow-y-auto space-y-4">
                {kidMaturityLevels.map((lvl) => (
                  <button 
                    key={lvl.rating}
                    onClick={() => setSelectedMaturity(lvl.rating)}
                    className={`w-full text-left p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 transition-all flex items-center justify-between group ${selectedMaturity === lvl.rating ? 'border-red-600 bg-red-600/5' : 'border-white/5 hover:border-white/10 bg-black/20'}`}
                  >
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center text-base md:text-xl font-black transition-colors ${selectedMaturity === lvl.rating ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-500 group-hover:text-zinc-300'}`}>
                        {lvl.rating}
                      </div>
                      <div>
                        <h4 className="font-black text-sm md:text-lg">{lvl.rating} Rating</h4>
                        <p className="text-zinc-500 text-[10px] md:text-sm font-medium">{lvl.desc}</p>
                      </div>
                    </div>
                    {selectedMaturity === lvl.rating && <Check className="text-red-600" size={24} md:size={28} />}
                  </button>
                ))}
              </div>
              <div className="p-8 md:p-10 border-t border-white/5 flex gap-4">
                <button onClick={() => setShowMaturity(false)} className="px-6 md:px-10 py-4 font-bold text-zinc-500 text-sm">Cancel</button>
                <button 
                  onClick={saveMaturityLevel}
                  className="flex-1 py-4 bg-red-600 rounded-2xl font-black text-base md:text-lg hover:bg-red-700 shadow-xl shadow-red-900/20 transition-all"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
            <div className="bg-zinc-900 max-w-md w-full rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 border border-red-900/30 text-center shadow-2xl">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                <AlertTriangle size={36} md:size={40} />
              </div>
              <h3 className="text-2xl md:text-3xl font-black mb-4">Delete Profile?</h3>
              <p className="text-zinc-500 font-medium mb-10 leading-relaxed text-sm">
                Permanently delete viewing history and personalized settings. This cannot be undone.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 font-bold text-zinc-500 text-sm">Keep It</button>
                <button onClick={confirmDelete} className="flex-1 py-4 bg-red-600 rounded-2xl font-black hover:bg-red-700 transition-all text-sm">Delete Forever</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ManageProfile;