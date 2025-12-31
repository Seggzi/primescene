// src/context/MyListContext.jsx - TRUE REAL-TIME MY LIST SYNC LIKE NETFLIX

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './AuthContext';

const MyListContext = createContext();

export function MyListProvider({ children }) {
  const [myList, setMyList] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      // Guest mode - load from localStorage
      const saved = localStorage.getItem('myList');
      if (saved) {
        setMyList(JSON.parse(saved));
      }
      return;
    }
    useEffect(() => {
  if (!user) {
    setNotifications([]); // or load from localStorage if you want
    return;
  }

  // Only then do the fetch and realtime subscription
}, [user]);

    // === REAL-TIME SUBSCRIPTION ===
    const channel = supabase
      .channel('my-list-sync')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'users', 
        filter: `id=eq.${user.uid}` 
      }, (payload) => {
        const data = payload.new;
        if (data.my_list) {
          const newList = data.my_list || [];
          setMyList(newList);
          localStorage.setItem('myList', JSON.stringify(newList));
        }
      })
      .subscribe();

    // === INITIAL FETCH FROM SUPABASE ===
    const fetchMyList = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('my_list')
        .eq('id', user.uid)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('My List fetch error:', error);
        return;
      }

      if (data?.my_list) {
        setMyList(data.my_list);
        localStorage.setItem('myList', JSON.stringify(data.my_list));
      }
    };

    fetchMyList();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addToMyList = async (movie) => {
    // Avoid duplicates
    if (myList.some(m => m.id === movie.id)) return;

    const updated = [...myList, movie];
    setMyList(updated);
    localStorage.setItem('myList', JSON.stringify(updated));

    if (user) {
      const { error } = await supabase
        .from('users')
        .update({ my_list: updated })
        .eq('id', user.uid);

      if (error) console.error('My List add error:', error);
    }
  };

  const removeFromMyList = async (movieId) => {
    const updated = myList.filter(m => m.id !== movieId);
    setMyList(updated);
    localStorage.setItem('myList', JSON.stringify(updated));

    if (user) {
      const { error } = await supabase
        .from('users')
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