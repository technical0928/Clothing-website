// Seed script: populates the Neon PostgreSQL database with categories,
// a merchant and 10 real clothing products. Idempotent (upserts by slug).
const prisma = require("./utills/db");

const CATEGORIES = [
  "Men",
  "Women",
  "Lawn Shirts",
  "Ethnic Shirts",
  "Formalwear",
  "Partywear",
  "Accessories",
];

const MERCHANT = {
  name: "Noor-e-Multan",
  description: "Premium Pakistani fashion — unique blend of culture.",
  email: "sales@noor-e-multan.com",
  phone: "+92-300-0000000",
  address: "Multan, Punjab, Pakistan",
  status: "ACTIVE",
};

// Images are local files served from repo/public/ (stored as relative paths,
// the frontend renders them as /demo/xxx.jpg).
const PRODUCTS = [
  {
    title: "Men's Casual T-Shirt",
    slug: "mens-casual-t-shirt",
    category: "Men",
    mainImage: "demo/tshirt.jpg",
    price: 1499,
    salePrice: 1199,
    manufacturer: "Noor-e-Multan",
    description:
      "Everyday crew-neck t-shirt cut from soft combed cotton. Breathable, comfortable and true to size — a wardrobe staple that works with jeans, chinos or joggers.",
    sizes: "S,M,L,XL,XXL",
    colors: "White,Black,Grey,Navy",
    fabric: "Cotton",
    inStock: 50,
    rating: 5,
  },
  {
    title: "Men's Premium Hoodie",
    slug: "mens-premium-hoodie",
    category: "Men",
    mainImage: "demo/hoodie.jpg",
    price: 4999,
    salePrice: 3999,
    manufacturer: "Noor-e-Multan",
    description:
      "Premium heavyweight fleece hoodie with a kangaroo pocket and adjustable drawstring hood. Warm, cozy and built to last through the colder months.",
    sizes: "S,M,L,XL",
    colors: "Grey,Black,Navy",
    fabric: "Fleece",
    inStock: 30,
    rating: 5,
  },
  {
    title: "Men's Denim Jacket",
    slug: "mens-denim-jacket",
    category: "Men",
    mainImage: "demo/jacket.jpg",
    price: 7499,
    salePrice: 6499,
    manufacturer: "Noor-e-Multan",
    description:
      "Classic denim jacket with a timeless five-pocket cut, sturdy metal buttons and a versatile mid-blue wash. Layer it over a tee or hoodie for an effortless look.",
    sizes: "M,L,XL,XXL",
    colors: "Blue,Black",
    fabric: "Denim",
    inStock: 20,
    rating: 5,
  },
  {
    title: "Men's Polo Shirt",
    slug: "mens-polo-shirt",
    category: "Men",
    mainImage: "demo/polo.jpg",
    price: 2999,
    salePrice: 2499,
    manufacturer: "Noor-e-Multan",
    description:
      "Premium piqué polo shirt with a ribbed collar and cuffs. The smart-casual essential that pairs just as well with jeans as it does with chinos.",
    sizes: "M,L,XL,XXL",
    colors: "Green,White,Navy",
    fabric: "Cotton Pique",
    inStock: 35,
    rating: 5,
  },
  {
    title: "Women's Summer Dress",
    slug: "womens-summer-dress",
    category: "Women",
    mainImage: "demo/dress.jpg",
    price: 5499,
    salePrice: 4499,
    manufacturer: "Noor-e-Multan",
    description:
      "Lightweight floral summer dress in premium cotton. Breathable fabric with a flattering fit — perfect for warm-weather outings and casual evenings.",
    sizes: "S,M,L,XL",
    colors: "Blue,Peach,White",
    fabric: "Cotton",
    inStock: 25,
    rating: 5,
  },
  {
    title: "Women's Abaya",
    slug: "womens-abaya",
    category: "Women",
    mainImage: "demo/abaya.jpg",
    price: 6999,
    manufacturer: "Noor-e-Multan",
    description:
      "Elegant flowing abaya in soft, breathable fabric with clean tailoring and subtle detailing. Modest, comfortable and refined for everyday wear.",
    sizes: "S,M,L,XL",
    colors: "Black",
    fabric: "Nida Fabric",
    inStock: 15,
    rating: 5,
  },
  {
    title: "Women's Casual Kurti",
    slug: "womens-casual-kurti",
    category: "Women",
    mainImage: "demo/kurti.jpg",
    price: 3499,
    salePrice: 2799,
    manufacturer: "Noor-e-Multan",
    description:
      "Casual kurti in soft lawn with delicate stitching. Lightweight and easy to style with jeans, trousers or a shalwar — ideal for everyday wear.",
    sizes: "S,M,L,XL",
    colors: "Multicolor",
    fabric: "Lawn",
    inStock: 40,
    rating: 5,
  },
  {
    title: "Women's Denim Jeans",
    slug: "womens-denim-jeans",
    category: "Women",
    mainImage: "demo/jeans.jpg",
    price: 4499,
    manufacturer: "Noor-e-Multan",
    description:
      "Slim-fit jeans in durable stretch denim with classic five-pocket styling. A comfortable, figure-flattering fit that goes with everything.",
    sizes: "26,28,30,32,34",
    colors: "Blue,Black",
    fabric: "Stretch Denim",
    inStock: 28,
    rating: 5,
  },
  {
    title: "Men's Shalwar Kameez",
    slug: "mens-shalwar-kameez",
    category: "Men",
    mainImage: "demo/shalwarkameez.jpg",
    price: 8999,
    manufacturer: "Noor-e-Multan",
    description:
      "Traditional shalwar kameez in comfortable cotton with a classic collar and matching shalwar. A timeless choice for Eid, weddings and everyday elegance.",
    sizes: "M,L,XL,XXL",
    colors: "White,Blue,Grey",
    fabric: "Cotton",
    inStock: 18,
    rating: 5,
  },
  {
    title: "Women's Embroidered Suit",
    slug: "womens-embroidered-suit",
    category: "Women",
    mainImage: "demo/embroidered-suit.jpg",
    price: 12999,
    manufacturer: "Noor-e-Multan",
    description:
      "Exquisite embroidered three-piece suit with intricate thread work and delicate detailing. Crafted for festive occasions, weddings and celebrations.",
    sizes: "S,M,L,XL",
    colors: "Multicolor",
    fabric: "Chiffon",
    inStock: 12,
    rating: 5,
  },
];

async function main() {
  // 1. Categories (upsert by unique name)
  const categoryIds = {};
  for (const name of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categoryIds[name] = category.id;
  }
  console.log(`✔ Categories ready: ${CATEGORIES.join(", ")}`);

  // 2. Merchant (find or create)
  let merchant = await prisma.merchant.findFirst({
    where: { name: MERCHANT.name },
  });
  if (!merchant) {
    merchant = await prisma.merchant.create({ data: MERCHANT });
  }
  console.log(`✔ Merchant ready: ${merchant.name} (${merchant.id})`);

  // 3. Products (upsert by unique slug)
  let created = 0;
  let updated = 0;
  for (const item of PRODUCTS) {
    const data = {
      title: item.title,
      mainImage: item.mainImage,
      price: item.price,
      rating: item.rating,
      description: item.description,
      manufacturer: item.manufacturer,
      inStock: item.inStock,
      salePrice: item.salePrice ?? null,
      categoryId: categoryIds[item.category],
      sizes: item.sizes,
      colors: item.colors,
      fabric: item.fabric,
      merchantId: merchant.id,
    };

    const existing = await prisma.product.findUnique({
      where: { slug: item.slug },
    });

    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await prisma.product.create({ data: { slug: item.slug, ...data } });
      created++;
    }
    console.log(`  ${created + updated}. ${item.title} — PKR ${item.price.toLocaleString()} [${item.category}] (${item.mainImage})`);
  }

  const total = await prisma.product.count();
  console.log(`\n✅ Done. Created: ${created}, Updated: ${updated}. Total products in Neon: ${total}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
