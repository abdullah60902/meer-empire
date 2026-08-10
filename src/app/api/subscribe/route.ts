import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SubscriberModel from '@/models/Subscriber';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const ADMIN_EMAIL = 'info.meerempire@gmail.com';

// GET /api/subscribe -> Fetch all subscribers for Admin Panel
export async function GET() {
  try {
    await connectDB();
    const subscribers = await SubscriberModel.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, subscribers });
  } catch (error: any) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/subscribe -> Add new subscriber
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address' }, { status: 400 });
    }

    await connectDB();

    // Check if already subscribed
    const existing = await SubscriberModel.findOne({ email: email.toLowerCase() });
    if (!existing) {
      await SubscriberModel.create({ email: email.toLowerCase() });
    }

    // 1. Send Notification Email to Admin (info.meerempire@gmail.com)
    const adminMailHtml = `
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
            <p style="color:#f59e0b;margin:6px 0 0;font-size:14px;font-weight:700;">👑 NEW VIP NEWSLETTER SUBSCRIBER</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="font-size:16px;color:#333;margin:0 0 16px;">A new user has just subscribed for VIP Access & Deals!</p>
            <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin-bottom:20px;border-left:4px solid #0B2345;">
              <p style="margin:0;font-size:15px;color:#0B2345;"><strong>Subscriber Email:</strong> <a href="mailto:${email}" style="color:#2563eb;">${email}</a></p>
              <p style="margin:8px 0 0;font-size:13px;color:#666;">Subscribed on: ${new Date().toLocaleString('en-PK')}</p>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
      from: `"Meer Empire VIP" <${process.env.GMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: `🎉 NEW VIP SUBSCRIBER – ${email}`,
      html: adminMailHtml,
    }).catch(err => console.error('Admin email error:', err));

    // 2. Send Welcome Email to Subscriber
    const welcomeMailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#0B2345,#1a3a6e);padding:36px 40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:28px;letter-spacing:2px;">MEER EMPIRE</h1>
            <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:13px;letter-spacing:1px;">WELCOME TO VIP ACCESS</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <h2 style="color:#0B2345;margin:0 0 16px;font-size:22px;">Welcome to The Empire! 👑</h2>
            <p style="font-size:15px;color:#555;line-height:1.7;">Thank you for subscribing to Meer Empire VIP Club. You'll now be the first to know about exclusive flash sales, new luxury shoe arrivals, and special member discounts.</p>
            
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
              <p style="margin:0 0 8px;font-size:14px;color:#1e40af;font-weight:600;">YOUR EXCLUSIVE VIP WELCOME COUPON</p>
              <div style="font-size:28px;font-weight:800;color:#0B2345;letter-spacing:4px;background:#fff;padding:12px 24px;border-radius:8px;display:inline-block;border:2px dashed #2563eb;margin:8px 0;">
                MEERVIP10
              </div>
              <p style="margin:8px 0 0;font-size:13px;color:#1e40af;">Use this code at checkout to get 10% OFF your next order!</p>
            </div>

            <div style="text-align:center;margin-top:30px;">
              <a href="http://localhost:3000/shop" style="background:#0B2345;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
                🛍️ Explore Shop Collection
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#0B2345;padding:24px 40px;text-align:center;">
            <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:0;">© ${new Date().getFullYear()} Meer Empire · All Rights Reserved</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
      from: `"Meer Empire" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `👑 Welcome to MEER EMPIRE VIP Access! – Your Discount Inside`,
      html: welcomeMailHtml,
    }).catch(err => console.error('Subscriber email error:', err));

    return NextResponse.json({ success: true, message: 'Successfully subscribed to VIP Access!' });
  } catch (error: any) {
    console.error('Subscription error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/subscribe -> Remove subscriber
export async function DELETE(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });

    await connectDB();
    await SubscriberModel.deleteOne({ email: email.toLowerCase() });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
