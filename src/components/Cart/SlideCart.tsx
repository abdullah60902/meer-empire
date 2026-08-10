'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './SlideCart.module.css';
import { useCart } from '@/context/CartContext';
import { coupons } from '@/data/products';
import { useState } from 'react';

export default function SlideCart() {
  const { isOpen, items, subtotal, deliveryCharge, total, discount, coupon, paymentMethod, dispatch } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const applyCoupon = () => {
    const code = couponInput.toUpperCase().trim();
    if ((coupons as any)[code]) {
      const c = (coupons as any)[code];
      const discountAmt = c.type === 'percent' ? Math.round(subtotal * c.discount / 100) : c.discount;
      dispatch({ type: 'APPLY_COUPON', payload: { code, discount: discountAmt } });
      setCouponError('');
      setCouponInput('');
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className={styles.overlay} onClick={() => dispatch({ type: 'CLOSE_CART' })} />}

      {/* Drawer */}
      <div className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <h2>Shopping Cart</h2>
            {items.length > 0 && <span className={styles.count}>{items.reduce((s,i) => s + i.quantity, 0)}</span>}
          </div>
          <button className={styles.closeBtn} onClick={() => dispatch({ type: 'CLOSE_CART' })}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Empty State */}
        {items.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some premium shoes to get started!</p>
            <Link href="/shop" className={styles.shopLink} onClick={() => dispatch({ type: 'CLOSE_CART' })}>
              Browse Collection
            </Link>
          </div>
        )}

        {/* Items */}
        {items.length > 0 && (
          <div className={styles.body}>
            <div className={styles.items}>
              {items.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className={styles.item}>
                  <div className={styles.itemImg}>
                    <Image src={item.images[0]} alt={item.name} fill className={styles.img} />
                  </div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemBrand}>{item.brand}</span>
                    <h4 className={styles.itemName}>{item.name}</h4>
                    <div className={styles.itemMeta}>
                      <span>Size: {item.size}</span>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: item.color, display: 'inline-block', border: '1px solid rgba(0,0,0,0.1)' }} />
                    </div>
                    <div className={styles.itemActions}>
                      <span className={styles.itemPrice}>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                      <button className={styles.removeBtn} onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: { id: item.id, size: item.size, color: item.color } })}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Method */}
            <div className={styles.payment}>
              <h4 className={styles.payTitle}>Payment Method</h4>
              <div className={styles.payOptions}>
                <label className={`${styles.payOption} ${paymentMethod === 'online' ? styles.payActive : ''}`}>
                  <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => dispatch({ type: 'SET_PAYMENT', payload: 'online' })} />
                  <div className={styles.payIcon}>💳</div>
                  <div>
                    <strong>Online Payment</strong>
                    <span>JazzCash / Easypaisa / Bank</span>
                  </div>
                </label>
                <label className={`${styles.payOption} ${paymentMethod === 'cod' ? styles.payActive : ''}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => dispatch({ type: 'SET_PAYMENT', payload: 'cod' })} />
                  <div className={styles.payIcon}>📦</div>
                  <div>
                    <strong>Cash On Delivery</strong>
                    <span>Rs. 250 advance required</span>
                  </div>
                </label>
              </div>
              {paymentMethod === 'cod' && (
                <div className={styles.codNotice}>
                  ⚠️ COD orders require <strong>Rs. 250 advance delivery charges</strong>. Remaining payment collected upon delivery.
                </div>
              )}
            </div>

            {/* Coupon */}
            <div className={styles.coupon}>
              <div className={styles.couponRow}>
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponInput}
                  onChange={(e) => { setCouponInput(e.target.value); setCouponError(''); }}
                  className={styles.couponInput}
                />
                <button className={styles.couponBtn} onClick={applyCoupon}>Apply</button>
              </div>
              {couponError && <p className={styles.couponError}>{couponError}</p>}
              {coupon && <p className={styles.couponSuccess}>✓ Coupon "{coupon}" applied!</p>}
            </div>

            {/* Summary */}
            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                  <span>Coupon Discount</span>
                  <span>−Rs. {discount.toLocaleString()}</span>
                </div>
              )}
              {paymentMethod === 'cod' && (
                <div className={styles.summaryRow}>
                  <span>Advance Delivery Charges</span>
                  <span>Rs. {deliveryCharge}</span>
                </div>
              )}
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Buttons */}
            <div className={styles.checkoutBtns}>
              <Link href="/cart" className={styles.checkoutBtn} onClick={() => dispatch({ type: 'CLOSE_CART' })}>
                Proceed to Checkout
              </Link>
              <button className={styles.continueBtn} onClick={() => dispatch({ type: 'CLOSE_CART' })}>
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
