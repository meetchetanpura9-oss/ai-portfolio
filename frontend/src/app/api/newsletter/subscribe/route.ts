import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
      "Access-Control-Allow-Headers":
        "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return NextResponse.json({ detail: "Enter a valid email address" }, { status: 422 });
    }

    const cleanEmail = email.trim();

    const mailServer = process.env.MAIL_SERVER?.trim();
    const mailPortValue = process.env.MAIL_PORT?.trim();
    const mailUser = process.env.MAIL_USERNAME?.trim();
    const mailPass = process.env.MAIL_PASSWORD?.trim();
    const adminEmail = process.env.ADMIN_EMAIL?.trim();
    const mailPort = Number(mailPortValue);
    if (!mailServer || !mailPortValue || !mailUser || !mailPass || !adminEmail ||
        !/^\d+$/.test(mailPortValue) || mailPort < 1 || mailPort > 65535) {
      return NextResponse.json({ detail: "Mail service is not configured" }, { status: 503 });
    }
    const siteName = process.env.SITE_NAME?.trim() || "Chetanpura Meet — AI Portfolio";

    // Transporter
    const transporter = nodemailer.createTransport({
      host: mailServer,
      port: mailPort,
      secure: mailPort === 465,
      auth: {
        user: mailUser,
        pass: mailPass,
      },
    });

    const escapeHtml = (value = "") =>
      String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }) + " (IST)";

    // 1. Admin Alert Email HTML Template
    const adminHtml = `
      <html>
        <body style="margin:0;font-family:Arial,sans-serif;background:#0A0A0F;color:#eee;padding:24px;">
          <div style="max-width:620px;margin:0 auto;background:#14141f;border:1px solid #333;border-radius:14px;padding:28px;box-shadow: 0 4px 20px rgba(139, 92, 246, 0.15);">
            <p style="margin:0 0 8px;color:#38bdf8;font-size:13px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;">
              New Newsletter Subscriber
            </p>
            <h2 style="color:#fff;margin:0 0 10px;font-size:24px;">New Subscriber Alert</h2>
            <p style="color:#aaa;font-size:14px;line-height:1.6;margin:0 0 24px;">
              A visitor subscribed to your newsletter list on your AI Portfolio website.
            </p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:10px 0;color:#888;width:120px;">Email</td><td style="padding:10px 0;color:#fff;"><strong><a href="mailto:${escapeHtml(cleanEmail)}" style="color:#38bdf8;text-decoration:none;">${escapeHtml(cleanEmail)}</a></strong></td></tr>
              <tr><td style="padding:10px 0;color:#888;">Timestamp</td><td style="padding:10px 0;color:#9ca3af;font-size:12px;">${escapeHtml(timestamp)}</td></tr>
            </table>
            <p style="margin:24px 0 0;font-size:11px;color:#555;text-align:center;">
              Sent securely via Next.js serverless route.
            </p>
          </div>
        </body>
      </html>
    `;

    const adminText = `New newsletter subscriber: ${cleanEmail}\nTimestamp: ${timestamp}`;

    // 2. Client Auto-Reply Email HTML Template
    const subscriberHtml = `
      <html>
        <body style="margin:0;font-family:Arial,sans-serif;background:#0A0A0F;color:#eee;padding:24px;">
          <div style="max-width:560px;margin:0 auto;background:#14141f;border:1px solid #333;border-radius:14px;padding:28px;box-shadow: 0 4px 20px rgba(139, 92, 246, 0.1);">
            <h2 style="color:#a78bfa;margin:0 0 16px;">Welcome to my Newsletter!</h2>
            <p style="line-height:1.7;color:#ddd;font-size:15px;margin:0;">
              Thank you for subscribing to my newsletter. You've been successfully subscribed with: <strong>${escapeHtml(cleanEmail)}</strong>.
            </p>
            <p style="line-height:1.7;color:#aaa;font-size:14px;margin:18px 0 0;">
              I will keep you updated with AI/ML articles, automation workflows, and my latest open-source project releases.
            </p>
            <div style="margin-top:28px;border-top:1px solid #222;padding-top:16px;color:#888;font-size:13px;">
              <p style="margin:0;"><strong>Chetanpura Meet</strong><br>AI & Automation Engineer</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const subscriberText = `Welcome to my newsletter!\n\nYou've been successfully subscribed with the email: ${cleanEmail}.\n\nI will keep you updated with my latest articles and projects.\n\nBest regards,\nMeet Chetanpura`;

    // Send emails in parallel
    await Promise.all([
      transporter.sendMail({
        from: `"${siteName}" <${mailUser}>`,
        to: adminEmail,
        subject: `🔔 New Newsletter Subscriber: ${cleanEmail}`,
        text: adminText,
        html: adminHtml,
      }),
      transporter.sendMail({
        from: `"${siteName}" <${mailUser}>`,
        to: cleanEmail,
        subject: `Welcome to Meet Chetanpura's Newsletter!`,
        text: subscriberText,
        html: subscriberHtml,
      }),
    ]);

    return NextResponse.json(
      {
        message: "Thank you! You have subscribed successfully.",
        created_at: new Date().toISOString(),
      },
      {
        status: 201,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { detail: "Mail service is unavailable" },
      { status: 502 }
    );
  }
}
