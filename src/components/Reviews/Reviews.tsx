'use client';
import { useEffect, useRef, useState } from 'react';
import styles from './Reviews.module.css';
import { reviews } from '@/data/products';
import GoogleWidget from '@/components/GoogleWidget/GoogleWidget';

export default function Reviews() {
  const [active, setActive] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isAutoplay) {
      intervalRef.current = setInterval(() => {
        setActive((prev) => (prev + 1) % reviews.length);
      }, 4000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isAutoplay]);

  const go = (i: number) => {
    setActive(i);
    setIsAutoplay(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeout(() => setIsAutoplay(true), 8000);
  };

  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll('[data-aos]');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add(styles.visible); observer.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    els?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.container}>
        <div className={styles.header} data-aos>
          <div className={styles.googleBadge}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Verified Google Reviews</span>
          </div>
          <h2 className={styles.title}>What Our <span>Customers Say</span></h2>
          <p className={styles.desc}>Real reviews from Google Business & Verified Buyers</p>
        </div>

        {/* Google Reviews Live Widget Card */}
        <div data-aos>
          <GoogleWidget />
        </div>

        {/* Featured Review */}
        <div className={styles.featured} data-aos>
          <div className={styles.quoteIcon}>"</div>
          <p className={styles.reviewText}>{reviews[active].text}</p>
          <div className={styles.reviewerInfo}>
            <div className={styles.avatar}>{reviews[active].avatar}</div>
            <div>
              <strong className={styles.reviewerName}>{reviews[active].name}</strong>
              <span className={styles.reviewerLocation}>📍 {reviews[active].location}</span>
              <div className={styles.stars}>
                {[...Array(reviews[active].rating)].map((_, i) => (
                  <span key={i} className={styles.star}>⭐</span>
                ))}
              </div>
            </div>
            <div className={styles.productBadge}>{reviews[active].product}</div>
          </div>
        </div>

        {/* All Reviews Grid */}
        <div className={styles.grid} data-aos>
          {reviews.map((r, i) => (
            <div
              key={r.id}
              className={`${styles.card} ${i === active ? styles.activeCard : ''}`}
              onClick={() => go(i)}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardAvatar}>{r.avatar}</div>
                <div className={styles.cardInfo}>
                  <strong>{r.name}</strong>
                  <span>{r.location}</span>
                </div>
                <div className={styles.cardStars}>
                  {'⭐'.repeat(r.rating)}
                </div>
              </div>
              <p className={styles.cardText}>{r.text}</p>
              <div className={styles.cardMeta}>
                <span className={styles.cardProduct}>{r.product}</span>
                <span className={styles.cardDate}>{r.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className={styles.dots} data-aos>
          {reviews.map((_, i) => (
            <button key={i} className={`${styles.dot} ${i === active ? styles.dotActive : ''}`} onClick={() => go(i)} />
          ))}
        </div>

        {/* Overall Rating */}
        <div className={styles.overall} data-aos>
          <div className={styles.overallScore}>
            <span className={styles.bigScore}>4.8</span>
            <div>
              <div className={styles.bigStars}>{'⭐'.repeat(5)}</div>
              <span>Based on 847 reviews</span>
            </div>
          </div>
          <div className={styles.bars}>
            {[5,4,3,2,1].map((s) => {
              const pct = s === 5 ? 78 : s === 4 ? 15 : s === 3 ? 5 : s === 2 ? 1 : 1;
              return (
                <div key={s} className={styles.barRow}>
                  <span>{s} ⭐</span>
                  <div className={styles.barBg}><div className={styles.barFill} style={{ width: `${pct}%` }} /></div>
                  <span>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
