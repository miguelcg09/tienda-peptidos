import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/settings";
import { getPalette } from "@/lib/palettes";

// Vista previa al compartir el sitio (WhatsApp, redes, Google). Las fichas de producto tienen la suya.
export const alt = "Helix Research";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default async function Image() {
  const settings = await getSettings();
  const pal = getPalette(settings.palette).dark;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: 72, background: `linear-gradient(135deg, ${pal.bg} 0%, ${pal.surface2} 100%)`, color: pal.fg, fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", width: 96, height: 96, borderRadius: 26, background: `linear-gradient(135deg, ${pal.accent}, ${pal.accent2})`, alignItems: "center", justifyContent: "center" }}>
            <svg width="60" height="60" viewBox="0 0 512 512">
              <path d="M256 104 L389 180 L389 332 L256 408 L123 332 L123 180 Z" fill="none" stroke="#fff" strokeWidth="46" strokeLinejoin="round" />
              <circle cx="256" cy="256" r="30" fill="#fff" />
            </svg>
          </div>
          <span style={{ fontSize: 44, fontWeight: 700 }}>{settings.name}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span style={{ fontSize: 88, fontWeight: 800, lineHeight: 1.05 }}>Péptidos de grado investigación</span>
          <span style={{ fontSize: 36, color: pal.muted }}>Pago en pesos · Despacho con seguimiento a todo Chile</span>
        </div>
        <div style={{ display: "flex", gap: 20, fontSize: 28 }}>
          <span style={{ padding: "12px 28px", borderRadius: 999, background: pal.accent, color: pal.onAccent, fontWeight: 700 }}>Mayores de 18 años</span>
          <span style={{ padding: "12px 28px", borderRadius: 999, border: `2px solid ${pal.muted}` }}>Solo para investigación</span>
        </div>
      </div>
    ),
    size,
  );
}
