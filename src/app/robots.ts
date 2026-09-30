import type { MetadataRoute } from "next";
import { publicUrl } from "@/lib/site";

const base = publicUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/checkout", "/carrito", "/pedido"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
