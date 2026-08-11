const prisma = require("../utills/db");
const { asyncHandler } = require("../utills/errorHandler");

// Real dashboard stats pulled directly from the database (Neon PostgreSQL).
const getDashboardStats = asyncHandler(async (request, response) => {
  const [products, categories, merchants, users, orders] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.merchant.count(),
    prisma.user.count(),
    prisma.customer_order.count(),
  ]);

  const revenueAgg = await prisma.customer_order.aggregate({
    _sum: { total: true },
  });

  return response.json({
    products,
    categories,
    merchants,
    users,
    orders,
    revenue: revenueAgg._sum.total || 0,
  });
});

module.exports = {
  getDashboardStats,
};
