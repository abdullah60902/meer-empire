import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const ADMIN_EMAIL = 'info.meerempire@gmail.com';

export async function POST(req: NextRequest) {
  try {
    const { order, action } = await req.json();

    if (!order || !action) {
      return NextResponse.json({ error: 'Missing order or action' }, { status: 400 });
    }

    const itemsHtml = order.items
      .map(
        (item: { images?: string[]; name: string; brand: string; size: string; quantity: number; price: number }) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #eee;">
            ${item.images?.[0] ? `<img src="${item.images[0]}" width="60" style="border-radius:6px;vertical-align:middle;margin-right:10px;" />` : ''}
            <strong>${item.name}</strong><br/>
            <small style="color:#666;">${item.brand} · Size: ${item.size}</small>
          </td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
        </tr>`
      )
      .join('');

    // ─── 1. NEW ORDER NOTIFICATION FOR ADMIN ─────────────────────────────────
    if (action === 'new_order') {
      const adminSubject = `🎉 NEW ORDER RECEIVED #${order.id} – ${order.customerName}`;
      const adminHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0B2345,#1a3a6e);padding:32px 40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:26px;letter-spacing:2px;">MEER EMPIRE</h1>
            <p style="color:#f59e0b;margin:6px 0 0;font-size:14px;font-weight:700;letter-spacing:1px;">🚨 NEW ORDER NOTIFICATION</p>
          </td>
        </tr>

        <!-- Alert Banner -->
        <tr>
          <td style="background:#fef3c7;padding:18px 40px;text-align:center;border-bottom:1px solid #fde68a;">
            <span style="color:#b45309;font-size:16px;font-weight:700;">
              🛒 A new order #${order.id} has just been placed!
            </span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 40px;">
            <!-- Customer Details -->
            <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin-bottom:24px;">
              <h3 style="margin:0 0 14px;font-size:15px;color:#0B2345;letter-spacing:0.5px;">👤 CUSTOMER INFORMATION</h3>
              <p style="margin:6px 0;font-size:14px;color:#333;"><strong>Name:</strong> ${order.customerName}</p>
              <p style="margin:6px 0;font-size:14px;color:#333;"><strong>Phone:</strong> <a href="tel:${order.customerPhone}" style="color:#2563eb;font-weight:600;">${order.customerPhone}</a></p>
              <p style="margin:6px 0;font-size:14px;color:#333;"><strong>Email:</strong> ${order.customerEmail}</p>
              <p style="margin:6px 0;font-size:14px;color:#333;"><strong>Address:</strong> ${order.customerAddress}, ${order.customerCity} ${order.customerPostal}</p>
              <p style="margin:6px 0;font-size:14px;color:#333;"><strong>Payment Method:</strong> ${order.paymentMethod === 'online' ? `💳 Online (${order.paymentChannel || 'Bank/Wallet'})` : '📦 Cash on Delivery (Rs. 250 Advance)'}</p>
            </div>

            <!-- Items -->
            <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin-bottom:24px;">
              <h3 style="margin:0 0 16px;font-size:15px;color:#0B2345;letter-spacing:0.5px;">🛍️ ORDERED ITEMS</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr style="background:#0B2345;">
                  <th style="padding:10px;color:#fff;text-align:left;font-size:13px;">Product</th>
                  <th style="padding:10px;color:#fff;text-align:center;font-size:13px;">Qty</th>
                  <th style="padding:10px;color:#fff;text-align:right;font-size:13px;">Price</th>
                </tr>
                ${itemsHtml}
                <tr>
                  <td colspan="2" style="padding:10px;text-align:right;font-weight:600;font-size:14px;">Subtotal</td>
                  <td style="padding:10px;text-align:right;">Rs. ${order.subtotal.toLocaleString()}</td>
                </tr>
                ${order.deliveryCharge > 0 ? `<tr><td colspan="2" style="padding:6px 10px;text-align:right;color:#2563eb;font-size:13px;">Advance Delivery Fee (Paid)</td><td style="padding:6px 10px;text-align:right;color:#2563eb;font-size:13px;">Rs. ${order.deliveryCharge}</td></tr>` : ''}
                <tr style="background:#0B2345;">
                  <td colspan="2" style="padding:12px 10px;color:#fff;font-weight:700;font-size:15px;">TOTAL PAYABLE</td>
                  <td style="padding:12px 10px;color:#fff;font-weight:700;font-size:15px;text-align:right;">Rs. ${order.subtotal.toLocaleString()}</td>
                </tr>
              </table>
            </div>

            <!-- Dashboard Button -->
            <div style="text-align:center;margin:30px 0 10px;">
              <a href="http://localhost:3000/admin" style="background:#0B2345;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;box-shadow:0 4px 12px rgba(11,35,69,0.3);">
                👑 Open Admin Dashboard →
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0B2345;padding:20px;text-align:center;">
            <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:0;">Meer Empire Admin Notification System</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

      // Send to Admin (info.meerempire@gmail.com)
      await transporter.sendMail({
        from: `"Meer Empire Orders" <${process.env.GMAIL_USER}>`,
        to: ADMIN_EMAIL,
        subject: adminSubject,
        html: adminHtml,
      });

      // Also send order received confirmation to customer
      const customerSubject = `📦 We Have Received Your Order #${order.id} – Meer Empire`;
      const customerHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#0B2345,#1a3a6e);padding:32px 40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:26px;letter-spacing:2px;">MEER EMPIRE</h1>
            <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:13px;letter-spacing:1px;">PREMIUM FOOTWEAR</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <h2 style="color:#0B2345;margin:0 0 16px;">Thank You For Your Order!</h2>
            <p style="font-size:14px;color:#555;line-height:1.7;">Dear <strong>${order.customerName}</strong>,</p>
            <p style="font-size:14px;color:#555;line-height:1.7;">We have successfully received your order <strong>#${order.id}</strong>. Our team is currently reviewing your order details and payment verification. You will receive an approval update shortly.</p>
            
            <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:24px 0;">
              <h3 style="margin:0 0 12px;font-size:15px;color:#0B2345;">📦 ORDER SUMMARY</h3>
              <p style="margin:4px 0;font-size:14px;color:#555;"><strong>Order ID:</strong> ${order.id}</p>
              <p style="margin:4px 0;font-size:14px;color:#555;"><strong>Total Payable:</strong> Rs. ${order.subtotal.toLocaleString()}</p>
              <p style="margin:4px 0;font-size:14px;color:#555;"><strong>Payment Method:</strong> ${order.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery (Rs. 250 Advance Paid)'}</p>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

      await transporter.sendMail({
        from: `"Meer Empire" <${process.env.GMAIL_USER}>`,
        to: order.customerEmail,
        subject: customerSubject,
        html: customerHtml,
      });

      return NextResponse.json({ success: true });
    }

    // ─── 2. STATUS UPDATE EMAIL (APPROVED / REJECTED) ────────────────────────
    const isApproved = action === 'approved';
    const subject = isApproved
      ? `✅ Your Order ${order.id} has been Confirmed! – Meer Empire`
      : `❌ Update on Your Order ${order.id} – Meer Empire`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:${isApproved ? 'linear-gradient(135deg,#0B2345,#1a3a6e)' : 'linear-gradient(135deg,#7f1d1d,#b91c1c)'};padding:36px 40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:28px;letter-spacing:2px;">MEER EMPIRE</h1>
            <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:13px;letter-spacing:1px;">PREMIUM FOOTWEAR</p>
          </td>
        </tr>

        <!-- Status Banner -->
        <tr>
          <td style="background:${isApproved ? '#f0fdf4' : '#fff5f5'};padding:24px 40px;text-align:center;border-bottom:1px solid ${isApproved ? '#bbf7d0' : '#fecaca'};">
            <div style="font-size:48px;margin-bottom:8px;">${isApproved ? '✅' : '❌'}</div>
            <h2 style="margin:0;color:${isApproved ? '#15803d' : '#dc2626'};font-size:22px;">
              ${isApproved ? 'Order Confirmed!' : 'Order Not Approved'}
            </h2>
            <p style="color:${isApproved ? '#166534' : '#991b1b'};margin:8px 0 0;font-size:15px;">
              ${isApproved
                ? 'Great news! Your order has been approved and is being processed.'
                : 'Unfortunately, we could not approve your order at this time.'}
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 40px;">
            <!-- Greeting -->
            <p style="font-size:16px;color:#333;margin:0 0 24px;">Dear <strong>${order.customerName}</strong>,</p>
            <p style="font-size:14px;color:#555;margin:0 0 24px;line-height:1.7;">
              ${isApproved
                ? `We are pleased to confirm that your order <strong>${order.id}</strong> has been approved and is now being prepared for shipment.`
                : `We regret to inform you that your order <strong>${order.id}</strong> could not be processed. ${order.adminNote ? `Reason: ${order.adminNote}` : 'Please contact us for more details.'}`}
            </p>

            ${isApproved ? `
            <!-- Delivery Estimate Notice -->
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-bottom:24px;text-align:center;">
              <p style="margin:0;font-size:15px;color:#1e40af;font-weight:700;">
                🚚 Estimated Delivery Time: Your order will be delivered within 3 to 4 business days.
              </p>
            </div>
            ` : ''}

            <!-- Order Summary -->
            <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin-bottom:24px;">
              <h3 style="margin:0 0 16px;font-size:15px;color:#0B2345;letter-spacing:0.5px;">📦 ORDER SUMMARY</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr style="background:#0B2345;">
                  <th style="padding:10px;color:#fff;text-align:left;font-size:13px;border-radius:4px 0 0 0;">Product</th>
                  <th style="padding:10px;color:#fff;text-align:center;font-size:13px;">Qty</th>
                  <th style="padding:10px;color:#fff;text-align:right;font-size:13px;border-radius:0 4px 0 0;">Price</th>
                </tr>
                ${itemsHtml}
                <tr>
                  <td colspan="2" style="padding:10px;text-align:right;font-weight:600;font-size:14px;">Subtotal</td>
                  <td style="padding:10px;text-align:right;">Rs. ${order.subtotal.toLocaleString()}</td>
                </tr>
                ${order.discount > 0 ? `<tr><td colspan="2" style="padding:6px 10px;text-align:right;color:#16a34a;font-size:13px;">Discount</td><td style="padding:6px 10px;text-align:right;color:#16a34a;font-size:13px;">- Rs. ${order.discount.toLocaleString()}</td></tr>` : ''}
                ${order.deliveryCharge > 0 ? `<tr><td colspan="2" style="padding:6px 10px;text-align:right;color:#2563eb;font-size:13px;">Advance Delivery Fee (Paid)</td><td style="padding:6px 10px;text-align:right;color:#2563eb;font-size:13px;">Rs. ${order.deliveryCharge} (Paid)</td></tr>` : ''}
                <tr style="background:#0B2345;border-radius:0 0 4px 4px;">
                  <td colspan="2" style="padding:12px 10px;color:#fff;font-weight:700;font-size:15px;border-radius:0 0 0 4px;">
                    ${order.paymentMethod === 'cod' ? 'TOTAL PAYABLE ON DELIVERY (COD)' : 'TOTAL PAID'}
                  </td>
                  <td style="padding:12px 10px;color:#fff;font-weight:700;font-size:15px;text-align:right;border-radius:0 0 4px 0;">
                    Rs. ${order.subtotal.toLocaleString()}
                  </td>
                </tr>
              </table>
            </div>

            <!-- Customer Details -->
            <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin-bottom:24px;">
              <h3 style="margin:0 0 12px;font-size:15px;color:#0B2345;">📍 DELIVERY DETAILS</h3>
              <p style="margin:4px 0;font-size:14px;color:#555;"><strong>Address:</strong> ${order.customerAddress}</p>
              <p style="margin:4px 0;font-size:14px;color:#555;"><strong>City:</strong> ${order.customerCity} ${order.customerPostal}</p>
              <p style="margin:4px 0;font-size:14px;color:#555;"><strong>Phone:</strong> 📞 ${order.customerPhone}</p>
              <p style="margin:4px 0;font-size:14px;color:#555;"><strong>Payment Method:</strong> ${order.paymentMethod === 'online' ? `Online (${order.paymentChannel || 'Bank/Mobile Wallet'})` : 'Cash on Delivery (Rs. 250 Advance Paid)'}</p>
            </div>

            ${order.adminNote && isApproved ? `
            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin-bottom:24px;">
              <p style="margin:0;font-size:14px;color:#92400e;"><strong>📝 Note:</strong> ${order.adminNote}</p>
            </div>` : ''}

            ${isApproved ? `
            <div style="text-align:center;margin:24px 0;">
              <p style="font-size:14px;color:#555;margin-bottom:16px;">Need help? Contact us anytime.</p>
              <a href="https://wa.me/923087975435" style="background:#25D366;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">💬 WhatsApp Us</a>
            </div>` : ''}

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0B2345;padding:24px 40px;text-align:center;">
            <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:0;">© ${new Date().getFullYear()} Meer Empire · All Rights Reserved</p>
            <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:6px 0 0;">This is an automated email. Order ID: ${order.id}</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
      from: `"Meer Empire" <${process.env.GMAIL_USER}>`,
      to: order.customerEmail,
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
