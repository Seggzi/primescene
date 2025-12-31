// src/context/AuthContext.jsx - FIXED FOR CROSS-DEVICE SYNC

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
        // Force reload data from Supabase on sign in
        localStorage.removeItem('profiles');
        localStorage.removeItem('myList');
        localStorage.removeItem('stats');
        localStorage.removeItem('activity');
        window.location.reload(); // Ensures fresh data from Supabase
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.clear();
      }
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}