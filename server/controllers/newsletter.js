const prisma = require("../utills/db");
const { asyncHandler, AppError } = require("../utills/errorHandler");

const subscribe = asyncHandler(async (request, response) => {
  const { email } = request.body || {};

  if (!email || typeof email !== "string" || email.trim().length === 0) {
    throw new AppError("Email is required", 400);
  }

  const normalized = String(email).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    throw new AppError("Please enter a valid email address", 400);
  }

  // Idempotent: subscribing twice is not an error, we just don't duplicate.
  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email: normalized },
  });

  if (existing) {
    return response.status(200).json({
      message: "You are already subscribed to our newsletter",
      alreadySubscribed: true,
    });
  }

  const subscriber = await prisma.newsletterSubscriber.create({
    data: { email: normalized },
  });

  return response.status(201).json({
    message: "Successfully subscribed to our newsletter",
    id: subscriber.id,
  });
});

module.exports = { subscribe };
