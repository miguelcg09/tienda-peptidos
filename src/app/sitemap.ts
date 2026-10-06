import type { MetadataRoute } from "next";
import { showCertificates } from "@/lib/features";
import { getProducts } from "@/lib/catalog";
import { publicUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const base = publicUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/productos`, changeFrequency: "weekly", priority: 0.9 },
    ...products.map((p) => ({ url: `${base}/productos/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...(showCertificates() ? [{ url: `${base}/certificados`, changeFrequency: "weekly" as const, priority: 0.7 }] : []),
    { url: `${base}/calculadora`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/guias`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/terminos`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/envios`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/pedido`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
