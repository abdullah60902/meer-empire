'use client';
import Hero from '@/components/Hero/Hero';
import Categories from '@/components/Categories/Categories';
import Features from '@/components/Features/Features';
import WhyChooseUs from '@/components/WhyChooseUs/WhyChooseUs';
import Reviews from '@/components/Reviews/Reviews';
import ProductCard from '@/components/ProductCard/ProductCard';
import { products } from '@/data/products';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.cssText = `opacity:0;transform:translateY(36px);transition:opacity 0.75s ${delay}s ease,transform 0.75s ${delay}s ease`;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.style.cssText = 'opacity:1;transform:none'; obs.disconnect(); }
    }, { threshold: 0.06 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return <div ref={ref}>{children}</div>;
}

/* Rolling ticker */
const TICKER_ITEMS = [
  'IMPORTED BRANDED SHOES', 'CASH ON DELIVERY', 'FAST SHIPPING', 
  'PREMIUM QUALITY', '200+ PRODUCTS', '5000+ CUSTOMERS',
  'MEER EMPIRE', 'WALK WITH CONFIDENCE',
];

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{ overflow: 'hidden', background: '#0B2345', padding: '0.9rem 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'inline-flex', animation: 'marqueeLeft 18s linear infinite', whiteSpace: 'nowrap' }}>
        {items.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '2rem', padding: '0 2rem' }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.7)' }}>{item}</span>
            <span style={{ width: 4, height: 4, background: 'rgba(184,197,208,0.5)', borderRadius: '50%', flexShrink: 0 }} />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const featuredProducts = products.filter((p: any) => p.isBestSeller).slice(0, 4);
  const newArrivals = products.filter((p: any) => p.isNew).slice(0, 4);

  const sectionStyle = (dark = false): React.CSSProperties => ({
    padding: '7rem 0',
    background: dark ? 'var(--navy-deep)' : 'var(--bg-body)',
  });

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '2rem',
  };

  return (
    <>
      <Hero />

      {/* Rolling Ticker */}
      <Ticker />

      {/* Categories */}
      <Categories />

      {/* ── Best Sellers ── */}
      <section style={sectionStyle()}>
        <div className="container">
          <Reveal>
            <div style={{ marginBottom: '3.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--silver-dark)', marginBottom: '1rem' }}>
                <span style={{ width: 28, height: 1, background: 'var(--silver-dark)', display: 'inline-block' }} />
                Top Rated
              </div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3rem, 6vw, 5.5rem)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                BEST<br /><span style={{ color: 'var(--navy)' }}>SELLERS</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 480 }}>Our most popular imported shoes, chosen by thousands of customers nationwide.</p>
            </div>
          </Reveal>

          <div style={gridStyle}>
            {featuredProducts.map((p: any, i: number) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3}>
            <div style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <Link href="/shop" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.05rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                padding: '1rem 2.5rem',
                background: 'var(--navy)', color: '#fff',
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                transition: 'all 0.22s ease',
              }}>
                View All Products →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Features (dark) */}
      <Features />

      {/* ── New Arrivals ── */}
      <section style={{ padding: '7rem 0', background: 'var(--bg-section)' }}>
        <div className="container">
          <Reveal>
            <div style={{ marginBottom: '3.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--silver-dark)', marginBottom: '1rem' }}>
                <span style={{ width: 28, height: 1, background: 'var(--silver-dark)', display: 'inline-block' }} />
                Just In
              </div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3rem, 6vw, 5.5rem)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                NEW<br /><span style={{ WebkitTextStroke: '1px var(--navy)', color: 'transparent' }}>ARRIVALS</span>
              </h2>
            </div>
          </Reveal>
          <div style={gridStyle}>
            {newArrivals.map((p: any, i: number) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <WhyChooseUs />
      <Reviews />
    </>
  );
}
