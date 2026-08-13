import mongoose, { Schema, Model } from 'mongoose';

export interface IProduct {
  id: string;
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
  rating: number;
  reviews: number;
  isNew: boolean;
  isBestSeller: boolean;
  isFlashSale: boolean;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brand: { type: String, default: 'Meer Empire' },
  category: { type: String, required: true, default: 'sports' },
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  discount: { type: Number, default: 0 },
  stock: { type: Number, default: 10 },
  badge: { type: String, default: 'Premium Quality' },
  description: { type: String, required: true },
  features: { type: [String], default: [] },
  colors: { type: [String], default: [] },
  sizes: { type: [String], default: [] },
  images: { type: [String], required: true },
  rating: { type: Number, default: 5.0 },
  reviews: { type: Number, default: 0 },
  isNew: { type: Boolean, default: true },
  isBestSeller: { type: Boolean, default: false },
  isFlashSale: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
