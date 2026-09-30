import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings";
import { getPalette } from "@/lib/palettes";

export const dynamic = "force-dynamic";

// Permite "Agregar a la pantalla de inicio" en el celular, con el ícono y el nombre de la tienda.
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await getSettings();
  const bg = getPalette(s.palette).light.bg;
  return {
    name: `${s.name} · ${s.tagline}`,
    short_name: s.name,
    description: "Péptidos de grado investigación con certificado de análisis por lote.",
    start_url: "/",
    display: "standalone",
    lang: "es-CL",
    background_color: bg,
    theme_color: bg,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
