'use client';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/ProductCard/ProductCard';
import Link from 'next/link';
import { Suspense } from 'react';

export default function WishlistPage() {
  const { items } = useWishlist();

  return (
    <div style={{ background: 'var(--bg-body)', minHeight: '100vh', paddingBottom: '5rem' }}>
      <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1a3a6e 100%)', padding: '3rem 0', textAlign: 'center', marginBottom: '2rem' }}>
        <div className="container">
          <h1 className="section-title" style={{ margin: 0, color: '#fff' }}>My <span className="silver">Wishlist</span></h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>Your curated collection of premium footwear.</p>
        </div>
      </div>

      <div className="container">
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
            <div style={{ fontSize: '4rem', opacity: 0.5, marginBottom: '1rem', animation: 'float 3s infinite ease-in-out' }}>❤️</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Your Wishlist is Empty</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Save your favorite items here to buy them later.</p>
            <Link href="/shop" className="btn-premium" style={{ background: 'var(--primary)', color: '#fff', marginTop: '1.5rem' }}>
              Explore Collection
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            <Suspense fallback={<div className="skeleton" style={{ height: '400px' }} />}>
              {items.map((item) => (
                <ProductCard key={item.id} product={item as any} />
              ))}
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
