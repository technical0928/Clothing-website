const { asyncHandler, AppError } = require("../utills/errorHandler");
const {
  getMailConfig,
  configureMailer,
  sendTestEmail,
} = require("../utills/mailer");

/** GET /api/settings/email — current SMTP config (no password). */
const getEmailSettings = asyncHandler(async (request, response) => {
  return response.status(200).json(getMailConfig());
});

/** POST /api/settings/email — save SMTP config and re-init the mailer. */
const saveEmailSettings = asyncHandler(async (request, response) => {
  const { host, port, user, pass, from } = request.body || {};

  const hostValue = host !== undefined && host !== null ? String(host).trim() : "";
  const userValue = user !== undefined && user !== null ? String(user).trim() : "";
  const portValue =
    port !== undefined && port !== null ? Number(port) || 587 : 587;

  // Allow clearing fields by sending empty strings; only reject invalid shapes
  if (String(hostValue).length > 0 && !/^[a-zA-Z0-9.-]+$/.test(hostValue)) {
    throw new AppError("Invalid SMTP host", 400);
  }

  // Keep the existing password when the field is left blank
  const passValue =
    pass !== undefined && pass !== null && String(pass).trim() !== ""
      ? String(pass).trim()
      : process.env.SMTP_PASS || "";

  configureMailer({
    host: hostValue,
    port: portValue,
    user: userValue,
    pass: passValue,
    from:
      from !== undefined && from !== null ? String(from).trim() : undefined,
  });

  return response.status(200).json({
    message: "Email settings saved",
    ...getMailConfig(),
  });
});

/** POST /api/settings/email/test — send a test email. */
const testEmail = asyncHandler(async (request, response) => {
  const { to } = request.body || {};
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(to))) {
    throw new AppError("A valid recipient email is required", 400);
  }

  const result = await sendTestEmail(String(to));
  return response.status(200).json(result);
});

module.exports = {
  getEmailSettings,
  saveEmailSettings,
  testEmail,
};
