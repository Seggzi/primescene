import { createContext, useContext, useState, useEffect } from 'react';

const MyListContext = createContext();

export function MyListProvider({ children }) {
  const [myList, setMyList] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('primeSceneMyList');
    if (saved) {
      try {
        setMyList(JSON.parse(saved));
      } catch (e) {
        setMyList([]);
      }
    }
  }, []);

  // Save to localStorage whenever myList changes
  useEffect(() => {
    localStorage.setItem('primeSceneMyList', JSON.stringify(myList));
  }, [myList]);

  const addToMyList = (movie) => {
    setMyList(prev => {
      if (prev.some(m => m.id === movie.id)) return prev;
      return [...prev, movie];
    });
  };

  const removeFromMyList = (movieId) => {
    setMyList(prev => prev.filter(m => m.id !== movieId));
  };

  const isInMyList = (movieId) => {
    return myList.some(m => m.id === movieId);
  };

  const toggleMyList = (movie) => {
    if (isInMyList(movie.id)) {
      removeFromMyList(movie.id);
    } else {
      addToMyList(movie);
    }
  };

  return (
    <MyListContext.Provider value={{ myList, addToMyList, removeFromMyList, isInMyList, toggleMyList }}>
      {children}
    </MyListContext.Provider>
  );
}

export function useMyList() {
  const context = useContext(MyListContext);
  if (!context) {
    throw new Error('useMyList must be used within MyListProvider');
  }
  return context;
}