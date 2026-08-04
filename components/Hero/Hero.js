'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './Hero.module.css';

const floatingItems = ['👟', '👞', '🥾', '👟', '✨', '⭐'];

export default function Hero() {
  const parallaxRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!parallaxRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 20;
      const y = (clientY / innerHeight - 0.5) * 10;
      parallaxRef.current.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className={styles.hero} id="hero">
      {/* Parallax Background */}
      <div className={styles.bg} ref={parallaxRef}>
        <div className={styles.bgOverlay} />
        <div className={styles.bgGradient} />
      </div>

      {/* Floating Icons */}
      {floatingItems.map((item, i) => (
        <span key={i} className={styles.float} style={{ '--i': i }}>{item}</span>
      ))}

      {/* Particles */}
      {[...Array(20)].map((_, i) => (
        <div key={i} className={styles.particle} style={{ '--i': i }} />
      ))}

      <div className={styles.content}>
        {/* Badge */}
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Premium Imported Collection 2025
        </div>

        <h1 className={styles.heading}>
          Walk With
          <span className={styles.highlight}> Confidence</span>
        </h1>

        <p className={styles.sub}>
          Imported Branded Shoes &nbsp;|&nbsp; Premium Quality &nbsp;|&nbsp; Luxury Collection
          <br />
          <strong>Cash On Delivery Available</strong>
        </p>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <strong>5000+</strong>
            <span>Happy Customers</span>
          </div>
          <div className={styles.statDiv} />
          <div className={styles.stat}>
            <strong>10+</strong>
            <span>Top Brands</span>
          </div>
          <div className={styles.statDiv} />
          <div className={styles.stat}>
            <strong>200+</strong>
            <span>Products</span>
          </div>
        </div>

        <div className={styles.btns}>
          <Link href="/shop" className={styles.btnPrimary}>
            <span>Shop Now</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
          <Link href="/shop" className={styles.btnSecondary}>
            View Collection
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className={styles.scrollHint}>
          <div className={styles.mouse}>
            <div className={styles.wheel} />
          </div>
          <span>Scroll to explore</span>
        </div>
      </div>

      {/* Bottom wave */}
      <div className={styles.wave}>
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,60 C360,100 1080,20 1440,60 L1440,100 L0,100 Z" fill="var(--bg-body)" />
        </svg>
      </div>
    </section>
  );
}
