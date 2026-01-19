import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './AuthContext';

const MyListContext = createContext();

export function MyListProvider({ children }) {
  const [myList, setMyList] = useState([]);
  const { user } = useAuth();

  // 1. Load from LocalStorage instantly (for speed)
  useEffect(() => {
    const saved = localStorage.getItem('myList');
    if (saved) setMyList(JSON.parse(saved));
  }, []);

  // 2. Sync with Supabase (Fetch + Realtime)
  useEffect(() => {
    if (!user) return;

    // --- FETCH INITIAL LIST ---
    const fetchMyList = async () => {
      // We select from 'my_list' because that is the table in your SQL screenshot
      const { data, error } = await supabase
        .from('my_list')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching list:', error);
      } else if (data) {
        // We extract just the movie data to keep the list clean
        const formattedList = data.map(item => item.movie_data);
        setMyList(formattedList);
        localStorage.setItem('myList', JSON.stringify(formattedList));
      }
    };

    fetchMyList();

    const pushToCloud = async (newData) => {
      if (!user?.id) return;

      // 1. Log to console so you can see if it's actually firing
      console.log("Saving to Database...", newData);

      const { data, error } = await supabase
        .from('users')
        .update(newData)
        .eq('id', user.id)
        .select(); // Adding .select() forces it to return the saved data

      if (error) {
        console.error("Database Save Error:", error.message);
        addNotification("Failed to save to cloud", "error");
      } else {
        console.log("Saved Successfully:", data);
      }
    };

    // --- REALTIME LISTENER ---
    const channel = supabase
      .channel('my-list-sync')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for ALL events (Insert and Delete)
          schema: 'public',
          table: 'my_list', // LISTENING TO THE CORRECT TABLE
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // If a new movie is ADDED
          if (payload.eventType === 'INSERT') {
            setMyList((prev) => {
              const updated = [payload.new.movie_data, ...prev];
              localStorage.setItem('myList', JSON.stringify(updated));
              return updated;
            });
          }

          // If a movie is REMOVED
          if (payload.eventType === 'DELETE') {
            // For deletes, it's safest to just re-fetch the clean list to avoid sync bugs
            fetchMyList();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // 3. Add to List
  const addToMyList = async (movie) => {
    if (myList.some(m => m.id === movie.id)) return;

    // Optimistic Update (Show it instantly)
    const updated = [movie, ...myList];
    setMyList(updated);
    localStorage.setItem('myList', JSON.stringify(updated));

    if (user) {
      // Insert into the 'my_list' table using the correct column names
      const { error } = await supabase.from('my_list').insert({
        user_id: user.id,
        movie_id: movie.id,
        movie_data: movie
      });
      if (error) console.error('Add error:', error);
    }
  };

  // 4. Remove from List
  const removeFromMyList = async (movieId) => {
    // Optimistic Update
    const updated = myList.filter(m => m.id !== movieId);
    setMyList(updated);
    localStorage.setItem('myList', JSON.stringify(updated));

    if (user) {
      // Delete from the 'my_list' table
      const { error } = await supabase
        .from('my_list')
        .delete()
        .eq('user_id', user.id)
        .eq('movie_id', movieId);

      if (error) console.error('Remove error:', error);
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