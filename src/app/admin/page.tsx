'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getOrders, fetchOrdersFromDB, updateOrderStatus, type Order } from '@/lib/orders';
import { categories as defaultCategories, brands as defaultBrands, sizes as defaultSizes, colors as defaultColors } from '@/data/products';
import styles from './Admin.module.css';

const ADMIN_PASSWORD = 'meer@admin2024';

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected' | 'online' | 'cod';
type AdminView = 'orders' | 'messages' | 'subscribers' | 'products' | 'add-product';

interface Subscriber {
  _id: string;
  email: string;
  subscribedAt: string;
}

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

interface AdminProductItem {
  id: string | number;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  stock: number;
  badge?: string;
  description: string;
  features: string[];
  colors: string[];
  sizes: string[];
  images: string[];
  isNew: boolean;
  isBestSeller: boolean;
  isFlashSale: boolean;
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
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Subscribers state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);

  // Contact Messages state
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Products State
  const [productsList, setProductsList] = useState<AdminProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Product Form State
  const [prodName, setProdName] = useState('');
  const [prodBrand, setProdBrand] = useState('Meer Empire');
  const [prodCategory, setProdCategory] = useState('sports');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOldPrice, setProdOldPrice] = useState('');
  const [prodBadge, setProdBadge] = useState('Premium');
  const [prodDesc, setProdDesc] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [prodFeatures, setProdFeatures] = useState<string[]>([
    'Imported Branded Shoe',
    'Breathable Premium Upper',
    'Ergonomic Cushioning & Soft Midsole',
    'Durable Anti-Slip Rubber Outsole',
  ]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([
    'UK/PK 7 | US 8 | EUR 41',
    'UK/PK 8 | US 9 | EUR 42',
    'UK/PK 9 | US 10 | EUR 43',
    'UK/PK 10 | US 11 | EUR 44',
  ]);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | number | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isFlashSale, setIsFlashSale] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | ''; msg: string }>({ type: '', msg: '' });
  const [submittingProduct, setSubmittingProduct] = useState(false);


  // Broadcast Offer Email Campaign state
  const [selectedTemplate, setSelectedTemplate] = useState<'flash_sale' | 'new_arrival' | 'custom'>('flash_sale');
  const [broadcastSubject, setBroadcastSubject] = useState('🔥 FLASH SALE ALERT – Up to 30% OFF at Meer Empire!');
  const [broadcastHeading, setBroadcastHeading] = useState('VIP FLASH SALE DEAL – UP TO 30% OFF!');
  const [broadcastMessage, setBroadcastMessage] = useState('Exclusive for our VIP Subscribers! Shop our premium imported shoes collection now and get up to 30% discount on selected items.');
  const [broadcastCoupon, setBroadcastCoupon] = useState('FLASH30');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState('');

  const loadOrders = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    const liveOrders = await fetchOrdersFromDB();
    setOrders(liveOrders);
    setLastUpdated(new Date());
    if (showRefreshing) setRefreshing(false);
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

  const loadMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await fetch('/api/contact');
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to load contact messages', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadAdminProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProductsList(data.products);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        await new Promise((resolve) => {
          reader.onloadend = async () => {
            const base64 = reader.result as string;
            try {
              const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64, folder: 'meer_empire/products' }),
              });
              const data = await res.json();
              if (data.success && data.url) {
                setProdImages((prev) => [...prev, data.url]);
              }
            } catch (err) {
              console.error('Upload error:', err);
            }
            resolve(true);
          };
        });
      }
    } catch (err) {
      console.error('Failed to process file upload', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setProdImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setProdImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setProdFeatures((prev) => [...prev, featureInput.trim()]);
    setFeatureInput('');
  };

  const handleRemoveFeature = (index: number) => {
    setProdFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleAddCustomSize = () => {
    const trimmed = customSizeInput.trim();
    if (!trimmed) return;
    if (!selectedSizes.includes(trimmed)) {
      setSelectedSizes((prev) => [...prev, trimmed]);
    }
    setCustomSizeInput('');
  };

  const handleSetAsFrontImage = (index: number) => {
    if (index === 0) return;
    setProdImages((prev) => {
      const newArr = [...prev];
      const [selectedImg] = newArr.splice(index, 1);
      newArr.unshift(selectedImg);
      return newArr;
    });
  };

  const handleStartEditProduct = (prod: AdminProductItem) => {
    setEditingProductId(prod.id);
    setProdName(prod.name);
    setProdBrand(prod.brand || 'Meer Empire');
    setProdCategory(prod.category || 'sports');
    setProdPrice(String(prod.price || ''));
    setProdOldPrice(prod.oldPrice ? String(prod.oldPrice) : '');
    setProdBadge(prod.badge || 'Premium');
    setProdDesc(prod.description || '');
    setProdFeatures(prod.features?.length ? prod.features : ['Imported Branded Shoe', 'Breathable Premium Upper']);
    setSelectedSizes(prod.sizes?.length ? prod.sizes : ['UK/PK 7 | US 8 | EUR 41', 'UK/PK 8 | US 9 | EUR 42']);
    setProdImages(prod.images || []);
    setUploadStatus({ type: '', msg: '' });
    setActiveView('add-product');
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setProdName('');
    setProdPrice('');
    setProdOldPrice('');
    setProdDesc('');
    setProdImages([]);
    setUploadStatus({ type: '', msg: '' });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodDesc) {
      setUploadStatus({ type: 'error', msg: 'Please fill in product name, price, and description.' });
      return;
    }
    if (prodImages.length < 4) {
      setUploadStatus({
        type: 'error',
        msg: `⚠️ Minimum 4 product images required! You have added ${prodImages.length} image(s). Please upload 1 Main Front image + 3 Detail Gallery images.`,
      });
      return;
    }

    setSubmittingProduct(true);
    setUploadStatus({ type: '', msg: '' });

    try {
      const isEdit = Boolean(editingProductId);
      const method = isEdit ? 'PUT' : 'POST';
      const bodyPayload = {
        ...(isEdit ? { id: editingProductId } : {}),
        name: prodName,
        brand: prodBrand,
        category: prodCategory,
        price: Number(prodPrice),
        oldPrice: prodOldPrice ? Number(prodOldPrice) : undefined,
        stock: 50,
        badge: prodBadge,
        description: prodDesc,
        features: prodFeatures,
        colors: ['#000000', '#FFFFFF'],
        sizes: selectedSizes,
        images: prodImages,
        isNew: isNewArrival,
        isBestSeller: isBestSeller,
        isFlashSale: isFlashSale,
      };

      const res = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      if (data.success) {
        setUploadStatus({
          type: 'success',
          msg: isEdit ? '🎉 Product & Front Cover Image updated successfully!' : '🎉 Product uploaded successfully to website catalog!',
        });
        if (!isEdit) {
          setProdName('');
          setProdPrice('');
          setProdOldPrice('');
          setProdDesc('');
          setProdImages([]);
        } else {
          setEditingProductId(null);
        }
        loadAdminProducts();
      } else {
        setUploadStatus({ type: 'error', msg: `❌ Error: ${data.error}` });
      }
    } catch (err: any) {
      setUploadStatus({ type: 'error', msg: '❌ Failed to save product. Please try again.' });
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string | number) => {
    if (!confirm('Are you sure you want to remove this product from website?')) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProductsList((prev) => prev.filter((p) => String(p.id) !== String(id)));
      }
    } catch (err) {
      console.error('Failed to delete product', err);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      const res = await fetch('/api/contact', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => prev.filter((m) => m._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete message', err);
    }
  };

  const handleUpdateMessageStatus = async (id: string, status: 'unread' | 'read' | 'replied') => {
    try {
      await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      setMessages((prev) => prev.map((m) => (m._id === id ? { ...m, status } : m)));
    } catch (err) {
      console.error('Failed to update message status', err);
    }
  };

  useEffect(() => {
    const auth = sessionStorage.getItem('meer_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      loadOrders();
      loadSubscribers();
      loadMessages();
      loadAdminProducts();
    }
  }, []);

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      loadOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('meer_admin_auth', 'true');
      loadOrders();
      loadSubscribers();
      loadMessages();
      loadAdminProducts();
    } else {
      setAuthError('Incorrect password. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('meer_admin_auth');
    setOrders([]);
    setSubscribers([]);
    setProductsList([]);
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
                onClick={() => setActiveView('products')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeView === 'products' ? '#ffffff' : 'transparent',
                  color: activeView === 'products' ? '#0B2345' : '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                👟 Products ({productsList.length})
              </button>
              <button
                onClick={() => setActiveView('add-product')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeView === 'add-product' ? 'linear-gradient(135deg, #D4AF37 0%, #f0cf65 100%)' : 'rgba(212, 175, 55, 0.25)',
                  color: activeView === 'add-product' ? '#0B2345' : '#D4AF37',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                ➕ Upload Product
              </button>
              <button
                onClick={() => setActiveView('messages')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeView === 'messages' ? '#ffffff' : 'transparent',
                  color: activeView === 'messages' ? '#0B2345' : '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                📩 Messages ({messages.length})
                {messages.filter(m => m.status === 'unread').length > 0 && (
                  <span style={{ marginLeft: '6px', background: '#ef4444', color: '#fff', padding: '2px 7px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 800 }}>
                    {messages.filter(m => m.status === 'unread').length} NEW
                  </span>
                )}
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

            {/* Refresh Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>
                {lastUpdated ? `🕐 Last updated: ${lastUpdated.toLocaleTimeString('en-PK')}` : '🕐 Loading orders...'}
                <span style={{ marginLeft: '0.75rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>Auto-refreshes every 30s</span>
              </span>
              <button
                onClick={() => loadOrders(true)}
                disabled={refreshing}
                style={{
                  padding: '0.45rem 1.1rem',
                  background: refreshing ? 'rgba(212,175,55,0.15)' : 'rgba(212,175,55,0.25)',
                  color: '#D4AF37',
                  border: '1px solid rgba(212,175,55,0.4)',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: refreshing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s',
                }}
              >
                {refreshing ? '⏳ Refreshing...' : '🔄 Refresh Orders'}
              </button>
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

        {/* ─── 2. UPLOAD PRODUCT VIEW ────────────────────────────────────────── */}
        {activeView === 'add-product' && (
          <div className={styles.dashContent}>
            <div className={styles.productFormCard}>
              <div className={styles.productFormHeader}>
                <div>
                  <h2 className={styles.productFormTitle}>
                    {editingProductId ? '✏️ Edit Product Details & Change Front Image' : '➕ Upload New Product / Project'}
                  </h2>
                  <p className={styles.productFormSub}>
                    {editingProductId
                      ? 'Modify product info, price, sizes, or click "Make Front Cover" on any image to change the main showroom image.'
                      : 'Fill in product details, images, quality specs, sizes, and price to publish on live website.'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {editingProductId && (
                    <button
                      onClick={handleCancelEdit}
                      style={{ padding: '0.6rem 1.2rem', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
                    >
                      ✕ Cancel Edit
                    </button>
                  )}
                  <button
                    onClick={() => setActiveView('products')}
                    style={{ padding: '0.6rem 1.2rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    👟 View Catalog ({productsList.length})
                  </button>
                </div>
              </div>

              {uploadStatus.msg && (
                <div style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  marginBottom: '1.5rem',
                  background: uploadStatus.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${uploadStatus.type === 'success' ? '#22c55e' : '#ef4444'}`,
                  color: uploadStatus.type === 'success' ? '#4ade80' : '#fca5a5',
                  fontWeight: 700,
                  fontSize: '0.95rem'
                }}>
                  {uploadStatus.msg}
                </div>
              )}

              <form onSubmit={handleSaveProduct} className={styles.formGrid}>
                {/* Product Name */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>👟 Product Name *</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="e.g. Nike Air Jordan 4 Retro Metallic"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    required
                  />
                </div>

                {/* Brand */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>🏷️ Brand Name</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="e.g. Nike, Adidas, Meer Empire..."
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                  />
                </div>

                {/* Category */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>📂 Category *</label>
                  <select
                    className={styles.formSelect}
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                  >
                    {defaultCategories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Quality Badge */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>⭐ Quality Badge / Description *</label>
                  <select
                    className={`${styles.formSelect} ${styles.qualitySelect}`}
                    value={prodBadge}
                    onChange={(e) => setProdBadge(e.target.value)}
                  >
                    <option value="Premium">✨ Premium</option>
                    <option value="Excellent">⭐ Excellent</option>
                    <option value="Very Good">🌟 Very Good</option>
                    <option value="Good">👍 Good</option>
                  </select>
                </div>

                {/* Price (Rs) */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>💰 Sale Price (Rs.) *</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    placeholder="e.g. 12500"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    required
                  />
                </div>

                {/* Old Price (Rs) */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>🏷️ Original / Old Price (Rs.) [Optional]</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    placeholder="e.g. 16000 (Calculates Discount %)"
                    value={prodOldPrice}
                    onChange={(e) => setProdOldPrice(e.target.value)}
                  />
                </div>

                {/* Available Sizes */}
                <div className={styles.formGroupFull}>
                  <label className={styles.formLabel}>📏 Available Sizes (UK/PK, US, EUR & Custom)</label>
                  
                  {/* Preset & Custom Size Chips */}
                  <div className={styles.chipGroup}>
                    {Array.from(new Set([...defaultSizes, ...selectedSizes])).map((size) => {
                      const isActive = selectedSizes.includes(size);
                      const isCustom = !defaultSizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          className={`${styles.chipBtn} ${isActive ? styles.chipBtnActive : ''}`}
                          onClick={() => toggleSize(size)}
                          title={isCustom ? 'Custom Added Size' : undefined}
                        >
                          {isActive ? '✓ ' : ''}{size} {isCustom ? '🏷️' : ''}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Size Field */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="➕ Type custom size (e.g. UK/PK 7.5 | US 8.5 | EUR 41.5 or 7.5)"
                      value={customSizeInput}
                      onChange={(e) => setCustomSizeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomSize();
                        }
                      }}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSize}
                      style={{
                        padding: '0.6rem 1.2rem',
                        background: 'rgba(212,175,55,0.2)',
                        border: '1px solid #D4AF37',
                        color: '#D4AF37',
                        borderRadius: '10px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      + Add Custom Size
                    </button>
                  </div>
                </div>

                {/* Images Upload / URL */}
                <div className={styles.formGroupFull}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <label className={styles.formLabel} style={{ margin: 0 }}>🖼️ Product Images * (Minimum 4 Required)</label>
                    <span style={{ fontSize: '0.82rem', color: prodImages.length >= 4 ? '#4ade80' : '#fca5a5', fontWeight: 700 }}>
                      {prodImages.length >= 4 ? `✅ ${prodImages.length} Images Added (Ready)` : `⚠️ ${prodImages.length}/4 Images Added`}
                    </span>
                  </div>

                  <div className={styles.imageDropArea} onClick={() => document.getElementById('fileUploadInput')?.click()}>
                    <span style={{ fontSize: '2rem' }}>☁️</span>
                    <p style={{ margin: '0.5rem 0 0.2rem', fontWeight: 700, color: '#D4AF37' }}>
                      Click to upload product images from computer (Select 4 or more)
                    </p>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>
                      📌 <strong>1st Image:</strong> Front Cover (Showroom Card View) &nbsp;|&nbsp; 📌 <strong>2nd, 3rd, 4th Images:</strong> View Details Gallery
                    </p>
                    <input
                      id="fileUploadInput"
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                  </div>

                  {uploadingImage && (
                    <p style={{ color: '#D4AF37', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>
                      ⏳ Uploading image to Cloudinary...
                    </p>
                  )}

                  {/* Or direct URL input */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="Or paste image URL directly (e.g. https://...)"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      style={{ padding: '0 1.2rem', background: 'rgba(212,175,55,0.2)', border: '1px solid #D4AF37', color: '#D4AF37', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      + Add URL
                    </button>
                  </div>

                  {/* Image Preview Grid */}
                  {prodImages.length > 0 && (
                    <div className={styles.imagePreviewsGrid}>
                      {prodImages.map((url, idx) => (
                        <div key={idx} className={styles.imagePreviewBox} style={{ position: 'relative' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Preview ${idx + 1}`} className={styles.imagePreviewImg} />
                          
                          {/* Position Badge or Make Front Button */}
                          {idx === 0 ? (
                            <span style={{
                              position: 'absolute',
                              bottom: '6px',
                              left: '6px',
                              right: '6px',
                              background: 'rgba(11, 35, 69, 0.95)',
                              color: '#D4AF37',
                              border: '1px solid #D4AF37',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              padding: '3px 4px',
                              textAlign: 'center',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              ⭐ Front Cover (Main)
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetAsFrontImage(idx)}
                              style={{
                                position: 'absolute',
                                bottom: '6px',
                                left: '6px',
                                right: '6px',
                                background: 'rgba(212, 175, 55, 0.95)',
                                color: '#0B2345',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                padding: '3px 4px',
                                cursor: 'pointer',
                                textAlign: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                              }}
                              title="Click to set this image as Front Cover"
                            >
                              ⭐ Make Front Cover
                            </button>
                          )}

                          <button
                            type="button"
                            className={styles.imageRemoveBtn}
                            onClick={() => handleRemoveImage(idx)}
                            title="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className={styles.formGroupFull}>
                  <label className={styles.formLabel}>📝 Full Product Description *</label>
                  <textarea
                    className={styles.formTextarea}
                    placeholder="Describe the product material, design quality, origin, comfort, and wearing experience..."
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    required
                  />
                </div>

                {/* Key Features / Highlights */}
                <div className={styles.formGroupFull}>
                  <label className={styles.formLabel}>✨ Key Features & Specifications</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="Add key feature (e.g. Memory foam cushioning, Rubber sole)"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      style={{ padding: '0 1.2rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      + Add Point
                    </button>
                  </div>
                  <div className={styles.featuresList}>
                    {prodFeatures.map((feat, idx) => (
                      <div key={idx} className={styles.featureTag}>
                        <span>• {feat}</span>
                        <span className={styles.featureRemove} onClick={() => handleRemoveFeature(idx)}>✕</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Badges / Checkboxes */}
                <div className={styles.formGroupFull}>
                  <label className={styles.formLabel}>🔥 Store Badges & Promotions</label>
                  <div className={styles.checkboxRow}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        className={styles.checkboxInput}
                        checked={isNewArrival}
                        onChange={(e) => setIsNewArrival(e.target.checked)}
                      />
                      🆕 Mark as New Arrival
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        className={styles.checkboxInput}
                        checked={isBestSeller}
                        onChange={(e) => setIsBestSeller(e.target.checked)}
                      />
                      ⭐ Mark as Best Seller
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        className={styles.checkboxInput}
                        checked={isFlashSale}
                        onChange={(e) => setIsFlashSale(e.target.checked)}
                      />
                      🔥 Include in Flash Sale
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className={styles.formGroupFull}>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={submittingProduct || uploadingImage}
                  >
                    {submittingProduct
                      ? (editingProductId ? '⏳ Updating Product & Images...' : '⏳ Uploading Product to Website...')
                      : (editingProductId ? '💾 Save & Update Product Details' : '🚀 Publish Product to Website')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── 3. PRODUCTS CATALOG VIEW ───────────────────────────────────────── */}
        {activeView === 'products' && (
          <div className={styles.dashContent}>
            <div className={styles.subscribersBox}>
              <div className={styles.subscribersHeader}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.3rem' }}>👟 Store Products Catalog ({productsList.length})</h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', opacity: 0.6 }}>Manage all live products displayed on the Meer Empire website.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => { handleCancelEdit(); setActiveView('add-product'); }}
                    style={{ padding: '0.6rem 1.2rem', background: 'linear-gradient(135deg, #D4AF37 0%, #f0cf65 100%)', color: '#0B2345', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}
                  >
                    ➕ Upload New Product
                  </button>
                  <button
                    onClick={loadAdminProducts}
                    style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-section)', cursor: 'pointer', fontWeight: 600, color: '#fff' }}
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>

              {loadingProducts ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.6)' }}>Loading catalog...</p>
              ) : productsList.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>👟</span>
                  <h3>No Products Found</h3>
                  <p>Click "Upload New Product" to add products to your online store.</p>
                </div>
              ) : (
                <div className={styles.productsAdminGrid}>
                  {productsList.map((prod) => (
                    <div key={prod.id} className={styles.adminProductCard}>
                      <div className={styles.adminProductImgBox}>
                        {prod.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={prod.images[0]} alt={prod.name} className={styles.adminProductImg} />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>No Image</div>
                        )}
                        {prod.badge && <span className={styles.adminProductBadge}>{prod.badge}</span>}
                      </div>
                      <div className={styles.adminProductInfo}>
                        <div>
                          <h4 className={styles.adminProductName}>{prod.name}</h4>
                          <div className={styles.adminProductMeta}>
                            <span style={{ textTransform: 'capitalize' }}>📂 {prod.category}</span>
                            <span>📦 Stock: {prod.stock}</span>
                          </div>
                          <div className={styles.adminProductPrice}>
                            Rs. {prod.price.toLocaleString()}
                            {prod.oldPrice && (
                              <span style={{ textDecoration: 'line-through', fontSize: '0.8rem', color: '#999', marginLeft: '6px' }}>
                                Rs. {prod.oldPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                          <button
                            style={{
                              flex: 1,
                              padding: '0.55rem 0.5rem',
                              background: 'rgba(212,175,55,0.15)',
                              color: '#D4AF37',
                              border: '1px solid rgba(212,175,55,0.3)',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.2rem',
                            }}
                            onClick={() => handleStartEditProduct(prod)}
                          >
                            ✏️ Edit & Change Front Img
                          </button>
                          <button
                            className={styles.deleteProdBtn}
                            onClick={() => handleDeleteProduct(prod.id)}
                            style={{ padding: '0.55rem 0.6rem' }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── 4. CONTACT MESSAGES VIEW ───────────────────────────────────────── */}
        {activeView === 'messages' && (
          <div className={styles.dashContent}>
            {/* Header Box */}
            <div className={styles.subscribersBox}>
              <div className={styles.subscribersHeader}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#ffffff' }}>📩 Customer Contact Inquiries ({messages.length})</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>Messages submitted by customers from the Contact Us page & auto-sent to info.meerempire@gmail.com</p>
                </div>
                <button onClick={loadMessages} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)', background: 'rgba(255, 255, 255, 0.06)', color: '#ffffff', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  🔄 Refresh Messages
                </button>
              </div>

              {/* Message Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700, textTransform: 'uppercase' }}>Total Messages</span>
                  <strong style={{ display: 'block', fontSize: '1.8rem', color: '#ffffff', marginTop: '0.2rem' }}>{messages.length}</strong>
                </div>
                <div style={{ background: 'rgba(239,68,68,0.1)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <span style={{ fontSize: '0.78rem', color: '#fca5a5', fontWeight: 700, textTransform: 'uppercase' }}>Unread Inquiries</span>
                  <strong style={{ display: 'block', fontSize: '1.8rem', color: '#ef4444', marginTop: '0.2rem' }}>{messages.filter(m => m.status === 'unread').length}</strong>
                </div>
                <div style={{ background: 'rgba(34,197,94,0.1)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <span style={{ fontSize: '0.78rem', color: '#86efac', fontWeight: 700, textTransform: 'uppercase' }}>Replied Messages</span>
                  <strong style={{ display: 'block', fontSize: '1.8rem', color: '#22c55e', marginTop: '0.2rem' }}>{messages.filter(m => m.status === 'replied').length}</strong>
                </div>
              </div>

              {/* Messages Grid */}
              {loadingMessages ? (
                <p style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255, 255, 255, 0.6)' }}>Loading contact messages...</p>
              ) : messages.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>📩</span>
                  <h3>No Messages Received Yet</h3>
                  <p>When customers fill out the Contact Us form, their messages will appear here and arrive in your email.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      style={{
                        background: msg.status === 'unread' ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.03)',
                        border: '1px solid ' + (msg.status === 'unread' ? '#f59e0b' : 'rgba(255,255,255,0.08)'),
                        borderRadius: '14px',
                        padding: '1.5rem',
                        position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '1.15rem', color: '#ffffff' }}>👤 {msg.name}</strong>
                            <span style={{ background: '#0B2345', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '3px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                              {msg.subject}
                            </span>
                            <span style={{
                              padding: '3px 10px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              background: msg.status === 'unread' ? 'rgba(239,68,68,0.2)' : msg.status === 'replied' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)',
                              color: msg.status === 'unread' ? '#fca5a5' : msg.status === 'replied' ? '#86efac' : 'rgba(255,255,255,0.7)',
                            }}>
                              {msg.status === 'unread' ? '⏳ Unread' : msg.status === 'replied' ? '✅ Replied' : '👁️ Read'}
                            </span>
                          </div>
                          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.45)' }}>
                            Received on: {new Date(msg.createdAt).toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}
                          </p>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <a
                            href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)} - Meer Empire`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => handleUpdateMessageStatus(msg._id, 'replied')}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              background: '#0B2345',
                              color: '#D4AF37',
                              border: '1px solid rgba(212,175,55,0.3)',
                              textDecoration: 'none',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            ✉️ Reply Email
                          </a>
                          {msg.phone && (
                            <a
                              href={`https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => handleUpdateMessageStatus(msg._id, 'replied')}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                background: '#25D366',
                                color: '#fff',
                                textDecoration: 'none',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                              }}
                            >
                              💬 Reply WhatsApp
                            </a>
                          )}
                          {msg.status === 'unread' ? (
                            <button
                              onClick={() => handleUpdateMessageStatus(msg._id, 'read')}
                              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#ffffff', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                            >
                              Mark Read
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateMessageStatus(msg._id, 'unread')}
                              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#ffffff', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                            >
                              Mark Unread
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMessage(msg._id)}
                            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>

                      {/* Contact Info Sub-row */}
                      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', fontSize: '0.9rem', flexWrap: 'wrap', background: 'rgba(255,255,255,0.04)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', color: '#ffffff' }}>
                        <span>✉️ <strong>Email:</strong> <a href={`mailto:${msg.email}`} style={{ color: '#D4AF37', textDecoration: 'none' }}>{msg.email}</a></span>
                        <span>📞 <strong>Phone:</strong> {msg.phone ? <a href={`tel:${msg.phone}`} style={{ color: '#ffffff' }}>{msg.phone}</a> : 'N/A'}</span>
                      </div>

                      {/* Message Content */}
                      <div style={{ background: '#061120', padding: '1.1rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── 5. VIP SUBSCRIBERS VIEW ────────────────────────────────────────── */}
        {activeView === 'subscribers' && (
          <div className={styles.dashContent}>
            {/* Broadcast Offer Campaign Sender Card */}
            <div className={styles.broadcastCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#ffffff' }}>📢 Broadcast Offer Email Campaign</h2>
                  <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.6)' }}>Send special discount offers & new arrival deals directly to all VIP subscribers!</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleTemplateChange('flash_sale')}
                    style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.4)', background: selectedTemplate === 'flash_sale' ? '#D4AF37' : 'rgba(255,255,255,0.05)', color: selectedTemplate === 'flash_sale' ? '#0B2345' : '#ffffff', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    🎁 Flash Sale
                  </button>
                  <button
                    onClick={() => handleTemplateChange('new_arrival')}
                    style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.4)', background: selectedTemplate === 'new_arrival' ? '#D4AF37' : 'rgba(255,255,255,0.05)', color: selectedTemplate === 'new_arrival' ? '#0B2345' : '#ffffff', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    👟 New Arrivals
                  </button>
                  <button
                    onClick={() => handleTemplateChange('custom')}
                    style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.4)', background: selectedTemplate === 'custom' ? '#D4AF37' : 'rgba(255,255,255,0.05)', color: selectedTemplate === 'custom' ? '#0B2345' : '#ffffff', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    ✍️ Custom
                  </button>
                </div>
              </div>

              <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: '#ffffff' }}>Email Subject Line</label>
                    <input
                      type="text"
                      value={broadcastSubject}
                      onChange={(e) => setBroadcastSubject(e.target.value)}
                      required
                      placeholder="e.g. 🔥 Flash Sale Up to 30% OFF!"
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#ffffff' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: '#ffffff' }}>Coupon Code (Optional)</label>
                    <input
                      type="text"
                      value={broadcastCoupon}
                      onChange={(e) => setBroadcastCoupon(e.target.value)}
                      placeholder="e.g. FLASH30"
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#ffffff' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: '#ffffff' }}>Banner Title / Heading</label>
                  <input
                    type="text"
                    value={broadcastHeading}
                    onChange={(e) => setBroadcastHeading(e.target.value)}
                    placeholder="e.g. VIP SPECIAL DISCOUNT"
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#ffffff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: '#ffffff' }}>Offer Details & Message</label>
                  <textarea
                    rows={3}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    required
                    placeholder="Write details about the discount offer or new product line..."
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#ffffff', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                    Targeting <strong style={{ color: '#D4AF37' }}>{subscribers.length}</strong> active subscriber(s)
                  </span>
                  <button
                    type="submit"
                    disabled={sendingBroadcast || subscribers.length === 0}
                    style={{
                      background: 'linear-gradient(135deg, #D4AF37 0%, #f0cf65 100%)',
                      color: '#0B2345',
                      padding: '0.85rem 2rem',
                      borderRadius: '10px',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(212,175,55,0.3)',
                    }}
                  >
                    {sendingBroadcast ? '🚀 Sending Offer Email...' : '📢 Send Deal Email to All Subscribers'}
                  </button>
                </div>

                {broadcastResult && (
                  <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', background: broadcastResult.includes('✅') ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', border: '1px solid ' + (broadcastResult.includes('✅') ? '#22c55e' : '#ef4444'), color: broadcastResult.includes('✅') ? '#4ade80' : '#fca5a5', fontWeight: 700, fontSize: '0.9rem' }}>
                    {broadcastResult}
                  </div>
                )}
              </form>
            </div>

            {/* Subscribers Table Box */}
            <div className={styles.subscribersBox}>
              <div className={styles.subscribersHeader}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#ffffff' }}>📧 VIP Newsletter Subscribers ({subscribers.length})</h3>
                <button onClick={loadSubscribers} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#ffffff', cursor: 'pointer', fontWeight: 600 }}>
                  🔄 Refresh List
                </button>
              </div>

              {loadingSubscribers ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.6)' }}>Loading subscribers...</p>
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
                          <td><strong style={{ color: '#ffffff' }}>{sub.email}</strong></td>
                          <td>{sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleString('en-PK') : 'Recent'}</td>
                          <td>
                            <button
                              onClick={() => handleDeleteSubscriber(sub.email)}
                              style={{ padding: '5px 12px', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
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
