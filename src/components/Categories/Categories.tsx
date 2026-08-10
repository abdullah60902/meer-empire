'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Categories.module.css';

const categories = [
  {
    id: 'sports',
    name: 'Sports',
    label: 'Performance',
    count: 48,
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=85',
  },
  {
    id: 'casual',
    name: 'Casual',
    label: 'Everyday',
    count: 62,
    img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=85',
  },
  {
    id: 'sneakers',
    name: 'Sneakers',
    label: 'Streetwear',
    count: 75,
    img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=85',
  },

  {
    id: 'accessories',
    name: 'Accessories',
    label: 'Complete The Look',
    count: 28,
    img: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=85',
  },
];

export default function Categories() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.opacity = '1';
          (e.target as HTMLElement).style.transform = 'translateY(0)';
          observer.unobserve(e.target);
        }
      }),
      { threshold: 0.1 }
    );
    els?.forEach((el, i) => {
      (el as HTMLElement).style.cssText = `opacity:0;transform:translateY(40px);transition:opacity 0.7s ${i * 0.08}s ease,transform 0.7s ${i * 0.08}s ease`;
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section} ref={sectionRef}>
      {/* Header */}
      <div className={styles.header} data-reveal>
        <span className={styles.eyebrow}>Browse By Style</span>
        <h2 className={styles.title}>SHOP BY<br />CATEGORY</h2>
        <p className={styles.sub}>From athletic performance to everyday elegance</p>
      </div>

      {/* Full-width grid */}
      <div className={styles.grid}>
        {categories.map((cat, i) => (
          <Link key={cat.id} href={`/shop?category=${cat.id}`} className={`${styles.card} ${i === 0 ? styles.featured : ''}`} data-reveal>
            <div className={styles.imgWrap}>
              <Image src={cat.img} alt={cat.name} fill className={styles.img} sizes="(max-width: 768px) 100vw, 33vw" />
            </div>
            <div className={styles.overlay} />
            <div className={styles.cardContent}>
              <span className={styles.label}>{cat.label}</span>
              <h3 className={styles.name}>{cat.name}</h3>
              <div className={styles.cardBottom}>
                <span className={styles.count}>{cat.count} Products</span>
                <span className={styles.arrow}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
