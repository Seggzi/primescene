// src/admin/AdminLogin.jsx - FINAL VERSION (role check active + debug log)
import { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from 'lucide-react';

const SECRET_ADMIN_CODE = 'admin2026'; // ← CHANGE THIS TO YOUR OWN SECRET CODE

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState('credentials'); // 'credentials' or 'code'
  const navigate = useNavigate();

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Role check – this should now work after fixing RLS
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      console.log('[ADMIN LOGIN] Profile from Supabase:', { profile, profileError });

      if (profileError) throw profileError;

      if (profile?.role !== 'admin') {
        throw new Error('Access denied: Admin only');
      }

      // Credentials + role correct → move to code step
      setStep('code');
    } catch (err) {
      console.error('[ADMIN LOGIN] Error:', err.message || err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (code.trim() === SECRET_ADMIN_CODE) {
      // Code correct → go to admin dashboard
      navigate('/admin', { replace: true });
    } else {
      setError('Invalid admin code');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-2xl">
        <h1 className="text-3xl font-bold text-red-600 mb-2 text-center">Admin Login</h1>
        <p className="text-gray-400 text-center mb-8">Authorized personnel only</p>

        {error && (
          <div className="bg-red-900/50 text-red-200 p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {step === 'credentials' ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="Admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition disabled:opacity-60"
            >
              {loading ? 'Checking...' : 'Next'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <ShieldCheck className="mx-auto text-red-500 mb-2" size={48} />
              <h2 className="text-xl font-bold">Admin Verification</h2>
              <p className="text-gray-400 mt-2">Enter the secret code</p>
            </div>

            <input
              type="text"
              placeholder="Secret code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none text-center text-xl tracking-widest"
              maxLength={20}
              required
              autoFocus
            />

            <button
              type="submit"
              className="w-full py-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
            >
              Verify & Enter Admin Panel
            </button>

            <button
              type="button"
              onClick={() => setStep('credentials')}
              className="text-gray-400 hover:text-white text-sm block w-full text-center mt-4"
            >
              Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}