import { Link, useNavigate } from 'react-router-dom';
import { 
  Check, X, CreditCard, Bell, Shield, Globe, Mail, Lock, 
  Smartphone, Download, Users, Crown, ChevronRight, Eye, EyeOff 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  updateEmail 
} from 'firebase/auth';

function AccountSettings() {
  const navigate = useNavigate();
  const { user, auth } = useAuth(); // auth from Firebase

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

  // Notifications - Persistent with localStorage
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

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('emailNotifications', JSON.stringify(emailNotifs));
    localStorage.setItem('pushNotifications', JSON.stringify(pushNotifs));
    localStorage.setItem('smsNotifications', JSON.stringify(smsNotifs));
  }, [emailNotifs, pushNotifs, smsNotifs]);

  // CHANGE EMAIL - NOW REAL WITH FIREBASE
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
      // Re-authenticate before changing email
      const credential = EmailAuthProvider.credential(user.email, currentPasswordForEmail);
      await reauthenticateWithCredential(user, credential);

      // Update email
      await updateEmail(user, newEmail);

      setEmailSuccess(true);
      setEmailError('');
      setTimeout(() => {
        setShowEmailModal(false);
        setNewEmail('');
        setCurrentPasswordForEmail('');
        setEmailSuccess(false);
      }, 2000);
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        setEmailError('Current password is incorrect');
      } else if (error.code === 'auth/invalid-email') {
        setEmailError('Invalid email address');
      } else if (error.code === 'auth/email-already-in-use') {
        setEmailError('Email already in use');
      } else if (error.code === 'auth/requires-recent-login') {
        setEmailError('Please log out and log in again for security');
      } else {
        setEmailError('Error: ' + error.message);
      }
    }
  };

  // CHANGE PASSWORD - REAL WITH FIREBASE
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
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setPasswordSuccess(true);
      setPasswordError('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordSuccess(false);
      }, 2000);
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        setPasswordError('Current password is incorrect');
      } else if (error.code === 'auth/requires-recent-login') {
        setPasswordError('For security, please log out and log in again');
      } else {
        setPasswordError('Error: ' + error.message);
      }
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
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-4 md:px-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-black mb-16 text-center bg-gradient-to-r from-white to-red-500 bg-clip-text text-transparent">
          Account Settings
        </h1>

        <div className="space-y-12">

          {/* Current Plan */}
          <div className="relative overflow-hidden bg-gradient-to-br from-red-900/40 via-zinc-900 to-zinc-900 rounded-3xl p-12 border border-red-600/40 shadow-2xl">
            <div className="absolute inset-0 bg-red-600/5 blur-3xl"></div>
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-3 mb-6">
                <Crown size={40} className="text-red-500" />
                <h2 className="text-3xl font-bold">Your Current Plan</h2>
              </div>
              <div className="bg-black/60 backdrop-blur-sm inline-block px-12 py-8 rounded-3xl border border-red-600/60 shadow-inner">
                <p className="text-5xl font-black text-red-400 mb-3">Free Forever</p>
                <p className="text-xl text-gray-300">Unlimited access • No payment required</p>
              </div>
              <p className="text-gray-400 mt-6 text-lg">Enjoy core features with our generous free plan</p>
            </div>
          </div>

          {/* Features Comparison */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-zinc-900/70 rounded-3xl p-10 border border-green-600/30 shadow-xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-green-600/20 rounded-2xl">
                  <Check size={32} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-green-400">Included in Free Plan</h3>
              </div>
              <ul className="space-y-6">
                <li className="flex items-center gap-4 text-lg">
                  <Check size={28} className="text-green-500 flex-shrink-0" />
                  <span>Unlimited streaming</span>
                </li>
                <li className="flex items-center gap-4 text-lg">
                  <Check size={28} className="text-green-500 flex-shrink-0" />
                  <span>Nollywood & Global titles</span>
                </li>
                <li className="flex items-center gap-4 text-lg">
                  <Check size={28} className="text-green-500 flex-shrink-0" />
                  <span>HD quality (1080p)</span>
                </li>
                <li className="flex items-center gap-4 text-lg">
                  <Check size={28} className="text-green-500 flex-shrink-0" />
                  <span>My List, Continue Watching & Search</span>
                </li>
                <li className="flex items-center gap-4 text-lg">
                  <Check size={28} className="text-green-500 flex-shrink-0" />
                  <span>One active profile</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-b from-red-900/20 to-zinc-900 rounded-3xl p-10 border border-red-600/50 shadow-2xl relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                PREMIUM
              </div>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-red-600/30 rounded-2xl">
                  <Crown size={32} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-red-400">Unlock with Premium</h3>
              </div>
              <ul className="space-y-6">
                <li className="flex items-center gap-4 text-lg">
                  <Users size={28} className="text-red-500/70 flex-shrink-0" />
                  <span>Up to 5 profiles + Kids Mode</span>
                </li>
                <li className="flex items-center gap-4 text-lg">
                  <Download size={28} className="text-red-500/70 flex-shrink-0" />
                  <span>Offline downloads</span>
                </li>
                <li className="flex items-center gap-4 text-lg">
                  <Globe size={28} className="text-red-500/70 flex-shrink-0" />
                  <span>4K Ultra HD streaming</span>
                </li>
                <li className="flex items-center gap-4 text-lg">
                  <Shield size={28} className="text-red-500/70 flex-shrink-0" />
                  <span>Exclusive PrimeScene Originals</span>
                </li>
                <li className="flex items-center gap-4 text-lg">
                  <Smartphone size={28} className="text-red-500/70 flex-shrink-0" />
                  <span>Stream on 4 devices simultaneously</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Upgrade CTA */}
          <div className="relative bg-gradient-to-r from-red-900/50 via-red-800/30 to-zinc-900 rounded-3xl p-16 text-center border-2 border-red-600/60 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-red-600/10 blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-8">Level Up Your Experience</h2>
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Join thousands enjoying multiple profiles, offline viewing, 4K quality, and exclusive Nollywood premieres.
              </p>
              <button 
                onClick={() => alert('Premium upgrade launching soon! 🚀 Stay tuned.')}
                className="px-20 py-7 bg-red-600 text-3xl font-black rounded-full hover:bg-red-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-red-600/50"
              >
                Upgrade to Premium Now
              </button>
              <div className="mt-10 space-y-3 text-gray-400">
                <p className="text-lg">✓ 30-day money-back guarantee</p>
                <p className="text-lg">✓ Cancel anytime • No hidden fees</p>
                <p className="text-lg">✓ Special launch pricing coming soon</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <button 
              onClick={() => setShowEmailModal(true)}
              className="bg-zinc-900/60 rounded-2xl p-8 border border-white/10 hover:border-red-600/50 transition-all group"
            >
              <Mail size={32} className="text-red-500 mb-4 group-hover:scale-110 transition" />
              <p className="text-xl font-bold mb-2">Change Email</p>
              <p className="text-gray-400 text-sm">Update your login email</p>
            </button>
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="bg-zinc-900/60 rounded-2xl p-8 border border-white/10 hover:border-red-600/50 transition-all group"
            >
              <Lock size={32} className="text-red-500 mb-4 group-hover:scale-110 transition" />
              <p className="text-xl font-bold mb-2">Change Password</p>
              <p className="text-gray-400 text-sm">Keep your account secure</p>
            </button>
            <button 
              onClick={() => setShowNotificationsModal(true)}
              className="bg-zinc-900/60 rounded-2xl p-8 border border-white/10 hover:border-red-600/50 transition-all group"
            >
              <Bell size={32} className="text-red-500 mb-4 group-hover:scale-110 transition" />
              <p className="text-xl font-bold mb-2">Notifications</p>
              <p className="text-gray-400 text-sm">Manage email & push alerts</p>
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-20">
            <p className="text-xl text-gray-400">
              Loving PrimeScene? Help us grow by sharing with friends ❤️
            </p>
            <p className="text-lg text-gray-500 mt-6">
              Questions? <Link to="/help-center" className="text-red-500 underline hover:text-red-400 transition">Visit Help Center</Link>
            </p>
          </div>
        </div>

        {/* CHANGE EMAIL MODAL - NOW FULLY REAL WITH FIREBASE */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
            <div className="bg-zinc-900 rounded-3xl p-10 max-w-md w-full border border-white/20 shadow-2xl">
              <h2 className="text-3xl font-bold mb-8 text-center">Change Email</h2>
              <div className="space-y-5">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="New email address"
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-6 py-4 text-lg focus:border-red-600 transition"
                />
                <input
                  type="password"
                  value={currentPasswordForEmail}
                  onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                  placeholder="Current password (required)"
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-6 py-4 text-lg focus:border-red-600 transition"
                />
              </div>
              {emailError && <p className="text-red-500 text-center mt-6">{emailError}</p>}
              {emailSuccess && (
                <p className="text-green-400 text-center mt-6 flex items-center justify-center gap-2">
                  <Check size={24} /> Email updated successfully!
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
                  className="flex-1 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangeEmail}
                  className="flex-1 py-4 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition"
                >
                  Update Email
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CHANGE PASSWORD MODAL - FULLY REAL */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
            <div className="bg-zinc-900 rounded-3xl p-10 max-w-md w-full border border-white/20 shadow-2xl">
              <h2 className="text-3xl font-bold mb-8 text-center">Change Password</h2>
              <div className="space-y-5">
                <div className="relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-6 py-4 pr-14 text-lg focus:border-red-600 focus:outline-none transition"
                  />
                  <button
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-4 top-4 text-gray-400 hover:text-white"
                  >
                    {showCurrentPass ? <EyeOff size={24} /> : <Eye size={24} />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 8 chars)"
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-6 py-4 pr-14 text-lg focus:border-red-600 focus:outline-none transition"
                  />
                  <button
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-4 top-4 text-gray-400 hover:text-white"
                  >
                    {showNewPass ? <EyeOff size={24} /> : <Eye size={24} />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-6 py-4 pr-14 text-lg focus:border-red-600 focus:outline-none transition"
                  />
                  <button
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-4 top-4 text-gray-400 hover:text-white"
                  >
                    {showConfirmPass ? <EyeOff size={24} /> : <Eye size={24} />}
                  </button>
                </div>
              </div>
              {passwordError && <p className="text-red-500 text-center mt-6">{passwordError}</p>}
              {passwordSuccess && (
                <p className="text-green-400 text-center mt-6 flex items-center justify-center gap-2">
                  <Check size={24} /> Password changed successfully!
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
                  className="flex-1 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  className="flex-1 py-4 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS MODAL - PERSISTENT & WORKING */}
        {showNotificationsModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
            <div className="bg-zinc-900 rounded-3xl p-10 max-w-md w-full border border-white/20 shadow-2xl">
              <h2 className="text-3xl font-bold mb-8 text-center">Notification Preferences</h2>
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-semibold">Email Notifications</p>
                    <p className="text-gray-400">New releases, recommendations</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={emailNotifs}
                      onChange={() => setEmailNotifs(!emailNotifs)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-700 rounded-full peer peer-checked:bg-red-600 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-6"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-semibold">Push Notifications</p>
                    <p className="text-gray-400">App alerts on your device</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={pushNotifs}
                      onChange={() => setPushNotifs(!pushNotifs)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-700 rounded-full peer peer-checked:bg-red-600 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-6"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-semibold">SMS Alerts</p>
                    <p className="text-gray-400">Important account updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={smsNotifs}
                      onChange={() => setSmsNotifs(!smsNotifs)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-700 rounded-full peer peer-checked:bg-red-600 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-6"></div>
                  </label>
                </div>
              </div>
              {notifSuccess && (
                <p className="text-green-400 text-center mt-8 flex items-center justify-center gap-2">
                  <Check size={24} /> Preferences saved!
                </p>
              )}
              <div className="flex gap-4 mt-10">
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="flex-1 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotifications}
                  className="flex-1 py-4 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition"
                >
                  Save Preferences
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