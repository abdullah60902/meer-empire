'use client';
import Link from 'next/link';
import { useRef, useEffect } from 'react';
import styles from './Categories.module.css';

const cats = [
  {
    id: 'sports',
    name: 'Sports Shoes',
    desc: 'High-performance athletic footwear',
    count: 24,
    icon: '🏃',
    gradient: 'linear-gradient(135deg, #0B2345 0%, #1a3a6e 100%)',
    accent: '#4a90d9',
  },
  {
    id: 'casual',
    name: 'Casual Shoes',
    desc: 'Everyday comfort & style',
    count: 18,
    icon: '👟',
    gradient: 'linear-gradient(135deg, #1a3a6e 0%, #2d5a8e 100%)',
    accent: '#6aacee',
  },
  {
    id: 'sneakers',
    name: 'Sneakers',
    desc: 'Trendy street-style kicks',
    count: 32,
    icon: '✨',
    gradient: 'linear-gradient(135deg, #2d5a8e 0%, #0B2345 100%)',
    accent: '#D4AF37',
  },
  {
    id: 'formal',
    name: 'Formal Shoes',
    desc: 'Elegant office & occasion wear',
    count: 15,
    icon: '👔',
    gradient: 'linear-gradient(135deg, #0d2040 0%, #0B2345 100%)',
    accent: '#c0c8d4',
  },
  {
    id: 'accessories',
    name: 'Accessories',
    desc: 'Socks, laces & care products',
    count: 20,
    icon: '🧦',
    gradient: 'linear-gradient(135deg, #152d52 0%, #1f3f73 100%)',
    accent: '#8ac4e8',
  },
];

export default function Categories() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll('[data-animate]');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add(styles.visible); observer.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    cards?.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section} ref={sectionRef} id="categories">
      <div className={styles.container}>
        <div className={styles.header} data-animate>
          <span className={styles.eyebrow}>Browse by Category</span>
          <h2 className={styles.title}>Shop by <span className={styles.accent}>Style</span></h2>
          <p className={styles.desc}>From high-performance sports shoes to elegant formals — find your perfect pair</p>
        </div>

        <div className={styles.grid}>
          {cats.map((cat, i) => (
            <Link
              href={`/shop?category=${cat.id}`}
              key={cat.id}
              className={styles.card}
              data-animate
              style={{ '--delay': `${i * 0.1}s`, '--gradient': cat.gradient, '--accent': cat.accent }}
            >
              <div className={styles.cardInner}>
                <div className={styles.iconWrap}>
                  <span className={styles.icon}>{cat.icon}</span>
                  <div className={styles.iconGlow} />
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.catName}>{cat.name}</h3>
                  <p className={styles.catDesc}>{cat.desc}</p>
                  <span className={styles.catCount}>{cat.count} Products</span>
                </div>
                <div className={styles.arrow}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
                <div className={styles.cardShine} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
