// src/components/ProtectedRoute.jsx (or wherever you keep it)

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    if (user) {
      const checkRole = async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        setIsAdmin(profile?.role === 'admin');
        setCheckingRole(false);
      };
      checkRole();
    } else {
      setCheckingRole(false);
    }
  }, [user]);

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-2xl">Loading...</p>
      </div>
    );
  }

  // Public pages - allow access even if logged in
  if (location.pathname === '/' || location.pathname === '/login') {
    if (user && isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    if (user) {
      return <Navigate to="/home" replace />;
    }
    return children;
  }

  // Protected pages - require login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Optional: If admin tries to access regular protected pages, redirect to admin
  // Uncomment if you want strict separation
  // if (isAdmin && !location.pathname.startsWith('/admin')) {
  //   return <Navigate to="/admin" replace />;
  // }

  return children;
}

export default ProtectedRoute;