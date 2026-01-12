// src/pages/Login.jsx - FULLY MIGRATED TO SUPABASE (no ads)

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/home',
        },
      });
      if (error) throw error;
    } catch (err) {
      setError('Google sign-in failed. Try again.');
      setLoading(false);
    }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let error;
      if (isRegister) {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        error = signUpError;
        if (!error) setSuccess('Check your email to confirm your account!');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        error = signInError;
      }
      if (error) throw error;

      navigate('/home');
    } catch (err) {
      setError(
        err.message.includes('Invalid login credentials') || err.message.includes('Email not confirmed')
          ? 'Invalid email or password'
          : err.message || 'Something went wrong. Try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email first');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login',
      });
      if (error) throw error;
      setSuccess('Check your email for password reset link!');
    } catch (err) {
      setError('Failed to send reset email. Check your email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <div className="absolute inset-0">
        <img 
          src="https://files.catbox.moe/843del.png" 
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="relative z-10 flex items-start justify-center pt-20 sm:pt-32 md:pt-40 min-h-screen px-4">
        <div className="w-full max-w-md bg-black/75 rounded-lg p-8 sm:p-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">
            {isRegister ? 'Create Account' : 'Sign In'}
          </h1>

          {error && <p className="text-red-500 bg-red-900/50 p-4 rounded mb-4">{error}</p>}
          {success && <p className="text-green-500 bg-green-900/50 p-4 rounded mb-4">{success}</p>}

          <form onSubmit={handleEmail} className="space-y-6">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-4 bg-gray-700 text-white rounded focus:outline-none focus:bg-gray-600"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-4 bg-gray-700 text-white rounded focus:outline-none focus:bg-gray-600"
              required
              minLength="6"
            />

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition text-lg disabled:opacity-70"
            >
              {loading ? 'Please wait...' : (isRegister ? 'Sign Up' : 'Sign In')}
            </button>

            {!isRegister && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-white/70 hover:underline text-sm block text-center"
              >
                Forgot password?
              </button>
            )}
          </form>

          <div className="my-8 text-center text-white/70">or</div>

          <button 
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-4 bg-white text-black font-bold rounded hover:bg-gray-200 transition flex items-center justify-center gap-3 disabled:opacity-70"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-white/70 mt-8">
            {isRegister ? 'Already have an account?' : 'New to PrimeScene?'}
            <button 
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setSuccess('');
              }}
              className="text-white hover:underline ml-2 font-bold"
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;