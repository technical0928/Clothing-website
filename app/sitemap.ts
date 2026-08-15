import type { MetadataRoute } from "next";

const BASE_URL = "https://noor-e-multan.vercel.app";
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://clothing-website-server.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/support`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_BASE}/api/products?limit=100`, {
      next: { revalidate: 3600, tags: ["products"] },
    });
    if (res.ok) {
      const products = await res.json();
      const list = Array.isArray(products) ? products : [];
      productRoutes = list
        .filter((p: any) => p && p.slug)
        .map((p: any) => ({
          url: `${BASE_URL}/product/${p.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));
    }
  } catch (error) {
    console.error("sitemap: failed to fetch products", error);
  }

  return [...staticRoutes, ...productRoutes];
}
