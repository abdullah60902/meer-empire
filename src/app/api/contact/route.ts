import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ContactMessageModel from '@/models/ContactMessage';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const ADMIN_EMAIL = 'info.meerempire@gmail.com';

// GET /api/contact -> Fetch all messages for Admin Dashboard
export async function GET() {
  try {
    await connectDB();
    const messages = await ContactMessageModel.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/contact -> Submit new contact inquiry
export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Please fill in all required fields (Name, Email, Subject, Message).' },
        { status: 400 }
      );
    }

    await connectDB();

    // 1. Save to Database for Dashboard
    const newMessage = await ContactMessageModel.create({
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      subject,
      message,
      status: 'unread',
    });

    // 2. Send Notification Email to Admin (info.meerempire@gmail.com)
    const adminMailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fa;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#0B2345 0%,#1a3a6e 100%);padding:32px 40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:26px;letter-spacing:2px;">MEER EMPIRE</h1>
            <p style="color:#f59e0b;margin:6px 0 0;font-size:14px;font-weight:700;letter-spacing:1px;">📩 NEW CUSTOMER INQUIRY</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="font-size:16px;color:#333;margin:0 0 20px;line-height:1.6;">You have received a new contact message from the website form:</p>
            
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:24px;margin-bottom:24px;border-left:4px solid #0B2345;">
              <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;color:#334155;">
                <tr>
                  <td width="30%" style="font-weight:700;color:#0B2345;">Sender Name:</td>
                  <td>${name}</td>
                </tr>
                <tr>
                  <td style="font-weight:700;color:#0B2345;">Email Address:</td>
                  <td><a href="mailto:${email}" style="color:#2563eb;text-decoration:none;">${email}</a></td>
                </tr>
                <tr>
                  <td style="font-weight:700;color:#0B2345;">Phone / WhatsApp:</td>
                  <td>${phone ? `<a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}" style="color:#16a34a;text-decoration:none;">${phone} (Chat on WhatsApp)</a>` : 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="font-weight:700;color:#0B2345;">Subject:</td>
                  <td><span style="background:#e0f2fe;color:#0369a1;padding:2px 8px;border-radius:4px;font-weight:600;">${subject}</span></td>
                </tr>
                <tr>
                  <td style="font-weight:700;color:#0B2345;">Submitted At:</td>
                  <td>${new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}</td>
                </tr>
              </table>
            </div>

            <div style="background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:20px;margin-bottom:24px;">
              <p style="margin:0 0 8px;font-size:13px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Message Content:</p>
              <p style="margin:0;font-size:15px;color:#1e293b;line-height:1.7;white-space:pre-wrap;">${message}</p>
            </div>

            <div style="text-align:center;margin-top:28px;">
              <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)} - Meer Empire" style="background:#0B2345;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;margin-right:10px;">
                ✉️ Reply via Email
              </a>
              ${phone ? `<a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}" style="background:#25D366;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;">💬 Reply via WhatsApp</a>` : ''}
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#0B2345;padding:20px 40px;text-align:center;">
            <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:0;">© ${new Date().getFullYear()} Meer Empire Admin Notification System</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
      from: `"Meer Empire Contact Form" <${process.env.GMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: `📩 NEW CONTACT INQUIRY: ${subject} from ${name}`,
      html: adminMailHtml,
    }).catch(err => console.error('Admin inquiry email error:', err));

    // 3. Send Auto-Reply Email to Customer
    const customerMailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fa;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#0B2345 0%,#1a3a6e 100%);padding:36px 40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:28px;letter-spacing:2px;">MEER EMPIRE</h1>
            <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:13px;letter-spacing:1px;">WE RECEIVED YOUR MESSAGE</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <h2 style="color:#0B2345;margin:0 0 16px;font-size:22px;">Hello ${name}, 👋</h2>
            <p style="font-size:15px;color:#475569;line-height:1.7;margin-bottom:20px;">Thank you for contacting <strong>MEER EMPIRE</strong>! We have received your inquiry regarding <strong>"${subject}"</strong> and our support team is reviewing it.</p>
            
            <div style="background:#f1f5f9;border-left:4px solid #0B2345;border-radius:8px;padding:18px;margin-bottom:24px;">
              <p style="margin:0 0 6px;font-size:13px;color:#64748b;font-weight:700;">YOUR MESSAGE SUMMARY:</p>
              <p style="margin:0;font-size:14px;color:#334155;font-style:italic;">"${message}"</p>
            </div>

            <p style="font-size:15px;color:#475569;line-height:1.7;margin-bottom:24px;">We usually reply within a few hours. If your request is urgent, feel free to message our support directly on WhatsApp at <strong>+92 308 7975435</strong>.</p>

            <div style="text-align:center;margin-top:30px;">
              <a href="https://wa.me/923087975435" style="background:#25D366;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
                💬 Chat with Support on WhatsApp
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#0B2345;padding:20px 40px;text-align:center;">
            <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:0;">© ${new Date().getFullYear()} Meer Empire · Dawood Colony, Sargodha Road, Faisalabad</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
      from: `"Meer Empire Support" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: ` We Received Your Inquiry – MEER EMPIRE`,
      html: customerMailHtml,
    }).catch(err => console.error('Customer auto-reply email error:', err));

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully! Our team will get back to you shortly.',
      id: newMessage._id,
    });
  } catch (error: any) {
    console.error('Contact inquiry error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH /api/contact -> Update message status (e.g. read/unread/replied)
export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ success: false, error: 'ID and status required' }, { status: 400 });

    await connectDB();
    await ContactMessageModel.findByIdAndUpdate(id, { status });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/contact -> Delete a message
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: 'Message ID required' }, { status: 400 });

    await connectDB();
    await ContactMessageModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
