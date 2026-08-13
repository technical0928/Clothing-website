const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const prisma = require("../utills/db");
const { asyncHandler, AppError } = require("../utills/errorHandler");
const { sendEmail, mailConfigured } = require("../utills/mailer");

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5; // max wrong OTP entries before the code is invalidated
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds between resend requests

const hashValue = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");

/** Generate a secure random 6-digit code (100000 - 999999). */
function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

/** Generic message so we do not reveal whether an account exists. */
const GENERIC_MESSAGE =
  "If an account exists for this email, a verification code has been sent.";

async function findLatestTokenForEmail(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Any registered account (admin or regular customer) can request a reset
  // code. Unregistered emails get the same generic response (no OTP, no
  // email) so account existence is never revealed.
  if (!user) return { user: null, token: null };
  const token = await prisma.passwordResetToken.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return { user, token };
}

/**
 * POST /api/password-reset/forgot
 * Body: { email }
 * Sends a 6-digit verification code to the account's email. Invalidates old
 * codes for the same account and enforces a 60s resend cooldown.
 */
const requestPasswordReset = asyncHandler(async (request, response) => {
  const { email } = request.body || {};
  if (!email || typeof email !== "string") {
    throw new AppError("Email is required", 400);
  }
  const trimmed = String(email).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    throw new AppError("Invalid email format", 400);
  }

  const { user, token: latestToken } = await findLatestTokenForEmail(trimmed);

  if (!user) {
    return response.status(200).json({ message: GENERIC_MESSAGE, email: trimmed });
  }

  // Resend cooldown: reject requests made within 60s of the last one
  if (latestToken) {
    const elapsed = Date.now() - new Date(latestToken.createdAt).getTime();
    if (elapsed < RESEND_COOLDOWN_MS && !latestToken.usedAt) {
      throw new AppError(
        `Please wait ${Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000)} seconds before requesting a new code.`,
        429
      );
    }
  }

  // Invalidate old codes for this account when a new one is generated
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const otp = generateOtp();

  await prisma.passwordResetToken.create({
    data: {
      token: hashValue(otp), // only the SHA-256 hash is stored
      userId: user.id,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  const text = `Hello,\n\nWe received a request to reset the password for your Noor-e-Multan account.\n\nYour verification code is:\n\n${otp}\n\nThis code will expire in 5 minutes.\n\nIf you did not request this password reset, you can safely ignore this email.\n\nRegards,\nNoor-e-Multan`;
  const html = `<p>Hello,</p><p>We received a request to reset the password for your Noor-e-Multan account.</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">${otp}</p><p>This code will expire in <strong>5 minutes</strong>.</p><p>If you did not request this password reset, you can safely ignore this email.</p><p>Regards,<br/>Noor-e-Multan</p>`;

  await sendEmail({
    to: user.email,
    subject: "Password Reset Code - Noor-e-Multan",
    text,
    html,
  });

  // SECURITY: never expose the OTP in production. Console mode (no SMTP) has
  // no inbox to deliver to, so the code is returned as demoOtp ONLY when the
  // server is explicitly opted in via ALLOW_DEMO_OTP=true (set in server/.env
  // for local development). On any real deployment this flag is absent, so the
  // OTP never appears anywhere except the account's email — a person who knows
  // only the email address cannot take over the account.
  const payload = { message: GENERIC_MESSAGE, email: trimmed, resendAfterMs: RESEND_COOLDOWN_MS };
  if (!mailConfigured && process.env.ALLOW_DEMO_OTP === "true") {
    payload.consoleMode = true;
    payload.demoOtp = otp;
  }
  return response.status(200).json(payload);
});

/**
 * GET /api/password-reset/status?email=
 * Used by the verify page to drive the resend cooldown UI.
 */
const getResetStatus = asyncHandler(async (request, response) => {
  const email = String(request.query.email || "").trim().toLowerCase();
  if (!email) {
    return response.status(200).json({ canResend: false, resendAfterMs: 0 });
  }
  const { user, token } = await findLatestTokenForEmail(email);
  if (!user || !token || token.usedAt) {
    return response.status(200).json({ canResend: true, resendAfterMs: 0 });
  }
  const elapsed = Date.now() - new Date(token.createdAt).getTime();
  const remaining = RESEND_COOLDOWN_MS - elapsed;
  return response.status(200).json({
    canResend: remaining <= 0,
    resendAfterMs: remaining > 0 ? remaining : 0,
    expiresAt: token.expiresAt,
  });
});

/**
 * POST /api/password-reset/verify
 * Body: { email, otp }
 * Checks expiry, attempts and compares the submitted code with the hash.
 */
const verifyOtp = asyncHandler(async (request, response) => {
  const { email, otp } = request.body || {};
  const trimmedEmail = String(email || "").trim().toLowerCase();
  const submittedOtp = String(otp || "").trim();

  if (!trimmedEmail || !submittedOtp) {
    throw new AppError("Email and verification code are required", 400);
  }
  if (!/^\d{6}$/.test(submittedOtp)) {
    throw new AppError("The verification code must be 6 digits", 400);
  }

  const { user, token } = await findLatestTokenForEmail(trimmedEmail);
  const INVALID = "Invalid or expired verification code";

  if (!user || !token || token.usedAt || token.verifiedAt) {
    throw new AppError(INVALID, 400);
  }

  if (token.expiresAt < new Date()) {
    await prisma.passwordResetToken.deleteMany({ where: { id: token.id } });
    throw new AppError("This code has expired. Please request a new one.", 400);
  }

  const hashed = hashValue(submittedOtp);
  const matches = crypto.timingSafeEqual(
    Buffer.from(hashed, "hex"),
    Buffer.from(token.token, "hex")
  );

  if (!matches) {
    const attempts = token.attempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      // Too many wrong attempts — invalidate the code entirely
      await prisma.passwordResetToken.deleteMany({ where: { id: token.id } });
      throw new AppError("Too many incorrect attempts. Please request a new code.", 400);
    }
    await prisma.passwordResetToken.update({
      where: { id: token.id },
      data: { attempts },
    });
    throw new AppError(`${INVALID} (${MAX_ATTEMPTS - attempts} attempts left)`, 400);
  }

  await prisma.passwordResetToken.update({
    where: { id: token.id },
    data: { verifiedAt: new Date() },
  });

  return response.status(200).json({ verified: true, email: trimmedEmail });
});

/**
 * POST /api/password-reset/reset
 * Body: { email, otp, password }
 * Requires a previously verified code, then updates the password (bcrypt).
 */
const resetPassword = asyncHandler(async (request, response) => {
  const { email, otp, password } = request.body || {};
  const trimmedEmail = String(email || "").trim().toLowerCase();
  const submittedOtp = String(otp || "").trim();

  if (!trimmedEmail || !submittedOtp || !password) {
    throw new AppError("Email, verification code and new password are required", 400);
  }
  if (String(password).length < 8) {
    throw new AppError("Password must be at least 8 characters", 400);
  }

  const { user, token } = await findLatestTokenForEmail(trimmedEmail);
  if (!user || !token || token.usedAt) {
    throw new AppError("Invalid or expired verification code", 400);
  }
  if (!token.verifiedAt) {
    throw new AppError("Please verify your code before choosing a new password", 400);
  }
  if (token.expiresAt < new Date()) {
    await prisma.passwordResetToken.deleteMany({ where: { id: token.id } });
    throw new AppError("This code has expired. Please request a new one.", 400);
  }

  const hashed = hashValue(submittedOtp);
  const matches = crypto.timingSafeEqual(
    Buffer.from(hashed, "hex"),
    Buffer.from(token.token, "hex")
  );
  if (!matches) {
    throw new AppError("Invalid or expired verification code", 400);
  }

  const hashedPassword = await bcrypt.hash(String(password), 14);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: token.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return response.status(200).json({ message: "Password reset successfully. You can now log in with your new password." });
});

module.exports = {
  requestPasswordReset,
  verifyOtp,
  resetPassword,
  getResetStatus,
};
