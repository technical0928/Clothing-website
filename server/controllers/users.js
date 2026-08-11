const prisma = require("../utills/db");
const bcrypt = require("bcryptjs");
const { asyncHandler, AppError } = require("../utills/errorHandler");

// Helper function to exclude password from user object
function excludePassword(user) {
  if (!user) return user;
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

const getAllUsers = asyncHandler(async (request, response) => {
  const users = await prisma.user.findMany({});
  // Exclude password from all users
  const usersWithoutPasswords = users.map(user => excludePassword(user));
  return response.json(usersWithoutPasswords);
});

const createUser = asyncHandler(async (request, response) => {
  const { email, password, role, name, lastname, phone, address, city, country, postalCode } = request.body;

  // Basic validation
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError("Invalid email format", 400);
  }

  // Password validation
  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters long", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 14);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: role || "user",
      name: name || null,
      lastname: lastname || null,
      phone: phone || null,
      address: address || null,
      city: city || null,
      country: country || null,
      postalCode: postalCode || null,
    },
  });
  // Exclude password from response
  return response.status(201).json(excludePassword(user));
});

const updateUser = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const { email, password, role, name, lastname, phone, address, city, country, postalCode } = request.body;

  if (!id) {
    throw new AppError("User ID is required", 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  // Prepare update data
  const updateData = {};
  if (email !== undefined && email !== null && String(email).trim() !== "") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError("Invalid email format", 400);
    }
    updateData.email = String(email).trim();
  }
  if (password) {
    if (password.length < 8) {
      throw new AppError("Password must be at least 8 characters long", 400);
    }
    updateData.password = await bcrypt.hash(password, 14);
  }
  if (role !== undefined && role !== null) {
    updateData.role = role;
  }
  // Profile fields (only update keys that were explicitly sent)
  const profileFields = { name, lastname, phone, address, city, country, postalCode };
  for (const [field, value] of Object.entries(profileFields)) {
    if (value !== undefined && value !== null) {
      const trimmed = String(value).trim();
      updateData[field] = trimmed === "" ? null : trimmed;
    }
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: existingUser.id,
    },
    data: updateData,
  });

  // Exclude password from response
  return response.status(200).json(excludePassword(updatedUser));
});

const deleteUser = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("User ID is required", 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  await prisma.user.delete({
    where: {
      id: id,
    },
  });
  return response.status(204).send();
});

const getUser = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("User ID is required", 400);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  
  if (!user) {
    throw new AppError("User not found", 404);
  }
  
  // Exclude password from response
  return response.status(200).json(excludePassword(user));
});

const getUserByEmail = asyncHandler(async (request, response) => {
  const { email } = request.params;

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  
  if (!user) {
    throw new AppError("User not found", 404);
  }
  
  // Exclude password from response
  return response.status(200).json(excludePassword(user));
});

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getUser,
  getAllUsers,
  getUserByEmail,
};
