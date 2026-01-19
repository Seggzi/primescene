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
    
    // Detailed iPhone Detection via Resolution Mapping
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

    // Android Model Extraction from User Agent
    if (/Android/.test(ua)) {
      const modelMatch = ua.match(/;\s([^;]+)\sBuild/);
      if (modelMatch && modelMatch[1]) {
        return modelMatch[1]; 
      }
      return "Android Device";
    }

    // PC / Desktop Detection
    if (/Win/.test(platform)) {
      if (ua.includes("Windows NT 10.0")) return "Windows 10/11 PC";
      if (ua.includes("Windows NT 6.3")) return "Windows 8.1 PC";
      return "Windows PC";
    }
    
    if (/Mac/.test(platform)) {
      return "Apple MacBook/iMac";
    }

    if (/Linux/.test(platform)) {
      return "Linux Workstation";
    }

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
        
        // Handle Device Registration
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
          
          // Set all other devices to not current
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

    // Real-time Supabase Subscription
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

  // Sync current profile local state
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

  // PIN Logic
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

  // ==========================================
  // 6. UI RENDERING
  // ==========================================
  return (
    <div className="min-h-screen bg-black text-white pt-24 md:pt-32 pb-20 px-4 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2 uppercase">Manage Profile</h1>
            <p className="text-zinc-500 font-medium text-sm md:text-base tracking-wide">Customize your viewing experience and active devices.</p>
          </div>
          <div className="flex items-center gap-4 bg-zinc-900/50 p-2 rounded-2xl border border-white/5 self-start md:self-auto">
            <button 
              onClick={() => navigate('/account-settings')} 
              className="p-3 hover:bg-white/10 rounded-xl transition-all group"
            >
              <Settings size={22} className="text-zinc-400 group-hover:text-red-500 group-hover:rotate-45 transition-all" />
            </button>
            <button className="p-3 hover:bg-white/10 rounded-xl transition-all">
              <HelpCircle size={22} className="text-zinc-400" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Profiles & Insights */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Profile Grid */}
            <section className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-8">Profiles</h3>
              <div className="grid grid-cols-2 gap-4">
                {profiles.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => switchProfile(p)}
                    className={`relative p-4 rounded-3xl border transition-all cursor-pointer group ${p.isActive ? 'bg-red-600 border-red-500 shadow-xl shadow-red-900/20' : 'bg-black/40 border-white/5 hover:border-white/20'}`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold mb-3">
                      {p.name[0]}
                    </div>
                    <p className={`font-bold truncate text-sm ${p.isActive ? 'text-white' : 'text-zinc-400'}`}>{p.name}</p>
                    {p.isKids && <Shield size={12} className="mt-1 text-white/60" />}
                    {profiles.length > 1 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(p.id); }}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-2 bg-black/50 rounded-lg hover:bg-red-500 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  onClick={addProfile}
                  className="p-4 rounded-3xl border border-dashed border-white/20 hover:border-red-500 flex flex-col items-center justify-center gap-2 group transition-all"
                >
                  <Plus size={24} className="text-zinc-500 group-hover:text-red-500" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Add</span>
                </button>
              </div>
            </section>

            {/* User Stats Card */}
            <section className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-8">Personal Insights</h3>
              <div className="space-y-6 mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-500"><Film size={18} /></div>
                    <span className="text-zinc-400 font-medium text-sm">Titles</span>
                  </div>
                  <span className="text-xl font-black">{stats.watched}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-yellow-600/10 flex items-center justify-center text-yellow-500"><Zap size={18} /></div>
                    <span className="text-zinc-400 font-medium text-sm">Streak</span>
                  </div>
                  <span className="text-xl font-black text-yellow-500">{stats.streak}d</span>
                </div>
              </div>

              {/* Badges */}
              <div className="pt-6 border-t border-white/5">
                <h4 className="text-[10px] font-bold text-zinc-600 uppercase mb-4 tracking-widest">Achievements</h4>
                <div className="flex flex-wrap gap-2">
                  {unlockedBadges.length > 0 ? unlockedBadges.map(badge => (
                    <div key={badge.id} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 hover:bg-red-600/10 transition-all cursor-help" title={badge.req}>
                      <span className={`${badge.color}`}>{badge.icon}</span>
                      <span className="text-[10px] font-black uppercase text-zinc-300">{badge.name}</span>
                    </div>
                  )) : (
                    <p className="text-[10px] text-zinc-600 italic font-medium">Watch more to unlock badges.</p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Settings & Devices */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Profile Detail Card */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-8 md:p-10 border-b border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-red-600 flex items-center justify-center text-3xl md:text-4xl font-black shadow-2xl shadow-red-600/20">
                      {currentProfile.name[0]}
                    </div>
                    <div>
                      {editingName ? (
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={newName} 
                            onChange={e => setNewName(e.target.value)}
                            className="bg-black border border-red-600/50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 ring-red-600/20"
                          />
                          <button onClick={handleNameChange} className="p-2 bg-red-600 rounded-xl hover:bg-red-700"><Save size={20} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <h2 className="text-2xl md:text-3xl font-black tracking-tight">{currentProfile.name}</h2>
                          <button onClick={() => setEditingName(true)} className="text-zinc-500 hover:text-white"><Edit size={18} /></button>
                        </div>
                      )}
                      <p className="text-zinc-500 font-bold text-[10px] mt-1 uppercase tracking-[0.2em]">{currentProfile.isKids ? 'Kids Restricted' : 'Full Access Profile'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSettingPin(true)}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Lock size={16} /> {currentProfile.pin ? 'Manage PIN' : 'Secure Profile'}
                  </button>
                </div>
              </div>

              <div className="p-8 md:p-10 space-y-10">
                {/* Kids Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold flex items-center gap-2">
                      Kids Experience
                      {currentProfile.isKids && <span className="text-[10px] bg-red-600/20 text-red-500 px-2 py-0.5 rounded-full font-black uppercase">On</span>}
                    </h4>
                    <p className="text-zinc-500 text-sm max-w-md">Limits content to ratings below 13+ and simplifies interface.</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (currentProfile.pin) { setPinPurpose('toggleKids'); setShowPinModal(true); }
                      else { finalizeKidsToggle(); }
                    }}
                    className={`w-16 h-8 rounded-full relative transition-all ${currentProfile.isKids ? 'bg-red-600' : 'bg-zinc-800'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${currentProfile.isKids ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>

                {/* Maturity Rating */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold">Maturity Content Control</h4>
                    <p className="text-zinc-500 text-sm">Titles rated <span className="text-white font-bold">{currentProfile.maturityLevel}</span> and below are visible.</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (currentProfile.pin) { setPinPurpose('openMaturity'); setShowPinModal(true); }
                      else { setShowMaturity(true); }
                    }}
                    className="text-red-500 font-bold text-sm hover:underline flex items-center gap-1"
                  >
                    Modify <ChevronRight size={16} />
                  </button>
                </div>

                {/* Technical Preferences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
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
                    <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2"><Globe size={14} /> Localization</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">Audio/Subtitle Language</span>
                        <span className="text-red-500 font-bold text-xs">{appSettings.language}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">Stream Quality</span>
                        <span className="text-red-500 font-bold text-xs">{appSettings.quality}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DEVICE MANAGEMENT - THE NEW SECTION */}
            <section className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold flex items-center gap-3">
                  <Smartphone size={20} className="text-red-500" /> Authorized Devices
                </h3>
                <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest">
                  {devices.length} Devices Online
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {devices.map((dev) => (
                  <div 
                    key={dev.id} 
                    className="p-5 bg-black/40 border border-white/5 rounded-3xl flex items-center justify-between group hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center">
                        {dev.type === 'Desktop' ? <Laptop size={20} className="text-zinc-500" /> : <Smartphone size={20} className="text-zinc-500" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm tracking-tight">{dev.name}</p>
                          {dev.isCurrent && (
                            <span className="text-[8px] bg-red-600 px-1.5 py-0.5 rounded text-white font-black uppercase tracking-tighter shadow-lg shadow-red-600/30">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-600 font-bold">Sync: {dev.lastActive}</p>
                      </div>
                    </div>
                    {!dev.isCurrent && (
                      <button 
                        onClick={() => removeDevice(dev.id)}
                        className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        title="Sign out this device"
                      >
                        <LogOut size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Viewing Timeline history */}
            <section className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 md:p-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold flex items-center gap-3">
                  <Calendar size={20} className="text-red-500" /> Viewing Activity
                </h3>
                <button 
                  onClick={clearAllActivity}
                  className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-[0.2em]"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-6">
                {activityTimeline.length > 0 ? activityTimeline.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                      <p className="font-bold text-sm group-hover:text-red-500 transition-colors">{item.title}</p>
                    </div>
                    <span className="text-[10px] text-zinc-600 font-black uppercase">{item.date || 'Today'}</span>
                  </div>
                )) : (
                  <div className="text-center py-10 opacity-30">
                    <Activity size={32} className="mx-auto mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest">No Recent History</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* ==========================================
            7. FULL MODAL OVERLAYS
        ========================================== */}

        {/* Security PIN Entry */}
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

        {/* Security PIN Setup */}
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

        {/* Maturity Rating Picker */}
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

        {/* Delete Verification */}
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