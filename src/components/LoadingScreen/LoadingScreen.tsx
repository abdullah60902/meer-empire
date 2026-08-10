'use client';
import { useEffect, useState } from 'react';
import styles from './LoadingScreen.module.css';

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 350);
    const remove = setTimeout(() => setVisible(false), 550);
    return () => { clearTimeout(timer); clearTimeout(remove); };
  }, []);

  if (!visible) return null;

  return (
    <div className={`${styles.loader} ${fadeOut ? styles.fadeOut : ''}`}>
      <div className={styles.content}>
        <div className={styles.logoWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logo-2.png" alt="MEER EMPIRE" style={{ width: 90, height: 90, objectFit: 'contain', margin: '0 auto 1rem', display: 'block' }} />
        </div>
        <h1 className={styles.brand}>MEER EMPIRE</h1>
        <p className={styles.tagline}>Premium Imported Shoes</p>
        <div className={styles.progress}>
          <div className={styles.bar}></div>
        </div>
      </div>
    </div>
  );
}
