import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check, CreditCard, Bell, Shield, Globe, Mail, Lock,
  Smartphone, Download, Users, Crown, ChevronRight, Eye, EyeOff,
  Activity, Monitor, LogOut, Clock, Trash2, Info, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';

function AccountSettings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false); // Premium upgrade modal

  // Email change states
  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Password change states
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordOtp, setPasswordOtp] = useState('');
  const [passwordOtpSent, setPasswordOtpSent] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notifications (real-time synced)
  const [settings, setSettings] = useState({
    email: true,
    push: false,
    sms: false,
    marketing: false
  });

  // Real-time sync
  useEffect(() => {
    if (!user?.id) return;

    const fetchSettings = async () => {
      const { data } = await supabase.from('users').select('settings').eq('id', user.id).single();
      if (data?.settings) setSettings(data.settings);
    };
    fetchSettings();

    const channel = supabase
      .channel(`settings-sync-${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${user.id}`
      }, (payload) => {
        if (payload.new.settings) setSettings(payload.new.settings);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  const updateSettings = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    setIsSyncing(true);
    await supabase.from('users').update({ settings: updated }).eq('id', user.id);
    setTimeout(() => setIsSyncing(false), 800);
  };

  // Email OTP handlers
  const handleSendEmailOtp = async () => {
    if (!newEmail.includes('@')) {
      setEmailError('Please enter a valid email');
      return;
    }
    setEmailLoading(true);
    setEmailError('');
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      setEmailOtpSent(true);
    } catch (err) {
      setEmailError(err.message || 'Failed to send code');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: newEmail,
        token: emailOtp.trim(),
        type: 'email_change'
      });
      if (error) throw error;
      setShowEmailModal(false);
      setNewEmail('');
      setEmailOtp('');
      setEmailOtpSent(false);
      alert('Email updated successfully!');
    } catch (err) {
      setEmailError(err.message || 'Invalid code');
    } finally {
      setEmailLoading(false);
    }
  };

  // Password OTP handlers
  const handleSendPasswordOtp = async () => {
    setPasswordLoading(true);
    setPasswordError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
      if (error) throw error;
      setPasswordOtpSent(true);
    } catch (err) {
      setPasswordError(err.message || 'Failed to send code');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmNewPassword) return setPasswordError("Passwords don't match");
    if (newPassword.length < 8) return setPasswordError("Password must be at least 8 characters");

    setPasswordLoading(true);
    try {
      const { error: verifyErr } = await supabase.auth.verifyOtp({
        email: user.email,
        token: passwordOtp.trim(),
        type: 'recovery'
      });
      if (verifyErr) throw verifyErr;

      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
      if (updateErr) throw updateErr;

      setShowPasswordModal(false);
      alert('Password updated! Please sign in again.');
      await signOut();
      navigate('/login');
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16 px-4 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Account Settings</h1>
            <p className="text-zinc-500 mt-2">Manage your profile, security, subscription, and preferences</p>
          </div>
          <div className={`flex items-center gap-3 px-5 py-2 rounded-full border ${isSyncing ? 'border-amber-500/30 bg-amber-950/30' : 'border-emerald-500/30 bg-emerald-950/30'}`}>
            <div className={`w-3 h-3 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-sm font-medium">{isSyncing ? 'Syncing...' : 'Synced'}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Tabs */}
          <nav className="lg:col-span-3 space-y-2">
            {[
              { id: 'profile', label: 'Profile', icon: <Mail size={18}/> },
              { id: 'security', label: 'Security', icon: <Shield size={18}/> },
              { id: 'billing', label: 'Subscription', icon: <CreditCard size={18}/> },
              { id: 'notifications', label: 'Notifications', icon: <Bell size={18}/> },
              { id: 'devices', label: 'Devices', icon: <Monitor size={18}/> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-left font-medium ${
                  activeTab === tab.id 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' 
                    : 'hover:bg-zinc-900/60 text-zinc-400 hover:text-white'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}

            <div className="pt-6 mt-6 border-t border-zinc-800">
              <button 
                onClick={signOut}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-400 hover:bg-red-950/30 transition-all font-medium"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </nav>

          {/* Main Content */}
          <main className="lg:col-span-9 space-y-10">
            {/* Profile */}
            {activeTab === 'profile' && (
              <section className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-10">
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white text-3xl font-black shadow-xl">
                    {user?.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{user?.email}</h2>
                    <p className="text-zinc-500 text-sm">Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-zinc-950/50 rounded-2xl border border-zinc-800">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Email Address</h3>
                      <button 
                        onClick={() => setShowEmailModal(true)} 
                        className="text-red-500 hover:underline text-sm"
                      >
                        Change
                      </button>
                    </div>
                    <p className="text-lg font-semibold">{user?.email}</p>
                  </div>

                  <div className="p-6 bg-zinc-950/50 rounded-2xl border border-zinc-800">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Password</h3>
                      <button 
                        onClick={() => setShowPasswordModal(true)} 
                        className="text-red-500 hover:underline text-sm"
                      >
                        Change
                      </button>
                    </div>
                    <p className="text-lg font-semibold">••••••••••••</p>
                  </div>
                </div>
              </section>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <section className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-10">
                <h3 className="text-2xl font-bold mb-8">Security Settings</h3>
                <div className="space-y-6">
                  <div className="p-6 bg-zinc-950/50 rounded-2xl border border-zinc-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-zinc-500 text-sm mt-1">Add extra security to your account</p>
                      </div>
                      <button 
                        onClick={() => setShowComingSoon(true)} 
                        className="px-6 py-2 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition"
                      >
                        Enable
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Subscription / Billing */}
            {activeTab === 'billing' && (
              <section className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-10">
                <h3 className="text-2xl font-bold mb-8">Subscription & Billing</h3>
                <div className="bg-gradient-to-br from-zinc-950 to-black rounded-2xl p-8 border border-red-900/30 text-center">
                  <Crown size={48} className="text-red-500 mx-auto mb-6" />
                  <h4 className="text-3xl font-black mb-4">Free Plan</h4>
                  <p className="text-zinc-400 mb-8">Enjoy core features with no cost</p>
                  <button 
                    onClick={() => setShowComingSoon(true)}
                    className="px-12 py-4 bg-red-600 rounded-full font-bold hover:bg-red-700 transition shadow-lg shadow-red-900/30"
                  >
                    Upgrade to Premium
                  </button>
                </div>
              </section>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <section className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-10">
                <h3 className="text-2xl font-bold mb-8">Notification Preferences</h3>
                <div className="space-y-6">
                  {[
                    { key: 'email', label: 'Email Notifications', desc: 'New releases, updates & recommendations' },
                    { key: 'push', label: 'Push Notifications', desc: 'Instant alerts on your devices' },
                    { key: 'sms', label: 'SMS Alerts', desc: 'Critical account security messages' },
                    { key: 'marketing', label: 'Marketing Offers', desc: 'Exclusive deals & early access' }
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-6 bg-zinc-950/50 rounded-2xl border border-zinc-800">
                      <div>
                        <h4 className="font-medium">{item.label}</h4>
                        <p className="text-zinc-500 text-sm mt-1">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings[item.key]}
                          onChange={() => updateSettings(item.key, !settings[item.key])}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-zinc-700 rounded-full peer peer-checked:bg-red-600 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-7"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Devices */}
            {activeTab === 'devices' && (
              <section className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-10">
                <h3 className="text-2xl font-bold mb-8">Active Devices</h3>
                <div className="space-y-6">
                  <div className="p-6 bg-zinc-950/50 rounded-2xl border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <Monitor size={28} className="text-emerald-500" />
                      <div>
                        <p className="font-medium">Current Session</p>
                        <p className="text-sm text-zinc-500">This browser • Active now</p>
                      </div>
                    </div>
                    <span className="px-4 py-1 bg-emerald-900/40 text-emerald-400 rounded-full text-sm">Current</span>
                  </div>
                  <button 
                    onClick={() => alert('All other sessions have been signed out!')}
                    className="w-full py-4 mt-6 bg-red-600/20 hover:bg-red-600/40 border border-red-600/30 rounded-xl text-red-400 font-medium transition"
                  >
                    Sign Out All Other Devices
                  </button>
                </div>
              </section>
            )}
          </main>
        </div>

        {/* Coming Soon Modal (for Premium Upgrade) */}
        {showComingSoon && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-3xl p-8 max-w-md w-full border border-zinc-800 shadow-2xl relative">
              <button
                onClick={() => setShowComingSoon(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition"
              >
                <X size={24} />
              </button>

              <div className="text-center">
                <Crown size={64} className="text-red-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4">Premium Coming Soon</h2>
                <p className="text-zinc-400 mb-8">
                  We're working hard to bring you 4K streaming, offline downloads, multiple profiles, and more.
                  <br /><br />
                  Stay tuned — you'll be the first to know when it's live!
                </p>
                <button
                  onClick={() => setShowComingSoon(false)}
                  className="px-10 py-4 bg-red-600 rounded-full font-bold hover:bg-red-700 transition"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-3xl p-8 max-w-md w-full border border-zinc-800 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6">Change Email</h2>
              {!emailOtpSent ? (
                <>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="New email address"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-5 py-4 mb-6 focus:border-red-600 outline-none"
                  />
                  <button
                    onClick={handleSendEmailOtp}
                    disabled={emailLoading}
                    className="w-full py-4 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {emailLoading ? 'Sending...' : 'Send Verification Code'}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-zinc-400 mb-6">Enter code sent to {newEmail}</p>
                  <input
                    type="text"
                    value={emailOtp}
                    onChange={e => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0,6))}
                    placeholder="6-digit code"
                    maxLength={6}
                    className="w-full text-center text-3xl tracking-[1em] bg-zinc-950 border border-zinc-700 rounded-xl py-6 mb-6 focus:border-red-600 outline-none"
                  />
                  {emailError && <p className="text-red-500 text-center mb-4">{emailError}</p>}
                  <button
                    onClick={handleVerifyEmail}
                    disabled={emailLoading}
                    className="w-full py-4 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {emailLoading ? 'Verifying...' : 'Verify & Update Email'}
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setNewEmail('');
                  setEmailOtp('');
                  setEmailOtpSent(false);
                  setEmailError('');
                }}
                className="w-full py-4 mt-4 border border-zinc-700 rounded-xl font-medium hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-3xl p-8 max-w-md w-full border border-zinc-800 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6">Change Password</h2>
              {!passwordOtpSent ? (
                <>
                  <p className="text-zinc-400 mb-6">Code will be sent to {user?.email}</p>
                  <button
                    onClick={handleSendPasswordOtp}
                    disabled={passwordLoading}
                    className="w-full py-4 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {passwordLoading ? 'Sending...' : 'Send Code'}
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    value={passwordOtp}
                    onChange={e => setPasswordOtp(e.target.value.replace(/\D/g, '').slice(0,6))}
                    placeholder="6-digit code"
                    maxLength={6}
                    className="w-full text-center text-3xl tracking-[1em] bg-zinc-950 border border-zinc-700 rounded-xl py-6 mb-6 focus:border-red-600 outline-none"
                  />
                  <div className="relative mb-6">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="New password"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-5 py-4 pr-12 focus:border-red-600 outline-none"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="relative mb-6">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={e => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-5 py-4 pr-12 focus:border-red-600 outline-none"
                    />
                    <button
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {passwordError && <p className="text-red-500 text-center mb-4">{passwordError}</p>}
                  <button
                    onClick={handleUpdatePassword}
                    disabled={passwordLoading}
                    className="w-full py-4 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordOtp('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                  setPasswordOtpSent(false);
                  setPasswordError('');
                }}
                className="w-full py-4 mt-4 border border-zinc-700 rounded-xl font-medium hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountSettings;