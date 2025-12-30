// src/context/MyListContext.jsx - FULL REAL-TIME SYNC WITH SUPABASE

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './AuthContext';

const MyListContext = createContext();

export function MyListProvider({ children }) {
  const [myList, setMyList] = useState([]);
  const { user } = useAuth();

  // Load from localStorage + Supabase
  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem('myList');
      if (saved) setMyList(JSON.parse(saved));
      return;
    }

    // Real-time subscription
    const channel = supabase
      .channel('my-list-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user', filter: `id=eq.${user.uid}` }, (payload) => {
        const data = payload.new;
        if (data.my_list) {
          setMyList(data.my_list || []);
          localStorage.setItem('myList', JSON.stringify(data.my_list || []));
        }
      })
      .subscribe();

    // Initial fetch
    supabase
      .from('user')
      .select('my_list')
      .eq('id', user.uid)
      .single()
      .then(({ data }) => {
        if (data?.my_list) {
          setMyList(data.my_list);
          localStorage.setItem('myList', JSON.stringify(data.my_list));
        }
      });

    return () => supabase.removeChannel(channel);
  }, [user]);

  const addToMyList = async (movie) => {
    const updated = [...myList.filter(m => m.id !== movie.id), movie]; // avoid duplicates
    setMyList(updated);
    localStorage.setItem('myList', JSON.stringify(updated));

    if (user) {
      const { error } = await supabase
        .from('user')
        .update({ my_list: updated })
        .eq('id', user.uid);
      if (error) console.error('My List save error:', error);
    }
  };

  const removeFromMyList = async (movieId) => {
    const updated = myList.filter(m => m.id !== movieId);
    setMyList(updated);
    localStorage.setItem('myList', JSON.stringify(updated));

    if (user) {
      const { error } = await supabase
        .from('user')
        .update({ my_list: updated })
        .eq('id', user.uid);
      if (error) console.error('My List remove error:', error);
    }
  };

  const isInMyList = (movieId) => myList.some(m => m.id === movieId);

  return (
    <MyListContext.Provider value={{ myList, addToMyList, removeFromMyList, isInMyList }}>
      {children}
    </MyListContext.Provider>
  );
}

export function useMyList() {
  return useContext(MyListContext);
}