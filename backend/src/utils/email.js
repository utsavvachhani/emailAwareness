import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// ─── Transporter ──────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper to send mail
const send = async (options) => {
  try {
    await transporter.sendMail(options);
    console.log(`✅ Email sent to: ${options.to}`);
    return true;
  } catch (err) {
    console.error("❌ Email error:", err.message);
    return false;
  }
};

const FROM = `"CyberShield Guard" <${process.env.EMAIL_USER}>`;

// ─── OTP Verification ─────────────────────────────────────────────────────────
export const sendOTP = async (email, otp, purpose = "Email Verification") => {
  return send({
    from: FROM,
    to: email,
    subject: `CyberShield — Your OTP for ${purpose}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;background:#fff;">
        <div style="text-align:center;margin-bottom:24px;">
          <h2 style="margin:0;color:#111827;font-size:24px;">🛡️ CyberShield Guard</h2>
          <p style="color:#6b7280;font-size:14px;margin-top:4px;">Email Awareness Platform</p>
        </div>
        <p style="color:#374151;">Hello,</p>
        <p style="color:#374151;">Your one-time verification code for <strong>${purpose}</strong> is:</p>
        <div style="background:#f9fafb;border:2px dashed #d1d5db;padding:20px;text-align:center;border-radius:8px;margin:20px 0;">
          <span style="font-size:36px;font-weight:bold;letter-spacing:10px;color:#111827;">${otp}</span>
        </div>
        <p style="color:#6b7280;font-size:13px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
        <p style="font-size:12px;color:#9ca3af;text-align:center;">© 2025 CyberShield Guard. All rights reserved.</p>
      </div>
    `,
  });
};

// ─── Password Reset ────────────────────────────────────────────────────────────
export const sendPasswordResetEmail = async (email, otp) => {
  return send({
    from: FROM,
    to: email,
    subject: "CyberShield — Password Reset Request",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;background:#fff;">
        <h2 style="color:#dc2626;text-align:center;">🔐 Password Reset</h2>
        <p>You requested a password reset for your CyberShield Guard account. Use this OTP:</p>
        <div style="background:#fef2f2;border:2px dashed #fca5a5;padding:20px;text-align:center;border-radius:8px;margin:20px 0;">
          <span style="font-size:36px;font-weight:bold;letter-spacing:10px;color:#b91c1c;">${otp}</span>
        </div>
        <p style="color:#6b7280;font-size:13px;">Expires in 10 minutes. If you didn't request this, change your password immediately.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
        <p style="font-size:12px;color:#9ca3af;text-align:center;">© 2025 CyberShield Guard.</p>
      </div>
    `,
  });
};

// ─── Superadmin Login Alert ────────────────────────────────────────────────────
export const sendSuperadminLoginAlert = async (
  loginEmail,
  loginTime,
  ip,
  location,
  userAgent,
  url,
) => {
  const ALERT_EMAILS = ["utsavvachhani.it22@scet.ac.in"];
  return send({
    from: FROM,
    to: ALERT_EMAILS.join(","),
    subject: "🚨 Superadmin Login Alert — CyberShield Guard",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:2px solid #dc2626;border-radius:12px;background:#fff;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
          <span style="font-size:28px;">🚨</span>
          <h2 style="margin:0;color:#dc2626;">Superadmin Login Detected</h2>
        </div>
        <div style="background:#fef2f2;padding:16px;border-radius:8px;margin-bottom:16px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#6b7280;width:40%;">Email:</td><td style="color:#111827;font-weight:600;">${loginEmail}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Login Time:</td><td style="color:#111827;font-weight:600;">${loginTime}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">IP Address:</td><td style="color:#111827;font-weight:600;">${ip || "Unknown"}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Location:</td><td style="color:#111827;font-weight:600;">${location || "Unknown"}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Device/Browser:</td><td style="color:#111827;font-weight:600;">${userAgent || "Unknown"}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Login URL:</td><td style="color:#111827;font-weight:600;"><a href="${url || "#"}" style="color:#2563eb;">${url || "Unknown"}</a></td></tr>
        </div>
        <p style="color:#374151;">If this was not you, please take immediate action to secure the account.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
        <p style="font-size:12px;color:#9ca3af;text-align:center;">CyberShield Guard Security Monitoring © 2025</p>
      </div>
    `,
  });
};

// ─── Admin Registration Alert to Superadmin ───────────────────────────────────
export const sendAdminRegistrationAlert = async (adminName, adminEmail) => {
  const ALERT_EMAILS = [
    "utsavvachhani.it22@scet.ac.in",
    "uvachhani03@gmail.com",
  ];
  return send({
    from: FROM,
    to: ALERT_EMAILS.join(","),
    subject: "🔔 New Admin Registration — Approval Required",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #f59e0b;border-radius:12px;background:#fff;">
        <h2 style="color:#d97706;text-align:center;">👤 New Admin Request</h2>
        <p>A new admin has registered and is awaiting your approval:</p>
        <div style="background:#fffbeb;padding:16px;border-radius:8px;margin:16px 0;">
          <table style="width:100%;">
            <tr><td style="padding:6px 0;color:#6b7280;width:40%;">Name:</td><td style="color:#111827;font-weight:600;">${adminName}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Email:</td><td style="color:#111827;font-weight:600;">${adminEmail}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Time:</td><td style="color:#111827;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td></tr>
          </table>
        </div>
        <p>Please log in to the CyberShield Guard dashboard to approve or reject this request.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
        <p style="font-size:12px;color:#9ca3af;text-align:center;">© 2025 CyberShield Guard</p>
      </div>
    `,
  });
};

// ─── Admin Approval Result ─────────────────────────────────────────────────────
export const sendAdminApprovalResult = async (
  adminEmail,
  adminName,
  approved,
) => {
  return send({
    from: FROM,
    to: adminEmail,
    subject: approved
      ? "✅ Your Admin Account Has Been Approved!"
      : "❌ Admin Account Registration Update",
    html: approved
      ? `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:2px solid #16a34a;border-radius:12px;background:#fff;">
          <h2 style="color:#16a34a;text-align:center;">✅ Account Approved!</h2>
          <p>Dear <strong>${adminName}</strong>,</p>
          <p>Great news! Your admin account on <strong>CyberShield Guard</strong> has been <strong>approved</strong> by the superadmin.</p>
          <p>You can now log in at: <a href="http://localhost:3000/admin/signin" style="color:#2563eb;">Admin Login</a></p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
          <p style="font-size:12px;color:#9ca3af;text-align:center;">© 2025 CyberShield Guard</p>
        </div>
      `
      : `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:2px solid #dc2626;border-radius:12px;background:#fff;">
          <h2 style="color:#dc2626;text-align:center;">Account Not Approved</h2>
          <p>Dear <strong>${adminName}</strong>,</p>
          <p>Unfortunately, your admin account registration on <strong>CyberShield Guard</strong> was <strong>not approved</strong> at this time.</p>
          <p>Please contact the platform administrators for more information.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
          <p style="font-size:12px;color:#9ca3af;text-align:center;">© 2025 CyberShield Guard</p>
        </div>
      `,
  });
};

// ─── Company Created Notification ─────────────────────────────────────────────
export const sendCompanyCreatedNotification = async (
  adminEmail,
  adminName,
  companyName,
  companyId,
) => {
  return send({
    from: FROM,
    to: adminEmail,
    subject: `🏢 Company "${companyName}" Successfully Created — CyberShield Guard`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #3b82f6;border-radius:12px;background:#fff;">
        <h2 style="color:#2563eb;text-align:center;">🏢 Company Created Successfully</h2>
        <p>Dear <strong>${adminName}</strong>,</p>
        <p>Your company has been registered on <strong>CyberShield Guard</strong>. Here are the details:</p>
        <div style="background:#eff6ff;padding:16px;border-radius:8px;margin:16px 0;">
          <table style="width:100%;">
            <tr><td style="padding:6px 0;color:#6b7280;width:40%;">Company Name:</td><td style="color:#111827;font-weight:600;">${companyName}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Company ID:</td><td style="color:#111827;font-weight:600;">${companyId}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Registered At:</td><td style="color:#111827;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td></tr>
          </table>
        </div>
        <p>If you need to add more companies, update your plan, or have any changes, please <strong>contact your Superadmin</strong> or <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/admin/signin" style="color:#2563eb;">log in</a> if you face any access issues.</p>
        <div style="background:#fef3c7;border:1px solid #f59e0b;padding:12px 16px;border-radius:8px;margin:16px 0;">
          <p style="margin:0;color:#92400e;font-size:13px;">💡 <strong>Need changes?</strong> Contact your Superadmin for plan upgrades and additional company slots, or reset your password if you have any login issues.</p>
        </div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
        <p style="font-size:12px;color:#9ca3af;text-align:center;">© 2025 CyberShield Guard. All rights reserved.</p>
      </div>
    `,
  });
};
// ─── Company Status Update Notification ──────────────────────────────────────
export const sendCompanyStatusUpdate = async (
  adminEmail,
  adminName,
  companyName,
  status,
) => {
  const approved = status === "approved";
  return send({
    from: FROM,
    // to: adminEmail,
    to: [EMAIL_ADDRESS],
    subject: approved
      ? `✅ Entity Verified: "${companyName}" — CyberShield Guard`
      : `⚠️ Entity Access Update: "${companyName}" — CyberShield Guard`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid ${approved ? "#16a34a" : "#dc2626"};border-radius:12px;background:#fff;">
        <div style="text-align:center;margin-bottom:20px;">
          <h2 style="margin:0;color:${approved ? "#16a34a" : "#dc2626"};font-size:20px;">${approved ? "✅ Access Granted" : "⚠️ Verification Update"}</h2>
        </div>
        <p>Dear <strong>${adminName}</strong>,</p>
        <p>Your entity registration for <strong>${companyName}</strong> has been <strong>${status}</strong> by the Superadmin.</p>
        
        ${
          approved
            ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:16px;border-radius:8px;margin:20px 0;">
               <p style="margin:0;color:#166534;font-size:14px;">🚀 <strong>Ready for Deployment:</strong> You can now access the full dashboard for this entity, manage employees, and deploy training modules.</p>
             </div>`
            : `<div style="background:#fef2f2;border:1px solid #fecaca;padding:16px;border-radius:8px;margin:20px 0;">
               <p style="margin:0;color:#b91c1c;font-size:14px;">🔒 <strong>Access Restricted:</strong> For detail regarding this update, please contact the Superadmin hub through your primary support channel.</p>
             </div>`
        }
        
        <div style="text-align:center;margin-top:24px;">
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/admin/dashboard/companies" 
             style="background:${approved ? "#2563eb" : "#4b5563"};color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;">
             ${approved ? "Launch Dashboard" : "View Entities"}
          </a>
        </div>
        
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
        <p style="font-size:12px;color:#9ca3af;text-align:center;">CyberShield Guard Entity Management Suite © 2025</p>
      </div>
    `,
  });
};

// ─── Course Assignment Notification ───────────────────────────────────────────
export const sendCourseAssignmentEmail = async (
  email,
  name,
  courseTitle,
  password,
) => {
  return send({
    from: FROM,
    to: email,
    subject: `🎓 New Training Assigned: "${courseTitle}" — CyberShield Guard`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #6366f1;border-radius:12px;background:#fff;">
        <div style="text-align:center;margin-bottom:20px;">
          <h2 style="margin:0;color:#6366f1;font-size:20px;">🎓 Training Assignment</h2>
        </div>
        <p>Dear <strong>${name}</strong>,</p>
        <p>A new cybersecurity training course has been assigned to you: <strong>"${courseTitle}"</strong>.</p>
        
        <div style="background:#f5f3ff;border:1px solid #ddd6fe;padding:20px;border-radius:12px;margin:24px 0;">
          <h3 style="margin-top:0;color:#5b21b6;font-size:16px;">🔑 Your Access Credentials</h3>
          <p style="margin:8px 0;font-size:14px;color:#4c1d95;">Login ID: <strong>${email}</strong></p>
          <p style="margin:8px 0;font-size:14px;color:#4c1d95;">Initial Password: <code style="background:#fff;padding:4px 8px;border-radius:4px;border:1px solid #ddd6fe;font-weight:bold;">${password}</code></p>
        </div>

        <p style="color:#4b5563;font-size:14px;line-height:1.6;">Please log in to your dashboard to begin your training. We recommend changing your password after your first login.</p>
        
        <div style="text-align:center;margin-top:32px;">
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/user/signin" 
             style="background:#6366f1;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4);">
             Access Training Dashboard
          </a>
        </div>
        
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;">
        <p style="font-size:11px;color:#9ca3af;text-align:center;line-height:1.4;">
          This is an automated security notification from CyberShield Guard.<br/>
          If you believe this was sent in error, please contact your company's IT administrator.
        </p>
      </div>
    `,
  });
};

// ─── Certificate Completion Notification ──────────────────────────────────────
export const sendCertificateEmail = async (
  email,
  name,
  courseTitle,
  pdfBuffer,
) => {
  return send({
    from: FROM,
    to: email,
    subject: `🏆 Achievement Unlocked: Certificate for "${courseTitle}" — CyberShield Guard`,
    attachments: [
      {
        filename: `Certificate_${courseTitle.replace(/\s+/g, '_')}.pdf`,
        content: pdfBuffer,
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:2px solid #10b981;border-radius:12px;background:#fff;">
        <div style="text-align:center;margin-bottom:20px;">
          <h2 style="margin:0;color:#10b981;font-size:24px;">🏆 Congratulations!</h2>
          <p style="color:#6b7280;font-size:14px;margin-top:4px;">Enterprise Security Achievement</p>
        </div>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Outstanding work! You have successfully completed and mastered the <strong>"${courseTitle}"</strong> cybersecurity curriculum.</p>
        
        <div style="background:#ecfdf5;border:1px solid #a7f3d0;padding:24px;border-radius:12px;text-align:center;margin:24px 0;">
          <div style="font-size:40px;margin-bottom:12px;">📄</div>
          <h3 style="margin:0;color:#065f46;font-size:18px;">Your Performance Certificate</h3>
          <p style="margin:8px 0;font-size:13px;color:#047857;line-height:1.5;">We've attached your official high-fidelity credential to this email for your records.</p>
        </div>
        
        <p style="color:#4b5563;font-size:14px;line-height:1.6;">This accomplishment demonstrates your commitment to organizational security and digital resilience. Keep up the great work!</p>
        
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;">
        <p style="font-size:11px;color:#9ca3af;text-align:center;">
          CyberShield Guard Enterprise Compliance Hub © 2025<br/>
          Verified Security Training Credentials
        </p>
      </div>
    `,
  });
};
// ─── Payment Receipt Notification ─────────────────────────────────────────────
export const sendPaymentReceipt = async (
  email,
  name,
  companyName,
  transactionId,
  planName,
  amount,
) => {
  return send({
    from: FROM,
    to: email,
    subject: `🧾 Payment Receipt: Transaction ${transactionId} — CyberShield Guard`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:24px;background:#fff;color:#1f2937;">
        <div style="text-align:center;margin-bottom:32px;">
          <h2 style="margin:0;color:#2563eb;font-size:24px;font-style:italic;font-weight:900;">🛡️ CyberShield Guard</h2>
          <p style="color:#6b7280;font-size:12px;margin-top:4px;text-transform:uppercase;letter-spacing:2px;font-weight:bold;">Enterprise Hub • Payment Confirmation</p>
        </div>
        
        <div style="border-top:4px solid #2563eb;padding-top:24px;margin-bottom:32px;">
          <h3 style="margin:0;color:#111827;font-size:18px;">Payment Successful</h3>
          <p style="color:#6b7280;font-size:14px;margin-top:4px;">Thank you for your business, ${name}. Your entity dashboard for <strong>${companyName}</strong> is now fully active.</p>
        </div>

        <div style="background:#f9fafb;border-radius:16px;padding:24px;margin-bottom:32px;">
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#6b7280;width:40%;">Transaction ID:</td><td style="color:#111827;font-weight:700;font-family:monospace;">${transactionId}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;">Date:</td><td style="color:#111827;font-weight:600;">${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;">Billed To:</td><td style="color:#111827;font-weight:600;">${companyName}</td></tr>
            <tr><td style="padding:24px 0 8px 0;border-bottom:1px solid #e5e7eb;" colspan="2"></td></tr>
            <tr><td style="padding:16px 0 8px 0;color:#111827;font-weight:700;font-size:16px;">${planName}</td><td style="padding:16px 0 8px 0;color:#111827;font-weight:900;font-size:18px;text-align:right;">${amount}</td></tr>
            <tr><td style="color:#6b7280;font-size:12px;">Full Awareness Strategy & Training Suite</td><td></td></tr>
          </table>
        </div>

        <div style="text-align:center;margin-bottom:32px;">
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/admin/signin" 
             style="background:#2563eb;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.4);">
             Go to Dashboard
          </a>
        </div>
        
        <p style="font-size:12px;color:#9ca3af;text-align:center;line-height:1.6;">
          This is an electronically generated receipt and does not require a physical signature.<br/>
          CyberShield Guard Enterprise Compliance Hub © 2025
        </p>
      </div>
    `,
  });
};
