import nodemailer from "nodemailer";

export function getTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: false, // port 587 uses STARTTLS
    auth: {
      user: process.env.SMTP_LOGIN || "",
      pass: process.env.SMTP_KEY || "",
    },
  });
}

const FROM = () => process.env.SMTP_FROM || "Averos <no-reply@averos.io>";

export async function sendVerificationEmail(
  to: string,
  name: string,
  link: string,
): Promise<void> {
  await getTransport().sendMail({
    from: FROM(),
    to,
    subject: "Confirm your Averos account",
    text: `Hi ${name},

Welcome to Averos! Please confirm your account by opening this link:

${link}

If you didn't create an account, you can safely ignore this email.`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;color:#1b3a6b">
        <h1 style="color:#1b3a6b;font-size:22px">You're almost there, ${escapeHtml(name)} 🌱</h1>
        <p style="color:#475569;line-height:1.6">
          Welcome to Averos. Confirm your email to activate your account and start
          running plot analyses.
        </p>
        <p style="margin:28px 0">
          <a href="${link}"
             style="background:#1b3a6b;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;display:inline-block">
            Confirm my account
          </a>
        </p>
        <p style="color:#94a3b8;font-size:13px;line-height:1.6">
          Or paste this link into your browser:<br>
          <span style="color:#34d685">${link}</span>
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0">
        <p style="color:#94a3b8;font-size:12px">
          If you didn't create an Averos account, you can ignore this email.
        </p>
      </div>`,
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
