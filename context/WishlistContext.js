'use client';
import { createContext, useContext, useReducer, useEffect } from 'react';

const WishlistContext = createContext(null);

function wishlistReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      if (state.items.find((i) => i.id === action.payload.id)) return state;
      return { items: [...state.items, action.payload] };
    case 'REMOVE':
      return { items: state.items.filter((i) => i.id !== action.payload) };
    case 'TOGGLE':
      if (state.items.find((i) => i.id === action.payload.id)) {
        return { items: state.items.filter((i) => i.id !== action.payload.id) };
      }
      return { items: [...state.items, action.payload] };
    default:
      return state;
  }
}

export function WishlistProvider({ children }) {
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('meer_wishlist');
      if (saved) {
        JSON.parse(saved).forEach((item) => dispatch({ type: 'ADD', payload: item }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('meer_wishlist', JSON.stringify(state.items));
    } catch {}
  }, [state.items]);

  const isWishlisted = (id) => state.items.some((i) => i.id === id);

  return (
    <WishlistContext.Provider value={{ ...state, dispatch, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
