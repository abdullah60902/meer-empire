'use client';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { coupons } from '@/data/products';
import styles from './Cart.module.css';
import { saveOrder, generateOrderId, type Order } from '@/lib/orders';

// ─── Payment Icons ────────────────────────────────────────────────────────────
const JazzCashIcon = ({ size = 24 }: { size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 2 }}>
    <Image src="/img/idvp4xtAGa_logos.png" alt="JazzCash" width={size} height={size} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
  </div>
);

const EasyPaisaIcon = ({ size = 24 }: { size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 2 }}>
    <Image src="/img/Easypaisa New Icon Logo.png" alt="EasyPaisa" width={size} height={size} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
  </div>
);

const BankIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, borderRadius: 6 }}>
    <rect width="40" height="40" rx="8" fill="url(#bank-grad)" />
    <path d="M20 10L9 16H31L20 10Z" fill="#D4AF37" />
    <rect x="11" y="18" width="3" height="8" fill="white" />
    <rect x="16" y="18" width="3" height="8" fill="white" />
    <rect x="21" y="18" width="3" height="8" fill="white" />
    <rect x="26" y="18" width="3" height="8" fill="white" />
    <rect x="9" y="27" width="22" height="3" fill="#D4AF37" />
    <defs>
      <linearGradient id="bank-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0B2345" />
        <stop offset="1" stopColor="#1A3A6E" />
      </linearGradient>
    </defs>
  </svg>
);

// ─── Payment account details ─────────────────────────────────────────────────
const PAYMENT_ACCOUNTS = {
  jazzcash:  { number: '0306-9810032', name: 'Muhammad Noman' },
  easypaisa: { number: '0306-9810032', name: 'Muhammad Noman' },
  bank: {
    bankName:      'United Bank Limited (UBL)',
    accountNumber: '2419391495656',
    iban:          'PK94UNIL0109000391495656',
    accountTitle:  'Muhammad Hussian',
  },
};

const ADMIN_EMAIL = 'info.meerempire@gmail.com';

type PayChannel = 'jazzcash' | 'easypaisa' | 'bank';
type Step = 1 | 2;

export default function CartPage() {
  const { items, subtotal, deliveryCharge, total, discount, coupon, paymentMethod, dispatch } = useCart();

  // Step
  const [step, setStep] = useState<Step>(1);

  // Form state
  const [fullName,  setFullName]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [email,     setEmail]     = useState('');
  const [address,   setAddress]   = useState('');
  const [city,      setCity]      = useState('');
  const [postal,    setPostal]    = useState('');

  // Payment step
  const [selectedChannel, setSelectedChannel] = useState<PayChannel>('jazzcash');
  const [screenshot,      setScreenshot]      = useState<string | null>(null);
  const [screenshotName,  setScreenshotName]  = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Coupon
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  // UI
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [successOrder, setSuccessOrder]   = useState<Order | null>(null);
  const [copied,       setCopied]         = useState<string | null>(null);

  /* ── helpers ───────────────────────────────────────────────────────────── */
  const applyCoupon = () => {
    const code = couponInput.toUpperCase().trim();
    if ((coupons as any)[code]) {
      const c = (coupons as any)[code];
      const amt = c.type === 'percent' ? Math.round(subtotal * c.discount / 100) : c.discount;
      dispatch({ type: 'APPLY_COUPON', payload: { code, discount: amt } });
      setCouponError('');
      setCouponInput('');
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshot(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // Step 1 → Step 2 (validate form first)
  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final submit
  const handlePlaceOrder = async () => {
    if (!screenshot) {
      alert('Please upload your payment screenshot to proceed.');
      return;
    }

    setIsSubmitting(true);

    let uploadedScreenshot = screenshot;
    if (screenshot && screenshot.startsWith('data:image')) {
      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: screenshot, folder: 'payment_proofs' }),
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.url) {
          uploadedScreenshot = uploadData.url;
        }
      } catch (err) {
        console.error('Cloudinary upload error:', err);
      }
    }

    const order: Order = {
      id:              generateOrderId(),
      createdAt:       new Date().toISOString(),
      status:          'pending',
      paymentMethod,
      paymentChannel:  selectedChannel,
      screenshotBase64: uploadedScreenshot,
      customerEmail:   email,
      customerName:    fullName,
      customerPhone:   phone,
      customerAddress: address,
      customerCity:    city,
      customerPostal:  postal,
      items: items.map((i) => ({
        id: i.id, name: i.name, brand: i.brand,
        price: i.price, quantity: i.quantity,
        size: i.size, color: i.color, images: i.images,
      })),
      subtotal,
      deliveryCharge,
      discount,
      coupon: coupon ?? undefined,
      total,
    };

    saveOrder(order);
    sendEmailNotification(order);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessOrder(order);
      dispatch({ type: 'CLEAR_CART' });
    }, 1500);
  };

  const sendEmailNotification = async (order: Order) => {
    try {
      await fetch('/api/send-order-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order, action: 'new_order' }),
      });
    } catch (err) {
      console.error('Failed to send order email notification', err);
    }
  };

  /* ── amount to pay ─────────────────────────────────────────────────────── */
  const amountToPay = paymentMethod === 'cod' ? 250 : total;
  const payLabel    = paymentMethod === 'cod'
    ? 'Rs. 250 (Advance Delivery Charges)'
    : `Rs. ${total.toLocaleString()} (Full Amount)`;

  /* ════════════════════════════════════════════════════════════════════════
     SUCCESS SCREEN
  ════════════════════════════════════════════════════════════════════════ */
  if (successOrder) {
    return (
      <div className={styles.successWrap}>
        <div className={styles.successCard}>
          <div className={styles.successAnim}>✅</div>
          <h2 className={styles.successTitle}>Order Placed!</h2>
          <p className={styles.successSub}>
            Thank you <strong>{successOrder.customerName}</strong>! Your order is received and awaiting confirmation.
          </p>
          <div className={styles.successId}>
            Order ID: <strong>{successOrder.id}</strong>
          </div>
          <div className={styles.successDetails}>
            <div className={styles.sRow}>
              <span>Payment</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                {successOrder.paymentChannel === 'jazzcash' && <JazzCashIcon size={18} />}
                {successOrder.paymentChannel === 'easypaisa' && <EasyPaisaIcon size={18} />}
                {successOrder.paymentChannel === 'bank' && <BankIcon size={18} />}
                {successOrder.paymentMethod === 'online' ? `Online (${successOrder.paymentChannel})` : 'Cash on Delivery'}
              </span>
            </div>
            <div className={styles.sRow}>
              <span>Amount Paid Now</span>
              <span><strong>Rs. {amountToPay.toLocaleString()}</strong></span>
            </div>
            <div className={styles.sRow}>
              <span>Order Total</span>
              <span>Rs. {successOrder.total.toLocaleString()}</span>
            </div>
            <div className={styles.sRow}>
              <span>Status</span>
              <span className={styles.pendingBadge}>⏳ Awaiting Admin Approval</span>
            </div>
          </div>
          <p className={styles.successEmail}>
            📧 Confirmation sent to <strong>{successOrder.customerEmail}</strong>
          </p>
          <div className={styles.successActions}>
            <Link href="/shop" className={styles.successBtn}>Continue Shopping</Link>
            <Link href="/"    className={styles.successBtnOutline}>Go to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════════
     EMPTY CART
  ════════════════════════════════════════════════════════════════════════ */
  if (items.length === 0) {
    return (
      <div className={styles.emptyWrap}>
        <div className={styles.emptyIcon}>🛒</div>
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven&apos;t added anything yet.</p>
        <Link href="/shop" className="btn-premium" style={{ background: 'var(--primary)', color: '#fff', marginTop: '1.5rem' }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════════
     STEP INDICATOR
  ════════════════════════════════════════════════════════════════════════ */
  const StepBar = () => (
    <div className={styles.stepBar}>
      <div className={`${styles.stepItem} ${step >= 1 ? styles.stepActive : ''}`}>
        <div className={styles.stepCircle}>1</div>
        <span>Order Details</span>
      </div>
      <div className={`${styles.stepLine} ${step >= 2 ? styles.stepLineDone : ''}`} />
      <div className={`${styles.stepItem} ${step >= 2 ? styles.stepActive : ''}`}>
        <div className={styles.stepCircle}>2</div>
        <span>Payment</span>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════════════════
     PAYMENT CHANNEL CARDS  (reused in step 2)
  ════════════════════════════════════════════════════════════════════════ */
  const ChannelDetail = () => (
    <div className={styles.channelDetail}>
      {selectedChannel === 'jazzcash' && (
        <div className={styles.accountCard}>
          <div className={styles.acHeader}>
            <JazzCashIcon size={38} />
            <div>
              <strong className={styles.acName}>JazzCash</strong>
              <span className={styles.acSub}>Mobile Account</span>
            </div>
          </div>
          <div className={styles.acRow}>
            <span>Account Number</span>
            <div className={styles.acValueRow}>
              <strong>{PAYMENT_ACCOUNTS.jazzcash.number}</strong>
              <button type="button" className={styles.copyBtn} onClick={() => copyToClipboard(PAYMENT_ACCOUNTS.jazzcash.number, 'jc')}>
                {copied === 'jc' ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>
          <div className={styles.acRow}>
            <span>Account Name</span>
            <strong>{PAYMENT_ACCOUNTS.jazzcash.name}</strong>
          </div>
          <div className={styles.acAmountRow}>
            <span>Amount to Send</span>
            <strong className={styles.acAmount}>{payLabel}</strong>
          </div>
        </div>
      )}

      {selectedChannel === 'easypaisa' && (
        <div className={styles.accountCard}>
          <div className={styles.acHeader}>
            <EasyPaisaIcon size={38} />
            <div>
              <strong className={styles.acName}>EasyPaisa</strong>
              <span className={styles.acSub}>Mobile Account</span>
            </div>
          </div>
          <div className={styles.acRow}>
            <span>Account Number</span>
            <div className={styles.acValueRow}>
              <strong>{PAYMENT_ACCOUNTS.easypaisa.number}</strong>
              <button type="button" className={styles.copyBtn} onClick={() => copyToClipboard(PAYMENT_ACCOUNTS.easypaisa.number, 'ep')}>
                {copied === 'ep' ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>
          <div className={styles.acRow}>
            <span>Account Name</span>
            <strong>{PAYMENT_ACCOUNTS.easypaisa.name}</strong>
          </div>
          <div className={styles.acAmountRow}>
            <span>Amount to Send</span>
            <strong className={styles.acAmount}>{payLabel}</strong>
          </div>
        </div>
      )}

      {selectedChannel === 'bank' && (
        <div className={styles.accountCard}>
          <div className={styles.acHeader}>
            <BankIcon size={38} />
            <div>
              <strong className={styles.acName}>{PAYMENT_ACCOUNTS.bank.bankName}</strong>
              <span className={styles.acSub}>Bank Transfer</span>
            </div>
          </div>
          <div className={styles.acRow}>
            <span>Account Number</span>
            <div className={styles.acValueRow}>
              <strong>{PAYMENT_ACCOUNTS.bank.accountNumber}</strong>
              <button type="button" className={styles.copyBtn} onClick={() => copyToClipboard(PAYMENT_ACCOUNTS.bank.accountNumber, 'ba')}>
                {copied === 'ba' ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>
          <div className={styles.acRow}>
            <span>IBAN Number</span>
            <div className={styles.acValueRow}>
              <strong style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>{PAYMENT_ACCOUNTS.bank.iban}</strong>
              <button type="button" className={styles.copyBtn} onClick={() => copyToClipboard(PAYMENT_ACCOUNTS.bank.iban, 'iban')}>
                {copied === 'iban' ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>
          <div className={styles.acRow}>
            <span>Account Title</span>
            <strong>{PAYMENT_ACCOUNTS.bank.accountTitle}</strong>
          </div>
          <div className={styles.acAmountRow}>
            <span>Amount to Send</span>
            <strong className={styles.acAmount}>{payLabel}</strong>
          </div>
        </div>
      )}
    </div>
  );

  /* ════════════════════════════════════════════════════════════════════════
     STEP 1 – ORDER DETAILS
  ════════════════════════════════════════════════════════════════════════ */
  if (step === 1) {
    return (
      <div className={styles.pageWrap}>
        <div className={styles.pageHeader}>
          <div className="container">
            <h1 className="section-title" style={{ margin: 0, color: '#fff' }}>
              Secure <span className="silver">Checkout</span>
            </h1>
          </div>
        </div>

        <div className="container">
          <StepBar />

          <div className={styles.checkoutContainer}>
            {/* Left: Cart + Shipping */}
            <div className={styles.leftCol}>
              {/* Cart Items */}
              <div className={styles.box}>
                <h3 className={styles.boxTitle}>Review Cart Items</h3>
                <div className={styles.itemsList}>
                  {items.map((item) => (
                    <div key={`${item.id}-${item.size}-${item.color}`} className={styles.item}>
                      <div className={styles.itemImg}>
                        <Image src={item.images[0]} alt={item.name} fill className={styles.img} />
                      </div>
                      <div className={styles.itemInfo}>
                        <div className={styles.itemHeader}>
                          <div>
                            <span className={styles.itemBrand}>{item.brand}</span>
                            <h4 className={styles.itemName}>{item.name}</h4>
                          </div>
                          <span className={styles.itemPrice}>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                        <div className={styles.itemMeta}>
                          <span>Size: {item.size}</span>
                          <span style={{ width: 14, height: 14, borderRadius: '50%', background: item.color, border: '1px solid var(--border)' }} />
                        </div>
                        <div className={styles.itemActions}>
                          <button type="button" className={styles.removeBtn} onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item })}>Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Form */}
              <div className={styles.box}>
                <h3 className={styles.boxTitle}>Shipping Details</h3>
                <form id="step1-form" onSubmit={handleProceed} className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Full Name *</label>
                    <input type="text" required placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone (WhatsApp preferred) *</label>
                    <input type="tel" required placeholder="0300 1234567" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                    <label>Email Address *</label>
                    <input type="email" required placeholder="yourname@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                    <label>Complete Delivery Address *</label>
                    <textarea required rows={3} placeholder="House, Street, Area, City" value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>City *</label>
                    <input type="text" required placeholder="Karachi" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Postal Code</label>
                    <input type="text" placeholder="75000" value={postal} onChange={(e) => setPostal(e.target.value)} />
                  </div>
                </form>
              </div>
            </div>

            {/* Right: Summary + Payment Method Select */}
            <div className={styles.rightCol}>
              <div className={styles.summaryBox}>
                <h3 className={styles.boxTitle}>Payment Method</h3>
                <div className={styles.payOptions}>
                  <label className={`${styles.payOption} ${paymentMethod === 'online' ? styles.payActive : ''}`}>
                    <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => dispatch({ type: 'SET_PAYMENT', payload: 'online' })} />
                    <div className={styles.payIcon}>💳</div>
                    <div style={{ flex: 1 }}>
                      <strong>Online Payment</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem' }}>
                        <JazzCashIcon size={20} />
                        <EasyPaisaIcon size={20} />
                        <BankIcon size={20} />
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>JazzCash / EasyPaisa / Bank</span>
                      </div>
                    </div>
                    {paymentMethod === 'online' && <span className={styles.payCheck}>✓</span>}
                  </label>
                  <label className={`${styles.payOption} ${paymentMethod === 'cod' ? styles.payActive : ''}`}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => dispatch({ type: 'SET_PAYMENT', payload: 'cod' })} />
                    <div className={styles.payIcon}>📦</div>
                    <div>
                      <strong>Cash On Delivery</strong>
                      <span>Rs. 250 advance required</span>
                    </div>
                    {paymentMethod === 'cod' && <span className={styles.payCheck}>✓</span>}
                  </label>
                </div>

                {paymentMethod === 'cod' && (
                  <div className={styles.codNotice}>
                    ⚠️ COD orders require <strong>Rs. 250 advance</strong> delivery charges. You will pay via JazzCash / EasyPaisa / Bank on the next step.
                  </div>
                )}
                {paymentMethod === 'online' && (
                  <div className={styles.onlineNotice}>
                    💳 You will see payment account details on the next step to transfer the full amount.
                  </div>
                )}

                <div className={styles.divider} />

                {/* Coupon */}
                <div className={styles.couponWrap}>
                  <div className={styles.couponInputGroup}>
                    <input type="text" placeholder="Coupon Code" value={couponInput} onChange={(e) => { setCouponInput(e.target.value); setCouponError(''); }} />
                    <button type="button" onClick={applyCoupon}>Apply</button>
                  </div>
                  {couponError && <p className={styles.error}>{couponError}</p>}
                  {coupon && <p className={styles.success}>Coupon &quot;{coupon}&quot; applied!</p>}
                </div>

                <div className={styles.divider} />

                {/* Totals */}
                <div className={styles.totals}>
                  <div className={styles.totRow}><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
                  {discount > 0 && (
                    <div className={`${styles.totRow} ${styles.greenText}`}>
                      <span>Discount ({coupon})</span><span>- Rs. {discount.toLocaleString()}</span>
                    </div>
                  )}
                  {paymentMethod === 'cod' && (
                    <div className={styles.totRow}><span>Advance Delivery</span><span>Rs. {deliveryCharge}</span></div>
                  )}
                  <div className={`${styles.totRow} ${styles.finalTotal}`}>
                    <span>Total Amount</span><span>Rs. {total.toLocaleString()}</span>
                  </div>
                </div>

                <button type="submit" form="step1-form" className={styles.proceedBtn}>
                  Proceed to Payment →
                </button>
                <div className={styles.secureText}>🔒 Secure SSL Encrypted Checkout</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════════
     STEP 2 – PAYMENT
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className={styles.pageWrap}>
      <div className={styles.pageHeader}>
        <div className="container">
          <h1 className="section-title" style={{ margin: 0, color: '#fff' }}>
            Secure <span className="silver">Checkout</span>
          </h1>
        </div>
      </div>

      <div className="container">
        <StepBar />

        <div className={styles.checkoutContainer}>
          {/* Left: Payment Details */}
          <div className={styles.leftCol}>
            <div className={styles.box}>
              <div className={styles.payStep2Header}>
                <button type="button" className={styles.backBtn} onClick={() => setStep(1)}>
                  ← Back
                </button>
                <h3 className={styles.boxTitle} style={{ margin: 0 }}>
                  {paymentMethod === 'cod' ? 'Pay Rs. 250 Advance' : 'Complete Your Payment'}
                </h3>
              </div>

              {/* Instruction banner */}
              <div className={styles.payInstructBanner}>
                {paymentMethod === 'online' ? (
                  <>
                    <span className={styles.payInstructIcon}>💳</span>
                    <div>
                      <strong>Transfer the full amount: Rs. {total.toLocaleString()}</strong>
                      <p>Select any payment method below, send the amount, then upload your screenshot.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <span className={styles.payInstructIcon}>📦</span>
                    <div>
                      <strong>Transfer Rs. 250 advance delivery charges</strong>
                      <p>Select any method below, send Rs. 250, then upload your screenshot. Remaining Rs. {(total - 250).toLocaleString()} collected at delivery.</p>
                    </div>
                  </>
                )}
              </div>

              {/* Channel Tabs */}
              <div className={styles.channelTabs}>
                <button
                  type="button"
                  className={`${styles.channelTab} ${selectedChannel === 'jazzcash' ? styles.channelTabActive : ''}`}
                  onClick={() => setSelectedChannel('jazzcash')}
                >
                  <JazzCashIcon size={22} />
                  <span>JazzCash</span>
                </button>
                <button
                  type="button"
                  className={`${styles.channelTab} ${selectedChannel === 'easypaisa' ? styles.channelTabActive : ''}`}
                  onClick={() => setSelectedChannel('easypaisa')}
                >
                  <EasyPaisaIcon size={22} />
                  <span>EasyPaisa</span>
                </button>
                <button
                  type="button"
                  className={`${styles.channelTab} ${selectedChannel === 'bank' ? styles.channelTabActive : ''}`}
                  onClick={() => setSelectedChannel('bank')}
                >
                  <BankIcon size={22} />
                  <span>Bank Transfer</span>
                </button>
              </div>

              {/* Account details card */}
              <ChannelDetail />

              {/* Steps guide */}
              <div className={styles.howToSteps}>
                <p className={styles.howToTitle}>📋 How to Pay</p>
                <div className={styles.howToList}>
                  <div className={styles.howToItem}>
                    <span className={styles.howToNum}>1</span>
                    <span>Open <strong>{selectedChannel === 'jazzcash' ? 'JazzCash' : selectedChannel === 'easypaisa' ? 'EasyPaisa' : 'your banking app'}</strong> on your phone</span>
                  </div>
                  <div className={styles.howToItem}>
                    <span className={styles.howToNum}>2</span>
                    <span>Send <strong>{payLabel}</strong> to the account above</span>
                  </div>
                  <div className={styles.howToItem}>
                    <span className={styles.howToNum}>3</span>
                    <span>Take a <strong>screenshot</strong> of the successful transaction</span>
                  </div>
                  <div className={styles.howToItem}>
                    <span className={styles.howToNum}>4</span>
                    <span>Upload the screenshot below and click <strong>Place Order</strong></span>
                  </div>
                </div>
              </div>

              {/* Screenshot Upload */}
              <div className={styles.uploadSection}>
                <p className={styles.uploadLabel}>📸 Upload Payment Screenshot *</p>
                <div
                  className={`${styles.uploadZone} ${screenshot ? styles.uploadDone : ''}`}
                  onClick={() => fileRef.current?.click()}
                >
                  {screenshot ? (
                    <div className={styles.uploadPreview}>
                      <img src={screenshot} alt="Payment proof" className={styles.previewImg} />
                      <div className={styles.uploadedMeta}>
                        <span className={styles.uploadedCheck}>✅ Screenshot uploaded</span>
                        <span className={styles.uploadedName}>{screenshotName}</span>
                        <span className={styles.changeBtn}>Tap to change</span>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <span className={styles.uploadIconBig}>📤</span>
                      <strong>Tap to upload payment screenshot</strong>
                      <span className={styles.uploadHint}>JPG, PNG, WEBP • Max 10MB</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className={styles.rightCol}>
            <div className={styles.summaryBox}>
              <h3 className={styles.boxTitle}>Order Summary</h3>

              {/* Customer Info */}
              <div className={styles.summaryInfo}>
                <div className={styles.siRow}><span>👤</span><span><strong>{fullName}</strong></span></div>
                <div className={styles.siRow}><span>📱</span><span>{phone}</span></div>
                <div className={styles.siRow}><span>📧</span><span>{email}</span></div>
                <div className={styles.siRow}><span>📍</span><span>{address}, {city}</span></div>
              </div>

              <div className={styles.divider} />

              {/* Items mini */}
              <div className={styles.summaryItems}>
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className={styles.summaryItem}>
                    <div className={styles.summaryItemImg}>
                      <Image src={item.images[0]} alt={item.name} fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div className={styles.summaryItemInfo}>
                      <strong>{item.name}</strong>
                      <span>Size: {item.size} · Qty: {item.quantity}</span>
                    </div>
                    <span className={styles.summaryItemPrice}>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className={styles.divider} />

              {/* Totals */}
              <div className={styles.totals}>
                <div className={styles.totRow}><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
                {discount > 0 && (
                  <div className={`${styles.totRow} ${styles.greenText}`}>
                    <span>Discount</span><span>- Rs. {discount.toLocaleString()}</span>
                  </div>
                )}
                {paymentMethod === 'cod' && (
                  <div className={styles.totRow}><span>Advance Delivery</span><span>Rs. {deliveryCharge}</span></div>
                )}
                <div className={`${styles.totRow} ${styles.finalTotal}`}>
                  <span>Total</span><span>Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              {paymentMethod === 'cod' && (
                <div className={styles.codPayNow}>
                  <span>💰 Pay Now (Advance)</span>
                  <strong>Rs. 250</strong>
                </div>
              )}

              <button
                type="button"
                className={styles.placeOrderBtn}
                onClick={handlePlaceOrder}
                disabled={isSubmitting || !screenshot}
              >
                {isSubmitting ? '⏳ Processing...' : screenshot ? '🛒 Place Order Now' : '📸 Upload Screenshot First'}
              </button>
              <div className={styles.secureText}>🔒 Secure SSL Encrypted Checkout</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
