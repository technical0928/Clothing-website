const prisma = require("./utills/db");

const DEMO_PRODUCTS = [
  {
    title: "Floral Summer Dress",
    slug: "floral-summer-dress",
    category: "Women",
    mainImage: "demo/dress.jpg",
    price: 4500,
    manufacturer: "Noor-e-Multan",
    description:
      "Lightweight floral summer dress in premium cotton. Breathable fabric with a comfortable fit, perfect for warm weather outings and casual evenings.",
    sizes: "S,M,L,XL",
    colors: "Blue,Peach,White",
    fabric: "Cotton",
    inStock: 25,
  },
  {
    title: "Embroidered Lawn Kurti",
    slug: "embroidered-lawn-kurti",
    category: "Women",
    mainImage: "demo/kurti.jpg",
    price: 6500,
    manufacturer: "Noor-e-Multan",
    description:
      "Elegant embroidered lawn kurti with delicate thread work. A classic three-piece style, lightweight and perfect for everyday wear.",
    sizes: "S,M,L,XL",
    colors: "Multicolor",
    fabric: "Lawn",
    inStock: 18,
  },
  {
    title: "Essential White Tee",
    slug: "essential-white-tee",
    category: "Women",
    mainImage: "demo/whitetshirt.jpg",
    price: 1200,
    manufacturer: "Noor-e-Multan",
    description:
      "The perfect wardrobe staple. Soft, breathable white t-shirt with a clean cut that goes with anything.",
    sizes: "S,M,L,XL",
    colors: "White",
    fabric: "Cotton",
    inStock: 60,
  },
  {
    title: "Classic Oxford Shirt",
    slug: "classic-oxford-shirt",
    category: "Men",
    mainImage: "demo/shirt.jpg",
    price: 3500,
    manufacturer: "Noor-e-Multan",
    description:
      "Timeless button-down Oxford shirt in 100% cotton. Crisp collar and durable fabric, ideal for office or smart casual looks.",
    sizes: "M,L,XL,XXL",
    colors: "White,Blue",
    fabric: "Cotton",
    inStock: 30,
  },
  {
    title: "Basic Crew Neck T-Shirt",
    slug: "basic-crew-neck-tshirt",
    category: "Men",
    mainImage: "demo/tshirt.jpg",
    price: 1800,
    manufacturer: "Noor-e-Multan",
    description:
      "Everyday crew neck t-shirt made from soft combed cotton. Classic fit with a comfortable feel, available in multiple colors.",
    sizes: "S,M,L,XL",
    colors: "White,Black",
    fabric: "Cotton",
    inStock: 45,
  },
  {
    title: "Classic Piqué Polo Shirt",
    slug: "classic-pique-polo-shirt",
    category: "Men",
    mainImage: "demo/polo.jpg",
    price: 2800,
    manufacturer: "Noor-e-Multan",
    description:
      "Premium piqué polo shirt with ribbed collar and cuffs. A smart-casual essential that pairs well with jeans or chinos.",
    sizes: "M,L,XL,XXL",
    colors: "Green,White,Navy",
    fabric: "Cotton Pique",
    inStock: 22,
  },
  {
    title: "Kids Cotton T-Shirt",
    slug: "kids-cotton-tshirt",
    category: "Kids",
    mainImage: "demo/kids.jpg",
    price: 1500,
    manufacturer: "Noor-e-Multan",
    description:
      "Soft and comfortable kids t-shirt in breathable cotton. Gentle on young skin with bright colors kids love.",
    sizes: "2y,4y,6y,8y,10y",
    colors: "Assorted",
    fabric: "Cotton",
    inStock: 40,
  },
  {
    title: "Cozy Fleece Hoodie",
    slug: "cozy-fleece-hoodie",
    category: "New Arrivals",
    mainImage: "demo/hoodie.jpg",
    price: 5000,
    manufacturer: "Noor-e-Multan",
    description:
      "Warm and cozy fleece hoodie with kangaroo pocket and adjustable drawstring hood. Perfect for the cooler months.",
    sizes: "S,M,L,XL",
    colors: "Grey,Black,Navy",
    fabric: "Fleece",
    inStock: 15,
  },
  {
    title: "Leather Biker Jacket",
    slug: "leather-biker-jacket",
    category: "New Arrivals",
    mainImage: "demo/jacket.jpg",
    price: 12000,
    manufacturer: "Noor-e-Multan",
    description:
      "Statement leather biker jacket with asymmetric zip. Premium finish that adds an edge to any outfit.",
    sizes: "M,L,XL",
    colors: "Black",
    fabric: "Leather",
    inStock: 8,
  },
  {
    title: "Slim Fit Denim Jeans",
    slug: "slim-fit-denim-jeans",
    category: "Sale",
    mainImage: "demo/jeans.jpg",
    price: 4000,
    manufacturer: "Noor-e-Multan",
    description:
      "Slim fit denim jeans in durable stretch denim. Classic five-pocket styling, on sale this week only.",
    sizes: "28,30,32,34,36",
    colors: "Blue,Black",
    fabric: "Denim",
    inStock: 20,
  },
];

async function main() {
  const merchant = await prisma.merchant.findFirst({
    where: { name: "Demo Merchant" },
  });

  if (!merchant) {
    throw new Error("Demo Merchant not found in database");
  }

  const categories = await prisma.category.findMany();
  const categoryByName = Object.fromEntries(
    categories.map((c) => [c.name, c.id])
  );

  let created = 0;
  let updated = 0;

  for (const item of DEMO_PRODUCTS) {
    const categoryId = categoryByName[item.category];
    if (!categoryId) {
      console.warn(`SKIP (no category '${item.category}'): ${item.title}`);
      continue;
    }

    const existing = await prisma.product.findUnique({
      where: { slug: item.slug },
    });

    const data = {
      title: item.title,
      mainImage: item.mainImage,
      price: item.price,
      rating: 5,
      description: item.description,
      manufacturer: item.manufacturer,
      inStock: item.inStock,
      categoryId,
      sizes: item.sizes,
      colors: item.colors,
      fabric: item.fabric,
      merchantId: merchant.id,
    };

    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await prisma.product.create({ data: { slug: item.slug, ...data } });
      created++;
    }
  }

  const total = await prisma.product.count();
  console.log(
    `Done. Created: ${created}, Updated: ${updated}. Total products in DB: ${total}`
  );
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
