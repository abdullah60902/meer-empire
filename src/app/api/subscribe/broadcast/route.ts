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

export async function POST(req: NextRequest) {
  try {
    const { subject, heading, message, coupon, targetEmails } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ success: false, error: 'Subject and message are required' }, { status: 400 });
    }

    await connectDB();

    let recipients: string[] = [];

    if (Array.isArray(targetEmails) && targetEmails.length > 0) {
      recipients = targetEmails;
    } else {
      const subscribers = await SubscriberModel.find({});
      recipients = subscribers.map((s) => s.email);
    }

    if (recipients.length === 0) {
      return NextResponse.json({ success: false, error: 'No subscribers found' }, { status: 400 });
    }

    const offerHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0B2345,#1a3a6e);padding:36px 40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:28px;letter-spacing:2px;">MEER EMPIRE</h1>
            <p style="color:#f59e0b;margin:8px 0 0;font-size:13px;font-weight:700;letter-spacing:1px;">EXCLUSIVE VIP OFFER</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <h2 style="color:#0B2345;margin:0 0 16px;font-size:24px;">${heading || 'Special VIP Offer For You! 🎁'}</h2>
            <p style="font-size:15px;color:#555;line-height:1.8;white-space:pre-line;margin-bottom:24px;">${message}</p>

            ${coupon ? `
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
              <p style="margin:0 0 8px;font-size:14px;color:#1e40af;font-weight:600;">USE COUPON CODE AT CHECKOUT</p>
              <div style="font-size:28px;font-weight:800;color:#0B2345;letter-spacing:4px;background:#fff;padding:12px 24px;border-radius:8px;display:inline-block;border:2px dashed #2563eb;margin:8px 0;">
                ${coupon}
              </div>
            </div>
            ` : ''}

            <div style="text-align:center;margin-top:32px;">
              <a href="http://localhost:3000/shop" style="background:#0B2345;color:#fff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;box-shadow:0 4px 12px rgba(11,35,69,0.25);">
                🛍️ Shop Deal Collection Now →
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0B2345;padding:24px 40px;text-align:center;">
            <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:0;">© ${new Date().getFullYear()} Meer Empire · All Rights Reserved</p>
            <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:6px 0 0;">You are receiving this because you subscribed to Meer Empire VIP Club.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // Dispatch broadcast emails
    let sentCount = 0;
    for (const recipient of recipients) {
      try {
        await transporter.sendMail({
          from: `"Meer Empire VIP Deals" <${process.env.GMAIL_USER}>`,
          to: recipient,
          subject: subject,
          html: offerHtml,
        });
        sentCount++;
      } catch (err) {
        console.error(`Failed to send broadcast email to ${recipient}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Broadcast offer email successfully sent to ${sentCount} subscriber(s)!`,
      sentCount,
    });
  } catch (error: any) {
    console.error('Broadcast API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
