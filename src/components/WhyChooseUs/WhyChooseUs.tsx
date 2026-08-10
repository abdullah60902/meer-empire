'use client';
import { useEffect, useRef } from 'react';
import styles from './WhyChooseUs.module.css';

const reasons = [
  { icon: '🌐', title: 'Imported Collections', desc: 'Directly sourced premium branded footwear from international markets.' },
  { icon: '🏆', title: 'Premium Material', desc: 'Only the finest leathers, meshes, and rubber compounds used in our collection.' },
  { icon: '💰', title: 'Affordable Prices', desc: 'Competitive pricing on all imports – luxury at a price you\'ll love.' },
  { icon: '⭐', title: 'Trusted Store', desc: '5,000+ satisfied customers across Pakistan trust MEER EMPIRE.' },
  { icon: '🔐', title: 'Secure Payments', desc: 'Bank-grade encryption for all online transactions. Safe and transparent.' },
  { icon: '🚀', title: 'Fast Delivery', desc: 'Nationwide delivery in 2-5 business days with live tracking.' },
];

const stats = [
  { value: '5000', suffix: '+', label: 'Happy Customers' },
  { value: '99', suffix: '%', label: 'Satisfaction Rate' },
  { value: '2-5', suffix: ' Days', label: 'Delivery Time' },
  { value: '10', suffix: '+', label: 'Top Brands' },
];

export default function WhyChooseUs() {
  const sectionRef = useRef<HTMLElement>(null);

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
        {/* Header */}
        <div className={styles.header} data-aos>
          <span className={styles.eyebrow}>Why MEER EMPIRE</span>
          <h2 className={styles.title}>Why Choose <span>Us?</span></h2>
          <p className={styles.desc}>We go the extra mile to ensure you receive only the best</p>
        </div>

        {/* Stats Row */}
        <div className={styles.statsRow} data-aos>
          {stats.map((s, i) => (
            <div key={i} className={styles.stat} style={{ '--delay': `${i * 0.1}s` } as React.CSSProperties}>
              <strong>{s.value}<span>{s.suffix}</span></strong>
              <p>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Cards */}
        <div className={styles.grid}>
          {reasons.map((r, i) => (
            <div key={i} className={styles.card} data-aos style={{ '--delay': `${i * 0.1}s` } as React.CSSProperties}>
              <div className={styles.iconWrap}>
                <span className={styles.icon}>{r.icon}</span>
              </div>
              <h3 className={styles.cardTitle}>{r.title}</h3>
              <p className={styles.cardDesc}>{r.desc}</p>
              <div className={styles.cardLine} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
