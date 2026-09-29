import { ImageResponse } from "next/og";
import { getProduct } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { getPalette } from "@/lib/palettes";
import { formatCLP } from "@/lib/products";

// Imagen de vista previa al compartir la ficha (WhatsApp, redes, Google).
export const alt = "Producto";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const [product, settings] = await Promise.all([getProduct((await params).slug), getSettings()]);
  const pal = getPalette(settings.palette).dark;
  const from = product ? Math.min(...product.variants.map((v) => v.price)) : 0;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: 64, background: `linear-gradient(135deg, ${pal.bg} 0%, ${pal.surface2} 100%)`, color: pal.fg, fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 28 }}>
          <span style={{ fontWeight: 700 }}>{settings.name}</span>
          <span style={{ color: pal.muted }}>Solo para investigación</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <span style={{ fontSize: 26, letterSpacing: 6, textTransform: "uppercase", color: pal.accent }}>{product?.category ?? ""}</span>
          <span style={{ fontSize: 96, fontWeight: 800, lineHeight: 1 }}>{product?.name ?? "Producto"}</span>
          <span style={{ fontSize: 34, color: pal.muted }}>{product?.short ?? ""}</span>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 30 }}>
          <span style={{ padding: "12px 24px", borderRadius: 999, background: pal.accent, color: pal.onAccent, fontWeight: 700 }}>Desde {formatCLP(from)}</span>
          <span style={{ padding: "12px 24px", borderRadius: 999, border: `2px solid ${pal.muted}` }}>{product?.purity ?? ""}</span>
          <span style={{ padding: "12px 24px", borderRadius: 999, border: `2px solid ${pal.muted}` }}>COA por lote</span>
        </div>
      </div>
    ),
    size,
  );
}
