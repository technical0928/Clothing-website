/**
 * Reset all test/dummy data from the Neon database.
 * Preserves: technicalsothikhan0928@gmail.com, abdureman0928@gmail.com
 * FK-safe order: child tables first, parent tables last.
 */
const prisma = require("../utills/db");

const PRESERVE_ADMINS = [
  "technicalsothikhan0928@gmail.com",
  "abdureman0928@gmail.com",
];

async function main() {
  console.log("=== DATA RESET START ===\n");

  // 1. bulk_upload_item (references Product + batch)
  const items = await prisma.bulk_upload_item.deleteMany();
  console.log(`1. bulk_upload_item deleted: ${items.count}`);

  // 2. bulk_upload_batch (references User)
  const batches = await prisma.bulk_upload_batch.deleteMany();
  console.log(`2. bulk_upload_batch deleted: ${batches.count}`);

  // 3. customer_order_product (references Order + Product)
  const orderProducts = await prisma.customer_order_product.deleteMany();
  console.log(`3. customer_order_product deleted: ${orderProducts.count}`);

  // 4. customer_order
  const orders = await prisma.customer_order.deleteMany();
  console.log(`4. customer_order deleted: ${orders.count}`);

  // 5. wishlist (references Product + User)
  const wishlist = await prisma.wishlist.deleteMany();
  console.log(`5. wishlist deleted: ${wishlist.count}`);

  // 6. password_reset_token (references User)
  const tokens = await prisma.passwordResetToken.deleteMany();
  console.log(`6. password_reset_token deleted: ${tokens.count}`);

  // 7. notification (references User)
  const notifications = await prisma.notification.deleteMany();
  console.log(`7. notification deleted: ${notifications.count}`);

  // 8. image (references Product)
  const images = await prisma.image.deleteMany();
  console.log(`8. image deleted: ${images.count}`);

  // 9. product_image_file (no FK — raw SQL, model not in root Prisma client)
  const productImagesResult = await prisma.$executeRaw`DELETE FROM "ProductImageFile"`;
  console.log(`9. product_image_file deleted: ${productImagesResult}`);

  // 10. newsletter_subscriber (no FK)
  const newsletter = await prisma.newsletterSubscriber.deleteMany();
  console.log(`10. newsletter_subscriber deleted: ${newsletter.count}`);

  // 11. contact_message (no FK)
  const contactMessages = await prisma.contactMessage.deleteMany();
  console.log(`11. contact_message deleted: ${contactMessages.count}`);

  // 12. product (references Category + Merchant)
  const products = await prisma.product.deleteMany();
  console.log(`12. product deleted: ${products.count}`);

  // 13. category
  const categories = await prisma.category.deleteMany();
  console.log(`13. category deleted: ${categories.count}`);

  // 14. merchant
  const merchants = await prisma.merchant.deleteMany();
  console.log(`14. merchant deleted: ${merchants.count}`);

  // 15. user — PRESERVE the 2 admin accounts
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      email: { notIn: PRESERVE_ADMINS },
    },
  });
  console.log(`15. user deleted: ${deletedUsers.count} (preserved ${PRESERVE_ADMINS.length} admins)`);

  // Verify what's left
  const remainingAdmins = await prisma.user.findMany({
    where: { email: { in: PRESERVE_ADMINS } },
    select: { email: true, role: true, id: true },
  });
  console.log("\n=== VERIFICATION ===");
  console.log("Remaining admin accounts:");
  remainingAdmins.forEach((u) => console.log(`  ✓ ${u.email} (${u.role}) [${u.id}]`));

  // Count remaining rows in all tables
  const counts = {
    products: await prisma.product.count(),
    categories: await prisma.category.count(),
    merchants: await prisma.merchant.count(),
    users: await prisma.user.count(),
    orders: await prisma.customer_order.count(),
    orderItems: await prisma.customer_order_product.count(),
    wishlist: await prisma.wishlist.count(),
    images: await prisma.image.count(),
    productImages: Number((await prisma.$queryRaw`SELECT COUNT(*) as cnt FROM "ProductImageFile"`)[0].cnt),
    newsletter: await prisma.newsletterSubscriber.count(),
    contactMessages: await prisma.contactMessage.count(),
    notifications: await prisma.notification.count(),
    bulkBatches: await prisma.bulk_upload_batch.count(),
    bulkItems: await prisma.bulk_upload_item.count(),
    passwordTokens: await prisma.passwordResetToken.count(),
  };

  console.log("\nRemaining rows after reset:");
  Object.entries(counts).forEach(([table, count]) => {
    const status = count === 0 ? "✓" : "✗";
    console.log(`  ${status} ${table}: ${count}`);
  });

  console.log("\n=== DATA RESET COMPLETE ===");
}

main()
  .catch((e) => {
    console.error("RESET FAILED:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
