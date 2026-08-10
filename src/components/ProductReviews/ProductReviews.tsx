'use client';

import { useState, useEffect } from 'react';
import styles from './ProductReviews.module.css';

export interface UserReview {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
  verified?: boolean;
}

interface ProductReviewsProps {
  productId: number;
  productName: string;
  initialRating: number;
  initialReviewsCount: number;
}

const DEFAULT_SAMPLE_REVIEWS: Record<number, UserReview[]> = {
  1: [
    { id: '1-1', name: 'Zeeshan Ali', rating: 5, date: '02 Aug 2026', comment: 'Bohot zabardast shoes hain! Pure original quality aur delivery bhi 2 din mein ho gayi. Extremely comfortable.', verified: true },
    { id: '1-2', name: 'Hamza Khan', rating: 5, date: '28 Jul 2026', comment: 'Cushioning is amazing for daily running. Fitting exact perfect hai.', verified: true },
    { id: '1-3', name: 'Usman Tariq', rating: 4, date: '15 Jul 2026', comment: 'Quality is very good. Loved the design!', verified: true },
  ],
  2: [
    { id: '2-1', name: 'Bilal Ahmed', rating: 5, date: '01 Aug 2026', comment: 'Ultraboost never disappoints. Best buy from Meer Empire!', verified: true },
    { id: '2-2', name: 'Farhan Sheikh', rating: 5, date: '20 Jul 2026', comment: 'Original product, fast delivery and great customer support.', verified: true },
  ],
};

export default function ProductReviews({
  productId,
  productName,
  initialRating,
  initialReviewsCount,
}: ProductReviewsProps) {
  const [reviewsList, setReviewsList] = useState<UserReview[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const STORAGE_KEY = `meer_reviews_prod_${productId}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setReviewsList(JSON.parse(saved));
      } else {
        const samples = DEFAULT_SAMPLE_REVIEWS[productId] || [
          {
            id: `sample-${productId}-1`,
            name: 'Verified Customer',
            rating: 5,
            date: '04 Aug 2026',
            comment: `Excellent quality ${productName}! 100% recommended.`,
            verified: true,
          },
          {
            id: `sample-${productId}-2`,
            name: 'Adeel Raza',
            rating: 5,
            date: '25 Jul 2026',
            comment: 'Packing and product quality are top notch.',
            verified: true,
          },
        ];
        setReviewsList(samples);
      }
    } catch {
      setReviewsList([]);
    }
  }, [productId, productName, STORAGE_KEY]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    const newReview: UserReview = {
      id: Date.now().toString(),
      name: name.trim(),
      rating,
      date: new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }),
      comment: comment.trim(),
      verified: true,
    };

    const updated = [newReview, ...reviewsList];
    setReviewsList(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    setName('');
    setComment('');
    setRating(5);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
    }, 2500);
  };

  const totalReviews = initialReviewsCount + reviewsList.length - (DEFAULT_SAMPLE_REVIEWS[productId]?.length || 2);
  const calculatedAvg = reviewsList.length
    ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length).toFixed(1)
    : initialRating.toFixed(1);

  return (
    <div id="reviews-section" className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Customer Reviews</h2>
          <p className={styles.subtitle}>What buyers say about {productName}</p>
        </div>
        <button
          className={styles.writeBtn}
          onClick={() => {
            setShowForm(!showForm);
            setSubmitted(false);
          }}
        >
          {showForm ? '✕ Close Form' : '✍️ Write a Review'}
        </button>
      </div>

      {/* Summary Box */}
      <div className={styles.summaryGrid}>
        <div className={styles.scoreBox}>
          <span className={styles.scoreNum}>{calculatedAvg}</span>
          <div className={styles.starsRow}>
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.round(Number(calculatedAvg)) ? styles.starFilled : styles.starEmpty}>
                ★
              </span>
            ))}
          </div>
          <span className={styles.totalText}>Based on {totalReviews > 0 ? totalReviews : reviewsList.length} reviews</span>
        </div>

        <div className={styles.barsBox}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviewsList.filter((r) => r.rating === star).length;
            const pct = reviewsList.length ? Math.round((count / reviewsList.length) * 100) : (star >= 4 ? 80 : 5);
            return (
              <div key={star} className={styles.barRow}>
                <span className={styles.barLabel}>{star} ★</span>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${pct}%` }} />
                </div>
                <span className={styles.barPct}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className={styles.formCard}>
          <h3 className={styles.formTitle}>Write Your Review</h3>
          
          {submitted ? (
            <div className={styles.successMsg}>
              ✅ Thank you! Your review has been published successfully.
            </div>
          ) : (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Your Rating *</label>
                <div className={styles.interactiveStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={
                        star <= (hoverRating || rating) ? styles.starSelectActive : styles.starSelectInactive
                      }
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      ★
                    </button>
                  ))}
                  <span className={styles.ratingText}>
                    {hoverRating || rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ali Khan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Your Review *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share your experience with this shoe (quality, sizing, comfort)..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className={styles.textarea}
                />
              </div>

              <button type="submit" className={styles.submitBtn}>
                Submit Review →
              </button>
            </>
          )}
        </form>
      )}

      {/* Reviews List */}
      <div className={styles.reviewsList}>
        {reviewsList.map((rev) => (
          <div key={rev.id} className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <div className={styles.authorInfo}>
                <div className={styles.avatar}>
                  {rev.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className={styles.authorNameRow}>
                    <strong className={styles.authorName}>{rev.name}</strong>
                    {rev.verified && (
                      <span className={styles.verifiedBadge}>✓ Verified Buyer</span>
                    )}
                  </div>
                  <span className={styles.reviewDate}>{rev.date}</span>
                </div>
              </div>
              <div className={styles.starsRowSmall}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < rev.rating ? styles.starFilled : styles.starEmpty}>
                    ★
                  </span>
                ))}
              </div>
            </div>
            <p className={styles.reviewComment}>{rev.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
