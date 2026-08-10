import Image from 'next/image';

export default function AboutPage() {
  return (
    <div style={{ background: 'var(--bg-body)' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1a3a6e 100%)', padding: '5rem 0', textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <span className="eyebrow" style={{ color: 'var(--accent-silver)' }}>Our Story</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, margin: '0.5rem 0 1rem' }}>
            About <span style={{ color: 'var(--accent-silver)' }}>MEER EMPIRE</span>
          </h1>
          <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', opacity: 0.9 }}>
            Redefining luxury footwear in Pakistan through authentic imported brands, premium quality, and unparalleled customer service.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '5rem 1.5rem' }}>
        {/* Content Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          <div className="aos">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: 1.2 }}>
              Your Trusted Source for <br/><span style={{ color: 'var(--primary)' }}>Imported Excellence</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Founded with a passion for premium footwear, <strong>MEER EMPIRE</strong> was established to bridge the gap between global luxury brands and Pakistani sneaker enthusiasts and fashion connoisseurs.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
              We understand the struggle of finding authentic, high-quality imported shoes locally. That's why we source directly from trusted international suppliers to bring you 100% original designs from Nike, Adidas, Puma, New Balance, and more—all without the hefty international shipping fees and long wait times.
            </p>
            
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '2rem', color: 'var(--accent-silver)', fontFamily: 'var(--font-display)' }}>5k+</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Happy Customers</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '2rem', color: 'var(--accent-silver)', fontFamily: 'var(--font-display)' }}>100%</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Authenticity</span>
              </div>
            </div>
          </div>

          <div className="aos" style={{ position: 'relative', height: '500px', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-xl)' }}>
            <Image src="https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80" alt="MEER EMPIRE Store" fill style={{ objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,35,69,0.8), transparent)' }} />
            <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem', color: '#fff' }}>
              <div style={{ width: 60, height: 60, background: 'var(--accent-silver)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Quality Guaranteed</h3>
              <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>Every pair passes strict quality control before reaching your doorstep.</p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div style={{ marginTop: '5rem' }}>
          <div className="section-header aos">
            <span className="eyebrow">The Empire Way</span>
            <h2 className="section-title">Our <span className="blue">Core Values</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: '⭐', title: 'Authenticity', desc: 'We guarantee the originality of every product we sell. No replicas, no compromises.' },
              { icon: '🤝', title: 'Customer First', desc: 'Your satisfaction is our priority. We offer dedicated support via WhatsApp and easy returns.' },
              { icon: '💎', title: 'Premium Quality', desc: 'We only stock shoes that meet our high standards for material, comfort, and durability.' },
              { icon: '🚀', title: 'Fast & Secure', desc: 'Swift nationwide delivery with cash on delivery options for your peace of mind.' }
            ].map((v, i) => (
              <div key={i} className="aos" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', textAlign: 'center', transition: 'var(--transition)', animationDelay: `${i*0.1}s` }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{v.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>{v.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
