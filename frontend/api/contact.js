const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ detail: "Method not allowed" });
    return;
  }

  try {
    const { full_name, email, phone, company, service, message, website } = req.body;

    // 1. Honeypot check (spam prevention)
    if (website && website.trim().length > 0) {
      console.warn("Spam submission blocked via honeypot field");
      // Return 201 success to silence the spam bot
      res.status(201).json({
        id: Date.now(),
        message: "Thank you! Your message has been received successfully.",
        created_at: new Date().toISOString(),
      });
      return;
    }

    // 2. Server-side validation
    if (!full_name || full_name.trim().length < 2) {
      res.status(422).json({ detail: "Name must be at least 2 characters" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      res.status(422).json({ detail: "Enter a valid email address" });
      return;
    }

    if (!phone || phone.trim().length < 7) {
      res.status(422).json({ detail: "Enter a valid phone number" });
      return;
    }

    if (!service || service.trim().length < 2) {
      res.status(422).json({ detail: "Please select a service" });
      return;
    }

    if (!message || message.trim().length < 10) {
      res.status(422).json({ detail: "Message must be at least 10 characters" });
      return;
    }

    // 3. Email Settings from environment variables
        const mailServer = process.env.MAIL_SERVER || "smtp.gmail.com";
    const mailPort = parseInt(process.env.MAIL_PORT || "587", 10);
    const mailUser = process.env.MAIL_USERNAME || "meetchetanpura9@gmail.com";
    // Gmail App Password
    const mailPass = process.env.MAIL_PASSWORD || "jcqa snot clus xkig"; 
    const adminEmail = process.env.ADMIN_EMAIL || "meetchetanpura9@gmail.com";
    const siteName = process.env.SITE_NAME || "Chetanpura Meet — AI Portfolio";

    // 4. Configure Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      host: mailServer,
      port: mailPort,
      secure: mailPort === 465, // true for 465, false for other ports
      auth: {
        user: mailUser,
        pass: mailPass,
      },
      tls: {
        rejectUnauthorized: false, // Bypass SSL validation issues on serverless host
      },
    });

    const escapeHtml = (value = "") =>
      String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");
    const timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }) + " (IST)";
    const cleanCompany = company ? company.trim() : "Not specified";

    // 5. Admin Notification HTML Template (Premium tech aesthetic)
    const adminHtml = `
      <html>
        <body style="margin:0;font-family:Arial,sans-serif;background:#0A0A0F;color:#eee;padding:24px;">
          <div style="max-width:620px;margin:0 auto;background:#14141f;border:1px solid #333;border-radius:14px;padding:28px;box-shadow: 0 4px 20px rgba(139, 92, 246, 0.15);">
            <p style="margin:0 0 8px;color:#34d399;font-size:13px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;">
              New Client Connection
            </p>
            <h2 style="color:#fff;margin:0 0 10px;font-size:24px;">${escapeHtml(full_name)} wants to collaborate</h2>
            <p style="color:#aaa;font-size:14px;line-height:1.6;margin:0 0 24px;">
              A visitor filled out the contact form on your AI Portfolio website.
            </p>

            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:10px 0;color:#888;width:120px;">Name</td><td style="padding:10px 0;color:#fff;"><strong>${escapeHtml(full_name)}</strong></td></tr>
              <tr><td style="padding:10px 0;color:#888;">Email</td><td style="padding:10px 0;color:#fff;"><a href="mailto:${escapeHtml(email)}" style="color:#38bdf8;text-decoration:none;">${escapeHtml(email)}</a></td></tr>
              <tr><td style="padding:10px 0;color:#888;">Phone</td><td style="padding:10px 0;color:#fff;">${escapeHtml(phone)}</td></tr>
              <tr><td style="padding:10px 0;color:#888;">Company</td><td style="padding:10px 0;color:#fff;">${escapeHtml(cleanCompany)}</td></tr>
              <tr><td style="padding:10px 0;color:#888;">Service Needed</td><td style="padding:10px 0;color:#c084fc;font-weight:bold;">${escapeHtml(service)}</td></tr>
              <tr><td style="padding:10px 0;color:#888;">Timestamp</td><td style="padding:10px 0;color:#9ca3af;font-size:12px;">${escapeHtml(timestamp)}</td></tr>
            </table>

            <div style="margin-top:24px;padding:18px;background:#0A0A0F;border-radius:10px;border:1px solid #2a2a3a;">
              <p style="margin:0 0 10px;color:#a78bfa;font-size:12px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;">Client Message</p>
              <p style="margin:0;line-height:1.7;color:#eee;white-space:pre-wrap;">${safeMessage}</p>
            </div>

            <p style="margin:24px 0 0;font-size:11px;color:#555;text-align:center;">
              Sent securely via Vercel Serverless Edge network.
            </p>
          </div>
        </body>
      </html>
    `;

    const adminText = `New contact form submission from ${full_name}\n\n` +
      `Email: ${email}\n` +
      `Phone: ${phone}\n` +
      `Company: ${cleanCompany}\n` +
      `Service: ${service}\n` +
      `Timestamp: ${timestamp}\n\n` +
      `Message:\n${message}`;

    // 6. Client Auto-Reply HTML Template (Recruiter-friendly branding)
    const clientHtml = `
      <html>
        <body style="margin:0;font-family:Arial,sans-serif;background:#0A0A0F;color:#eee;padding:24px;">
          <div style="max-width:560px;margin:0 auto;background:#14141f;border:1px solid #333;border-radius:14px;padding:28px;box-shadow: 0 4px 20px rgba(139, 92, 246, 0.1);">
            <h2 style="color:#a78bfa;margin:0 0 16px;">Thanks for connecting with me, ${escapeHtml(full_name)}!</h2>
            <p style="line-height:1.7;color:#ddd;font-size:15px;margin:0;">
              Your message was sent successfully. I have received your request for <strong>${escapeHtml(service)}</strong> and will contact you soon.
            </p>
            <div style="margin-top:18px;padding:18px;background:#0A0A0F;border-radius:12px;border:1px solid #2a2a3a;">
              <p style="margin:0 0 8px;color:#a78bfa;font-size:12px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;">Your submitted message</p>
              <p style="margin:0;line-height:1.7;color:#eee;white-space:pre-wrap;">${safeMessage}</p>
            </div>
            <p style="line-height:1.7;color:#aaa;font-size:14px;margin:18px 0 0;">
              I typically reply within 24 to 48 hours. Looking forward to discussing how we can work together!
            </p>
            
            <div style="margin-top:28px;border-top:1px solid #222;padding-top:16px;color:#888;font-size:13px;display:flex;align-items:center;">
              <p style="margin:0;"><strong>Chetanpura Meet</strong><br>AI & Automation Engineer<br><a href="https://wa.me/919998471715" style="color:#22d3ee;text-decoration:none;">WhatsApp Chat</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    const clientText = `Thank you for contacting us, ${full_name}!\n\n` +
      `Your message for ${service}:\n${message}\n\n` +
      `We will reply to you as soon as possible.`;

    // 7. Fire off emails concurrently
    await Promise.all([
      transporter.sendMail({
        from: `"${siteName}" <${mailUser}>`,
        to: adminEmail,
        replyTo: email,
        subject: `💼 Connection from ${full_name} (${service})`,
        text: adminText,
        html: adminHtml,
      }),
      transporter.sendMail({
        from: `"${siteName}" <${mailUser}>`,
        to: email,
        subject: `Thanks for connecting with me!`,
        text: clientText,
        html: clientHtml,
      }),
    ]);

    // 8. Return success response
    res.status(201).json({
      id: Date.now(),
      message: "Thank you! Your message has been received successfully.",
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Serverless form error:", error);
    res.status(500).json({
      detail: "Mail service error: " + (error.message || "Something went wrong"),
    });
  }
};
