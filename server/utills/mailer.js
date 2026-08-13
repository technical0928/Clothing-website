/**
 * Lightweight email sender.
 *
 * Reads SMTP credentials from environment variables:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_SECURE
 *
 * When SMTP credentials are not configured (local/dev without a mail server),
 * emails are logged to the console instead of failing the request.
 *
 * The transporter can also be (re)configured at runtime via configureMailer()
 * so the admin panel can save SMTP settings without restarting the API.
 */

const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

let transporter = null;
let mailConfigured = false;

function initTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;

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
      transporter = null;
      mailConfigured = false;
    }
  } else {
    transporter = null;
    mailConfigured = false;
    console.log(
      "[mailer] SMTP not configured (SMTP_HOST/SMTP_USER missing) - emails will be logged to console only"
    );
  }
}

// Initial configuration from the environment at startup
initTransporter();

/** Path of the server .env file that holds SMTP credentials. */
const ENV_PATH = path.join(__dirname, "..", ".env");

/**
 * Persist SMTP settings to server/.env and (re)initialize the transporter.
 * Values are only written when provided so clearing one field works too.
 * @param {{host?: string, port?: number|string, user?: string, pass?: string, from?: string, secure?: boolean}} settings
 */
function configureMailer(settings = {}) {
  const entries = {
    SMTP_HOST: settings.host,
    SMTP_PORT: settings.port,
    SMTP_USER: settings.user,
    SMTP_PASS: settings.pass,
    SMTP_FROM: settings.from,
    SMTP_SECURE: settings.secure === true ? "true" : "false",
  };

  let content = "";
  if (fs.existsSync(ENV_PATH)) {
    content = fs.readFileSync(ENV_PATH, "utf8");
  }

  const lines = content.split(/\r?\n/);
  const keys = Object.keys(entries);
  const existingKeys = new Set();

  lines.forEach((line) => {
    const match = line.match(/^([A-Z_]+)=/);
    if (match) existingKeys.add(match[1]);
  });

  // Update existing lines in place, keep their position
  const updated = lines.map((line) => {
    const match = line.match(/^(SMTP_[A-Z]+)=/);
    if (!match || !(match[1] in entries)) return line;
    const value = entries[match[1]];
    if (value === undefined || value === null) return line;
    return `${match[1]}=${String(value)}`;
  });

  // Append keys that were not present
  keys.forEach((key) => {
    if (!existingKeys.has(key) && entries[key] !== undefined && entries[key] !== null) {
      updated.push(`${key}=${entries[key]}`);
    }
  });

  const newContent = updated.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
  fs.writeFileSync(ENV_PATH, newContent, "utf8");

  // Apply to the running process
  keys.forEach((key) => {
    if (entries[key] !== undefined && entries[key] !== null) {
      process.env[key] = String(entries[key]);
    }
  });

  initTransporter();
}

/** Return the current SMTP config WITHOUT the password. */
function getMailConfig() {
  return {
    configured: mailConfigured,
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || "",
    from: process.env.SMTP_FROM || "",
    hasPassword: Boolean(process.env.SMTP_PASS),
  };
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

/**
 * Send a test email using the current configuration (works even in
 * console mode so the admin can see the mailer is wired up).
 */
async function sendTestEmail(to) {
  const result = await sendEmail({
    to,
    subject: "Test email from Noor-e-Multan",
    text: "This is a test email from the Noor-e-Multan website. If you received this, email sending is working correctly.",
    html: "<p>This is a <strong>test email</strong> from the Noor-e-Multan website.</p><p>If you received this, email sending is working correctly.</p>",
  });
  return {
    ...result,
    configured: mailConfigured,
    message: mailConfigured
      ? "Test email sent through SMTP"
      : "Email was logged to the console (SMTP not configured)",
  };
}

module.exports = { sendEmail, sendTestEmail, configureMailer, getMailConfig, mailConfigured };
