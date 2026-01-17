import { Link, useNavigate } from 'react-router-dom';
import { 
  Check, X, CreditCard, Bell, Shield, Globe, Mail, Lock, 
  Smartphone, Download, Users, Crown, ChevronRight, Eye, EyeOff 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase'; // ← Make sure this import exists

function AccountSettings() {
  const navigate = useNavigate();
  const { user, auth } = useAuth();

  // Modal States
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Email Form
  const [newEmail, setNewEmail] = useState('');
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Notifications - Persistent
  const [emailNotifs, setEmailNotifs] = useState(() => {
    const saved = localStorage.getItem('emailNotifications');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [pushNotifs, setPushNotifs] = useState(() => {
    const saved = localStorage.getItem('pushNotifications');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [smsNotifs, setSmsNotifs] = useState(() => {
    const saved = localStorage.getItem('smsNotifications');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [notifSuccess, setNotifSuccess] = useState(false);

  // Save notifications
  useEffect(() => {
    localStorage.setItem('emailNotifications', JSON.stringify(emailNotifs));
    localStorage.setItem('pushNotifications', JSON.stringify(pushNotifs));
    localStorage.setItem('smsNotifications', JSON.stringify(smsNotifs));
  }, [emailNotifs, pushNotifs, smsNotifs]);

  const handleChangeEmail = async () => {
    setEmailError('');
    if (!newEmail.includes('@') || !newEmail.includes('.')) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!user) {
      setEmailError('No user logged in');
      return;
    }

    try {
      // Supabase: Update email (may require recent login)
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      
      if (error) {
        if (error.message.includes('recent login')) {
          setEmailError('For security, please log out and log in again');
        } else {
          throw error;
        }
      } else {
        setEmailSuccess(true);
        setEmailError('');
        setTimeout(() => {
          setShowEmailModal(false);
          setNewEmail('');
          setCurrentPasswordForEmail('');
          setEmailSuccess(false);
        }, 2000);
      }
    } catch (error) {
      setEmailError(error.message || 'Failed to update email');
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (!user) {
      setPasswordError('No user logged in');
      return;
    }

    try {
      // Supabase: Update password (no reauthentication needed if session is fresh)
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) {
        if (error.message.includes('weak password')) {
          setPasswordError('Password is too weak. Try a stronger one.');
        } else if (error.message.includes('recent login')) {
          setPasswordError('For security, please log out and log in again');
        } else {
          throw error;
        }
      } else {
        setPasswordSuccess(true);
        setPasswordError('');
        setTimeout(() => {
          setShowPasswordModal(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setPasswordSuccess(false);
        }, 2000);
      }
    } catch (error) {
      setPasswordError(error.message || 'Failed to update password');
    }
  };

  const handleSaveNotifications = () => {
    setNotifSuccess(true);
    setTimeout(() => {
      setShowNotificationsModal(false);
      setNotifSuccess(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16 px-4 md:px-12 lg:px-16">
      <div className="max-w-4xl mx-auto">
        {/* Compact Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-12 text-center bg-gradient-to-r from-white to-red-500 bg-clip-text text-transparent">
          Account Settings
        </h1>

        {/* Current Plan - Compact Card */}
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

        {/* Features Comparison - Compact Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-zinc-900/70 rounded-2xl p-6 border border-green-600/30">
            <div className="flex items-center gap-3 mb-6">
              <Check size={28} className="text-green-500" />
              <h3 className="text-xl font-bold text-green-400">Included in Free</h3>
            </div>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-center gap-2"><Check size={18} className="text-green-500" /> Unlimited streaming</li>
              <li className="flex items-center gap-2"><Check size={18} className="text-green-500" /> Nollywood & Global titles</li>
              <li className="flex items-center gap-2"><Check size={18} className="text-green-500" /> HD quality</li>
              <li className="flex items-center gap-2"><Check size={18} className="text-green-500" /> My List & Search</li>
              <li className="flex items-center gap-2"><Check size={18} className="text-green-500" /> One profile</li>
            </ul>
          </div>

          <div className="bg-gradient-to-b from-red-900/20 to-zinc-900 rounded-2xl p-6 border border-red-600/50">
            <div className="flex items-center gap-3 mb-6">
              <Crown size={28} className="text-red-500" />
              <h3 className="text-xl font-bold text-red-400">Premium Upgrades</h3>
            </div>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-center gap-2"><Users size={18} className="text-red-500" /> Up to 5 profiles + Kids Mode</li>
              <li className="flex items-center gap-2"><Download size={18} className="text-red-500" /> Offline downloads</li>
              <li className="flex items-center gap-2"><Globe size={18} className="text-red-500" /> 4K streaming</li>
              <li className="flex items-center gap-2"><Shield size={18} className="text-red-500" /> Exclusive content</li>
              <li className="flex items-center gap-2"><Smartphone size={18} className="text-red-500" /> Stream on 4 devices</li>
            </ul>
          </div>
        </div>

        {/* Upgrade CTA - Compact */}
        <div className="bg-gradient-to-r from-red-900/40 to-zinc-900 rounded-2xl p-10 text-center border border-red-600/40 mb-10">
          <h2 className="text-2xl font-bold mb-4">Level Up to Premium</h2>
          <p className="text-gray-300 mb-6">
            Unlock 5 profiles, offline downloads, 4K, and exclusives
          </p>
          <button 
            onClick={() => alert('Premium coming soon! Stay tuned.')}
            className="px-12 py-4 bg-red-600 rounded-full font-bold hover:bg-red-700 transition shadow-lg"
          >
            Upgrade Now
          </button>
          <div className="mt-6 text-gray-400 text-sm">
            Cancel anytime • No hidden fees
          </div>
        </div>

        {/* Quick Actions - Compact Grid */}
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

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p className="text-lg">
            Loving PrimeScene? <Link to="/help-center" className="text-red-500 hover:underline">Visit Help Center</Link>
          </p>
        </div>
      </div>

      {/* CHANGE EMAIL MODAL */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-zinc-900 rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Change Email</h2>
            <div className="space-y-4">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="New email address"
                className="w-full bg-black/50 border border-white/20 rounded-xl px-5 py-3 text-base focus:border-red-600 transition"
              />
              <input
                type="password"
                value={currentPasswordForEmail}
                onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                placeholder="Current password"
                className="w-full bg-black/50 border border-white/20 rounded-xl px-5 py-3 text-base focus:border-red-600 transition"
              />
            </div>
            {emailError && <p className="text-red-500 text-center mt-4">{emailError}</p>}
            {emailSuccess && (
              <p className="text-green-400 text-center mt-4 flex items-center justify-center gap-2">
                <Check size={20} /> Email updated!
              </p>
            )}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setNewEmail('');
                  setCurrentPasswordForEmail('');
                  setEmailError('');
                  setEmailSuccess(false);
                }}
                className="flex-1 py-3 border border-white/20 rounded-xl font-semibold hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeEmail}
                className="flex-1 py-3 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-zinc-900 rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Change Password</h2>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showCurrentPass ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-5 py-3 text-base focus:border-red-600 transition pr-12"
                />
                <button
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-4 top-4 text-gray-400"
                >
                  {showCurrentPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showNewPass ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min 8 chars)"
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-5 py-3 text-base focus:border-red-600 transition pr-12"
                />
                <button
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-4 top-4 text-gray-400"
                >
                  {showNewPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-5 py-3 text-base focus:border-red-600 transition pr-12"
                />
                <button
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-4 top-4 text-gray-400"
                >
                  {showConfirmPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            {passwordError && <p className="text-red-500 text-center mt-4">{passwordError}</p>}
            {passwordSuccess && (
              <p className="text-green-400 text-center mt-4 flex items-center justify-center gap-2">
                <Check size={20} /> Password changed!
              </p>
            )}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                  setPasswordSuccess(false);
                }}
                className="flex-1 py-3 border border-white/20 rounded-xl font-semibold hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="flex-1 py-3 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS MODAL */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-zinc-900 rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Notifications</h2>
            <div className="space-y-6">
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
                <Check size={20} /> Saved!
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
  );
}

export default AccountSettings;