import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../firebase';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/');
    return null;
  }

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError('Google sign-in failed. Try again.');
    }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Hero Background */}
      <div className="absolute inset-0">
        <img 
          src="https://files.catbox.moe/843del.png" 
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Login Form - Moved down like Netflix */}
      <div className="relative z-10 flex items-start justify-center pt-20 sm:pt-32 md:pt-40 min-h-screen px-4">
        <div className="w-full max-w-md bg-black/75 rounded-lg p-8 sm:p-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">
            Sign In
          </h1>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <form onSubmit={handleEmail} className="space-y-6">
            <input
              type="email"
              placeholder="Email or phone number"
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
            />

            <button 
              type="submit"
              className="w-full py-4 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition text-lg"
            >
              Sign In
            </button>

            <div className="flex items-center justify-between text-white/70 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                Remember me
              </label>
              <a href="#" className="hover:underline">Need help?</a>
            </div>
          </form>

          <div className="mt-8 text-white/70">
            <p className="mb-4">
              {isRegister ? 'Already have an account?' : 'New to PrimeScene?'}
              <button 
                onClick={() => setIsRegister(!isRegister)}
                className="text-white hover:underline ml-2 font-medium"
              >
                {isRegister ? 'Sign In' : 'Sign up now'}
              </button>
            </p>

            <p className="text-sm mt-8">
              Sign in with Google:
            </p>
            <button 
              onClick={handleGoogle}
              className="mt-4 w-full py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <p className="mt-8 text-xs">
              This page is protected by Google reCAPTCHA to ensure you're not a bot. <a href="#" className="text-blue-500 hover:underline">Learn more</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;