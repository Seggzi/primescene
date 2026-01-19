// src/pages/Login.jsx - FULL VERSION WITH CODE-BASED FORGOT PASSWORD

import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Phone, User } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState(''); // for reset
  const [confirmNewPassword, setConfirmNewPassword] = useState(''); // for reset
  const [isRegister, setIsRegister] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false); // show reset password UI
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/home');
    });
  }, [navigate]);

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/home' },
      });
      if (error) throw error;
    } catch (err) {
      setError('Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email');
      setLoading(false);
      return;
    }

    try {
      if (isResetMode && showOtpInput) {
        // Verify reset code + update password
        const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token: otp.trim(),
          type: 'recovery' // Important: for password reset
        });

        if (verifyError) throw verifyError;

        if (newPassword.length < 6) {
          setError('New password must be at least 6 characters');
          setLoading(false);
          return;
        }
        if (newPassword !== confirmNewPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (updateError) throw updateError;

        setSuccess('Password updated! Logging you in...');
        setTimeout(() => navigate('/home'), 1500);
      } else if (showOtpInput) {
        // Normal sign-up confirmation
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token: otp.trim(),
          type: 'signup'
        });

        if (error) throw error;

        setSuccess('Account confirmed! Logging you in...');
        setTimeout(() => navigate('/home'), 1500);
      } else if (isRegister) {
        const metadata = {};
        if (username.trim()) metadata.username = username.trim();
        if (phone.trim()) metadata.phone = phone.trim();

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: metadata }
        });

        if (error) throw error;

        setSuccess('Check your email for the 6-digit confirmation code!');
        setShowOtpInput(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/home');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return setError('Enter your email first');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login' // optional
      });

      if (error) throw error;

      setSuccess('Check your email for the 6-digit reset code!');
      setIsResetMode(true); // Show reset UI
      setShowOtpInput(true); // Show code input immediately
    } catch (err) {
      console.error('Reset request error:', err);
      setError(err.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-black via-red-950/30 to-black overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <img 
          src="https://files.catbox.moe/843del.png" 
          alt="Background"
          className="w-full h-full object-cover opacity-70 animate-pulse-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 py-12">
        <div className="w-full max-w-md bg-black/75 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-red-900/50 animate-fade-in-up">
          <h1 className="text-4xl font-extrabold text-white mb-2 text-center tracking-tight">
            {isResetMode ? 'Reset Password' : (isRegister ? 'Join PrimeScene' : 'Welcome Back')}
          </h1>
          <p className="text-gray-400 text-center mb-10">
            {isResetMode ? 'Enter the code from your email' : (isRegister ? 'Create your account' : 'Sign in to continue watching')}
          </p>

          {error && (
            <div className="bg-red-900/50 text-red-200 p-4 rounded-xl mb-6 text-center animate-shake">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-900/50 text-green-200 p-4 rounded-xl mb-6 text-center">
              {success}
            </div>
          )}

          <form onSubmit={handleEmail} className="space-y-6">
            {isResetMode && showOtpInput ? (
              <>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full pl-12 pr-12 py-4 bg-zinc-900/80 border border-zinc-700 rounded-xl text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-zinc-900/80 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-gray-400 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm New Password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-zinc-900/80 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                    required
                    minLength="6"
                  />
                </div>
              </>
            ) : (
              <>
                {isRegister && (
                  <>
                    <div className="relative">
                      <User className="absolute left-4 top-4 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Username (optional)"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-zinc-900/80 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                        disabled={showOtpInput}
                      />
                    </div>

                    <div className="relative">
                      <Phone className="absolute left-4 top-4 text-gray-400" size={20} />
                      <input
                        type="tel"
                        placeholder="Phone number (optional)"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-zinc-900/80 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                        disabled={showOtpInput}
                      />
                    </div>
                  </>
                )}

                <div className="relative">
                  <Mail className="absolute left-4 top-4 text-gray-400" size={20} />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-zinc-900/80 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                    required
                    disabled={showOtpInput}
                  />
                </div>

                {!showOtpInput && (
                  <>
                    <div className="relative">
                      <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={isResetMode ? 'New Password' : 'Password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 bg-zinc-900/80 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                        required
                        minLength="6"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4 text-gray-400 hover:text-white transition"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>

                    {isRegister && (
                      <div className="relative">
                        <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirm Password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-12 pr-12 py-4 bg-zinc-900/80 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                          required
                          minLength="6"
                        />
                      </div>
                    )}
                  </>
                )}

                {showOtpInput && !isResetMode && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full pl-12 pr-12 py-4 bg-zinc-900/80 border border-zinc-700 rounded-xl text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                      maxLength={6}
                      required
                      autoFocus
                    />
                  </div>
                )}
              </>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-red-700 to-red-500 text-white font-bold rounded-xl hover:from-red-600 hover:to-red-400 transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-3 shadow-lg"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  {showOtpInput ? (isResetMode ? 'Update Password' : 'Verify Code') : (isRegister ? 'Create Account' : 'Sign In')}
                  {!showOtpInput && !showOtpInput && <ArrowRight size={20} />}
                </>
              )}
            </button>

            {!isRegister && !showOtpInput && !isResetMode && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-red-400 hover:text-red-300 text-sm block w-full text-center mt-3 transition"
              >
                Forgot password?
              </button>
            )}

            {showOtpInput && (
              <button
                type="button"
                onClick={() => {
                  setShowOtpInput(false);
                  setOtp('');
                  setSuccess('');
                }}
                className="text-gray-400 hover:text-white text-sm block w-full text-center mt-3 transition"
              >
                Didn't receive code? Try again
              </button>
            )}
          </form>

          {!showOtpInput && !isResetMode && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-black text-gray-500">or</span>
                </div>
              </div>

              <button 
                onClick={handleGoogle}
                disabled={loading}
                className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3 shadow-md disabled:opacity-60"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <p className="text-center text-gray-400 mt-8">
                {isRegister ? 'Already have an account?' : 'New to PrimeScene?'}
                <button 
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError('');
                    setSuccess('');
                    setShowOtpInput(false);
                    setOtp('');
                  }}
                  className="text-red-500 hover:text-red-400 ml-2 font-semibold transition"
                >
                  {isRegister ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;