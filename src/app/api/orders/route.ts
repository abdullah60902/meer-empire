import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import OrderModel from '@/models/Order';

// GET /api/orders -> List all orders from MongoDB
export async function GET() {
  try {
    await connectDB();
    const orders = await OrderModel.find({}).sort({ createdAt: -1 });

    const formattedOrders = orders.map((o) => ({
      id: o.orderId,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      customerEmail: o.customerEmail,
      customerAddress: o.customerAddress,
      customerCity: o.customerCity,
      customerPostal: o.customerPostal,
      paymentMethod: o.paymentMethod,
      paymentChannel: o.paymentChannel,
      paymentProofImage: o.paymentProofImage,
      status: o.status,
      adminNote: o.adminNote,
      items: o.items,
      subtotal: o.subtotal,
      deliveryCharge: o.deliveryCharge,
      discount: o.discount,
      coupon: o.coupon,
      total: o.total,
      createdAt: o.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, orders: formattedOrders });
  } catch (error: any) {
    console.error('Error fetching orders from MongoDB:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/orders -> Save new order in MongoDB Atlas
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const orderData = {
      orderId: body.id,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail,
      customerAddress: body.customerAddress,
      customerCity: body.customerCity,
      customerPostal: body.customerPostal,
      paymentMethod: body.paymentMethod,
      paymentChannel: body.paymentChannel,
      paymentProofImage: body.paymentProofImage,
      status: body.status || 'pending',
      adminNote: body.adminNote,
      items: body.items,
      subtotal: body.subtotal,
      deliveryCharge: body.deliveryCharge || 250,
      discount: body.discount || 0,
      coupon: body.coupon,
      total: body.total,
    };

    const newOrder = await OrderModel.create(orderData);

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error('Error saving order to MongoDB:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH /api/orders -> Update order status in MongoDB
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const { orderId, status, adminNote } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: 'Missing orderId or status' }, { status: 400 });
    }

    const updated = await OrderModel.findOneAndUpdate(
      { orderId },
      { status, adminNote },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error('Error updating order in MongoDB:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
