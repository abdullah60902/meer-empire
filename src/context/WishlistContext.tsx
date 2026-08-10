'use client';
import { createContext, useContext, useReducer, useEffect, ReactNode, Dispatch } from 'react';

export interface WishlistItem {
  id: number | string;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  stock: number;
  images: string[];
  [key: string]: any;
}

export interface WishlistState {
  items: WishlistItem[];
}

export type WishlistAction =
  | { type: 'ADD'; payload: any }
  | { type: 'REMOVE'; payload: number | string }
  | { type: 'TOGGLE'; payload: any };

export interface WishlistContextType extends WishlistState {
  dispatch: Dispatch<WishlistAction>;
  isWishlisted: (id: number | string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
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

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('meer_wishlist');
      if (saved) {
        JSON.parse(saved).forEach((item: any) => dispatch({ type: 'ADD', payload: item }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('meer_wishlist', JSON.stringify(state.items));
    } catch {}
  }, [state.items]);

  const isWishlisted = (id: number | string) => state.items.some((i) => i.id === id);

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
