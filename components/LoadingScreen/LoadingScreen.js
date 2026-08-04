'use client';
import { useEffect, useState } from 'react';
import styles from './LoadingScreen.module.css';

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 1800);
    const remove = setTimeout(() => setVisible(false), 2300);
    return () => { clearTimeout(timer); clearTimeout(remove); };
  }, []);

  if (!visible) return null;

  return (
    <div className={`${styles.loader} ${fadeOut ? styles.fadeOut : ''}`}>
      <div className={styles.content}>
        <div className={styles.logoWrap}>
          <div className={styles.shield}>
            <span className={styles.m}>M</span>
          </div>
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
