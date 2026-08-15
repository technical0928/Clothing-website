import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin", "/login", "/register", "/checkout", "/cart", "/wishlist", "/profile", "/notifications", "/orders", "/forgot-password", "/reset-password"],
    },
    sitemap: "https://noor-e-multan.vercel.app/sitemap.xml",
  };
}
