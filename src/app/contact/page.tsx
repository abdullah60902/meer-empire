'use client';
import { useState } from 'react';
import styles from './Contact.module.css';

export default function ContactPage() {
  const [status, setStatus] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => {
      setStatus('sent');
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setStatus(''), 4000);
    }, 1500);
  };

  return (
    <div className={styles.pageWrap}>
      <div className={styles.pageHeader}>
        <div className="container">
          <span className="eyebrow" style={{ color: 'var(--accent-silver)' }}>Get In Touch</span>
          <h1 className="section-title" style={{ margin: 0, color: '#fff' }}>Contact <span className="silver">Us</span></h1>
        </div>
      </div>

      <div className="container">
        <div className={styles.grid}>
          {/* Info Side */}
          <div className={styles.infoCol}>
            <div className={styles.infoBox}>
              <h3>We'd love to hear from you</h3>
              <p>Whether you have a question about an order, need sizing advice, or just want to talk shoes, our team is ready to answer all your questions.</p>
              
              <div className={styles.contactItems}>
                <a href="https://wa.me/923087975435" target="_blank" rel="noreferrer" className={styles.contactItem}>
                  <div className={styles.icon}>💬</div>
                  <div>
                    <strong>WhatsApp Support</strong>
                    <span>+92 308 7975435</span>
                    <small>Usually replies within 10 mins</small>
                  </div>
                </a>
                
                <a href="mailto:support@meerempire.com" className={styles.contactItem}>
                  <div className={styles.icon}>✉️</div>
                  <div>
                    <strong>Email Us</strong>
                    <span>support@meerempire.com</span>
                    <small>For business & general inquiries</small>
                  </div>
                </a>
                
                <div className={styles.contactItem}>
                  <div className={styles.icon}>📍</div>
                  <div>
                    <strong>Location</strong>
                    <span>Karachi, Pakistan</span>
                    <small>Online Store Only - Delivery Nationwide</small>
                  </div>
                </div>
              </div>

              <div className={styles.socials}>
                <h4>Follow Our Journey</h4>
                <div className={styles.socialIcons}>
                  <a href="https://facebook.com" target="_blank" rel="noreferrer">FB</a>
                  <a href="https://instagram.com" target="_blank" rel="noreferrer">IG</a>
                  <a href="https://tiktok.com" target="_blank" rel="noreferrer">TK</a>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className={styles.formCol}>
            <div className={styles.formBox}>
              <h3>Send us a Message</h3>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Your Name *</label>
                  <input type="text" required placeholder="John Doe" />
                </div>
                
                <div className={styles.row}>
                  <div className={styles.formGroup}>
                    <label>Email Address *</label>
                    <input type="email" required placeholder="john@example.com" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone / WhatsApp</label>
                    <input type="tel" placeholder="0300 1234567" />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Subject</label>
                  <select>
                    <option>Order Inquiry</option>
                    <option>Size Exchange Request</option>
                    <option>Product Information</option>
                    <option>Other</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Message *</label>
                  <textarea required rows={5} placeholder="How can we help you?" />
                </div>
                
                <button type="submit" className={styles.submitBtn} disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending...' : status === 'sent' ? '✓ Message Sent!' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className={styles.mapWrap}>
          <div className={styles.mapPlaceholder}>
            <div className={styles.mapIcon}>🗺️</div>
            <h4>Delivering Premium Shoes Nationwide</h4>
            <p>From Karachi to Khyber, MEER EMPIRE brings luxury to your doorstep.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
