// src/pages/AccountSettings.jsx - FULL CODE WITH REAL-TIME SYNC & OTP FIXES

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, CreditCard, Bell, Shield, Globe, Mail, Lock, 
  Smartphone, Download, Users, Crown, ChevronRight, Eye, EyeOff 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';

function AccountSettings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth(); 

  // === MODAL STATES ===
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // === EMAIL CHANGE WITH OTP ===
  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);

  // === PASSWORD CHANGE WITH OTP ===
  const [passwordOtp, setPasswordOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordOtpSent, setPasswordOtpSent] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // === NOTIFICATIONS (SYNCED STATE) ===
  // We initialize these to defaults, but they will update from DB immediately
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState(false);

  // === 1. SYNC LOGIC (Replaces LocalStorage) ===
  useEffect(() => {
    if (!user?.id) return;

    // A. Initial Fetch from Supabase
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('settings')
          .eq('id', user.id)
          .single();

        if (data?.settings) {
          setEmailNotifs(data.settings.email ?? true);
          setPushNotifs(data.settings.push ?? false);
          setSmsNotifs(data.settings.sms ?? false);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();

    // B. Real-time Listener (Updates instantly if changed on another device)
    const channel = supabase
      .channel(`settings-sync-${user.id}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'users', 
          filter: `id=eq.${user.id}` 
        },
        (payload) => {
          const newSettings = payload.new.settings;
          if (newSettings) {
            setEmailNotifs(newSettings.email ?? true);
            setPushNotifs(newSettings.push ?? false);
            setSmsNotifs(newSettings.sms ?? false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // === 2. SAVE NOTIFICATIONS TO DB ===
  const handleSaveNotifications = async () => {
    // Show success immediately (Optimistic UI)
    setNotifSuccess(true);

    if (user?.id) {
      const newSettings = {
        email: emailNotifs,
        push: pushNotifs,
        sms: smsNotifs
      };

      // Save to Supabase 'users' table in the 'settings' column
      const { error } = await supabase
        .from('users')
        .upsert({ 
          id: user.id, 
          settings: newSettings 
        }, { onConflict: 'id' });

      if (error) console.error('Error saving settings:', error);
    }

    // Close modal after delay
    setTimeout(() => {
      setShowNotificationsModal(false);
      setNotifSuccess(false);
    }, 1500);
  };

  // === SEND OTP FOR EMAIL CHANGE ===
  const handleSendEmailOtp = async () => {
    if (!newEmail.includes('@') || !newEmail.includes('.')) {
      setEmailError('Please enter a valid email');
      return;
    }

    setEmailLoading(true);
    setEmailError('');
    setEmailSuccess(false);

    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });

      if (error) throw error;

      setEmailOtpSent(true);
      setEmailSuccess(true);
      setEmailError('');
    } catch (err) {
      setEmailError(err.message || 'Failed to send code. Try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  // === VERIFY OTP & UPDATE EMAIL ===
  const handleVerifyAndUpdateEmail = async () => {
    setEmailLoading(true);
    setEmailError('');

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: newEmail,
        token: emailOtp.trim(),
        type: 'email_change'
      });

      if (verifyError) throw verifyError;

      // Reset states
      setShowEmailModal(false);
      setNewEmail('');
      setEmailOtp('');
      setEmailOtpSent(false);
      setEmailSuccess(false);
      setEmailError('');
    } catch (err) {
      setEmailError(err.message || 'Invalid or expired code');
    } finally {
      setEmailLoading(false);
    }
  };

  // === SEND OTP FOR PASSWORD CHANGE ===
  const handleSendPasswordOtp = async () => {
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email);

      if (error) throw error;

      setPasswordOtpSent(true);
      setPasswordSuccess(true);
    } catch (err) {
      setPasswordError(err.message || 'Failed to send code');
    } finally {
      setPasswordLoading(false);
    }
  };

  // === VERIFY OTP & UPDATE PASSWORD ===
  const handleVerifyAndUpdatePassword = async () => {
    setPasswordLoading(true);
    setPasswordError('');

    try {
      // Verify OTP
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: user.email,
        token: passwordOtp.trim(),
        type: 'recovery'
      });

      if (verifyError) throw verifyError;

      // Validate passwords
      if (newPassword.length < 8) {
        setPasswordError('Password must be at least 8 characters');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setPasswordError('Passwords do not match');
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      setPasswordSuccess(true);
      setTimeout(async () => {
        setShowPasswordModal(false);
        setPasswordOtp('');
        setNewPassword('');
        setConfirmNewPassword('');
        setPasswordOtpSent(false);
        setPasswordSuccess(false);
        setPasswordError('');
        
        // Logout for security
        await signOut();
        navigate('/login');
      }, 2000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16 px-4 md:px-12 lg:px-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-12 text-center bg-gradient-to-r from-white to-red-500 bg-clip-text text-transparent">
          Account Settings
        </h1>

        {/* Current Plan */}
        <div className="bg-zinc-900/70 rounded-2xl p-8 mb-10 border border-red-600/40 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <Crown size={32} className="text-red-500" />
            <h2 className="text-2xl font-bold">Your Current Plan</h2>
          </div>
          <div className="bg-black/60 rounded-xl p-6 text-center">
            <p className="text-3xl font-black text-red-400 mb-2">Free Forever</p>
            <p className="text-gray-400">Unlimited access • No payment required</p>
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="bg-gradient-to-r from-red-900/40 to-zinc-900 rounded-2xl p-10 text-center border border-red-600/40 mb-10">
          <h2 className="text-2xl font-bold mb-4">Level Up to Premium</h2>
          <p className="text-gray-300 mb-6">
            Unlock 5 profiles, offline downloads, 4K, and exclusives
          </p>
          <button 
            onClick={() => alert('Premium coming soon!')}
            className="px-12 py-4 bg-red-600 rounded-full font-bold hover:bg-red-700 transition shadow-lg"
          >
            Upgrade Now
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <button 
            onClick={() => setShowEmailModal(true)}
            className="bg-zinc-900/60 rounded-2xl p-6 border border-white/10 hover:border-red-600/50 transition-all group"
          >
            <Mail size={28} className="text-red-500 mb-4 group-hover:scale-110 transition" />
            <p className="font-semibold">Change Email</p>
          </button>

          <button 
            onClick={() => setShowPasswordModal(true)}
            className="bg-zinc-900/60 rounded-2xl p-6 border border-white/10 hover:border-red-600/50 transition-all group"
          >
            <Lock size={28} className="text-red-500 mb-4 group-hover:scale-110 transition" />
            <p className="font-semibold">Change Password</p>
          </button>

          <button 
            onClick={() => setShowNotificationsModal(true)}
            className="bg-zinc-900/60 rounded-2xl p-6 border border-white/10 hover:border-red-600/50 transition-all group"
          >
            <Bell size={28} className="text-red-500 mb-4 group-hover:scale-110 transition" />
            <p className="font-semibold">Notifications</p>
          </button>
        </div>

        {/* CHANGE EMAIL MODAL WITH OTP */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
            <div className="bg-zinc-900 rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-center">Change Email</h2>

              {!emailOtpSent ? (
                <>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="New email address"
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-5 py-3 text-base focus:border-red-600 transition mb-4"
                  />
                  <button
                    onClick={handleSendEmailOtp}
                    disabled={emailLoading}
                    className="w-full py-3 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {emailLoading ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : 'Send OTP'}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-300 mb-4 text-center">
                    Enter the 6-digit code sent to {newEmail}
                  </p>
                  <input
                    type="text"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full text-center text-3xl tracking-widest bg-black/50 border border-white/20 rounded-xl px-5 py-4 mb-4 focus:border-red-600"
                    autoFocus
                  />
                  {emailError && <p className="text-red-500 text-center">{emailError}</p>}
                  <button
                    onClick={handleVerifyAndUpdateEmail}
                    disabled={emailLoading}
                    className="w-full py-3 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {emailLoading ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verifying...
                      </>
                    ) : 'Verify & Update'}
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
                  setEmailSuccess(false);
                }}
                className="w-full py-3 mt-4 border border-white/20 rounded-xl font-semibold hover:bg-white/10 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* CHANGE PASSWORD MODAL WITH OTP */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
            <div className="bg-zinc-900 rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-center">Change Password</h2>

              {!passwordOtpSent ? (
                <>
                  <p className="text-gray-300 text-center mb-6">
                    We'll send a 6-digit code to {user?.email}
                  </p>
                  <button
                    onClick={handleSendPasswordOtp}
                    disabled={passwordLoading}
                    className="w-full py-3 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {passwordLoading ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : 'Send OTP'}
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    value={passwordOtp}
                    onChange={(e) => setPasswordOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full text-center text-3xl tracking-widest bg-black/50 border border-white/20 rounded-xl px-5 py-4 mb-4 focus:border-red-600"
                    autoFocus
                  />

                  <div className="relative mb-4">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password (min 8 chars)"
                      className="w-full bg-black/50 border border-white/20 rounded-xl px-5 py-3 text-base focus:border-red-600 transition pr-12"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-4 text-gray-400"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div className="relative mb-4">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full bg-black/50 border border-white/20 rounded-xl px-5 py-3 text-base focus:border-red-600 transition pr-12"
                    />
                    <button
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-4 text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {passwordError && <p className="text-red-500 text-center mb-4">{passwordError}</p>}
                  {passwordSuccess && <p className="text-green-500 text-center mb-4">Password Updated! Logging out...</p>}

                  <button
                    onClick={handleVerifyAndUpdatePassword}
                    disabled={passwordLoading}
                    className="w-full py-3 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {passwordLoading ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Updating...
                      </>
                    ) : 'Verify & Update'}
                  </button>

                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordOtp('');
                      setNewPassword('');
                      setConfirmNewPassword('');
                      setPasswordOtpSent(false);
                      setPasswordError('');
                      setPasswordSuccess(false);
                    }}
                    className="w-full py-3 mt-4 border border-white/20 rounded-xl font-semibold hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* NOTIFICATIONS MODAL (Synced) */}
        {showNotificationsModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
            <div className="bg-zinc-900 rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-center">Notifications</h2>
              <div className="space-y-6">
                
                {/* Email Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Email Notifications</p>
                    <p className="text-sm text-gray-400">New releases & recommendations</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={emailNotifs} 
                      onChange={() => setEmailNotifs(!emailNotifs)} 
                      className="sr-only peer" 
                    />
                    <div className="w-12 h-6 bg-gray-700 rounded-full peer peer-checked:bg-red-600 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6"></div>
                  </label>
                </div>

                {/* Push Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Push Notifications</p>
                    <p className="text-sm text-gray-400">App alerts on your device</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={pushNotifs} 
                      onChange={() => setPushNotifs(!pushNotifs)} 
                      className="sr-only peer" 
                    />
                    <div className="w-12 h-6 bg-gray-700 rounded-full peer peer-checked:bg-red-600 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6"></div>
                  </label>
                </div>

                {/* SMS Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">SMS Alerts</p>
                    <p className="text-sm text-gray-400">Important account updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={smsNotifs} 
                      onChange={() => setSmsNotifs(!smsNotifs)} 
                      className="sr-only peer" 
                    />
                    <div className="w-12 h-6 bg-gray-700 rounded-full peer peer-checked:bg-red-600 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6"></div>
                  </label>
                </div>
              </div>

              {notifSuccess && (
                <p className="text-green-400 text-center mt-6 flex items-center justify-center gap-2">
                  <Check size={20} /> Saved to Cloud!
                </p>
              )}
              
              <div className="flex gap-4 mt-10">
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="flex-1 py-3 border border-white/20 rounded-xl font-semibold hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotifications}
                  className="flex-1 py-3 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountSettings;