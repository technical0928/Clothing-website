const prisma = require("../utills/db");

const demoMerchant = [
  {
    id: "1",
    name: "Demo Merchant",
    description: "This is demo merchant description",
    phone: "1234567890",
    address: "123 Demo St, Demo City, DM 12345",
    status: "active",
    createdAt : new Date(),
    updatedAt : new Date(),
  }
]

const demoProducts = [
  {
    id: "1",
    title: "Lawn Shirt",
    price: 4999,
    rating: 5,
    description: "Lightweight summer lawn shirt with detailed embroidery.",
    mainImage: "product1.webp",
    slug: "lawn-shirt",
    manufacturer: "Noor-e-Multan",
    categoryId: "3117a1b0-6369-491e-8b8b-9fdd5ad9912e",
    inStock: 1,
    sizes: "S,M,L,XL",
    colors: "White,Beige,Pastel Pink",
    fabric: "Lawn",
    merchantId: "1",
  },
  {
    id: "2",
    title: "Embroidered Kurta",
    price: 6999,
    rating: 4,
    description: "Premium cotton kurta with elegant thread work.",
    mainImage: "product2.webp",
    slug: "embroidered-kurta",
    manufacturer: "Noor-e-Multan",
    categoryId: "659a91b9-3ff6-47d5-9830-5e7ac905b961",
    inStock: 1,
    sizes: "M,L,XL",
    colors: "Navy,Maroon,Olive",
    fabric: "Cotton",
    merchantId: "1",
  },
  {
    id: "3",
    title: "Women’s Long Dress",
    price: 8499,
    rating: 5,
    description: "Flowy maxi dress perfect for evening occasions.",
    mainImage: "product3.webp",
    slug: "womens-long-dress",
    manufacturer: "Noor-e-Multan",
    categoryId: "7a241318-624f-48f7-9921-1818f6c20d85",
    inStock: 1,
    sizes: "S,M,L",
    colors: "Red,Black,Emerald",
    fabric: "Silk",
    merchantId: "1",
  },
  {
    id: "4",
    title: "Men’s Formal Shirt",
    price: 5399,
    rating: 4,
    description: "Tailored formal shirt for office and celebration wear.",
    mainImage: "product4.webp",
    slug: "mens-formal-shirt",
    manufacturer: "Noor-e-Multan",
    categoryId: "ada699e5-e764-4da0-8d3e-18a8c8c5ed24",
    inStock: 1,
    sizes: "M,L,XL,XXL",
    colors: "White,Blue,Grey",
    fabric: "Cotton",
    merchantId: "1",
  },
  {
    id: "5",
    title: "Silk Dupatta",
    price: 2999,
    rating: 5,
    description: "Elegant silk dupatta for traditional ensembles.",
    mainImage: "product5.webp",
    slug: "silk-dupatta",
    manufacturer: "Noor-e-Multan",
    categoryId: "da6413b4-22fd-4fbb-9741-d77580dfdcd5",
    inStock: 1,
    sizes: "One Size",
    colors: "Gold,Rose,Purple",
    fabric: "Silk",
    merchantId: "1",
  },
  {
    id: "6",
    title: "Chiffon Evening Gown",
    price: 12999,
    rating: 5,
    description: "Premium chiffon gown with modern sequin details.",
    mainImage: "product6.webp",
    slug: "chiffon-evening-gown",
    manufacturer: "Noor-e-Multan",
    categoryId: "782e7829-806b-489f-8c3a-2689548d7153",
    inStock: 1,
    sizes: "S,M,L",
    colors: "Black,Maroon",
    fabric: "Chiffon",
    merchantId: "1",
  },
  {
    id: "7",
    title: "Summer Block Print Shirt",
    price: 4199,
    rating: 4,
    description: "Breathable block print shirt for warm-weather styling.",
    mainImage: "product7.webp",
    slug: "summer-block-print-shirt",
    manufacturer: "Noor-e-Multan",
    categoryId: "6c3b8591-b01e-4842-bce1-2f5585bf3a28",
    inStock: 1,
    sizes: "S,M,L,XL",
    colors: "Yellow,Green,Blue",
    fabric: "Cotton",
    merchantId: "1",
  },
  {
    id: "8",
    title: "Classic Leather Sandals",
    price: 4599,
    rating: 4,
    description: "Comfortable leather sandals for everyday wear.",
    mainImage: "product8.webp",
    slug: "classic-leather-sandals",
    manufacturer: "Noor-e-Multan",
    categoryId: "4c2cc9ec-7504-4b7c-8ecd-2379a854a423",
    inStock: 1,
    sizes: "40,41,42,43,44",
    colors: "Brown,Black",
    fabric: "Leather",
    merchantId: "1",
  },
  {
    id: "9",
    title: "Ethnic Waistcoat",
    price: 7299,
    rating: 5,
    description: "Embroidered waistcoat for festive occasions.",
    mainImage: "product9.webp",
    slug: "ethnic-waistcoat",
    manufacturer: "Noor-e-Multan",
    categoryId: "8d2a091c-4b90-4d60-b191-114b895f3e54",
    inStock: 1,
    sizes: "M,L,XL",
    colors: "Maroon,Navy",
    fabric: "Cotton",
    merchantId: "1",
  },
  {
    id: "10",
    title: "Satin Party Dress",
    price: 9999,
    rating: 5,
    description: "Satin party dress with elegant silhouette.",
    mainImage: "product10.webp",
    slug: "satin-party-dress",
    manufacturer: "Noor-e-Multan",
    categoryId: "d30b85e2-e544-4f48-8434-33fe0b591579",
    inStock: 1,
    sizes: "S,M,L",
    colors: "Pink,Silver",
    fabric: "Satin",
    merchantId: "1",
  },
  {
    id: "11",
    title: "Classic Trouser",
    price: 4799,
    rating: 4,
    description: "Stretch cotton trouser for work and casual outfits.",
    mainImage: "product11.webp",
    slug: "classic-trouser",
    manufacturer: "Noor-e-Multan",
    categoryId: "313eee86-bc11-4dc1-8cb0-6b2c2a2a1ccb",
    inStock: 1,
    sizes: "M,L,XL,XXL",
    colors: "Grey,Black",
    fabric: "Cotton",
    merchantId: "1",
  },
  {
    id: "12",
    title: "Textured Stole",
    price: 2999,
    rating: 5,
    description: "Lightweight textured stole for layered styling.",
    mainImage: "product12.webp",
    slug: "textured-stole",
    manufacturer: "Noor-e-Multan",
    categoryId: "fs6413b4-22fd-4fbb-9741-d77512dfdfa3",
    inStock: 1,
    sizes: "One Size",
    colors: "Cream,Teal,Maroon",
    fabric: "Viscose",
    merchantId: "1",
  }
];

const demoCategories = [
  {
    id: "3117a1b0-6369-491e-8b8b-9fdd5ad9912e",
    name: "lawn-shirts",
  },
  {
    id: "659a91b9-3ff6-47d5-9830-5e7ac905b961",
    name: "ethnic-shirts",
  },
  {
    id: "6c3b8591-b01e-4842-bce1-2f5585bf3a28",
    name: "summer-shirts",
  },
  {
    id: "ada699e5-e764-4da0-8d3e-18a8c8c5ed24",
    name: "formalwear",
  },
  {
    id: "d30b85e2-e544-4f48-8434-33fe0b591579",
    name: "partywear",
  },
  {
    id: "7a241318-624f-48f7-9921-1818f6c20d85",
    name: "dresses",
  },
  {
    id: "313eee86-bc11-4dc1-8cb0-6b2c2a2a1ccb",
    name: "menswear",
  },
  {
    id: "782e7829-806b-489f-8c3a-2689548d7153",
    name: "womenswear",
  },
  {
    id: "a6896b67-197c-4b2a-b5e2-93954474d8b4",
    name: "accessories",
  },
  {
    id: "4c2cc9ec-7504-4b7c-8ecd-2379a854a423",
    name: "shoes",
  },
  {
    id: "8d2a091c-4b90-4d60-b191-114b895f3e54",
    name: "ethnic-wear",
  },
  {
    id: "fs6413b4-22fd-4fbb-9741-d77512dfdfa3",
    name: "stoles",
  },
];

async function insertDemoData() {
  for (const merchant of demoMerchant) {
    const existingMerchant = await prisma.merchant.findUnique({
      where: { id: merchant.id },
    });

    if (!existingMerchant) {
      await prisma.merchant.create({ data: merchant });
    }
  }
  console.log("Demo merchant inserted successfully!");

  for (const category of demoCategories) {
    const existingCategory = await prisma.category.findUnique({
      where: { id: category.id },
    });

    if (!existingCategory) {
      await prisma.category.create({ data: category });
    }
  }
  console.log("Demo categories inserted successfully!");

  for (const product of demoProducts) {
    const existingProduct = await prisma.product.findUnique({
      where: { slug: product.slug },
    });

    const productData = { ...product };
    delete productData.id;

    if (existingProduct) {
      await prisma.product.update({
        where: { slug: product.slug },
        data: productData,
      });
    } else {
      await prisma.product.create({ data: product });
    }
  }
  console.log("Demo products inserted successfully!");
}

insertDemoData()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });