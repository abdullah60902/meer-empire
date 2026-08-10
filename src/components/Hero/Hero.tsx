'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Hero.module.css';

export default function Hero() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!parallaxRef.current) return;
      const y = window.scrollY;
      parallaxRef.current.style.transform = `translateY(${y * 0.35}px)`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className={styles.hero}>
      {/* Full-bleed bg */}
      <div className={styles.bg} ref={parallaxRef}>
        <Image
          src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&q=90"
          alt="Premium shoes"
          fill
          priority
          className={styles.bgImg}
          sizes="100vw"
        />
        <div className={styles.bgOverlay} />
      </div>

      {/* Noise texture overlay */}
      <div className={styles.noise} />

      {/* Left vertical label removed */}

      {/* Main content */}
      <div className={styles.content}>

        {/* Giant heading — Nike style */}
        <h1 className={styles.heading}>
          <span className={styles.line1}>WEAR</span>
          <span className={styles.line2}>YOUR</span>
          <span className={styles.line3}>LEGACY</span>
        </h1>

        {/* Sub */}
        <p className={styles.sub}>
          Imported Branded Shoes &nbsp;·&nbsp; Premium Quality &nbsp;·&nbsp; Luxury Collection
        </p>
        <p className={styles.codBadge}>
          <span>📦</span> Cash On Delivery Available — Nationwide
        </p>

        {/* CTA */}
        <div className={styles.ctaRow}>
          <Link href="/shop" className={styles.btnShop}>
            Shop Now
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
          <Link href="/shop" className={styles.btnExplore}>
            View Collection
          </Link>
        </div>

        {/* Stats bar */}
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <strong>5,000+</strong>
            <span>Happy Customers</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <strong>10+</strong>
            <span>Global Brands</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <strong>200+</strong>
            <span>Styles Available</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <strong>Rs. 250</strong>
            <span>Advance COD</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollLine}>
        <div className={styles.scrollDot} />
      </div>
    </section>
  );
}
