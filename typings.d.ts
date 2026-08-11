interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  salePrice?: number | null;
  rating: number;
  description: string;
  mainImage: string;
  manufacturer: string;
  categoryId: string;
  category: {name: string}?;
  inStock: number;
  sizes: string;
  colors: string;
  fabric: string;
}

interface Merchant {
  id: string;
  name: string;
  email: string;
  description: string;
  phone: string;
  address: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

interface SingleProductPageProps {
  params: {
    id: string;
    productSlug: string;
  };
}

type ProductInWishlist = {
  id: string;
  title: string;
  price: number;
  image: string;
  slug: string;
  stockAvailabillity: number;
};

interface OtherImages {
  imageID: string;
  productID: string;
  image: string;
}

interface Category {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  password: string | null;
  role: string;
}

interface Order {
  id: string;
  adress: string;
  apartment: string;
  company: string;
  dateTime: string;
  email: string;
  lastname: string;
  name: string;
  phone: string;
  postalCode: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "canceled";
  city: string;
  country: string;
  orderNotice: string?;
  total: number;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
}

interface SingleProductBtnProps {
  product: Product;
  quantityCount: number;
}


interface Category {
  id: string;
  name: string;
}

interface WishListItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
}


declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
      role: string;
    };
  }

  interface User {
    id: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}