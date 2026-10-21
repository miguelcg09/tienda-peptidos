import type { NextConfig } from "next";

// Política de contenido: la tienda solo carga código y estilos propios. Los scripts y estilos "inline" siguen
// permitidos porque Next los usa para arrancar cada página (cerrarlos exigiría generar cada página en cada visita
// y la tienda se volvería más lenta). Aun así bloquea poner la tienda dentro de otra página, cambiar la base de
// los enlaces, enviar formularios a otros sitios, plugins y conexiones a servidores ajenos. Las fotos de producto
// pueden venir de cualquier https (se pegan por enlace en el panel); los mapas, de OpenStreetMap.
// Solo en producción: el modo de desarrollo de Next necesita eval y websockets.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const nextConfig: NextConfig = {
  // Paquetes nativos/WASM que deben cargarse en Node, no empaquetarse.
  serverExternalPackages: ["@electric-sql/pglite", "postgres"],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // La ubicación solo se usa en el checkout, con el botón "Usar mi ubicación".
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          // Solo https durante dos años (sin subdominios ni lista de precarga: no se pueden deshacer fácil).
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          ...(process.env.NODE_ENV === "production" ? [{ key: "Content-Security-Policy", value: csp }] : []),
        ],
      },
      // El panel y las APIs no deben aparecer en buscadores.
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
    ];
  },
};

export default nextConfig;
