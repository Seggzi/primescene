// src/context/MyListContext.jsx - SUPABASE SYNC

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './AuthContext';

const MyListContext = createContext();

export function MyListProvider({ children }) {
  const [myList, setMyList] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem('myList');
      if (saved) setMyList(JSON.parse(saved));
      return;
    }

    // Real-time sync from Supabase
    const channel = supabase
      .channel('my-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: `id=eq.${user.uid}` }, (payload) => {
        const data = payload.new;
        if (data.myList) setMyList(data.myList || []);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  const addToMyList = (movie) => {
    const updated = [...myList, movie];
    setMyList(updated);
    localStorage.setItem('myList', JSON.stringify(updated));

    if (user) {
      supabase.from('users').update({ myList: updated }).eq('id', user.uid);
    }
  };

  const removeFromMyList = (movieId) => {
    const updated = myList.filter(m => m.id !== movieId);
    setMyList(updated);
    localStorage.setItem('myList', JSON.stringify(updated));

    if (user) {
      supabase.from('users').update({ myList: updated }).eq('id', user.uid);
    }
  };

  return (
    <MyListContext.Provider value={{ myList, addToMyList, removeFromMyList }}>
      {children}
    </MyListContext.Provider>
  );
}

export function useMyList() {
  return useContext(MyListContext);
}