/**
 * Lightweight email sender.
 *
 * Reads SMTP credentials from environment variables:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 *
 * When SMTP credentials are not configured (local/dev without a mail server),
 * emails are logged to the console instead of failing the request.
 */

const nodemailer = require("nodemailer");

const smtpHost = process.env.SMTP_HOST;
const smtpUser = process.env.SMTP_USER;

let transporter = null;
let mailConfigured = false;

if (smtpHost && smtpUser) {
  try {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: smtpUser,
        pass: process.env.SMTP_PASS || "",
      },
    });
    mailConfigured = true;
    console.log("[mailer] SMTP configured, email sending enabled");
  } catch (error) {
    console.error("[mailer] Failed to initialize SMTP transport:", error.message);
  }
} else {
  console.log(
    "[mailer] SMTP not configured (SMTP_HOST/SMTP_USER missing) - emails will be logged to console only"
  );
}

/**
 * Send an email. Resolves regardless of success when mail is not configured.
 * @param {{to: string, subject: string, text: string, html?: string}} message
 */
async function sendEmail({ to, subject, text, html }) {
  const from = process.env.SMTP_FROM || "Noor-e-Multan <no-reply@noor-e-multan.example>";
  if (!mailConfigured || !transporter) {
    console.log("[mailer][console-mode] To:", to);
    console.log(`[mailer][console-mode] Subject: ${subject}`);
    console.log("[mailer][console-mode] Body:", (text || html || "").slice(0, 500));
    return { delivered: false, consoleMode: true };
  }

  try {
    const info = await transporter.sendMail({ from, to, subject, text, html });
    console.log(`[mailer] Email sent to ${to}: ${info.messageId}`);
    return { delivered: true, messageId: info.messageId };
  } catch (error) {
    console.error("[mailer] Failed to send email:", error.message);
    return { delivered: false, error: error.message };
  }
}

module.exports = { sendEmail, mailConfigured };
