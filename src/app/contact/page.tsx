'use client';
import { useState } from 'react';
import styles from './Contact.module.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Order Inquiry',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMsg(data.message || '✓ Your message has been sent successfully! Our team will contact you soon.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: 'Order Inquiry',
          message: '',
        });
      } else {
        setErrorMsg(data.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Contact form submission error:', err);
      setErrorMsg('Something went wrong while sending your message. Please try again or message us on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
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
                
                <a href="mailto:info.meerempire@gmail.com" className={styles.contactItem}>
                  <div className={styles.icon}>✉️</div>
                  <div>
                    <strong>Email Us</strong>
                    <span>info.meerempire@gmail.com</span>
                    <small>For business & general inquiries</small>
                  </div>
                </a>
                
                <div className={styles.contactItem}>
                  <div className={styles.icon}>📍</div>
                  <div>
                    <strong>Location</strong>
                    <span>Dawood Colony, Sargodha Road, Faisalabad</span>
                    <small>Main Outlet & Head Office</small>
                  </div>
                </div>
              </div>

              <div className={styles.socials}>
                <h4>Follow Our Journey</h4>
                <div className={styles.socialIcons}>
                  {/* Facebook */}
                  <a href="https://www.facebook.com/profile.php?id=61590741872316" target="_blank" rel="noreferrer" title="Facebook" aria-label="Facebook">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                  {/* Instagram */}
                  <a href="https://www.instagram.com/meer.empire" target="_blank" rel="noreferrer" title="Instagram" aria-label="Instagram">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                  {/* TikTok */}
                  <a href="https://www.tiktok.com/@meer.empire" target="_blank" rel="noreferrer" title="TikTok" aria-label="TikTok">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-1.42V9.01a6.34 6.34 0 0 0-3.56 1.01 6.34 6.34 0 1 0 9.9 5.33V9.67a8.16 8.16 0 0 0 4.77 1.52V7.74a4.85 4.85 0 0 1-1-.05z"/></svg>
                  </a>
                  {/* YouTube */}
                  <a href="https://www.youtube.com/@MeerEmpire" target="_blank" rel="noreferrer" title="YouTube" aria-label="YouTube">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                  {/* Pinterest */}
                  <a href="https://www.pinterest.com/infomeerempire/_profile" target="_blank" rel="noreferrer" title="Pinterest" aria-label="Pinterest">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.62 0 12.017 0z"/></svg>
                  </a>
                  {/* WhatsApp Channel */}
                  <a href="https://whatsapp.com/channel/0029Vb93hiJ5q08VgrCclL0g" target="_blank" rel="noreferrer" title="WhatsApp Channel" aria-label="WhatsApp Channel">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99 0-3.951-.5-5.688-1.448l-6.305 1.654z"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className={styles.formCol}>
            <div className={styles.formBox}>
              <h3>Send us a Message</h3>

              {successMsg && (
                <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🎉</span> {successMsg}
                </div>
              )}

              {errorMsg && (
                <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>⚠️</span> {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                
                <div className={styles.row}>
                  <div className={styles.formGroup}>
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone / WhatsApp</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="0300 1234567"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Subject</label>
                  <select name="subject" value={formData.subject} onChange={handleChange}>
                    <option value="Order Inquiry">Order Inquiry</option>
                    <option value="Size Exchange Request">Size Exchange Request</option>
                    <option value="Product Information">Product Information</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Message *</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>
                
                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  {submitting ? 'Sending Message...' : 'Send Message'}
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
            <p>Visit us at Dawood Colony, Sargodha Road, Faisalabad or order online across Pakistan.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
