export interface OrderItem {
  id: number | string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  images: string[];
}

export interface Order {
  id: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  paymentMethod: 'online' | 'cod';
  paymentChannel?: 'jazzcash' | 'easypaisa' | 'bank'; // for online/cod advance
  screenshotBase64?: string; // base64 image of payment proof
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerPostal: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  coupon?: string;
  total: number;
  adminNote?: string;
}

const STORAGE_KEY = 'meer_orders';

export async function saveOrder(order: Order): Promise<void> {
  // Save to localStorage first (instant backup)
  try {
    const existing = getOrders();
    existing.unshift(order); // newest first
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to save order in localStorage', e);
  }

  // Save to MongoDB Atlas Database (await so we know it saved)
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    const data = await res.json();
    if (!data.success) {
      console.error('MongoDB save failed:', data.error);
    }
  } catch (err) {
    console.error('Failed to save order to MongoDB:', err);
  }
}

export function getOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function fetchOrdersFromDB(): Promise<Order[]> {
  try {
    const res = await fetch('/api/orders');
    const data = await res.json();
    if (data.success && Array.isArray(data.orders)) {
      // Sync to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.orders));
      return data.orders;
    }
  } catch (err) {
    console.error('Error fetching orders from DB:', err);
  }
  return getOrders();
}

export function updateOrderStatus(
  id: string,
  status: 'approved' | 'rejected',
  adminNote?: string
): void {
  try {
    const orders = getOrders();
    const updated = orders.map((o) =>
      o.id === id ? { ...o, status, adminNote: adminNote ?? o.adminNote } : o
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update order in localStorage', e);
  }

  // Also update in MongoDB Atlas Database
  fetch('/api/orders', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: id, status, adminNote }),
  }).catch((err) => console.error('Failed to update order in MongoDB:', err));
}

export function generateOrderId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ME-${ts}-${rand}`;
}
