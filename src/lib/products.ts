import { products as staticProducts } from '@/data/products';

export interface ProductItem {
  id: number | string;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  stock: number;
  isNew: boolean;
  isBestSeller: boolean;
  isFlashSale: boolean;
  badge?: string;
  colors: string[];
  sizes: string[];
  images: string[];
  description: string;
  features: string[];
}

export async function fetchProductsFromDB(): Promise<ProductItem[]> {
  try {
    const res = await fetch('/api/products', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    if (data.success && Array.isArray(data.products)) {
      return data.products;
    }
  } catch (error) {
    console.error('Failed to load dynamic products, using fallback static catalog:', error);
  }
  return staticProducts;
}

export async function fetchProductById(id: string | number): Promise<ProductItem | null> {
  const allProducts = await fetchProductsFromDB();
  const searchId = String(id);
  const found = allProducts.find(p => String(p.id) === searchId);
  return found || null;
}
