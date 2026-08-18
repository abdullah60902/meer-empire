import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import OrderModel from '@/models/Order';

// GET /api/orders -> List all orders from MongoDB
export async function GET() {
  try {
    await connectDB();
    const orders = await OrderModel.find({}).sort({ createdAt: -1 });

    const formattedOrders = orders.map((o) => {
      const plain = o.toObject ? o.toObject() : o;
      return {
        id: plain.orderId,
        customerName: plain.customerName,
        customerPhone: plain.customerPhone,
        customerEmail: plain.customerEmail,
        customerAddress: plain.customerAddress,
        customerCity: plain.customerCity,
        customerPostal: plain.customerPostal,
        paymentMethod: plain.paymentMethod,
        paymentChannel: plain.paymentChannel,
        paymentProofImage: plain.paymentProofImage,
        screenshotBase64: plain.paymentProofImage, // alias for admin dashboard
        status: plain.status,
        adminNote: plain.adminNote,
        items: Array.isArray(plain.items)
          ? plain.items.map((item: any) => ({
              id: item.id,
              name: item.name,
              brand: item.brand,
              price: item.price,
              quantity: item.quantity,
              size: item.size,
              color: item.color,
              images: item.images || [],
            }))
          : [],
        subtotal: plain.subtotal,
        deliveryCharge: plain.deliveryCharge,
        discount: plain.discount,
        coupon: plain.coupon,
        total: plain.total,
        createdAt: plain.createdAt instanceof Date ? plain.createdAt.toISOString() : plain.createdAt,
      };
    });

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
      paymentProofImage: body.screenshotBase64 ?? body.paymentProofImage,
      status: body.status || 'pending',
      adminNote: body.adminNote,
      items: body.items,
      subtotal: body.subtotal,
      deliveryCharge: body.deliveryCharge ?? 250,
      discount: body.discount ?? 0,
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
