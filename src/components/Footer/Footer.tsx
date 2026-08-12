'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';
import { useTheme } from '@/context/ThemeContext';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { isDark } = useTheme();
  const logoSrc = isDark ? '/img/logo-2.png' : '/img/logo.png';

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscribed(true);
        setEmail('');
        setTimeout(() => setSubscribed(false), 5000);
      } else {
        setErrorMsg(data.error || 'Failed to subscribe');
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className={styles.footer}>
      {/* Top Newsletter Section */}
      <div className={styles.newsletterSection}>
        <div className={styles.container}>
          <div className={styles.newsletterCard}>
            <div className={styles.newsletterText}>
              <span className={styles.newsletterBadge}>Join The Empire</span>
              <h3>Subscribe for VIP Access & Deals</h3>
              <p>Get exclusive discounts, new arrival alerts & luxury style guides straight to your inbox.</p>
            </div>
            <form onSubmit={handleSubscribe} className={styles.newsletterForm}>
              <input
                type="email"
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
                className={styles.input}
              />
              <button type="submit" className={styles.subBtn} disabled={submitting}>
                {submitting ? 'Subscribing...' : subscribed ? '✓ Subscribed!' : 'Subscribe'}
              </button>
            </form>
            {errorMsg && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{errorMsg}</p>}
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className={styles.mainFooter}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {/* Brand Info */}
            <div className={styles.brandCol}>
              <Link href="/" className={styles.logo}>
                <div className={styles.logoMark} style={{ width: 70, height: 70, background: 'transparent', boxShadow: 'none' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoSrc} alt="MEER EMPIRE" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              </Link>
              <p className={styles.brandDesc}>
                MEER EMPIRE provides imported branded shoes with premium craftsmanship, excellent comfort, stylish designs and trusted customer service.
              </p>
              <div style={{ marginTop: '0.8rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📍</span> Dawood Colony, Sargodha Road, Faisalabad
                </p>
                <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>✉️</span> <a href="mailto:info.meerempire@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>info.meerempire@gmail.com</a>
                </p>
              </div>
              <div className={styles.socials}>
                {/* Facebook */}
                <a href="https://www.facebook.com/profile.php?id=61590741872316" target="_blank" rel="noreferrer" aria-label="Facebook" className={styles.socialIcon} title="Facebook">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>

                {/* Instagram */}
                <a href="https://www.instagram.com/meer.empire" target="_blank" rel="noreferrer" aria-label="Instagram" className={styles.socialIcon} title="Instagram">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>

                {/* TikTok */}
                <a href="https://www.tiktok.com/@meer.empire" target="_blank" rel="noreferrer" aria-label="TikTok" className={styles.socialIcon} title="TikTok">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-1.42V9.01a6.34 6.34 0 0 0-3.56 1.01 6.34 6.34 0 1 0 9.9 5.33V9.67a8.16 8.16 0 0 0 4.77 1.52V7.74a4.85 4.85 0 0 1-1-.05z"/></svg>
                </a>

                {/* YouTube */}
                <a href="https://www.youtube.com/@MeerEmpire" target="_blank" rel="noreferrer" aria-label="YouTube" className={styles.socialIcon} title="YouTube">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>

                {/* Pinterest */}
                <a href="https://www.pinterest.com/infomeerempire/_profile" target="_blank" rel="noreferrer" aria-label="Pinterest" className={styles.socialIcon} title="Pinterest">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.62 0 12.017 0z"/></svg>
                </a>

                {/* WhatsApp Channel */}
                <a href="https://whatsapp.com/channel/0029Vb93hiJ5q08VgrCclL0g" target="_blank" rel="noreferrer" aria-label="WhatsApp Channel" className={styles.socialIcon} title="WhatsApp Channel">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99 0-3.951-.5-5.688-1.448l-6.305 1.654z"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className={styles.colTitle}>Quick Links</h4>
              <ul className={styles.linkList}>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/shop">Shop Collection</Link></li>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/contact">Contact Us</Link></li>
                <li><Link href="/wishlist">My Wishlist</Link></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className={styles.colTitle}>Categories</h4>
              <ul className={styles.linkList}>
                <li><Link href="/shop?category=sports">Sports Shoes</Link></li>
                <li><Link href="/shop?category=casual">Casual Shoes</Link></li>
                <li><Link href="/shop?category=sneakers">Sneakers</Link></li>
                <li><Link href="/shop?category=accessories">Accessories</Link></li>
              </ul>
            </div>

            {/* Customer Support & Policies */}
            <div>
              <h4 className={styles.colTitle}>Customer Care</h4>
              <ul className={styles.linkList}>
                <li><Link href="/policies/return">Return & Exchange Policy</Link></li>
                <li><Link href="/policies/shipping">Shipping Policy</Link></li>
                <li><Link href="/policies/privacy">Privacy Policy</Link></li>
                <li><Link href="/policies/terms">Terms & Conditions</Link></li>
                <li><Link href="/contact">Help & FAQs</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Payment methods & Copyright */}
      <div className={styles.bottomBar}>
        <div className={styles.container}>
          <div className={styles.bottomInner}>
            <p className={styles.copy}>© {new Date().getFullYear()} <strong>MEER EMPIRE</strong>. All Rights Reserved.</p>
            <div className={styles.payMethods}>
              <span className={styles.payBadge}>JazzCash</span>
              <span className={styles.payBadge}>Easypaisa</span>
              <span className={styles.payBadge}>Bank Transfer</span>
              <span className={styles.payBadge}>Cash On Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
