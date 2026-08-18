import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  images: string[];
}

export interface IOrder extends Document {
  orderId: string; // e.g. ME-1234
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  customerCity: string;
  customerPostal: string;
  paymentMethod: 'online' | 'cod';
  paymentChannel?: string;
  paymentProofImage?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  items: IOrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  coupon?: string;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  id: { type: Schema.Types.Mixed, required: true }, // accepts both string and number IDs
  name: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  size: { type: String, required: true },
  color: { type: String, required: true },
  images: [{ type: String }],
});

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerAddress: { type: String, required: true },
    customerCity: { type: String, required: true },
    customerPostal: { type: String, default: '' },
    paymentMethod: { type: String, enum: ['online', 'cod'], required: true },
    paymentChannel: { type: String },
    paymentProofImage: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNote: { type: String },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 250 },
    discount: { type: Number, default: 0 },
    coupon: { type: String },
    total: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const OrderModel: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default OrderModel;
