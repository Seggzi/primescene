import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-2xl">Loading...</p>
      </div>
    );
  }

  // Public pages
  if (!user && (location.pathname === '/' || location.pathname === '/login')) {
    return children;
  }

  // Redirect logged-in user from public pages to home
  if (user && (location.pathname === '/' || location.pathname === '/login')) {
    return <Navigate to="/home" replace />;
  }

  // Require login for protected pages
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;