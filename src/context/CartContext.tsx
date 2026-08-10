'use client';
import { createContext, useContext, useReducer, useEffect, ReactNode, Dispatch } from 'react';

export interface CartItem {
  id: number | string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  images: string[];
  [key: string]: any;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  paymentMethod: 'cod' | 'online';
  coupon: string | null;
  couponDiscount: number;
}

export type CartAction =
  | { type: 'ADD_ITEM'; payload: any }
  | { type: 'REMOVE_ITEM'; payload: any }
  | { type: 'UPDATE_QUANTITY'; payload: any }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'SET_PAYMENT'; payload: 'cod' | 'online' }
  | { type: 'APPLY_COUPON'; payload: { code: string; discount: number } }
  | { type: 'REMOVE_COUPON' };

export interface CartContextType extends CartState {
  dispatch: Dispatch<CartAction>;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

const initialState: CartState = {
  items: [],
  isOpen: false,
  paymentMethod: 'cod',
  coupon: null,
  couponDiscount: 0,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(
        (i) => i.id === action.payload.id && i.size === action.payload.size && i.color === action.payload.color
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.payload.id && i.size === action.payload.size && i.color === action.payload.color
              ? { ...i, quantity: i.quantity + (action.payload.quantity || 1) }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => !(i.id === action.payload.id && i.size === action.payload.size && i.color === action.payload.color)) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id && i.size === action.payload.size && i.color === action.payload.color
            ? { ...i, quantity: Math.max(1, action.payload.quantity) }
            : i
        ),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    case 'OPEN_CART':
      return { ...state, isOpen: true };
    case 'CLOSE_CART':
      return { ...state, isOpen: false };
    case 'SET_PAYMENT':
      return { ...state, paymentMethod: action.payload };
    case 'APPLY_COUPON':
      return { ...state, coupon: action.payload.code, couponDiscount: action.payload.discount };
    case 'REMOVE_COUPON':
      return { ...state, coupon: null, couponDiscount: 0 };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Persist to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('meer_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.items?.forEach((item: any) => dispatch({ type: 'ADD_ITEM', payload: item }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('meer_cart', JSON.stringify({ items: state.items }));
    } catch {}
  }, [state.items]);

  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryCharge = state.paymentMethod === 'cod' ? 250 : 0;
  const discount = state.couponDiscount;
  const total = subtotal + deliveryCharge - discount;
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ ...state, dispatch, subtotal, deliveryCharge, discount, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
