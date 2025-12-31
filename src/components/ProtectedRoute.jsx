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

  // Allow access to login page even if not logged in
  if (!user && location.pathname !== '/login' && location.pathname !== '/') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If user is logged in and trying to go to login or root, send to home
  if (user && (location.pathname === '/login' || location.pathname === '/')) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default ProtectedRoute;