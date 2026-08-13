'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './ProductCard.module.css';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export interface Product {
  id: number | string;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  stock: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isFlashSale?: boolean;
  badge?: string;
  colors?: string[];
  sizes?: string[];
  images: string[];
  description?: string;
  features?: string[];
  quantity?: number;
  size?: string;
  color?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'UK 9');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '#000000');
  const [addedToCart, setAddedToCart] = useState(false);
  const { dispatch: cartDispatch } = useCart();
  const { isWishlisted, dispatch: wishlistDispatch } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    cartDispatch({ type: 'ADD_ITEM', payload: { ...product, size: selectedSize, color: selectedColor } });
    cartDispatch({ type: 'OPEN_CART' });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    wishlistDispatch({ type: 'TOGGLE', payload: product });
  };

  const getStockClass = () => {
    if (product.stock === 0) return styles.outOfStock;
    if (product.stock < 5) return styles.lowStock;
    return styles.inStock;
  };

  const getStockLabel = () => {
    if (product.stock === 0) return 'Out of Stock';
    if (product.stock < 5) return `Only ${product.stock} left`;
    return 'In Stock';
  };

  const discountPct = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : (product.discount || 0);

  return (
    <div className={styles.card}>
      {/* Image Container */}
      <div className={styles.imgWrap}>
        <Link href={`/product/${product.id}`} style={{ display: 'block', width: '100%', height: '100%', position: 'relative' }}>
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className={styles.img}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>

        {/* Badges */}
        <div className={styles.badges}>
          <span className={styles.badgeComingSoon}>🚀 Coming Soon</span>
          {product.isNew && <span className={styles.badgeNew}>New In</span>}
          {discountPct > 0 && <span className={styles.badgeSale}>-{discountPct}%</span>}
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${wishlisted ? styles.wishlisted : ''}`}
            onClick={handleWishlist}
            aria-label="Add to wishlist"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          <Link href={`/product/${product.id}`} className={styles.actionBtn} aria-label="Quick view">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </Link>
        </div>

        {/* Add to Cart bar */}
        <button className={styles.addBar} onClick={handleAddToCart} disabled={product.stock === 0}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          {addedToCart ? '✓ Added to Cart!' : 'Add to Cart'}
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.brand}>{product.brand}</div>
        <h3 className={styles.name}>{product.name}</h3>

        <div className={styles.meta}>
          <div className={styles.rating}>
            <span className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{ opacity: i < Math.round(product.rating) ? 1 : 0.25 }}>⭐</span>
              ))}
            </span>
            <span className={styles.ratingNum}>{product.rating}</span>
            <span className={styles.reviews}>({product.reviews})</span>
          </div>
          <span className={`${styles.stockBadge} ${getStockClass()}`}>{getStockLabel()}</span>
        </div>

        <div className={styles.footer}>
          <div className={styles.priceWrap}>
            <span className={styles.price}>Coming Soon</span>
          </div>
          <Link href={`/product/${product.id}`} className={styles.viewBtn}>
            Details
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
