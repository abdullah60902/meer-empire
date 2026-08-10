'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getOrders, fetchOrdersFromDB, updateOrderStatus, type Order } from '@/lib/orders';
import styles from './Admin.module.css';

const ADMIN_PASSWORD = 'meer@admin2024';

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected' | 'online' | 'cod';
type AdminView = 'orders' | 'subscribers';

interface Subscriber {
  _id: string;
  email: string;
  subscribedAt: string;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [activeView, setActiveView] = useState<AdminView>('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Subscribers state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);

  // Broadcast Offer Email Campaign state
  const [selectedTemplate, setSelectedTemplate] = useState<'flash_sale' | 'new_arrival' | 'custom'>('flash_sale');
  const [broadcastSubject, setBroadcastSubject] = useState('🔥 FLASH SALE ALERT – Up to 30% OFF at Meer Empire!');
  const [broadcastHeading, setBroadcastHeading] = useState('VIP FLASH SALE DEAL – UP TO 30% OFF!');
  const [broadcastMessage, setBroadcastMessage] = useState('Exclusive for our VIP Subscribers! Shop our premium imported shoes collection now and get up to 30% discount on selected items.');
  const [broadcastCoupon, setBroadcastCoupon] = useState('FLASH30');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState('');

  const loadOrders = async () => {
    const liveOrders = await fetchOrdersFromDB();
    setOrders(liveOrders);
  };

  const loadSubscribers = async () => {
    setLoadingSubscribers(true);
    try {
      const res = await fetch('/api/subscribe');
      const data = await res.json();
      if (data.success && Array.isArray(data.subscribers)) {
        setSubscribers(data.subscribers);
      }
    } catch (err) {
      console.error('Failed to load subscribers', err);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  useEffect(() => {
    const auth = sessionStorage.getItem('meer_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      loadOrders();
      loadSubscribers();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('meer_admin_auth', 'true');
      loadOrders();
      loadSubscribers();
    } else {
      setAuthError('Incorrect password. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('meer_admin_auth');
    setOrders([]);
    setSubscribers([]);
  };

  const [emailStatus, setEmailStatus] = useState<Record<string, 'sending' | 'sent' | 'failed'>>({});

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    updateOrderStatus(id, status, adminNote || undefined);
    loadOrders();

    const updatedOrders = getOrders();
    const order = updatedOrders.find((o) => o.id === id);

    if (order) {
      setEmailStatus((prev) => ({ ...prev, [id]: 'sending' }));

      try {
        const res = await fetch('/api/send-order-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order, action: status }),
        });

        const result = await res.json();

        if (result.success) {
          setEmailStatus((prev) => ({ ...prev, [id]: 'sent' }));
        } else {
          setEmailStatus((prev) => ({ ...prev, [id]: 'failed' }));
        }
      } catch (err) {
        console.error('Failed to send order status email', err);
        setEmailStatus((prev) => ({ ...prev, [id]: 'failed' }));
      }
    }

    if (selectedOrder?.id === id) {
      setSelectedOrder(null);
      setAdminNote('');
    }
  };

  const handleTemplateChange = (tmpl: 'flash_sale' | 'new_arrival' | 'custom') => {
    setSelectedTemplate(tmpl);
    if (tmpl === 'flash_sale') {
      setBroadcastSubject('🔥 FLASH SALE ALERT – Up to 30% OFF at Meer Empire!');
      setBroadcastHeading('VIP FLASH SALE DEAL – UP TO 30% OFF!');
      setBroadcastMessage('Exclusive for our VIP Subscribers! Shop our premium imported shoes collection now and get up to 30% discount on selected items.');
      setBroadcastCoupon('FLASH30');
    } else if (tmpl === 'new_arrival') {
      setBroadcastSubject('👟 NEW ARRIVALS ALERT – Exclusive Luxury Shoe Collection!');
      setBroadcastHeading('NEW IMPORTED SHOES ARRIVED!');
      setBroadcastMessage('Check out our latest collection of imported branded sneakers, casuals, and formal shoes crafted for maximum comfort and style.');
      setBroadcastCoupon('NEWLOOK10');
    } else {
      setBroadcastSubject('🎁 Special Member Discount Offer – Meer Empire');
      setBroadcastHeading('SPECIAL VIP DISCOUNT OFFER');
      setBroadcastMessage('Enjoy an extra discount on your next order as a valued VIP member. Enter your coupon code at checkout.');
      setBroadcastCoupon('VIPEXTRA15');
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribers.length === 0) {
      alert('No subscribers available to send offer emails.');
      return;
    }

    setSendingBroadcast(true);
    setBroadcastResult('');

    try {
      const res = await fetch('/api/subscribe/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: broadcastSubject,
          heading: broadcastHeading,
          message: broadcastMessage,
          coupon: broadcastCoupon,
          targetEmails: subscribers.map((s) => s.email),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBroadcastResult(`✅ ${data.message}`);
      } else {
        setBroadcastResult(`❌ Error: ${data.error}`);
      }
    } catch {
      setBroadcastResult('❌ Failed to send offer emails. Please try again.');
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleDeleteSubscriber = async (email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from subscribers?`)) return;
    try {
      await fetch('/api/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      loadSubscribers();
    } catch (err) {
      console.error('Failed to delete subscriber', err);
    }
  };

  // Stats calculation
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    approved: orders.filter((o) => o.status === 'approved').length,
    rejected: orders.filter((o) => o.status === 'rejected').length,
    online: orders.filter((o) => o.paymentMethod === 'online').length,
    cod: orders.filter((o) => o.paymentMethod === 'cod').length,
    revenue: orders.filter((o) => o.status === 'approved').reduce((sum, o) => sum + o.total, 0),
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'pending' && order.status !== 'pending') return false;
    if (activeTab === 'approved' && order.status !== 'approved') return false;
    if (activeTab === 'rejected' && order.status !== 'rejected') return false;
    if (activeTab === 'online' && order.paymentMethod !== 'online') return false;
    if (activeTab === 'cod' && order.paymentMethod !== 'cod') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.toLowerCase().includes(q);
      const matchEmail = order.customerEmail.toLowerCase().includes(q);
      const matchCity = order.customerCity.toLowerCase().includes(q);
      return matchId || matchName || matchPhone || matchEmail || matchCity;
    }
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginLogo} style={{ width: 80, height: 80, margin: '0 auto 1rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/logo.png" alt="MEER EMPIRE" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 className={styles.loginTitle}>MEER EMPIRE</h1>
          <p className={styles.loginSub}>Admin Dashboard</p>

          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className={styles.inputGroup}>
              <label>Admin Password</label>
              <input
                type="password"
                placeholder="Enter password..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
              />
            </div>
            {authError && <p className={styles.errorMsg}>{authError}</p>}
            <button type="submit" className={styles.loginBtn}>Login to Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Admin Top Header */}
      <header className={styles.dashHeader}>
        <div className={styles.dashHeaderInner}>
          <div className={styles.dashLogo}>
            <div style={{ width: 50, height: 50, flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/logo.png" alt="MEER EMPIRE" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <h1 className={styles.dashTitle}>MEER EMPIRE</h1>
              <p className={styles.dashSub}>Store Management & Orders Control Panel</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', padding: '4px', borderRadius: '10px' }}>
              <button
                onClick={() => setActiveView('orders')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeView === 'orders' ? '#ffffff' : 'transparent',
                  color: activeView === 'orders' ? '#0B2345' : '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                📦 Orders ({stats.total})
              </button>
              <button
                onClick={() => setActiveView('subscribers')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeView === 'subscribers' ? '#ffffff' : 'transparent',
                  color: activeView === 'subscribers' ? '#0B2345' : '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                📧 VIP Subscribers ({subscribers.length})
              </button>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <main className={styles.dashMain}>
        {/* ─── 1. ORDERS VIEW ────────────────────────────────────────────────── */}
        {activeView === 'orders' && (
          <div className={styles.dashContent}>
            {/* Stats Cards */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>📦</div>
                <div className={styles.statInfo}>
                  <span className={styles.statNum}>{stats.total}</span>
                  <span className={styles.statLabel}>Total Orders</span>
                </div>
              </div>
              <div className={`${styles.statCard} ${styles.statPending}`}>
                <div className={styles.statIcon}>⏳</div>
                <div className={styles.statInfo}>
                  <span className={styles.statNum}>{stats.pending}</span>
                  <span className={styles.statLabel}>Pending</span>
                </div>
              </div>
              <div className={`${styles.statCard} ${styles.statApproved}`}>
                <div className={styles.statIcon}>✅</div>
                <div className={styles.statInfo}>
                  <span className={styles.statNum}>{stats.approved}</span>
                  <span className={styles.statLabel}>Approved</span>
                </div>
              </div>
              <div className={`${styles.statCard} ${styles.statRejected}`}>
                <div className={styles.statIcon}>❌</div>
                <div className={styles.statInfo}>
                  <span className={styles.statNum}>{stats.rejected}</span>
                  <span className={styles.statLabel}>Rejected</span>
                </div>
              </div>
              <div className={`${styles.statCard} ${styles.statRevenue}`}>
                <div className={styles.statIcon}>💰</div>
                <div className={styles.statInfo}>
                  <span className={styles.statNum}>Rs. {stats.revenue.toLocaleString()}</span>
                  <span className={styles.statLabel}>Revenue (Approved)</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>💳</div>
                <div className={styles.statInfo}>
                  <span className={styles.statNum}>{stats.online}</span>
                  <span className={styles.statLabel}>Online</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>🚚</div>
                <div className={styles.statInfo}>
                  <span className={styles.statNum}>{stats.cod}</span>
                  <span className={styles.statLabel}>COD</span>
                </div>
              </div>
            </div>

            {/* Filter Tabs + Search */}
            <div className={styles.filtersRow}>
              <div className={styles.filterTabs}>
                {(['all', 'pending', 'approved', 'rejected', 'online', 'cod'] as FilterTab[]).map((tab) => (
                  <button
                    key={tab}
                    className={`${styles.filterTab} ${activeTab === tab ? styles.filterTabActive : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'all' && '🗂️'}
                    {tab === 'pending' && '⏳'}
                    {tab === 'approved' && '✅'}
                    {tab === 'rejected' && '❌'}
                    {tab === 'online' && '💳'}
                    {tab === 'cod' && '🚚'}
                    {' '}{tab.charAt(0).toUpperCase() + tab.slice(1)}
                    <span className={styles.tabCount}>
                      {tab === 'all' ? stats.total
                        : tab === 'pending' ? stats.pending
                        : tab === 'approved' ? stats.approved
                        : tab === 'rejected' ? stats.rejected
                        : tab === 'online' ? stats.online
                        : stats.cod}
                    </span>
                  </button>
                ))}
              </div>

              <div className={styles.searchBox}>
                <input
                  type="text"
                  placeholder="Search order ID, name, phone, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🔍</span>
                <h3>No Orders Found</h3>
                <p>There are no orders matching your current filter criteria.</p>
              </div>
            ) : (
              <div className={styles.ordersGrid}>
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`${styles.orderCard} ${
                      order.status === 'pending' ? styles.cardBorderPending
                      : order.status === 'approved' ? styles.cardBorderApproved
                      : styles.cardBorderRejected
                    }`}
                  >
                    <div className={styles.orderCardHeader}>
                      <div>
                        <span className={styles.orderId}>{order.id}</span>
                        <span className={styles.orderDate}>{new Date(order.createdAt).toLocaleString('en-PK')}</span>
                      </div>
                      <span className={`${styles.statusBadge} ${
                        order.status === 'pending' ? styles.badgePending
                        : order.status === 'approved' ? styles.badgeApproved
                        : styles.badgeRejected
                      }`}>
                        {order.status === 'pending' && '⏳ Pending'}
                        {order.status === 'approved' && '✅ Approved'}
                        {order.status === 'rejected' && '❌ Rejected'}
                      </span>
                    </div>

                    <div className={styles.customerInfo}>
                      <p><strong>👤 {order.customerName}</strong></p>
                      <p>📞 <a href={`tel:${order.customerPhone}`}>{order.customerPhone}</a></p>
                      <p>✉️ {order.customerEmail}</p>
                      <p>📍 {order.customerAddress}, {order.customerCity} {order.customerPostal}</p>
                    </div>

                    <div className={styles.paymentInfo}>
                      <span className={styles.payBadge}>
                        {order.paymentMethod === 'online' ? `💳 Online (${order.paymentChannel || 'Bank/Wallet'})` : '📦 COD (Rs. 250 Advance)'}
                      </span>
                      {order.screenshotBase64 && (
                        <button
                          className={styles.viewProofBtn}
                          onClick={() => setSelectedOrder(order)}
                        >
                          🖼️ View Payment Proof
                        </button>
                      )}
                    </div>

                    <div className={styles.orderItems}>
                      <h4>Ordered Items ({order.items?.length || 0}):</h4>
                      {order.items?.map((item, idx) => (
                        <div key={idx} className={styles.orderItemRow}>
                          <div className={styles.itemThumb}>
                            {item.images?.[0] ? (
                              <Image src={item.images[0]} alt={item.name} fill style={{ objectFit: 'cover' }} />
                            ) : '👟'}
                          </div>
                          <div className={styles.itemMetaRow}>
                            <strong>{item.name}</strong>
                            <span>Size: {item.size} · Qty: {item.quantity} · Rs. {(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className={styles.orderTotalRow}>
                      <span>Total Amount:</span>
                      <strong>Rs. {order.total.toLocaleString()}</strong>
                    </div>

                    {order.adminNote && (
                      <div className={styles.noteDisplay}>
                        <strong>Note:</strong> {order.adminNote}
                      </div>
                    )}

                    {/* Email Status Indicator */}
                    {emailStatus[order.id] && (
                      <div className={styles.emailStatusBadge} data-status={emailStatus[order.id]}>
                        {emailStatus[order.id] === 'sending' && '⏳ Sending email to customer...'}
                        {emailStatus[order.id] === 'sent' && '✉️ Email sent to customer!'}
                        {emailStatus[order.id] === 'failed' && '⚠️ Email failed to send!'}
                      </div>
                    )}

                    {/* Action Controls */}
                    <div className={styles.cardActions}>
                      {order.status === 'pending' ? (
                        <>
                          <button
                            className={styles.approveBtn}
                            onClick={() => handleUpdateStatus(order.id, 'approved')}
                          >
                            ✅ Approve Order
                          </button>
                          <button
                            className={styles.rejectBtn}
                            onClick={() => handleUpdateStatus(order.id, 'rejected')}
                          >
                            ❌ Reject
                          </button>
                        </>
                      ) : (
                        <div className={styles.actionBtns}>
                          <button
                            className={styles.approveBtn}
                            onClick={() => handleUpdateStatus(order.id, 'approved')}
                            disabled={order.status === 'approved'}
                          >
                            {order.status === 'approved' ? '✓ Confirmed' : 'Approve'}
                          </button>
                          <button
                            className={styles.rejectBtn}
                            onClick={() => handleUpdateStatus(order.id, 'rejected')}
                            disabled={order.status === 'rejected'}
                          >
                            {order.status === 'rejected' ? '✓ Rejected' : 'Reject'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── 2. SUBSCRIBERS VIEW ───────────────────────────────────────────── */}
        {activeView === 'subscribers' && (
          <div className={styles.dashContent}>
            {/* Broadcast Offer Campaign Sender Card */}
            <div className={styles.broadcastCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-primary)' }}>📢 Broadcast Offer Email Campaign</h2>
                  <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>Send special discount offers & new arrival deals directly to all VIP subscribers!</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleTemplateChange('flash_sale')}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: selectedTemplate === 'flash_sale' ? '#0B2345' : 'transparent', color: selectedTemplate === 'flash_sale' ? '#fff' : 'inherit', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    🎁 Flash Sale
                  </button>
                  <button
                    onClick={() => handleTemplateChange('new_arrival')}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: selectedTemplate === 'new_arrival' ? '#0B2345' : 'transparent', color: selectedTemplate === 'new_arrival' ? '#fff' : 'inherit', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    👟 New Arrivals
                  </button>
                  <button
                    onClick={() => handleTemplateChange('custom')}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: selectedTemplate === 'custom' ? '#0B2345' : 'transparent', color: selectedTemplate === 'custom' ? '#fff' : 'inherit', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    ✍️ Custom
                  </button>
                </div>
              </div>

              <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem' }}>Email Subject Line</label>
                    <input
                      type="text"
                      value={broadcastSubject}
                      onChange={(e) => setBroadcastSubject(e.target.value)}
                      required
                      placeholder="e.g. 🔥 Flash Sale Up to 30% OFF!"
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-section)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem' }}>Coupon Code (Optional)</label>
                    <input
                      type="text"
                      value={broadcastCoupon}
                      onChange={(e) => setBroadcastCoupon(e.target.value)}
                      placeholder="e.g. FLASH30"
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-section)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem' }}>Banner Title / Heading</label>
                  <input
                    type="text"
                    value={broadcastHeading}
                    onChange={(e) => setBroadcastHeading(e.target.value)}
                    placeholder="e.g. VIP SPECIAL DISCOUNT"
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-section)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem' }}>Offer Details & Message</label>
                  <textarea
                    rows={3}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    required
                    placeholder="Write details about the discount offer or new product line..."
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-section)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Targeting <strong>{subscribers.length}</strong> active subscriber(s)
                  </span>
                  <button
                    type="submit"
                    disabled={sendingBroadcast || subscribers.length === 0}
                    style={{
                      background: 'linear-gradient(135deg, #0B2345, #1a3a6e)',
                      color: '#fff',
                      padding: '0.85rem 2rem',
                      borderRadius: '10px',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(11,35,69,0.3)',
                    }}
                  >
                    {sendingBroadcast ? '🚀 Sending Offer Email...' : '📢 Send Deal Email to All Subscribers'}
                  </button>
                </div>

                {broadcastResult && (
                  <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', background: broadcastResult.includes('✅') ? '#f0fdf4' : '#fff5f5', border: '1px solid ' + (broadcastResult.includes('✅') ? '#bbf7d0' : '#fecaca'), color: broadcastResult.includes('✅') ? '#15803d' : '#dc2626', fontWeight: 600, fontSize: '0.88rem' }}>
                    {broadcastResult}
                  </div>
                )}
              </form>
            </div>

            {/* Subscribers Table Box */}
            <div className={styles.subscribersBox}>
              <div className={styles.subscribersHeader}>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>📧 VIP Newsletter Subscribers ({subscribers.length})</h3>
                <button onClick={loadSubscribers} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-section)', cursor: 'pointer', fontWeight: 600 }}>
                  🔄 Refresh List
                </button>
              </div>

              {loadingSubscribers ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading subscribers...</p>
              ) : subscribers.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>✉️</span>
                  <h3>No Subscribers Yet</h3>
                  <p>When users subscribe to VIP access on the site, their emails will appear here.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className={styles.subTable}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Subscriber Email</th>
                        <th>Subscribed Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((sub, idx) => (
                        <tr key={sub._id || idx}>
                          <td>{idx + 1}</td>
                          <td><strong>{sub.email}</strong></td>
                          <td>{sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleString('en-PK') : 'Recent'}</td>
                          <td>
                            <button
                              onClick={() => handleDeleteSubscriber(sub.email)}
                              style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Payment Proof Modal */}
      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Payment Proof – Order #{selectedOrder.id}</h3>
              <button className={styles.closeBtn} onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p><strong>Customer:</strong> {selectedOrder.customerName} ({selectedOrder.customerPhone})</p>
              <p><strong>Channel:</strong> {selectedOrder.paymentChannel || 'Online'}</p>
              <div className={styles.modalImgWrap}>
                {selectedOrder.screenshotBase64 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedOrder.screenshotBase64} alt="Payment Proof" style={{ maxWidth: '100%', borderRadius: '12px' }} />
                ) : (
                  <p>No screenshot attached.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
