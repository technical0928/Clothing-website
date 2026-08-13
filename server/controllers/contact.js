const prisma = require("../utills/db");
const { asyncHandler, AppError } = require("../utills/errorHandler");
const { sendEmail, mailConfigured } = require("../utills/mailer");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/contact
 * Body: { name, email, message }
 * Sends the customer's message to the store inbox (admin).
 * The recipient is CONTACT_TO when set, otherwise the SMTP user/from address.
 */
const sendContactMessage = asyncHandler(async (request, response) => {
  const { name, email, message } = request.body || {};

  const trimmedName = String(name || "").trim();
  const trimmedEmail = String(email || "").trim().toLowerCase();
  const trimmedMessage = String(message || "").trim();

  if (!trimmedName) {
    throw new AppError("Please enter your name", 400);
  }
  if (trimmedName.length > 100) {
    throw new AppError("Name is too long (max 100 characters)", 400);
  }
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    throw new AppError("Please enter a valid email address", 400);
  }
  if (!trimmedMessage) {
    throw new AppError("Please write your message", 400);
  }
  if (trimmedMessage.length < 10) {
    throw new AppError("Your message should be at least 10 characters", 400);
  }
  if (trimmedMessage.length > 2000) {
    throw new AppError("Message is too long (max 2000 characters)", 400);
  }

  // Deliver to the store inbox: explicit CONTACT_TO override, otherwise the
  // SMTP account that sends the mail (same address in practice).
  const recipient =
    process.env.CONTACT_TO ||
    process.env.SMTP_USER ||
    process.env.SMTP_FROM ||
    "";

  if (!recipient) {
    throw new AppError("Contact email is not configured on the server", 500);
  }

  const subject = `New Contact Message from ${trimmedName}`;
  // Frontend URL for the “view in admin panel” link in the notification
  // email. Falls back to the NextAuth/FRONTEND URL so it works in dev and
  // production without extra config.
  const frontendUrl =
    process.env.FRONTEND_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";
  const adminMessagesUrl = `${frontendUrl.replace(/\/$/, "")}/admin/messages`;
  const safeName = trimmedName.replace(/</g, "&lt;");
  const safeEmail = trimmedEmail.replace(/</g, "&lt;");
  const safeMessage = trimmedMessage.replace(/</g, "&lt;");

  const text = `You received a new contact message from the Noor-e-Multan website.\n\nName: ${trimmedName}\nEmail: ${trimmedEmail}\n\nMessage:\n${trimmedMessage}\n\nView it in the admin panel: ${adminMessagesUrl}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e7e5e4;border-radius:8px">
      <h2 style="margin:0 0 16px;color:#1c1917">New Contact Message — Noor-e-Multan</h2>
      <p style="color:#57534e;margin:0 0 16px">A customer sent a message from the website contact page.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr>
          <td style="padding:8px 12px;background:#f5f5f4;border:1px solid #e7e5e4;color:#78716c;width:90px">Name</td>
          <td style="padding:8px 12px;border:1px solid #e7e5e4;color:#1c1917"><strong>${safeName}</strong></td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background:#f5f5f4;border:1px solid #e7e5e4;color:#78716c">Email</td>
          <td style="padding:8px 12px;border:1px solid #e7e5e4;color:#1c1917"><a href="mailto:${safeEmail}">${safeEmail}</a></td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background:#f5f5f4;border:1px solid #e7e5e4;color:#78716c;vertical-align:top">Message</td>
          <td style="padding:8px 12px;border:1px solid #e7e5e4;color:#1c1917;white-space:pre-wrap">${safeMessage}</td>
        </tr>
      </table>
      <p style="margin:20px 0 0">
        <a href="${adminMessagesUrl}" style="display:inline-block;background:#1c1917;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:bold">View in admin panel</a>
      </p>
      <p style="color:#a8a29e;font-size:12px;margin:16px 0 0">Reply to the customer directly at ${safeEmail}.</p>
    </div>
  `;

  // Always persist the message to Neon so it can be reviewed in the admin
  // panel even if the email fails or SMTP is not configured.
  let savedMessage = null;
  try {
    savedMessage = await prisma.contactMessage.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
      },
    });
  } catch (error) {
    console.error("[contact] Failed to save message to database:", error.message);
  }

  await sendEmail({
    to: recipient,
    subject,
    text,
    html,
  });

  return response.status(200).json({
    message: mailConfigured
      ? "Your message has been sent. We will get back to you soon!"
      : "Your message has been received. We will get back to you soon!",
    id: savedMessage ? savedMessage.id : null,
  });
});

/**
 * GET /api/contact — list contact messages (newest first).
 * Query: ?read=true|false to filter, ?limit= to cap the count.
 * Admin-only: checked in the route handler.
 */
const listContactMessages = asyncHandler(async (request, response) => {
  const { read, limit } = request.query;
  const where = {};
  if (read === "true") where.isRead = true;
  if (read === "false") where.isRead = false;

  const take = Math.min(Number(limit) || 100, 500);
  const [messages, unreadCount, totalCount] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
    }),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.contactMessage.count(),
  ]);

  return response.status(200).json({ messages, unreadCount, totalCount });
});

/**
 * PATCH /api/contact/:id — mark a message read/unread.
 * Body: { isRead: boolean }
 */
const updateContactMessage = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const { isRead } = request.body || {};

  if (!id) {
    throw new AppError("Message ID is required", 400);
  }

  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Message not found", 404);
  }

  const updated = await prisma.contactMessage.update({
    where: { id },
    data: { isRead: Boolean(isRead) },
  });
  return response.status(200).json(updated);
});

/**
 * DELETE /api/contact/:id — remove a contact message.
 */
const deleteContactMessage = asyncHandler(async (request, response) => {
  const { id } = request.params;
  if (!id) {
    throw new AppError("Message ID is required", 400);
  }
  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Message not found", 404);
  }
  await prisma.contactMessage.delete({ where: { id } });
  return response.status(200).json({ message: "Message deleted" });
});

module.exports = {
  sendContactMessage,
  listContactMessages,
  updateContactMessage,
  deleteContactMessage,
};
