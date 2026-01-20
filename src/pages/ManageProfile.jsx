import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import {
  Check, Users, Shield, Clock, Film, Trophy,
  Smartphone, Zap, Calendar, ChevronRight, Edit, Save, Plus,
  Trash2, AlertTriangle, Lock, Eye, EyeOff, Settings,
  Download, Globe, Volume2, Monitor, HardDrive, Info, Star, Award,
  LogOut, Laptop, Tablet, CreditCard, Activity, Bell, HelpCircle
} from 'lucide-react';
import { supabase } from '../supabase';

function ManageProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  // ==========================================
  // 1. COMPREHENSIVE STATE ARCHITECTURE
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
    { rating: '16+', desc: 'Contains strong language, violence, or mature themes.' },
    { rating: '18+', desc: 'Adult content. May contain graphic violence or adult themes.' }
  ];

  // ==========================================
  // 2. ACHIEVEMENT & BADGE LIBRARY
  // ==========================================
  const badgeLibrary = [
    { 
      id: 'binge_pro', 
      name: 'Binge Pro', 
      icon: <Zap size={14}/>, 
      color: 'text-yellow-500', 
      req: '5+ Day Streak', 
      check: (s) => s.streak >= 5 
    },
    { 
      id: 'film_buff', 
      name: 'Film Buff', 
      icon: <Film size={14}/>, 
      color: 'text-blue-500', 
      req: '50+ Titles Watched', 
      check: (s) => s.watched >= 50 
    },
    { 
      id: 'marathoner', 
      name: 'Marathoner', 
      icon: <Clock size={14}/>, 
      color: 'text-purple-500', 
      req: '100+ Hours', 
      check: (s) => s.hours >= 100 
    },
    { 
      id: 'early_adopter', 
      name: 'Elite Member', 
      icon: <Award size={14}/>, 
      color: 'text-red-500', 
      req: 'Profile Created', 
      check: () => true 
    }
  ];

  const unlockedBadges = useMemo(() => {
    return badgeLibrary.filter(badge => badge.check(stats));
  }, [stats]);

  // ==========================================
  // 3. ADVANCED DEVICE DETECTION LOGIC
  // ==========================================
  const getDetailedDeviceName = () => {
    const ua = navigator.userAgent;
    const platform = navigator.platform;
    
    if (/iPhone/.test(ua)) {
      const w = window.screen.width;
      const h = window.screen.height;
      const pr = window.devicePixelRatio;

      if ((w === 430 && h === 932) || (w === 932 && h === 430)) return "iPhone 15/16 Pro Max";
      if ((w === 393 && h === 852) || (w === 852 && h === 393)) return "iPhone 15/16 Pro";
      if ((w === 428 && h === 926) || (w === 926 && h === 428)) return "iPhone 13/14 Pro Max";
      if ((w === 390 && h === 844) || (w === 844 && h === 390)) return "iPhone 13/14 Pro";
      if ((w === 375 && h === 812) || (w === 812 && h === 375)) return "iPhone 12/13 Mini";
      return "Apple iPhone";
    }

    if (/Android/.test(ua)) {
      const modelMatch = ua.match(/;\s([^;]+)\sBuild/);
      if (modelMatch && modelMatch[1]) return modelMatch[1];
      return "Android Device";
    }

    if (/Win/.test(platform)) {
      if (ua.includes("Windows NT 10.0")) return "Windows 10/11 PC";
      if (ua.includes("Windows NT 6.3")) return "Windows 8.1 PC";
      return "Windows PC";
    }
    
    if (/Mac/.test(platform)) return "Apple MacBook/iMac";
    if (/Linux/.test(platform)) return "Linux Workstation";

    return "Web Browser Session";
  };

  // ==========================================
  // 4. CLOUD SYNC & DATA PERSISTENCE
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
      console.error("Cloud Sync Error:", err.message);
      addNotification("Sync failed: " + err.message, "error");
    }
  };

  useEffect(() => {
    if (!user?.id) return;

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
        
        const currentDeviceName = getDetailedDeviceName();
        const existingDevices = data.devices || [];
        
        const isAlreadyRegistered = existingDevices.some(d => 
          d.name === currentDeviceName && d.isCurrent === true
        );

        if (!isAlreadyRegistered) {
          const newDevice = {
            id: 'dev-' + Math.random().toString(36).substr(2, 9),
            name: currentDeviceName,
            type: /iPhone|Android/.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
            lastActive: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isCurrent: true
          };
          
          const updatedDevicesList = [
            newDevice, 
            ...existingDevices.map(d => ({ ...d, isCurrent: false }))
          ];
          
          setDevices(updatedDevicesList);
          pushToCloud({ devices: updatedDevicesList });
        } else {
          setDevices(existingDevices);
        }
      }
    };

    fetchAllUserData();

    const channel = supabase
      .channel(`profile-updates-${user.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'users', 
        filter: `id=eq.${user.id}` 
      }, (payload) => {
        const d = payload.new;
        if (d.profiles) setProfiles(d.profiles);
        if (d.stats) setStats(d.stats);
        if (d.devices) setDevices(d.devices);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  useEffect(() => {
    if (profiles.length > 0) {
      const active = profiles.find(p => p.isActive) || profiles[0];
      setCurrentProfile(active);
      setNewName(active.name);
      setSelectedMaturity(active.maturityLevel || 'All Ages');
    }
  }, [profiles]);

  // ==========================================
  // 5. CORE ACTION HANDLERS
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
    addNotification("Profile removed", "info");
  };

  const removeDevice = async (deviceId) => {
    const updated = devices.filter(d => d.id !== deviceId);
    setDevices(updated);
    await pushToCloud({ devices: updated });
    addNotification("Device session signed out", "info");
  };

  const updateAppSettings = async (key, value) => {
    const newSettings = { ...appSettings, [key]: value };
    setAppSettings(newSettings);
    await pushToCloud({ app_settings: newSettings });
    addNotification("Settings updated", "success");
  };

  const handlePinUnlock = () => {
    if (pinInput === currentProfile.pin) {
      setShowPinModal(false);
      setPinInput('');
      setPinError('');
      if (pinPurpose === 'toggleKids') finalizeKidsToggle();
      if (pinPurpose === 'openMaturity') setShowMaturity(true);
      setPinPurpose(null);
    } else {
      setPinError("Incorrect PIN");
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
    addNotification("PIN updated successfully", "success");
  };

  const saveMaturityLevel = async () => {
    const updatedProfiles = profiles.map(p => 
      p.id === currentProfile.id ? { ...p, maturityLevel: selectedMaturity } : p
    );
    setProfiles(updatedProfiles);
    setShowMaturity(false);
    await pushToCloud({ profiles: updatedProfiles });
    addNotification(`Maturity level: ${selectedMaturity}`, "success");
  };

  const clearAllActivity = async () => {
    setActivityTimeline([]);
    await pushToCloud({ activity: [] });
    addNotification("Activity history cleared", "success");
  };

  if (!currentProfile) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-bold">LOADING DATA...</div>;

  return (
    <div className="min-h-screen bg-black text-white pt-24 md:pt-32 pb-40 px-4 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-2 uppercase">Manage Profile</h1>
            <p className="text-zinc-400 font-medium text-base md:text-lg tracking-wide">Customize your viewing experience and manage devices</p>
          </div>
          <div className="flex items-center gap-4 bg-zinc-900/70 p-3 rounded-2xl border border-zinc-800 self-start md:self-auto">
            <button 
              onClick={() => navigate('/account-settings')} 
              className="p-3 hover:bg-zinc-800 rounded-xl transition-all group"
            >
              <Settings size={22} className="text-zinc-400 group-hover:text-red-500 group-hover:rotate-45 transition-all" />
            </button>
            <button className="p-3 hover:bg-zinc-800 rounded-xl transition-all">
              <HelpCircle size={22} className="text-zinc-400 hover:text-zinc-300 transition-colors" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Profiles, Stats & Recent Activity */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Profile Grid */}
            <section className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 shadow-xl">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-8">Profiles</h3>
              <div className="grid grid-cols-2 gap-5">
                {profiles.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => switchProfile(p)}
                    className={`relative p-6 rounded-2xl border transition-all cursor-pointer group ${p.isActive ? 'bg-red-600/20 border-red-600 shadow-lg shadow-red-900/30' : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-600'}`}
                  >
                    <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center text-2xl font-black mb-4">
                      {p.name[0]}
                    </div>
                    <p className={`font-bold truncate text-base ${p.isActive ? 'text-white' : 'text-zinc-300'}`}>{p.name}</p>
                    {p.isKids && <Shield size={14} className="mt-2 text-emerald-400" />}
                    {profiles.length > 1 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(p.id); }}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-2 bg-black/60 rounded-lg hover:bg-red-600/80 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  onClick={addProfile}
                  className="p-6 rounded-2xl border border-dashed border-zinc-700 hover:border-red-600 flex flex-col items-center justify-center gap-3 group transition-all"
                >
                  <Plus size={28} className="text-zinc-500 group-hover:text-red-500 transition-colors" />
                  <span className="text-sm font-bold text-zinc-500 group-hover:text-zinc-300 uppercase tracking-wide">Add Profile</span>
                </button>
              </div>
            </section>

            {/* User Stats Card */}
            <section className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 shadow-xl">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-8">Your Stats</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-900/30 flex items-center justify-center text-red-500">
                      <Film size={20} />
                    </div>
                    <span className="text-zinc-300 font-medium">Titles Watched</span>
                  </div>
                  <span className="text-2xl font-black">{stats.watched}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-900/30 flex items-center justify-center text-yellow-500">
                      <Zap size={20} />
                    </div>
                    <span className="text-zinc-300 font-medium">Streak</span>
                  </div>
                  <span className="text-2xl font-black text-yellow-400">{stats.streak}d</span>
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-800 mt-6">
                <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-5">Achievements</h4>
                <div className="flex flex-wrap gap-3">
                  {unlockedBadges.length > 0 ? unlockedBadges.map(badge => (
                    <div key={badge.id} className="flex items-center gap-2 px-4 py-2 bg-zinc-800/60 rounded-full border border-zinc-700 hover:border-zinc-500 transition-all">
                      <span className={badge.color}>{badge.icon}</span>
                      <span className="text-sm font-bold text-zinc-200">{badge.name}</span>
                    </div>
                  )) : (
                    <p className="text-sm text-zinc-500 italic">Watch more to unlock badges</p>
                  )}
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                  <Calendar size={24} className="text-red-500" /> Recent Activity
                </h3>
                <button 
                  onClick={clearAllActivity}
                  className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-6">
                {activityTimeline.length > 0 ? activityTimeline.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-zinc-800 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                      <p className="font-medium text-base">{item.title || 'Watched content'}</p>
                    </div>
                    <span className="text-sm text-zinc-500">{item.date || 'Recent'}</span>
                  </div>
                )) : (
                  <div className="text-center py-16 opacity-60">
                    <Activity size={40} className="mx-auto mb-4 text-zinc-600" />
                    <p className="text-base font-medium">No recent activity yet</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Profile Details & Devices */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Profile Detail Card */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-10 border-b border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-red-600 flex items-center justify-center text-4xl font-black shadow-lg shadow-red-900/40">
                      {currentProfile.name[0]}
                    </div>
                    <div>
                      {editingName ? (
                        <div className="flex gap-3">
                          <input 
                            type="text" 
                            value={newName} 
                            onChange={e => setNewName(e.target.value)}
                            className="bg-zinc-950 border border-red-600/50 rounded-xl px-5 py-3 text-lg focus:outline-none focus:ring-2 ring-red-600/30 w-64"
                          />
                          <button onClick={handleNameChange} className="p-3 bg-red-600 rounded-xl hover:bg-red-700 transition-all">
                            <Save size={22} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <h2 className="text-3xl md:text-4xl font-black tracking-tight">{currentProfile.name}</h2>
                          <button onClick={() => setEditingName(true)} className="text-zinc-400 hover:text-white transition-colors">
                            <Edit size={22} />
                          </button>
                        </div>
                      )}
                      <p className="text-zinc-500 font-medium text-sm mt-2 uppercase tracking-wide">
                        {currentProfile.isKids ? 'Kids Profile • Restricted' : 'Standard Profile'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSettingPin(true)}
                    className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-semibold text-base transition-all flex items-center gap-3 border border-zinc-700"
                  >
                    <Lock size={18} /> {currentProfile.pin ? 'Manage PIN' : 'Add PIN Lock'}
                  </button>
                </div>
              </div>

              <div className="p-10 space-y-12">
                {/* Kids Toggle */}
                <div className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <h4 className="text-xl font-semibold flex items-center gap-3">
                      Kids Profile
                      {currentProfile.isKids && (
                        <span className="text-xs bg-emerald-900/40 text-emerald-400 px-3 py-1 rounded-full font-medium">
                          Active
                        </span>
                      )}
                    </h4>
                    <p className="text-zinc-400 text-base">Family-friendly content and simplified interface</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (currentProfile.pin) { setPinPurpose('toggleKids'); setShowPinModal(true); }
                      else { finalizeKidsToggle(); }
                    }}
                    className={`w-16 h-8 rounded-full relative transition-all ${currentProfile.isKids ? 'bg-emerald-600' : 'bg-zinc-700'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${currentProfile.isKids ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>

                {/* Maturity Rating */}
                <div className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <h4 className="text-xl font-semibold">Content Maturity</h4>
                    <p className="text-zinc-400 text-base">
                      Maximum allowed rating: <span className="text-white font-medium">{currentProfile.maturityLevel}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      if (currentProfile.pin) { setPinPurpose('openMaturity'); setShowPinModal(true); }
                      else { setShowMaturity(true); }
                    }}
                    className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-medium text-base transition-all border border-zinc-700"
                  >
                    Change
                  </button>
                </div>

                {/* Technical Preferences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-zinc-800">
                  <div className="space-y-6">
                    <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                      <Monitor size={18} /> Playback Settings
                    </h4>
                    <div className="space-y-5">
                      <div className="flex items-center justify-between text-base">
                        <span className="text-zinc-300">Autoplay Next Episode</span>
                        <input 
                          type="checkbox" 
                          checked={appSettings.autoplayNext} 
                          onChange={e => updateAppSettings('autoplayNext', e.target.checked)} 
                          className="w-5 h-5 accent-red-600 rounded" 
                        />
                      </div>
                      <div className="flex items-center justify-between text-base">
                        <span className="text-zinc-300">Play Previews Automatically</span>
                        <input 
                          type="checkbox" 
                          checked={appSettings.autoplayPreviews} 
                          onChange={e => updateAppSettings('autoplayPreviews', e.target.checked)} 
                          className="w-5 h-5 accent-red-600 rounded" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                      <Globe size={18} /> Language & Quality
                    </h4>
                    <div className="space-y-5">
                      <div className="flex items-center justify-between text-base">
                        <span className="text-zinc-300">Preferred Language</span>
                        <span className="text-red-400 font-medium">{appSettings.language}</span>
                      </div>
                      <div className="flex items-center justify-between text-base">
                        <span className="text-zinc-300">Streaming Quality</span>
                        <span className="text-red-400 font-medium">{appSettings.quality}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Authorized Devices */}
            <section className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-10 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <Smartphone size={24} className="text-red-500" /> Authorized Devices
                </h3>
                <span className="text-sm font-medium bg-zinc-800 px-4 py-2 rounded-full">
                  {devices.length} active
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {devices.map((dev) => (
                  <div 
                    key={dev.id} 
                    className="p-6 bg-zinc-950/60 border border-zinc-800 rounded-2xl flex items-center justify-between group hover:border-zinc-600 transition-all"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-zinc-900 rounded-xl flex items-center justify-center">
                        {dev.type === 'Desktop' ? <Laptop size={24} className="text-zinc-400" /> : <Smartphone size={24} className="text-zinc-400" />}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{dev.name}</p>
                        {dev.isCurrent && (
                          <span className="text-xs bg-emerald-900/40 text-emerald-400 px-3 py-1 rounded-full mt-1 inline-block">
                            Current Device
                          </span>
                        )}
                        <p className="text-sm text-zinc-500 mt-1">Last active: {dev.lastActive}</p>
                      </div>
                    </div>
                    {!dev.isCurrent && (
                      <button 
                        onClick={() => removeDevice(dev.id)}
                        className="p-3 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-xl transition-all"
                        title="Sign out device"
                      >
                        <LogOut size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Premium Upgrade CTA */}
        <div className="mt-20 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-zinc-800/70 rounded-3xl p-12 md:p-16 shadow-2xl shadow-black/70 overflow-hidden relative mx-auto max-w-5xl">
          <div className="absolute inset-0 bg-gradient-to-r from-red-950/15 via-transparent to-purple-950/10 pointer-events-none" />
          
          <div className="relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">
              Unlock <span className="text-red-500">Premium</span> Experience
            </h2>
            
            <p className="text-xl md:text-2xl text-zinc-300 font-medium mb-4">
              Take your streaming to the next level
            </p>
            
            <p className="text-lg text-zinc-400 mb-12 leading-relaxed max-w-3xl mx-auto">
              Enjoy multiple profiles, offline downloads, 4K Ultra HD streaming, no ads, and exclusive early access to new releases.
            </p>

            <button
              onClick={() => navigate('/account-settings')}
              className="inline-flex items-center px-12 py-6 bg-gradient-to-r from-red-600 to-red-700 
                         hover:from-red-700 hover:to-red-800 
                         text-white font-bold text-xl rounded-full 
                         shadow-xl shadow-red-900/40 
                         transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Upgrade Now
            </button>
          </div>
        </div>

        {/* Footer with external links for Privacy & Terms */}
        <footer className="mt-24 pt-12 pb-16 border-t border-zinc-800 text-center text-zinc-500 text-sm">
          <div className="max-w-4xl mx-auto">
            <p className="mb-4">
              © {new Date().getFullYear()} Qodec Tech. All rights reserved.
            </p>
            <div className="flex justify-center gap-8 md:gap-12 flex-wrap">
              <a 
                href="https://policies.google.com/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-zinc-300 transition-colors"
              >
                Privacy Policy
              </a>
              <a 
                href="https://policies.google.com/terms" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-zinc-300 transition-colors"
              >
                Terms of Service
              </a>
              <a 
                href="/help-center" 
                className="hover:text-zinc-300 transition-colors"
              >
                Help Center
              </a>
              <a 
                href="/help-center" 
                className="hover:text-zinc-300 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </footer>

        {/* Modals - unchanged */}
        {showPinModal && (
          <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-zinc-900 w-full max-w-sm rounded-[3rem] p-10 border border-white/10 text-center shadow-2xl">
              <div className="w-20 h-20 bg-red-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Lock size={32} className="text-red-600" />
              </div>
              <h3 className="text-2xl font-black mb-2">Profile Locked</h3>
              <p className="text-zinc-500 text-sm mb-8">Verification required for {currentProfile.name}.</p>
              
              <div className="relative mb-8">
                <input 
                  type={showPinVisibility ? "text" : "password"}
                  maxLength="4"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-black border-2 border-white/5 rounded-2xl py-4 text-center text-4xl font-black tracking-[0.5em] focus:border-red-600 focus:outline-none transition-all"
                  autoFocus
                />
                <button 
                  onClick={() => setShowPinVisibility(!showPinVisibility)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
                >
                  {showPinVisibility ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {pinError && <p className="text-red-500 text-[10px] font-bold mb-6 uppercase tracking-widest">{pinError}</p>}
              
              <div className="flex gap-4">
                <button onClick={() => { setShowPinModal(false); setPinInput(''); setPinError(''); }} className="flex-1 py-4 font-bold text-zinc-500 text-sm">Cancel</button>
                <button onClick={handlePinUnlock} className="flex-1 py-4 bg-red-600 rounded-2xl font-black hover:bg-red-700 shadow-xl shadow-red-900/20 transition-all text-sm uppercase">Verify</button>
              </div>
            </div>
          </div>
        )}

        {settingPin && (
          <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-zinc-900 w-full max-w-md rounded-[3rem] p-10 border border-white/10 shadow-2xl">
              <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Profile Lock</h3>
              <p className="text-zinc-500 text-sm mb-8 font-medium">Create a 4-digit PIN to restrict access to this profile.</p>
              <div className="space-y-6 mb-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] ml-2">New Security PIN</label>
                  <input 
                    type="password" 
                    maxLength="4" 
                    value={newPin}
                    onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-black border border-white/5 rounded-2xl py-4 text-center text-3xl font-black focus:border-red-600 focus:outline-none"
                    placeholder="****"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] ml-2">Confirm Identity PIN</label>
                  <input 
                    type="password" 
                    maxLength="4" 
                    value={confirmPin}
                    onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-black border border-white/5 rounded-2xl py-4 text-center text-3xl font-black focus:border-red-600 focus:outline-none"
                    placeholder="****"
                  />
                </div>
              </div>
              {pinError && <p className="text-red-500 text-center text-[10px] font-bold mb-6">{pinError}</p>}
              <div className="flex gap-4">
                <button onClick={() => { setSettingPin(false); setNewPin(''); setConfirmPin(''); }} className="flex-1 py-4 font-bold text-zinc-500 text-sm uppercase">Discard</button>
                <button onClick={handleSetPin} className="flex-1 py-4 bg-red-600 rounded-2xl font-black hover:bg-red-700 transition-all text-sm uppercase">Activate</button>
              </div>
            </div>
          </div>
        )}

        {showMaturity && (
          <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 md:p-10">
            <div className="bg-zinc-900 w-full max-w-3xl rounded-[3rem] border border-white/10 flex flex-col max-h-[90vh] shadow-2xl">
              <div className="p-8 md:p-10 border-b border-white/5">
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Content Filters</h3>
                <p className="text-zinc-500 mt-2 font-medium text-sm">Select the age-appropriate ceiling for this profile.</p>
              </div>
              <div className="p-6 md:p-10 overflow-y-auto space-y-4 bg-black/20">
                {kidMaturityLevels.map((lvl) => (
                  <button 
                    key={lvl.rating}
                    onClick={() => setSelectedMaturity(lvl.rating)}
                    className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${selectedMaturity === lvl.rating ? 'border-red-600 bg-red-600/5' : 'border-white/5 hover:border-white/10 bg-black/40'}`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black transition-colors ${selectedMaturity === lvl.rating ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' : 'bg-zinc-800 text-zinc-500'}`}>
                        {lvl.rating}
                      </div>
                      <div>
                        <h4 className="font-black text-lg">{lvl.rating} Content</h4>
                        <p className="text-zinc-500 text-xs md:text-sm font-medium">{lvl.desc}</p>
                      </div>
                    </div>
                    {selectedMaturity === lvl.rating && <Check className="text-red-600" size={28} />}
                  </button>
                ))}
              </div>
              <div className="p-8 md:p-10 border-t border-white/5 flex gap-4">
                <button onClick={() => setShowMaturity(false)} className="px-10 py-4 font-bold text-zinc-500 text-sm uppercase">Cancel</button>
                <button 
                  onClick={saveMaturityLevel}
                  className="flex-1 py-4 bg-red-600 rounded-2xl font-black text-lg hover:bg-red-700 shadow-xl shadow-red-900/20 transition-all uppercase"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
            <div className="bg-zinc-900 max-w-md w-full rounded-[3rem] p-10 border border-red-900/30 text-center shadow-2xl">
              <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase">Erase Profile?</h3>
              <p className="text-zinc-500 font-medium mb-10 leading-relaxed text-sm">
                All watch history, preferences, and personal badges for this profile will be permanently deleted from our servers.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 font-bold text-zinc-500 text-sm uppercase">Back</button>
                <button onClick={confirmDelete} className="flex-1 py-4 bg-red-600 rounded-2xl font-black hover:bg-red-700 transition-all text-sm uppercase shadow-lg shadow-red-900/20">Delete</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ManageProfile;