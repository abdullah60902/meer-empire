'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useTheme } from '@/context/ThemeContext';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount, dispatch: cartDispatch } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { isDark, toggleTheme } = useTheme();
  const logoSrc = isDark ? '/img/logo-2.png' : '/img/logo.png';
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Flash Sale Top Banner */}
      <div className={styles.flashBanner}>
        <div className={styles.flashBannerInner}>
          <span>🔥 FLASH SALE – Up to 30% OFF Selected Items</span>
          <span className={styles.sep}>·</span>
          <span>📦 Cash on Delivery Nationwide</span>
          <span className={styles.sep}>·</span>
          <span>⚡ Fast Shipping Across Pakistan</span>
          <span className={styles.sep}>·</span>
          <span>🔥 FLASH SALE – Up to 30% OFF Selected Items</span>
          <span className={styles.sep}>·</span>
          <span>📦 Cash on Delivery Nationwide</span>
          <span className={styles.sep}>·</span>
          <span>⚡ Fast Shipping Across Pakistan</span>
        </div>
      </div>

      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.navInner}>
          <div className={styles.container}>
            {/* Logo */}
            <Link href="/" className={styles.logo}>
              <div className={styles.logoMark}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoSrc} alt="MEER EMPIRE" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
              </div>
            </Link>

            {/* Desktop Links */}
            <ul className={styles.links}>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.link}>{link.label}</Link>
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className={styles.actions}>


              <Link href="/wishlist" className={styles.iconBtn} aria-label="Wishlist">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                {wishlistItems.length > 0 && <span className={styles.badge}>{wishlistItems.length}</span>}
              </Link>

              <button className={styles.iconBtn} onClick={() => cartDispatch({ type: 'OPEN_CART' })} aria-label="Cart">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
              </button>

              <button className={styles.iconBtn} onClick={toggleTheme} aria-label="Toggle theme">
                {isDark ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
              </button>

              <Link href="/shop" className={styles.shopBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                Shop Now
              </Link>

              <button className={styles.hamburger} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
                <span className={`${styles.ham} ${mobileOpen ? styles.open : ''}`} />
              </button>
            </div>
          </div>


        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.mobileHeader}>
          <Link href="/" className={styles.logo} onClick={() => setMobileOpen(false)}>
            <div className={styles.logoMark}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} alt="MEER EMPIRE" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            </div>
          </Link>
          <button className={styles.mobileClose} onClick={() => setMobileOpen(false)}>✕</button>
        </div>

        <div className={styles.mobileInner}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className={styles.mobileDivider} />
          <Link href="/policies/return" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Return Policy</Link>
          <Link href="/policies/shipping" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Shipping Policy</Link>
          <Link href="/policies/privacy" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Privacy Policy</Link>
        </div>

        <div className={styles.mobileFooter}>
          <div className={styles.mobileCOD}>
            <strong>💳 Cash On Delivery Available</strong>
            Rs. 250 advance delivery charge applies
          </div>
        </div>
      </div>

      {mobileOpen && <div className={styles.overlay} onClick={() => setMobileOpen(false)} />}
    </>
  );
}
