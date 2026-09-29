import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/productos`, changeFrequency: "weekly", priority: 0.9 },
    ...products.map((p) => ({ url: `${base}/productos/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    { url: `${base}/terminos`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/pedido`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
